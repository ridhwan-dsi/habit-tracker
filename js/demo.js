/* Demo data (SL 29). Builds a filled example — tabs, a group, good/bad, yes/no and measurable habits, 200 days of
   history — so the app can be shown without his own data, and a first-time visitor sees what it does.
   Demo lives under its own localStorage key (Store.setDemo), never syncs, and is rebuilt fresh each time it is turned on. */
(function () {
  window.Demo = {
    build: function (settings) {
      var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
      var now = Date.now(), order = 0, H = {}, E = {}, T = {};
      function id() { return 'demo' + (++order).toString(36); }
      var tabDaily = { id: 'demoTabD', u: now, name: 'Daily', order: 1, hidden: false };
      var tabWeek = { id: 'demoTabW', u: now, name: 'Weekly', order: 2, hidden: false };
      T[tabDaily.id] = tabDaily; T[tabWeek.id] = tabWeek;
      function habit(o) {
        var h = Object.assign(Store.newHabit(), o); h.id = id(); h.order = order; h.u = now; H[h.id] = h; return h;
      }
      var D = tabDaily.id, W = tabWeek.id;
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
        [habit({ name: 'Clean desk', color: '#C9C27A', freq: { t: 'days', n: 1, days: [5] }, tab: W }), 0.8],
        [habit({ name: 'Plan the week', color: '#7FB3FF', freq: { t: 'days', n: 1, days: [6] }, tab: W }), 0.85]);

      var t = Store.todayDate();
      for (var i = 0; i < 200; i++) {
        var dt = new Date(t); dt.setDate(t.getDate() - i);
        var k = Store.key(dt), wd = dt.getDay();
        list.forEach(function (x) {
          var h = x[0];
          if (h.freq.t === 'days' && h.freq.days.indexOf(wd) < 0) return;
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
      var st = JSON.parse(JSON.stringify(settings)); st.heightCm = 172; st.wTarget = 75;
      return { schema: 1, acct: null, su: 0, demo: true,
        settings: st, habits: H, entries: E, tabs: T, weights: Wt, ui: { view: 'all' } };
    }
  };
})();
