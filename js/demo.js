/* Demo data (SL 29). Builds a filled example — tabs, a group, good/bad, yes/no and measurable habits, 200 days of
   history — so the app can be shown without his own data, and a first-time visitor sees what it does.
   Demo lives under its own localStorage key (Store.setDemo), never syncs, and is rebuilt fresh each time it is turned on. */
(function () {
  window.Demo = {
    build: function (settings) {
      var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
      var now = Date.now(), order = 0, H = {}, E = {}, T = {};
      function id() { return 'demo' + (++order).toString(36); }
      var tabWeek = { id: 'demoTabW', u: now, name: 'Weekly', short: 'Wk', order: 1, hidden: false };
      var tabMon = { id: 'demoTabM', u: now, name: 'Monthly', short: 'Mo', order: 2, hidden: false };
      T[tabWeek.id] = tabWeek; T[tabMon.id] = tabMon;
      function habit(o) {
        var h = Object.assign(Store.newHabit(), o); h.id = id(); h.order = order; h.u = now; H[h.id] = h; return h;
      }
      var D = null, W = tabWeek.id, M = tabMon.id, t0 = Store.todayDate(), ago = function (n) { var x = new Date(t0); x.setDate(t0.getDate() - n); return Store.key(x); };
      var list = [
        // [habit, chance done per day, value maker]
        [habit({ name: 'Morning walk', color: '#7FB3FF', type: 'num', unit: 'km', target: 3, step: 1, tab: D, star: true }), 0.75, function () { return Math.round((2 + rnd() * 3) * 10) / 10; }],
        [habit({ name: 'Read', color: '#B39DFF', type: 'num', unit: 'pages', target: 10, step: 5, tab: D, star: true }), 0.8, function () { return 5 * Math.ceil(rnd() * 5); }],
        [habit({ name: 'Drink water', color: '#5FD3E0', type: 'num', unit: 'glasses', target: 8, step: 1, tab: D }), 0.9, function () { return 4 + Math.floor(rnd() * 6); }]
      ];
      var g = habit({ name: 'Workout', color: '#FFB86B', isGroup: true, agg: { t: 'count', n: 2, prog: true }, tab: D, star: true });
      list.push(
        [habit({ name: 'Push-ups', color: '#FFB86B', type: 'num', unit: 'reps', target: 45, step: 15, parent: g.id, tab: D }), 0.65, function () { return 15 * (1 + Math.floor(rnd() * 4)); }],
        [habit({ name: 'Plank', color: '#FFB86B', parent: g.id, tab: D }), 0.55],
        [habit({ name: 'Stretch', color: '#FFB86B', parent: g.id, tab: D }), 0.7]);
      list.push(
        [habit({ name: 'No sugar', color: '#FF7A7A', kind: 'bad', tab: D }), 0.2],
        [habit({ name: 'Social media', color: '#FF7A7A', kind: 'bad', type: 'num', unit: 'min', target: 30, tt: 'max', step: 10, tab: D }), 0.85, function () { return 10 * (1 + Math.floor(rnd() * 6)); }],
        [habit({ name: 'Evening reflection', color: '#9BE29B', tab: D, win: { from: '19:00', to: '' } }), 0.6],
        [habit({ name: 'Call family', color: '#F5A3D0', freq: { t: 'week', n: 2, days: [] }, tab: W }), 0.3],
        [habit({ name: 'Surah Al-Kahf', color: '#9BE29B', freq: { t: 'rep', n: 1, ev: 1, u: 'w', days: [5], from: 'sch', a: ago(199) }, tab: W }), 0.85, null, function (dt) { return dt.getDay() === 5; }],
        [habit({ name: 'Plan the week', color: '#7FB3FF', freq: { t: 'rep', n: 1, ev: 1, u: 'w', days: [6], from: 'sch', a: ago(199) }, miss: { t: 'stay', keep: 3 }, tab: W }), 0.6, null, function (dt) { return dt.getDay() === 6 || dt.getDay() === 0; }],
        [habit({ name: 'Pay rent', color: '#F2A65A', freq: { t: 'rep', n: 1, ev: 1, u: 'm', md: 1, from: 'sch', a: ago(199) }, miss: { t: 'stay', keep: null }, tab: M }), 0.7, null, function (dt) { return dt.getDate() <= 4 && dt.getDate() > 1; }],
        [habit({ name: 'Car oil change', color: '#C4A49A', freq: { t: 'rep', n: 1, ev: 90, u: 'd', from: 'done', a: ago(170) }, miss: { t: 'stay', keep: null }, tab: M }), 1, null, function (dt, i) { return i === 160 || i === 66; }]);

      var t = Store.todayDate();
      for (var i = 0; i < 200; i++) {
        var dt = new Date(t); dt.setDate(t.getDate() - i);
        var k = Store.key(dt), wd = dt.getDay();
        list.forEach(function (x) {
          var h = x[0];
          if (x[3] && !x[3](dt, i)) return;                         // repeats: only on (or just after) their days
          if (i === 0 && rnd() < 0.5) return;                      // leave part of today open to try
          if (rnd() >= x[1]) return;
          E[h.id + '|' + k] = { v: x[2] ? x[2]() : 1, s: 0, u: now };
        });
      }
      var Wt = {}, kg = 81.2;   // SL 34: a slow downward trend with day-to-day noise, a few days not weighed
      for (var j = 150; j >= 0; j--) {
        var wd2 = new Date(t); wd2.setDate(t.getDate() - j); kg += -0.018 + (rnd() - 0.5) * 0.35;
        if (rnd() < 0.8) Wt[Store.key(wd2)] = { v: Math.round(kg * 100) / 100, u: now };
      }
      var tk = Store.key(t); if (Wt[tk]) { Wt[tk + 'T06:05'] = { v: Wt[tk].v, u: now }; Wt[tk + 'T06:50'] = { v: Math.round((Wt[tk].v + 0.6) * 100) / 100, u: now }; delete Wt[tk]; }   // two weigh-ins today
      var st = JSON.parse(JSON.stringify(settings)); st.heightCm = 172; st.wTarget = 75;
      return { schema: 1, acct: null, su: 0, demo: true,
        settings: st, habits: H, entries: E, tabs: T, weights: Wt, ui: { view: 'all' } };
    }
  };
})();

