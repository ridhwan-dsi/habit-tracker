/* SL 26: read-only link to the Hifz app on the same phone. Both apps live on ridhwan-dsi.github.io, so they share
   localStorage; Habits reads Hifz's own data ('hifz.v2') and never writes to it. Nothing here goes over the network:
   other devices see the filled-in days through Habits' normal sync.
   day(k) → { pg: Qur'an pages read that day (all readings, as Hifz counts them), min: memorisation minutes, goal: Hifz daily goal (min) } */
(function () {
  var KEY = 'hifz.v2', cache = null, raw = null;
  function pad(n) { return String(n).padStart(2, '0'); }
  function dk(t) { var d = new Date(t); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function load() {
    var r = null; try { r = localStorage.getItem(KEY); } catch (e) {}
    if (r === raw) return cache; raw = r; cache = null;
    var d = null; try { d = JSON.parse(r); } catch (e) {}
    if (!d || typeof d !== 'object') return null;
    var out = {}, o = function (k) { return out[k] || (out[k] = { pg: 0, min: 0 }); };
    // Pages read per day, per reading: the day's last bookmark minus the previous reading day's (Hifz store.rread, pages only)
    var m = d.rmain || {}, tags = [{ id: 'def', start: m.start, from: m.from }].concat(d.rtags || []), A = d.radj || {};
    tags.forEach(function (t) {
      var b = (d.rbm || {})[t.id] || {}, f = t.from ? new Date(t.from + 'T00:00:00').getTime() : 0;
      var log = (b.log || []).filter(function (e) { return e[0] >= f; }).sort(function (x, y) { return x[0] - y[0]; });
      var by = {}, order = [], prev = t.start || (log[0] ? log[0][1] : 0), reset = false, pg = {};
      log.forEach(function (e) { var k = dk(e[0]); if (!by[k]) { by[k] = []; order.push(k); } by[k].push(e); });
      order.forEach(function (k) {
        var n = 0, cur = null;
        by[k].forEach(function (e) {
          if (reset) { prev = e[1]; reset = false; cur = null; return; }
          if (e[1] >= 605) { n += Math.max(0, 605 - prev); prev = 605; reset = true; cur = null; return; }   // a completion (khatm)
          cur = e[1];
        });
        if (cur != null) { n += Math.max(0, cur - prev); prev = cur; }
        pg[k] = n;
      });
      var adj = A[t.id] || {}; Object.keys(adj).forEach(function (k) { pg[k] = adj[k]; });   // days corrected by hand in Hifz
      Object.keys(pg).forEach(function (k) { o(k).pg += pg[k]; });
    });
    // Memorisation stopwatch: time[day][device][mode][page] = seconds
    Object.keys(d.time || {}).forEach(function (k) {
      var D = d.time[k] || {}, s = 0;
      Object.keys(D).forEach(function (dv) { ['r', 'n'].forEach(function (md) { var P = (D[dv] || {})[md] || {}; for (var p in P) s += +P[p] || 0; }); });
      if (s) o(k).min += Math.round(s / 60);
    });
    cache = { days: out, goal: +((d.settings || {}).goalDay) || 0 };
    return cache;
  }
  window.HifzLink = {
    have: function () { return !!load(); },
    all: function () { return load(); },   // { days: { 'YYYY-MM-DD': { pg, min } }, goal } — used by the dashboard
    day: function (k) { var c = load(); if (!c) return null; var x = c.days[k] || { pg: 0, min: 0 }; return { pg: x.pg, min: x.min, goal: c.goal }; },
    /* What a linked habit gets for day k: a number (measurable) or 1 (yes/no ticked); null = nothing from Hifz that day.
       link 'pg' = Qur'an pages read; 'hz' = memorisation minutes. Yes/no 'hz' ticks at Hifz's daily goal (5 min if no goal). */
    value: function (h, k) {
      var x = this.day(k); if (!x || !h.link) return null;
      var n = h.link === 'pg' ? x.pg : x.min;
      if (h.type === 'num') return n > 0 ? n : null;
      var need = h.link === 'pg' ? 1 : (x.goal || 5);
      return n >= need ? 1 : null;
    }
  };
})();
