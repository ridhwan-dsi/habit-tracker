/* v7 Stats page (SL 24 month-over-month included). Pure: app.js hands in a day-result function and gets HTML back.
   A "counted" day is scheduled, not skipped, and not today-still-open (today only counts once it's done/clean).
   Good habit: ok = done. Bad habit: ok = clean (no lapse). Week/month-frequency habits count in periods of N times. */
(function () {
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function key(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function addD(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function r1(v) { return Math.round(v * 10) / 10; }
  function fmt(v) { v = Math.round(v * 100) / 100; return Math.abs(v) >= 1000 ? Math.round(v).toLocaleString() : String(v); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }

  /* o = { h, res(k)->{v,s,ok}, sched(dt), start:Date, today:Date, ws, bad, num, unit, target, color, mon (calendar month offset) } */
  function build(o) {
    var today = o.today, tk = key(today), days = [], byK = {};
    var span = Math.min(1100, Math.round((today - o.start) / 864e5));
    for (var i = span; i >= 0; i--) {
      var dt = addD(today, -i), k = key(dt), r = o.res(k) || {};
      var d = { k: k, dt: dt, m: k.slice(0, 7), sch: o.sched(dt), s: !!r.s, ok: !!r.ok, v: r.v, isT: k === tk };
      d.cnt = d.sch && !d.s && !(d.isT && !d.ok);
      d.done = o.bad ? (d.cnt && !d.ok) : (d.cnt && d.ok);   // good: done; bad: lapse
      d.bonus = !o.bad && !d.sch && !d.s && d.ok;              // SL 40: ticked on a non-scheduled day = extra, never a miss
      days.push(d); byK[k] = d;
    }
    var f = o.h.freq || { t: 'day' }, per = f.t === 'week' || f.t === 'month', N = Math.max(1, f.n || 1);

    /* ---- streaks ---- */
    var cur = 0, best = 0, run = 0, unit = 'day';
    if (!per) {
      days.forEach(function (d) { if (!d.cnt) return; if (d.ok) { run++; best = Math.max(best, run); } else run = 0; });
      for (var j = days.length - 1; j >= 0; j--) { var d = days[j]; if (!d.cnt) continue; if (d.ok) cur++; else break; }
    } else {
      unit = f.t;
      var pk = function (d) { if (f.t === 'month') return d.m; var b = addD(d.dt, -((d.dt.getDay() - o.ws + 7) % 7)); return key(b); };
      var P = [], pm = {};
      days.forEach(function (d) { var p = pk(d); if (!pm[p]) { pm[p] = { c: 0, v: 0, last: false }; P.push(pm[p]); } if (!d.s && typeof d.v === 'number') pm[p].v += d.v; if (!d.s && (o.bad ? !d.ok : d.ok) && d.sch) pm[p].c++; });
      if (P.length) P[P.length - 1].last = true;
      P.forEach(function (p) { p.met = o.bad ? p.c <= 0 : f.wt ? p.v >= f.wt : p.c >= N; p.cnt = !(p.last && !p.met); });
      P.forEach(function (p) { if (!p.cnt) return; if (p.met) { run++; best = Math.max(best, run); } else run = 0; });
      for (var q = P.length - 1; q >= 0; q--) { if (!P[q].cnt) continue; if (P[q].met) cur++; else break; }
    }

    /* ---- the one number each month is judged by ---- */
    var kind = o.bad ? (o.num ? 'total' : 'lapses') : (o.num ? 'total' : per ? 'count' : 'rate');
    var better = o.bad ? 'down' : 'up';
    function metric(list) {
      var c = 0, ok = 0, tot = 0, done = 0;
      list.forEach(function (d) { if (d.cnt) { c++; if (d.ok) ok++; } if (d.done) done++; if (!d.s && d.v != null && typeof d.v === 'number') tot += d.v; });
      if (kind === 'rate') return c ? Math.round(ok / c * 100) : null;
      if (kind === 'total') return r1(tot);
      return done;   // count (good, period habits) or lapses (bad)
    }
    function unitTxt(v) { return kind === 'rate' ? v + '%' : kind === 'total' ? fmt(v) + (o.unit ? ' ' + o.unit : '') : kind === 'lapses' ? plural(v, 'lapse') : plural(v, 'time'); }
    var monthDays = function (y, m, upTo) { return days.filter(function (d) { return d.dt.getFullYear() === y && d.dt.getMonth() === m && (!upTo || d.dt.getDate() <= upTo); }); };

    var ty = today.getFullYear(), tm = today.getMonth(), D = today.getDate();
    var ly = tm ? ty : ty - 1, lm = tm ? tm - 1 : 11, lLen = new Date(ly, lm + 1, 0).getDate();
    var mtd = metric(monthDays(ty, tm)), lmtd = metric(monthDays(ly, lm, Math.min(D, lLen))), lfull = metric(monthDays(ly, lm));
    var months = [];
    for (var b = 5; b >= 0; b--) { var x = new Date(ty, tm - b, 1), md = monthDays(x.getFullYear(), x.getMonth()); months.push({ lab: MON[x.getMonth()], v: md.some(function (d) { return d.cnt || d.done; }) ? metric(md) : null, cur: b === 0 }); }

    /* ---- tiles ---- */
    var su = unit === 'day' ? 'day' : unit === 'week' ? 'week' : 'month';
    var tiles = [];
    tiles.push([o.bad ? 'Clean streak' : 'Current streak', plural(cur, su), cur && cur >= best ? 'Your best yet' : '']);
    tiles.push([o.bad ? 'Best clean streak' : 'Best streak', plural(best, su), '']);
    var bonusM = monthDays(ty, tm).filter(function (d) { return d.bonus; }).length;
    tiles.push(['This month', unitTxt(mtd == null ? 0 : mtd), MON[tm] + ' 1–' + D + (bonusM ? ' · +' + bonusM + ' extra day' + (bonusM > 1 ? 's' : '') : '')]);
    if (o.num) {
      var logged = monthDays(ty, tm).filter(function (d) { return !d.s && typeof d.v === 'number'; });
      var avg = logged.length ? r1(logged.reduce(function (s, d) { return s + d.v; }, 0) / logged.length) : 0;
      tiles.push(['Average per logged day', fmt(avg) + (o.unit ? ' ' + o.unit : ''), o.target ? (o.bad ? 'limit ' : 'target ') + fmt(o.target) : '']);
    } else if (o.bad) {
      var cm = monthDays(ty, tm).filter(function (d) { return d.cnt; }), cl = cm.filter(function (d) { return d.ok; }).length;
      tiles.push(['Clean days this month', cm.length ? Math.round(cl / cm.length * 100) + '%' : '–', cl + ' of ' + cm.length]);
    } else {
      var all = days.filter(function (d) { return d.done || d.bonus; }).length;
      tiles.push(['Done in total', plural(all, 'time'), 'since ' + o.start.getDate() + ' ' + MON[o.start.getMonth()]]);
    }

    /* ---- month vs last month (same days, so a half month isn't judged against a whole one) ---- */
    var delta = '', good = null;
    if (mtd != null && lmtd != null) {
      var diff = mtd - lmtd;
      good = diff === 0 ? null : (better === 'up') === diff > 0;
      delta = diff === 0 ? 'Same as last month' : kind === 'rate' ? (diff > 0 ? '+' : '−') + Math.abs(diff) + ' pts' :
        (diff > 0 ? '+' : '−') + fmt(Math.abs(diff)) + (lmtd ? ' (' + (diff > 0 ? '+' : '−') + Math.round(Math.abs(diff) / lmtd * 100) + '%)' : '');
    }
    var maxMv = Math.max(1, mtd || 0, lmtd || 0);
    var bar = function (lab, v, cls) { return '<div class="mvr"><span class="mvl">' + lab + '</span><div class="mvt"><div class="mvb ' + cls + '" style="width:' + Math.max(2, (v || 0) / (kind === 'rate' ? 100 : maxMv) * 100) + '%"></div></div><b>' + (v == null ? '–' : unitTxt(v)) + '</b></div>'; };
    var mom = '<section class="stc"><h4>This month vs last month</h4>' +
      bar(MON[tm] + ' 1–' + D, mtd, good == null ? 'same' : good ? 'cur' : 'worse') + bar(MON[lm] + ' 1–' + Math.min(D, lLen), lmtd, 'old') +
      '<p class="mvd ' + (good == null ? '' : good ? 'up' : 'down') + '">' + (delta ? (good == null ? '' : mtd > lmtd ? '▲ ' : '▼ ') + delta + (o.bad && good != null ? (good ? ' · fewer, well done' : ' · more than last month') : '') : 'Not enough history yet') + '</p>' +
      (lfull != null ? '<p class="small muted">All of ' + MON[lm] + ': ' + unitTxt(lfull) + '</p>' : '') + '</section>';

    /* ---- 6-month bars (SVG) ---- */
    var W = 340, H = 130, top = 18, bot = 22, bw = 34, gap = (W - bw * 6) / 6;
    var mx = Math.max.apply(null, months.map(function (m) { return m.v || 0; }).concat(kind === 'rate' ? [100] : [1]));
    var six = '<section class="stc"><h4>Last 6 months · ' + { rate: 'success rate', total: o.bad ? 'total (lower is better)' : 'total', count: 'times done', lapses: 'lapses (lower is better)' }[kind] + '</h4>' +
      '<svg viewBox="0 0 ' + W + ' ' + H + '" class="chart">' + months.map(function (m, i) {
        var x = gap / 2 + i * (bw + gap), hh = m.v == null ? 0 : Math.max(2, m.v / mx * (H - top - bot)), y = H - bot - hh;
        return '<rect x="' + x + '" y="' + y + '" width="' + bw + '" height="' + hh + '" rx="5" fill="' + (o.bad ? 'var(--bad)' : o.color) + '" opacity="' + (m.cur ? 1 : .45) + '"/>' +
          '<text x="' + (x + bw / 2) + '" y="' + (y - 5) + '" class="cv">' + (m.v == null ? '' : kind === 'rate' ? m.v + '%' : fmt(m.v)) + '</text>' +
          '<text x="' + (x + bw / 2) + '" y="' + (H - 6) + '" class="cl' + (m.cur ? ' on' : '') + '">' + m.lab + '</text>';
      }).join('') + '</svg>' + (months[5].v != null ? '<p class="small muted">' + MON[tm] + ' is so far.</p>' : '') + '</section>';

    /* ---- calendar ---- */
    var cm0 = new Date(ty, tm + (o.mon || 0), 1), cy = cm0.getFullYear(), cmn = cm0.getMonth(), len = new Date(cy, cmn + 1, 0).getDate();
    var lead = (cm0.getDay() - o.ws + 7) % 7, cells = '';
    for (var w = 0; w < 7; w++) cells += '<span class="cw">' + WD[(w + o.ws) % 7].charAt(0) + '</span>';
    for (var e = 0; e < lead; e++) cells += '<span></span>';
    for (var dn = 1; dn <= len; dn++) {
      var dd = byK[cy + '-' + pad(cmn + 1) + '-' + pad(dn)], cls = 'cd', st = '';
      if (!dd) cls += ' fut';
      else if (dd.s) cls += ' skp';
      else if (!dd.sch && !dd.bonus) cls += ' off';
      else if (o.bad) { if (!dd.ok) cls += ' lap'; else if (dd.cnt) cls += ' cln'; }
      else if (dd.ok) { cls += ' ok'; st = 'background:' + o.color; }
      else if (per) cls += ' off';   // N-times-a-week/month: a day without it isn't a miss
      else if (o.num && typeof dd.v === 'number' && dd.v > 0 && o.target) { cls += ' part'; st = 'background:' + o.color + ';opacity:' + (0.25 + 0.5 * Math.min(1, dd.v / o.target)); }
      if (dd && dd.isT) cls += ' tdy';
      cells += '<span class="' + cls + '"' + (st ? ' style="' + st + '"' : '') + '>' + dn + '</span>';
    }
    var canBack = new Date(cy, cmn, 1) > new Date(o.start.getFullYear(), o.start.getMonth(), 1);
    var cal = '<section class="stc"><div class="calh"><button class="ib" data-act="stMon" data-d="-1"' + (canBack ? '' : ' disabled') + ' aria-label="Earlier month">‹</button><h4>' + MON[cmn] + ' ' + cy + '</h4>' +
      '<button class="ib" data-act="stMon" data-d="1"' + ((o.mon || 0) < 0 ? '' : ' disabled') + ' aria-label="Later month">›</button></div><div class="cal">' + cells + '</div>' +
      '<p class="small muted calk">' + (o.bad ? '<i class="k lap"></i>did it <i class="k cln"></i>clean' : '<i class="k" style="background:' + o.color + '"></i>done' + (o.num ? ' <i class="k" style="background:' + o.color + ';opacity:.45"></i>part way' : '') + ' <i class="k ms"></i>missed') + ' <i class="k skp"></i>skip</p></section>';

    /* ---- last 30 days (measurable) ---- */
    var l30 = '';
    if (o.num) {
      var L = days.slice(-30), mv = Math.max.apply(null, L.map(function (d) { return typeof d.v === 'number' ? d.v : 0; }).concat([o.target || 1])) * 1.1;
      var W2 = 340, H2 = 120, b2 = W2 / 30, ty2 = o.target ? 110 - o.target / mv * 104 : null;
      l30 = '<section class="stc"><h4>Last 30 days</h4><svg viewBox="0 0 ' + W2 + ' ' + H2 + '" class="chart">' + L.map(function (d, i) {
        var v = typeof d.v === 'number' && !d.s ? d.v : 0, hh = v / mv * 104;
        return '<rect x="' + (i * b2 + 1.5) + '" y="' + (110 - hh) + '" width="' + (b2 - 3) + '" height="' + hh + '" rx="2" fill="' + (o.bad ? (d.ok ? 'var(--muted)' : 'var(--bad)') : d.ok ? o.color : 'var(--muted)') + '" opacity="' + (o.bad || d.ok ? 1 : .5) + '"/>';
      }).join('') + (ty2 != null ? '<line x1="0" x2="' + W2 + '" y1="' + ty2 + '" y2="' + ty2 + '" class="tl"/><text x="' + (W2 - 2) + '" y="' + (ty2 - 4) + '" class="tlt">' + (o.bad ? 'limit ' : 'target ') + fmt(o.target) + '</text>' : '') +
        '<text x="0" y="' + (H2 - 1) + '" class="cl" text-anchor="start">' + L[0].dt.getDate() + ' ' + MON[L[0].dt.getMonth()] + '</text><text x="' + W2 + '" y="' + (H2 - 1) + '" class="cl" text-anchor="end">Today</text></svg></section>';
    }

    /* ---- by weekday ---- */
    var wdv = [0, 1, 2, 3, 4, 5, 6].map(function (w) {
      var L = days.filter(function (d) { return d.dt.getDay() === w; }), c = L.filter(function (d) { return d.cnt; });
      if (o.bad) return { v: L.filter(function (d) { return d.done; }).length, n: c.length };
      return { v: c.length ? Math.round(c.filter(function (d) { return d.ok; }).length / c.length * 100) : null, n: c.length };
    });
    var wmx = Math.max(1, Math.max.apply(null, wdv.map(function (x) { return x.v || 0; }))), topW = -1, tv = -1;
    wdv.forEach(function (x, w) { if (x.v != null && x.n >= 3 && x.v > tv) { tv = x.v; topW = w; } });
    var wk = '<section class="stc"><h4>' + (o.bad ? 'Lapses by weekday' : 'Success by weekday') + '</h4><div class="wkb">' + [0, 1, 2, 3, 4, 5, 6].map(function (i) {
      var w = (i + o.ws) % 7, x = wdv[w], hh = x.v == null ? 0 : (o.bad ? x.v / wmx : x.v / 100) * 100;
      return '<div class="wkc"><span class="wkv">' + (x.v == null ? '' : o.bad ? x.v : x.v + '%') + '</span><div class="wkt"><div style="height:' + hh + '%;background:' + (o.bad ? 'var(--bad)' : o.color) + ';opacity:' + (w === topW ? 1 : .55) + '"></div></div><span class="wkl">' + WD[w] + '</span></div>';
    }).join('') + '</div>' + (topW >= 0 && days.length > 21 ? '<p class="small muted">' + (o.bad ? 'You slip most on ' : 'Your strongest day is ') + FULL[topW] + (o.bad ? 's.' : '.') + '</p>' : '') + '</section>';

    /* ---- SL 25 weekly buckets: each week's total against what the week asked for, with a running balance.
       Good: expected = target × scheduled days (N-a-week: N × target). Bad measurable: the limit is a weekly budget.
       The current week is judged on the days so far. Month-frequency and bad yes/no habits have no weekly quota. ---- */
    var wkB = '';
    if (f.t !== 'month' && !(o.bad && !o.num)) {
      var per1 = f.wt ? 1 : o.num ? (o.target || 0) : 1, W8 = [], wkS = function (d) { return key(addD(d.dt, -((d.dt.getDay() - o.ws + 7) % 7))); }, wm = {};
      days.forEach(function (d) {
        var k = wkS(d); if (!wm[k]) { wm[k] = { k: k, dt: addD(d.dt, -((d.dt.getDay() - o.ws + 7) % 7)), got: 0, sch: 0, dx: 0 }; W8.push(wm[k]); }
        var w = wm[k]; if (d.s) return;
        if (d.sch && !(d.isT && !d.ok && !o.bad)) { w.sch++; if (o.dayT) w.dx += o.dayT(key(d.dt)); }   // v5.29: a book's due = that day's pace, not the plain target
        if (o.num) { if (typeof d.v === 'number') w.got += d.v; } else if (d.ok && d.sch) w.got++;
      });
      W8 = W8.slice(-8);
      if (W8.length && per1) {
        var bal = 0;
        W8.forEach(function (w) { w.exp = r1(f.wt ? f.wt : o.dayT && f.t !== 'week' ? w.dx : f.t === 'week' ? Math.min(N, w.sch) * per1 : w.sch * per1); w.got = r1(w.got); w.diff = r1(o.bad ? w.exp - w.got : w.got - w.exp); if (f.t === 'week' && w === W8[W8.length - 1] && w.diff < 0) w.diff = 0; bal = r1(bal + w.diff); w.bal = bal; });
        var u = o.num ? (o.unit ? ' ' + esc(o.unit) : '') : '';
        var sg = function (v) { return (v > 0 ? '+' : v < 0 ? '−' : '') + fmt(Math.abs(v)); };
        wkB = '<section class="stc"><h4>Weekly buckets' + (o.bad ? ' · weekly budget' : '') + '</h4><div class="wbk"><span>Week of</span><span>' + (o.bad ? 'Used' : 'Done') + '</span><span>' + (o.bad ? 'Budget' : 'Due') + '</span><span>Week</span><span>Running</span>' +
          W8.slice().reverse().map(function (w, i) {
            return '<span>' + w.dt.getDate() + ' ' + MON[w.dt.getMonth()] + (i === 0 ? ' <em>so far</em>' : '') + '</span><span>' + fmt(w.got) + '</span><span class="muted">' + fmt(w.exp) + '</span>' +
              '<b class="' + (w.diff >= 0 ? 'up' : 'down') + '">' + sg(w.diff) + '</b><b class="' + (w.bal >= 0 ? 'up' : 'down') + '">' + sg(w.bal) + '</b>';
          }).join('') + '</div><p class="small muted">' + (o.bad ? 'Budget = your daily limit × days. + means you stayed under it' : '+ means ahead of what the week asked for') +
          '; Running carries it over from week to week' + u.replace(/^ /, ' (in ') + (u ? ')' : '') + '. Latest week first.</p></section>';
      }
    }

    return '<div class="tiles">' + tiles.map(function (t) { return '<div class="tile"><span>' + t[0] + '</span><b>' + esc(t[1]) + '</b>' + (t[2] ? '<em>' + esc(t[2]) + '</em>' : '') + '</div>'; }).join('') + '</div>' + (o.extra || '') +
      mom + wkB + cal + l30 + six + wk;
  }
  window.Stats = { build: build, key: key };
})();