/* SL 31: Start from examples — the demo's habits as starters (plus a few more). Ticked ones are created as real
   habits with no history; a starter's tab (Weekly / Monthly) is reused if he has a tab of that name, else created. */
(function () {
  var Y = '#9BE29B';
  window.Starters = [
    { sec: 'Daily', items: [
      { k: 'walk', name: 'Morning walk', note: 'km · at least 3', h: { color: '#7FB3FF', type: 'num', unit: 'km', target: 3, step: 1 } },
      { k: 'read', name: 'Read', note: 'pages · at least 10', h: { color: '#B39DFF', type: 'num', unit: 'pages', target: 10, step: 5 } },
      { k: 'quran', name: 'Qur’an pages', note: 'pages · at least 5', h: { color: Y, type: 'num', unit: 'pages', target: 5, step: 1 } },
      { k: 'water', name: 'Drink water', note: 'glasses · at least 8', h: { color: '#5FD3E0', type: 'num', unit: 'glasses', target: 8, step: 1 } },
      { k: 'salah', name: 'Salah in Masjid', note: 'group · Fajr to Isha, done at 5', h: { color: Y, isGroup: true, agg: { t: 'count', n: 5, prog: true } },
        subs: ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map(function (n) { return { name: n, h: { color: Y } }; }) },
      { k: 'workout', name: 'Workout', note: 'group · push-ups, plank, stretch; done at 2', h: { color: '#FFB86B', isGroup: true, agg: { t: 'count', n: 2, prog: true } },
        subs: [{ name: 'Push-ups', h: { type: 'num', unit: 'reps', target: 45, step: 15 } }, { name: 'Plank', h: {} }, { name: 'Stretch', h: {} }] },
      { k: 'reflect', name: 'Evening reflection', note: 'shows from 7 pm', h: { color: Y, win: { from: '19:00', to: '' } } },
      { k: 'sugar', name: 'No sugar', note: 'bad habit · tick when you slip', h: { color: '#FF7A7A', kind: 'bad' } },
      { k: 'social', name: 'Social media', note: 'bad habit · at most 30 min', h: { color: '#FF7A7A', kind: 'bad', type: 'num', unit: 'min', target: 30, tt: 'max', step: 10 } }
    ] },
    { sec: 'Weekly', tab: ['Weekly', 'Wk'], items: [
      { k: 'family', name: 'Call family', note: '2 times a week', h: { color: '#F5A3D0', freq: { t: 'week', n: 2, days: [] } } },
      { k: 'kahf', name: 'Surah Al-Kahf', note: 'every Friday', h: { color: Y, freq: { t: 'rep', n: 1, ev: 1, u: 'w', days: [5], from: 'sch' } } },
      { k: 'plan', name: 'Plan the week', note: 'every Saturday · stays 3 days if missed', h: { color: '#7FB3FF', freq: { t: 'rep', n: 1, ev: 1, u: 'w', days: [6], from: 'sch' }, miss: { t: 'stay', keep: 3 } } }
    ] },
    { sec: 'Monthly', tab: ['Monthly', 'Mo'], items: [
      { k: 'rent', name: 'Pay rent', note: 'the 1st · stays until paid', h: { color: '#F2A65A', freq: { t: 'rep', n: 1, ev: 1, u: 'm', md: 1, from: 'sch' }, miss: { t: 'stay', keep: null } } },
      { k: 'oil', name: 'Car oil change', note: 'every 90 days after it’s done', h: { color: '#C4A49A', freq: { t: 'rep', n: 1, ev: 90, u: 'd', from: 'done' }, miss: { t: 'stay', keep: null } } }
    ] }
  ];
  // Create the ticked starters (keys) as real habits. Returns how many top-level habits were made.
  window.Starters.add = function (keys, intoTab) {
    var S = window.Store, today = S.today(), made = 0, want = {};
    keys.forEach(function (k) { want[k] = 1; });
    var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
    window.Starters.forEach(function (sec) {
      var its = sec.items.filter(function (it) { return want[it.k]; }); if (!its.length) return;
      var tab = intoTab || null;
      if (!tab && sec.tab) {
        var ex = S.tabs().filter(function (t) { return t.name.toLowerCase() === sec.tab[0].toLowerCase(); })[0];
        tab = (ex || S.putTab({ name: sec.tab[0], short: sec.tab[1] })).id;
      }
      its.forEach(function (it) {
        var h = Object.assign(S.newHabit(), clone(it.h), { name: it.name, tab: tab });
        if (h.freq && h.freq.t === 'rep') h.freq.a = today;
        if (h.type === 'num' && h.tt == null) h.tt = 'min';
        S.putHabit(h); made++;
        (it.subs || []).forEach(function (s) {
          var x = Object.assign(S.newHabit(), { color: h.color }, clone(s.h), { name: s.name, parent: h.id, tab: tab });
          S.putHabit(x);
        });
      });
    });
    return made;
  };
})();
