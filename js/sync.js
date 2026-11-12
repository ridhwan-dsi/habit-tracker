/* v5 Sync: Google Identity Services token client + Drive appDataFolder (habits.json) + a one-way copy to a Google Sheet.
   Offline-first: logging never waits for Google. Decisions (Nov 2026, toolkit 08):
   - the token is kept in localStorage for its hour, so reopening the app doesn't sign in again;
   - a new token is asked for only when there are changes to sync (or he taps Sync), on his next tap — a tap lets
     Google's popup open and close at once; it's never asked for while he's just looking;
   - when the connection comes back, pending changes go up by themselves (if the token is still valid).
   The OAuth client is the Hifz app's (same origin ridhwan-dsi.github.io, same Google project); Hifz only ever opens
   hifz.json, Habits only habits.json, so the two never touch each other's data.
   Sheet copy: Drive converts an uploaded CSV into a Google Sheet ("Habits history") — needs drive.file (non-sensitive),
   no Sheets API. Rewritten at most every 5 minutes, and on Sync now.
   States: off | idle (signed in, nothing waiting) | paused (changes waiting) | syncing | ok | error */
(function () {
  var S = window.Store, C = window.APP_CONFIG, API = 'https://www.googleapis.com', TK = 'habits.tok';
  var SHEET_GAP = 5 * 60000;
  var Sync = {
    tok: null, exp: 0, fileId: null, state: 'off', timer: null, client: null, lastSync: 0, lastSheet: 0, asking: false, sheetOk: null,
    enabled: function () { return !!C.googleClientId; },
    gisReady: function () { return !!(window.google && google.accounts && google.accounts.oauth2); },
    set: function (st) { this.state = st; if (window.App) App.syncChanged(); },
    valid: function () { return !!this.tok && this.exp > Date.now() + 60000; },
    saveTok: function (acct) { try { localStorage.setItem(TK, JSON.stringify({ tok: this.tok, exp: this.exp, acct: acct })); } catch (e) {} },
    dropTok: function () { this.tok = null; this.exp = 0; try { localStorage.removeItem(TK); } catch (e) {} },
    init: function () {
      var self = this;
      if (!this.enabled()) return;
      try { var t = JSON.parse(localStorage.getItem(TK)); if (t && t.exp > Date.now() + 60000 && t.acct === S.d.acct) { this.tok = t.tok; this.exp = t.exp; } } catch (e) {}
      // After any tap: if there are changes waiting and no valid token, ask Google now (the tap allows the popup).
      var onTap = function () { setTimeout(function () { if (S.demo || !S.d.acct || self.asking) return; if (S.dirty && !self.valid() && navigator.onLine !== false) self.signIn(true); }, 30); };
      document.addEventListener('click', onTap, true); document.addEventListener('pointerup', onTap, true);
      window.addEventListener('online', function () { if (self.valid() && !S.demo) self.pull(); });
      if (S.demo) return;
      if (this.valid()) this.pull();
      else if (S.d.acct) this.set(S.dirty ? 'paused' : 'idle');
    },
    signIn: function (silent) {
      var self = this;
      if (S.demo) return App.toast('Exit demo data first');
      if (!this.enabled()) return App.toast('Sign-in is not set up yet');
      if (!this.gisReady()) { if (!silent) App.toast('Google sign-in is still loading — try again'); return; }
      if (!this.client) this.client = google.accounts.oauth2.initTokenClient({
        client_id: C.googleClientId, scope: C.scope,
        callback: function (r) { self.asking = false; self.onToken(r); },
        error_callback: function () { self.asking = false; self.set(S.d.acct ? 'paused' : 'off'); }
      });
      this.asking = true;
      this.client.requestAccessToken({ prompt: silent ? '' : 'select_account', login_hint: S.d.acct || undefined });
    },
    onToken: function (r) {
      var self = this;
      if (!r || r.error) return this.set(S.d.acct ? 'paused' : 'off');
      this.tok = r.access_token; this.exp = Date.now() + (r.expires_in || 3600) * 1000;
      this.sheetOk = !r.scope || r.scope.indexOf('drive.file') >= 0;
      this.set('syncing');
      fetch(API + '/oauth2/v3/userinfo', { headers: { Authorization: 'Bearer ' + this.tok } })
        .then(function (x) { return x.json(); })
        .then(function (u) {
          if (S.d.acct && S.d.acct !== u.email) { S.reset(u.email); self.fileId = null; App.render(); }   // other account: don't mix data
          else if (!S.d.acct) { S.d.acct = u.email; S.dirty = true; S.persist(); }                        // local data joins the account
          self.saveTok(u.email);
          self.pull(true);
        }).catch(function () { self.set('error'); });
    },
    signOut: function () {
      if (this.tok && this.gisReady()) try { google.accounts.oauth2.revoke(this.tok, function () {}); } catch (e) {}
      this.dropTok(); this.fileId = null;
      S.reset(null); this.set('off'); App.render();
    },
    api: function (url, opt) {
      var self = this; opt = opt || {};
      opt.headers = Object.assign({ Authorization: 'Bearer ' + this.tok }, opt.headers || {});
      return fetch(url, opt).then(function (r) {
        if (r.status === 401) { self.dropTok(); self.set('paused'); throw new Error('auth'); }
        if (!r.ok) return r.json().catch(function () { return {}; }).then(function (j) {
          var e = new Error('http'); e.status = r.status; e.msg = (j.error && j.error.message) || 'HTTP ' + r.status; throw e;
        });
        return r;
      });
    },
    fail: function (e) {
      if (e.message === 'auth') return;
      if (!e.status) { S.dirty = true; return this.set('paused'); }   // no connection: wait quietly, retry when it's back
      this.set('error'); if (e.msg) App.toast('Sync error: ' + e.msg.slice(0, 120));
    },
    findFile: function () {
      var self = this; if (this.fileId) return Promise.resolve(this.fileId);
      return this.api(API + '/drive/v3/files?spaces=appDataFolder&fields=files(id)&q=' + encodeURIComponent("name='" + C.driveFile + "'"))
        .then(function (r) { return r.json(); })
        .then(function (j) { self.fileId = (j.files && j.files[0] && j.files[0].id) || null; return self.fileId; });
    },
    pull: function (sheetNow) {   // remote → merge → push merged result
      var self = this; if (!this.valid() || S.demo) return; this.set('syncing');
      this.findFile().then(function (id) {
        if (!id) { S.dirty = true; return null; }
        return self.api(API + '/drive/v3/files/' + id + '?alt=media').then(function (r) { return r.json(); });
      }).then(function (remote) { if (remote) { S.merge(remote); App.render(); } return self.push(true, sheetNow); })
        .catch(function (e) { self.fail(e); });
    },
    now: function () { if (this.valid()) this.pull(true); else this.signIn(true); },   // the Sync button
    schedule: function () {
      var self = this; clearTimeout(this.timer);
      if (!this.valid()) { if (S.d.acct && this.state !== 'syncing') this.set('paused'); return; }   // the next tap asks for a token
      this.timer = setTimeout(function () { self.push(); }, 2500);
    },
    push: function (force, sheetNow) {
      var self = this;
      if (!this.valid() || S.demo) return Promise.resolve();   // demo data never syncs
      if (!S.dirty) { this.lastSync = Date.now(); this.set('ok'); return this.sheet(sheetNow); }
      this.set('syncing');
      var body = JSON.stringify(S.exportData()), p; S.dirty = false;
      if (this.fileId) {
        p = this.api(API + '/upload/drive/v3/files/' + this.fileId + '?uploadType=media', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: body });
      } else {
        p = this.upload({ name: C.driveFile, parents: ['appDataFolder'], mimeType: 'application/json' }, body, 'application/json').then(function (j) { self.fileId = j.id; });
      }
      return p.then(function () { self.lastSync = Date.now(); S.flag(); if (S.dirty) { self.schedule(); return; } self.set('ok'); return self.sheet(sheetNow); })
        .catch(function (e) { S.dirty = true; self.fail(e); });
    },
    upload: function (meta, body, type) {
      var b = 'bnd' + Date.now(), multi = '--' + b + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify(meta) +
        '\r\n--' + b + '\r\nContent-Type: ' + type + '\r\n\r\n' + body + '\r\n--' + b + '--';
      return this.api(API + '/upload/drive/v3/files?uploadType=multipart&fields=id', { method: 'POST', headers: { 'Content-Type': 'multipart/related; boundary=' + b }, body: multi })
        .then(function (r) { return r.json(); });
    },

    /* ---- one-way copy to a Google Sheet in his Drive: a row per day (newest first), a column per habit, then Weight ---- */
    sheet: function (now) {
      var self = this, st = S.d.settings;
      if (!this.valid() || S.demo || st.sheetOff || this.sheetOk === false) return Promise.resolve();
      if (!now && Date.now() - this.lastSheet < SHEET_GAP) return Promise.resolve();
      this.lastSheet = Date.now();
      var csv = this.csv(), id = st.sheetId, sig = csv.length + ':' + csv.split('').reduce(function (h, c) { return (h * 31 + c.charCodeAt(0)) | 0; }, 0);
      try { if (id && localStorage.getItem('habits.sheetSig') === id + sig) return Promise.resolve(); } catch (e) {}   // nothing new for the Sheet
      var done = function () { try { localStorage.setItem('habits.sheetSig', st.sheetId + sig); } catch (e) {} };
      var create = function () {
        return self.upload({ name: 'Habits history', mimeType: 'application/vnd.google-apps.spreadsheet' }, csv, 'text/csv')
          .then(function (j) { st.sheetId = j.id; S.saveSettings(); if (window.App) App.syncChanged(); });
      };
      var p = id ? this.api(API + '/upload/drive/v3/files/' + id + '?uploadType=media', { method: 'PATCH', headers: { 'Content-Type': 'text/csv' }, body: csv })
        .catch(function (e) { if (e.status === 404) return create(); throw e; })   // he deleted the Sheet: make a new one
        : create();
      return p.then(done).catch(function (e) { if (e.status === 403) { self.sheetOk = false; if (window.App) App.syncChanged(); } else self.lastSheet = 0; });
    },
    csv: function () {
      var H = S.habits(), byId = {}; H.forEach(function (h) { byId[h.id] = h; });
      var q = function (v) { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
      var col = function (h) { var g = h.parent && byId[h.parent], n = (g ? g.name + ' › ' : '') + h.name; return n + (h.type === 'num' && h.unit ? ' (' + h.unit + ')' : '') + (h.archived ? ' [archived]' : ''); };
      var cols = H.filter(function (h) { return !H.some(function (x) { return x.parent === h.id; }); });   // a group has no value of its own
      var E = S.d.entries, W = S.wByDay(), first = S.today();
      Object.keys(E).forEach(function (k) { var d = k.slice(k.indexOf('|') + 1); if (d < first && (E[k].v != null || E[k].s)) first = d; });
      Object.keys(W).forEach(function (d) { if (d < first) first = d; });
      var WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], rows = [['Date', 'Day'].concat(cols.map(col), ['Weight (kg)']).map(q).join(',')];
      var t = S.todayDate(), f = new Date(first + 'T12:00:00');
      for (var d = new Date(t); d >= f; d.setDate(d.getDate() - 1)) {
        var k = S.key(d), any = false;
        var cells = cols.map(function (h) {
          var e = E[h.id + '|' + k]; if (!e) return '';
          if (e.s === 1) { any = true; return 'skip'; }
          if (e.v == null) return '';
          any = true; return h.type === 'yn' ? (e.v ? 1 : '') : e.v;
        });
        var w = W[k] != null ? W[k] : ''; if (w !== '') any = true;
        if (any || k === S.today()) rows.push([k, WD[d.getDay()]].concat(cells, [w]).map(q).join(','));
      }
      return rows.join('\n');
    }
  };
  window.Sync = Sync;
})();
