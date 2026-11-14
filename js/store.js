/* Store: one local state object, saved to localStorage on every change, synced later by Sync (v5).
   Every record carries u (updated ms); merge = newer u wins per record. Deletes keep a tombstone {d:1,u}.

   habits[id] = { id, u, name, color, order,
     type: 'yn' | 'num',            // yes/no or measurable
     kind: 'good' | 'bad',          // bad: tick = did it (red), empty = clean
     unit, target, tt: 'min'|'max', // measurable: target and "At least" / "At most"
     freq: { t: 'day'|'week'|'month'|'days'|'rep', n, days:[0..6] },   // days = Sun 0 … Sat 6 (legacy weekdays = rep every 1 week)
       rep (v5.5): ev = every N, u: 'd'|'w'|'m', days (weeks), md (day of month), a: 'YYYY-MM-DD' start,
                   from: 'sch' (fixed schedule) | 'done' (next one counts from the day it was done, e.g. every 90 days)
     miss: { t: 'drop'|'stay', keep: N|null },   // v5.5 if not done: disappear when the day ends, or stay due (at most keep days)
     enf: false,                    // v5.5 group: its repeat + if-not-done settings apply to its sub-habits
     parent: null,                  // v3 sub-habits: id of the group habit
     isGroup: false, agg: { t:'sum'|'count', n },                 // v3 group result
     tab: null, star: false,        // v4
     win: { from: '', to: '' },     // v4 time window 'HH:MM' (show from / hide after; blank = no limit)
     step: null,                    // v4 measurable: default value & +/- step (blank = 1)
     archived: false }
   entries['<habitId>|YYYY-MM-DD'] = { v: number|null, s: 0|1 (skip, v6), u }
   tabs[id] = { id, u, name, short, order, hidden }   (v4; short name v5.5). No tab = the Main tab.
   weights['YYYY-MM-DD'] = { v: kg|null, u }   (SL 34); settings.heightCm, settings.wTarget */
