/* Sync: Google Identity Services token client + Drive appDataFolder (one JSON file per user).
   States: off | syncing | ok | paused | error. Token kept in sessionStorage only. */
(function () {
  var S = window.Store, C = window.APP_CONFIG, API = 'https://www.googleapis.com', TK = 'habits.tok';
  var Sync = {
    tok: null, exp: 0, fileId: null, state: 'off', timer: null, client: null, lastSync: 0,
    enabled: function () { return !!C.googleClientId; },
    gisReady: function () { return !!(window.google && google.accounts && google.accounts.oauth2); },
    set: function (st) { this.state = st; if (window.App) App.syncChanged(); },
    init: function () {
      if (!this.enabled()) return;
      try { var t = JSON.parse(sessionStorage.getItem(TK)); if (t && t.exp > Date.now() + 60000 && t.acct === S.d.acct) { this.tok = t.tok; this.exp = t.exp; } } catch (e) {}
      if (this.tok) { this.pull(); return; }
      if (S.d.acct) {
        this.set('paused');
        var self = this;   // resume silently on the first tap (popups need a user gesture)
        document.addEventListener('click', function once() { document.removeEventListener('click', once, true); if (!self.tok) self.signIn(true); }, true);
      }
    },
    signIn: function (silent) {
      var self = this;
      if (!this.enabled()) return App.toast('Sign-in is not set up yet');
      if (!this.gisReady()) return App.toast('Google sign-in is still loading — try again');
      if (!this.client) this.client = google.accounts.oauth2.initTokenClient({
        client_id: C.googleClientId, scope: C.scope,
        callback: function (r) { self.onToken(r); },
        error_callback: function () { self.set(S.d.acct ? 'paused' : 'off'); }
      });
      this.client.requestAccessToken({ prompt: silent ? '' : 'select_account', login_hint: S.d.acct || undefined });
    },
    onToken: function (r) {
      var self = this;
      if (!r || r.error) return this.set(S.d.acct ? 'paused' : 'off');
      this.tok = r.access_token; this.exp = Date.now() + (r.expires_in || 3600) * 1000;
      this.set('syncing');
      fetch(API + '/oauth2/v3/userinfo', { headers: { Authorization: 'Bearer ' + this.tok } })
        .then(function (x) { return x.json(); })
        .then(function (u) {
          if (S.d.acct && S.d.acct !== u.email) { S.reset(u.email); self.fileId = null; App.render(); }   // other account: don't mix data
          else if (!S.d.acct) { S.d.acct = u.email; S.dirty = true; S.persist(); }                        // local data joins the account
          sessionStorage.setItem(TK, JSON.stringify({ tok: self.tok, exp: self.exp, acct: u.email }));
          self.pull();
        }).catch(function () { self.set('error'); });
    },
    signOut: function () {
      if (this.tok && this.gisReady()) try { google.accounts.oauth2.revoke(this.tok, function () {}); } catch (e) {}
      this.tok = null; this.fileId = null; sessionStorage.removeItem(TK);
      S.reset(null); this.set('off'); App.render();
    },
    api: function (url, opt) {
      var self = this; opt = opt || {};
      opt.headers = Object.assign({ Authorization: 'Bearer ' + this.tok }, opt.headers || {});
      return fetch(url, opt).then(function (r) {
        if (r.status === 401) { self.tok = null; sessionStorage.removeItem(TK); self.set('paused'); throw new Error('auth'); }
        if (!r.ok) return r.json().catch(function () { return {}; }).then(function (j) {
          App.toast('Sync error: ' + ((j.error && j.error.message) || 'HTTP ' + r.status).slice(0, 120)); throw new Error('http');
        });
        return r;
      });
    },
    findFile: function () {
      var self = this; if (this.fileId) return Promise.resolve(this.fileId);
      return this.api(API + '/drive/v3/files?spaces=appDataFolder&fields=files(id)&q=' + encodeURIComponent("name='" + C.driveFile + "'"))
        .then(function (r) { return r.json(); })
        .then(function (j) { self.fileId = (j.files && j.files[0] && j.files[0].id) || null; return self.fileId; });
    },
    pull: function () {   // remote → merge → push merged result
      var self = this; if (!this.tok) return; this.set('syncing');
      this.findFile().then(function (id) {
        if (!id) { S.dirty = true; return null; }
        return self.api(API + '/drive/v3/files/' + id + '?alt=media').then(function (r) { return r.json(); });
      }).then(function (remote) { if (remote) { S.merge(remote); App.render(); } return self.push(true); })
        .catch(function (e) { if (e.message !== 'auth') self.set('error'); });
    },
    schedule: function () { var self = this; if (!this.tok) return; clearTimeout(this.timer); this.timer = setTimeout(function () { self.push(); }, 2500); },
    push: function (force) {
      var self = this;
      if (!this.tok) return Promise.resolve();
      if (!S.dirty) { if (force) this.lastSync = Date.now(); this.set('ok'); return Promise.resolve(); }
      this.set('syncing');
      var body = JSON.stringify(S.exportData()), p; S.dirty = false;
      if (this.fileId) {
        p = this.api(API + '/upload/drive/v3/files/' + this.fileId + '?uploadType=media', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: body });
      } else {
        var b = 'bnd' + Date.now(), meta = JSON.stringify({ name: C.driveFile, parents: ['appDataFolder'], mimeType: 'application/json' });
        var multi = '--' + b + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + meta + '\r\n--' + b + '\r\nContent-Type: application/json\r\n\r\n' + body + '\r\n--' + b + '--';
        p = this.api(API + '/upload/drive/v3/files?uploadType=multipart&fields=id', { method: 'POST', headers: { 'Content-Type': 'multipart/related; boundary=' + b }, body: multi })
          .then(function (r) { return r.json(); }).then(function (j) { self.fileId = j.id; });
      }
      return p.then(function () { self.lastSync = Date.now(); self.set('ok'); })
        .catch(function (e) { S.dirty = true; if (e.message !== 'auth') self.set('error'); });
    }
  };
  window.Sync = Sync;
})();