(function () {
  var REAL = 'habits.v1', DEMO = 'habits.demo', MODE = 'habits.mode', SCHEMA = 1, KEY = REAL;   // demo data has its own key
  function blank() {
    return {
      schema: SCHEMA, acct: null, su: 0,
      settings: { theme: 'dark', hideArchived: true, hideEntered: false, extendH: 0, shortPress: false, skipDays: false, weekStart: 0, tabsMode: 'bottom', hideNotDue: true, subLines: true, starGroups: true, hideSkipped: false },
      habits: {}, entries: {}, tabs: {}, weights: {}, ui: {}
    };
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function live(map) { return Object.keys(map).map(function (k) { return map[k]; }).filter(function (x) { return !x.d; }); }

  var S = {
    d: null, dirty: false, demo: false,
    load: function () {
      try { this.demo = localStorage.getItem(MODE) === 'demo'; } catch (e) {}
      KEY = this.demo ? DEMO : REAL;
      var d = null; try { d = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
      if (!d && this.demo) { this.d = blank(); d = Demo.build(this.d.settings); }
      this.d = d || blank();
      this.migrate();
      try { this.dirty = !this.demo && localStorage.getItem('habits.dirty') === '1'; } catch (e) {}   // unsynced changes survive closing the app
    },
    /* SL 29 Demo data: on = a fresh example (with his current settings) under its own key; off = his own data back.
       His own data is never touched while demo is on, and demo never syncs. */
    setDemo: function (on) {
      this.persist();
      try { if (on) localStorage.setItem(MODE, 'demo'); else localStorage.removeItem(MODE); localStorage.removeItem(DEMO); } catch (e) {}
      if (on) { var d = Demo.build(this.d.settings); this.demo = true; KEY = DEMO; this.d = d; this.migrate(); this.persist(); }
      else this.load();
    },
    migrate: function () {
      var d = this.d, b = blank();
      Object.keys(b).forEach(function (k) { if (d[k] == null) d[k] = b[k]; });
      Object.keys(b.settings).forEach(function (k) { if (d.settings[k] == null) d.settings[k] = b.settings[k]; });
      if (d.settings.tabsMode === 'ribbon') d.settings.tabsMode = 'bottom';   // v5.5: the Tabs sheet became a tab strip above the bottom bar
      // future: if (d.schema < 2) { ...reshape, never delete... }
      d.schema = SCHEMA;
    },
    reset: function (acct) { this.d = blank(); this.d.acct = acct; this.persist(); },
    persist: function () { try { localStorage.setItem(KEY, JSON.stringify(this.d)); } catch (e) { console.warn('save failed', e); } this.flag(); },
    flag: function () { if (!this.demo) try { localStorage.setItem('habits.dirty', this.dirty ? '1' : ''); } catch (e) {} },
    save: function () { if (!this.demo) this.dirty = true; this.persist(); if (this.demo) return; if (window.Sync) Sync.schedule(); },
    saveUi: function () { this.persist(); },
    saveSettings: function () { this.d.su = Date.now(); this.save(); },
    id: function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); },

    /* ---- days ---- */
    key: function (dt) { return dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate()); },
    // "Today" respects Extend day (hours after midnight still count as yesterday).
    todayDate: function () { var t = new Date(Date.now() - (this.d.settings.extendH || 0) * 3600000); t.setHours(12, 0, 0, 0); return t; },
    today: function () { return this.key(this.todayDate()); },
    days: function (n) {   // newest first
      var out = [], t = this.todayDate();
      for (var i = 0; i < n; i++) { var x = new Date(t); x.setDate(t.getDate() - i); out.push({ k: this.key(x), dt: x }); }
      return out;
    },

    /* ---- habits ---- */
    habits: function () { return live(this.d.habits).sort(function (a, b) { return (a.order || 0) - (b.order || 0); }); },
    habit: function (id) { var h = this.d.habits[id]; return h && !h.d ? h : null; },
    newHabit: function () {
      return { name: '', color: '#7FB3FF', type: 'yn', kind: 'good', unit: '', target: 1, tt: 'min',
        freq: { t: 'day', n: 1, days: [] }, parent: null, isGroup: false, agg: { t: 'count', n: 0 },
        tab: null, star: false, win: { from: '', to: '' }, step: null, miss: { t: 'drop', keep: null }, archived: false };
    },
    putHabit: function (h) {
      if (!h.id) { h.id = this.id(); h.order = this.habits().reduce(function (m, x) { return Math.max(m, x.order || 0); }, 0) + 1; }
      h.u = Date.now(); this.d.habits[h.id] = h; this.save(); return h;
    },
    // New order for the habits shown on screen; hidden ones (archived, entered) keep their slots.
    reorder: function (shownIds) {
      var all = this.habits(), shown = {}, q = shownIds.slice(), now = Date.now();
      shownIds.forEach(function (id) { shown[id] = 1; });
      all.map(function (h) { return shown[h.id] ? q.shift() : h.id; }).forEach(function (id, i) {
        var h = this.d.habits[id]; if (h && h.order !== i + 1) { h.order = i + 1; h.u = now; }
      }, this);
      this.save();
    },
    delHabit: function (id) {
      var self = this;
      this.habits().forEach(function (x) { if (x.parent === id) { x.parent = null; x.u = Date.now(); } });   // its sub-habits stay, ungrouped
      this.d.habits[id] = { id: id, d: 1, u: Date.now() };
      var E = this.d.entries, now = Date.now();
      Object.keys(E).forEach(function (k) { if (k.indexOf(id + '|') === 0) E[k] = { v: null, u: now }; });
      this.save();
    },

    /* ---- tabs (v4): a habit belongs to one tab or none; sub-habits follow their group ---- */
    tabs: function () { return live(this.d.tabs).sort(function (a, b) { return (a.order || 0) - (b.order || 0); }); },
    tab: function (id) { var t = id && this.d.tabs[id]; return t && !t.d ? t : null; },
    putTab: function (t) {
      if (!t.id) { t.id = this.id(); t.order = this.tabs().reduce(function (m, x) { return Math.max(m, x.order || 0); }, 0) + 1; t.hidden = false; }
      t.u = Date.now(); this.d.tabs[t.id] = t; this.save(); return t;
    },
    moveTab: function (id, dir) {   // swap with the neighbour among visible tabs
      var vis = this.tabs().filter(function (t) { return !t.hidden; }), i = vis.findIndex(function (t) { return t.id === id; }), j = i + dir;
      if (i < 0 || j < 0 || j >= vis.length) return false;
      var a = vis[i], b = vis[j], o = a.order, now = Date.now(); a.order = b.order; b.order = o; a.u = b.u = now;
      this.save(); return true;
    },
    delTab: function (id) {   // its habits stay, with no tab
      var now = Date.now();
      this.habits().forEach(function (h) { if (h.tab === id) { h.tab = null; h.u = now; } });
      this.d.tabs[id] = { id: id, d: 1, u: now };
      if (this.d.ui.view === id) this.d.ui.view = 'all';
      this.save();
    },

    /* ---- entries ---- */
    val: function (hid, k) { var e = this.d.entries[hid + '|' + k]; return e && e.v != null ? e.v : null; },
    setVal: function (hid, k, v) { this.d.entries[hid + '|' + k] = { v: v == null ? null : v, s: 0, u: Date.now() }; this.save(); },
    // v6 skip day: neither done nor missed (Settings → Skip days)
    skipped: function (hid, k) { var e = this.d.entries[hid + '|' + k]; return !!(e && e.s === 1); },
    setSkip: function (hid, k) { this.d.entries[hid + '|' + k] = { v: null, s: 1, u: Date.now() }; this.save(); },
    /* v6 type switch. Measurable → yes/no: good = target met becomes a tick, bad = any amount becomes a tick;
       the number is kept (n) so switching back restores it. Yes/no → measurable: a tick becomes its kept number, else tickTo. */
    switchType: function (h, to, tickTo) {
      var E = this.d.entries, pre = h.id + '|', now = Date.now(), n = 0;
      Object.keys(E).forEach(function (k) {
        if (k.indexOf(pre) !== 0) return; var e = E[k];
        if (to === 'yn') {
          if (e.v == null) return;
          var ok = h.kind === 'bad' ? e.v > 0 : (h.tt === 'max' ? e.v <= h.target : e.v >= h.target); E[k] = { v: ok ? 1 : null, s: 0, n: e.v, u: now };
        } else if (e.n != null) E[k] = { v: e.n, s: 0, u: now };            // back to the number it had before
        else if (e.v) E[k] = { v: tickTo, s: 0, u: now };
        else return;
        n++;
      });
      return n;
    },
    countEntries: function (id) { var E = this.d.entries, pre = id + '|'; return Object.keys(E).filter(function (k) { return k.indexOf(pre) === 0 && (E[k].v != null || E[k].n != null); }).length; },

    /* Merge remote into local: per record, newer u wins. Settings: newer su wins. */
    /* ---- SL 34 weight log: weights['YYYY-MM-DD'] = { v: kg|null, u } (null = deleted); height & target live in settings ---- */
    // v5.8: several readings a day — key 'YYYY-MM-DDTHH:MM' (older readings: 'YYYY-MM-DD'); d = day, t = time ('' if none)
    wList: function () { var W = this.d.weights || {}; return Object.keys(W).filter(function (k) { return W[k].v != null; }).sort().map(function (k) { return { k: k, d: k.slice(0, 10), t: k.slice(11, 16), v: W[k].v }; }); },
    wByDay: function () {   // one value per day for the Sheet, using his Latest / Smallest / Highest choice
      var p = this.d.settings.wPick || 'last', out = {};
      this.wList().forEach(function (e) { var b = out[e.d]; if (b == null || p === 'last' || (p === 'min' ? e.v < b : e.v > b)) out[e.d] = e.v; });
      return out;
    },
    wSet: function (k, v) { this.d.weights[k] = { v: v == null ? null : Math.round(v * 100) / 100, u: Date.now() }; this.save(); },

    merge: function (r) {
      var L = this.d, ahead = false;   // ahead = this phone has something Drive doesn't → upload after merging
      ['habits', 'entries', 'tabs', 'weights'].forEach(function (m) {
        var R = r[m] || {}; L[m] = L[m] || {};
        Object.keys(R).forEach(function (k) { var a = R[k], b = L[m][k]; if (!b || (a.u || 0) > (b.u || 0)) L[m][k] = a; });
        Object.keys(L[m]).forEach(function (k) { var b = L[m][k], a = R[k]; if (!a || (b.u || 0) > (a.u || 0)) ahead = true; });
      });
      if ((r.su || 0) > (L.su || 0)) { L.settings = r.settings; L.su = r.su; } else if ((L.su || 0) > (r.su || 0)) ahead = true;
      this.migrate(); this.dirty = this.dirty || ahead; this.persist();
    },
    exportData: function () { var c = JSON.parse(JSON.stringify(this.d)); delete c.ui; return c; }
  };
  window.Store = S;
})();
