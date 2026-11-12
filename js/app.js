/* App: main list (frozen habit column, 31 days side-scroll, newest day on the left), create/edit habit,
   long-press to mark, number entry for measurable habits, Settings, Update app, SW registration.
   One delegated click handler: data-act → actions[name](el). Long-press handled separately on .c cells. */
(function () {
  var S = window.Store, C = window.APP_CONFIG, root = document.getElementById('app');
  var NDAYS = 31, CELL = 48;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function num(v) { return Math.round(v * 100) / 100; }
  var WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var COLORS = ['#E5737B', '#F28C6B', '#F2A65A', '#F5D27A', '#5BC48A', '#9EC27A', '#D4D86A', '#F2E25A',
    '#5BC4C0', '#6AD3E0', '#7FB3FF', '#4E9BF0', '#F27BA8', '#C98BE0', '#A99BF0', '#8F9BE0',
    '#C4A49A', '#F0F0F0', '#C9CDD2', '#9AA0A6'];
  var ICON = {
    plus: '<svg class="i" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    more: '<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/></svg>',
    back: '<svg class="i" viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    tick: '<svg class="tk" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    cross: '<svg class="xx" viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg>',
    filter: '<svg class="i" viewBox="0 0 24 24"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
    pen: '<svg class="i" viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg>',
    palette: '<svg class="i" viewBox="0 0 24 24"><path d="M12 3a9 9 0 100 18c1.1 0 1.6-.8 1.6-1.6 0-.9-.7-1.3-.7-2.1 0-.9.7-1.5 1.6-1.5H17a4 4 0 004-4c0-4.9-4-8.8-9-8.8z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="14.5" cy="7" r="1"/></svg>',
    archive: '<svg class="i" viewBox="0 0 24 24"><path d="M3 4h18v4H3zM5 8v12h14V8M10 12h4"/></svg>',
    unarchive: '<svg class="i" viewBox="0 0 24 24"><path d="M3 4h18v4H3zM5 8v12h14V8M12 17v-6M9.5 13.5L12 11l2.5 2.5"/></svg>',
    bin: '<svg class="i" viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
    skip: '<svg class="sk" viewBox="0 0 24 24"><path d="M6 7l5 5-5 5M13 7l5 5-5 5"/></svg>',
    check: '<svg class="i" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    fold: '<svg class="i" viewBox="0 0 24 24"><path d="M7 4l5 5 5-5M7 20l5-5 5 5"/></svg>',
    // Bottom-bar fold control, one icon per mode: arrows apart = all expanded, arrows together = all collapsed,
    // one open row + one closed row = each group as set in Edit.
    fOpen: '<svg class="i" viewBox="0 0 24 24"><path d="M7 8l5-5 5 5M7 16l5 5 5-5M5 12h14"/></svg>',
    fShut: '<svg class="i" viewBox="0 0 24 24"><path d="M7 3l5 5 5-5M7 21l5-5 5 5M5 12h14"/></svg>',
    fMan: '<svg class="i" viewBox="0 0 24 24"><path d="M3.5 5.5l3 3 3-3M12.5 7h8M5 13.5l3 3-3 3M12.5 16.5h8"/></svg>',
    star: '<svg class="i" viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>',
    starOn: '<svg class="i" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>',
    list: '<svg class="i" viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/></svg>',
    tabs: '<svg class="i" viewBox="0 0 24 24"><path d="M3 7h6l2 2h10v10H3z"/><path d="M3 7V5h6l2 2"/></svg>',
    chart: '<svg class="i" viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/></svg>',
    scale: '<svg class="i" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M8 9.5a5 5 0 018 0M12 9.5l1.6-2"/></svg>',
    sync: '<svg class="i" viewBox="0 0 24 24"><path d="M20 12a8 8 0 01-14.3 4.9M4 12a8 8 0 0114.3-4.9"/><path d="M18.5 3v4.5H14M5.5 21v-4.5H10"/></svg>',
    cloudOk: '<svg class="i" viewBox="0 0 24 24"><path d="M7 18.5h10.5a4 4 0 00.6-8 6 6 0 00-11.6-1.4A4.6 4.6 0 007 18.5z"/><path d="M9.5 13.5l2 2 3.5-3.8"/></svg>',
    eye: '<svg class="i" viewBox="0 0 24 24"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeOff: '<svg class="i" viewBox="0 0 24 24"><path d="M3 3l18 18M10.6 6a9.8 9.8 0 011.4-.1c6 0 9.5 6.1 9.5 6.1a16 16 0 01-2.6 3.3M6.2 6.9A16.7 16.7 0 002.5 12s3.5 6.5 9.5 6.5a9 9 0 004.6-1.3M9.9 10a3 3 0 004.1 4.1"/></svg>',
    cal: '<svg class="i" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
    clock: '<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>'
  };
  var VIEW_NAME = { all: 'Main', star: 'Starred', arch: 'Archived', win: 'Outside time window', due: 'Overdue & missed' };
  var SYNC_TXT = { off: 'Not signed in', syncing: 'Syncing…', ok: 'Synced', paused: 'Sync paused', error: 'Sync error' };

  /* ---- what a cell shows ---- */
  function met(h, v) { return h.tt === 'max' ? v <= h.target : v >= h.target; }
  /* ---- v5.5 Repeats (Google Tasks style) and "If not done". Occurrences come from a fixed schedule (every N days /
     weeks on chosen weekdays / months on a date) or from the day it was last done (every N days after done).
     If not done: 'drop' = missed when its day ends; 'stay' = stays due (red "due Nd") until done, its next turn, or keep days.
     A tick on a later day completes the open occurrence as "done late". Legacy weekday habits = every 1 week. ---- */
  function dn(dt) { return Math.round(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()) / 864e5); }
  function fromDn(n) { var u = new Date(n * 864e5); return new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate(), 12); }
  function kDn(k) { var p = k.split('-'); return Math.round(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 864e5); }
  function enfG(h) { var g = h.parent && S.habit(h.parent); return g && g.enf ? g : null; }   // group that enforces its schedule
  function fq(h) {
    var f = (enfG(h) || h).freq || { t: 'day' };
    if (f.t === 'days') return f.days && f.days.length ? { t: 'rep', ev: 1, u: 'w', days: f.days, from: 'sch', a: '2000-01-01' } : { t: 'day' };
    return f;
  }
  function missOf(h) { return (enfG(h) || h).miss || { t: 'drop' }; }
  function isRep(h) { return fq(h).t === 'rep'; }
  function wkN(n) { var ws = S.d.settings.weekStart || 0; return Math.floor((n + (4 - ws + 7) % 7) / 7); }
  function onSched(f, n) {
    var a = kDn(f.a || '2000-01-01'), ev = Math.max(1, f.ev || 1), dt = fromDn(n); if (n < a) return false;
    if (f.u === 'd') return (n - a) % ev === 0;
    if (f.u === 'w') { var ds = f.days && f.days.length ? f.days : [fromDn(a).getDay()]; return ds.indexOf(dt.getDay()) >= 0 && (wkN(n) - wkN(a)) % ev === 0; }
    var ad = fromDn(a), mi = dt.getFullYear() * 12 + dt.getMonth() - (ad.getFullYear() * 12 + ad.getMonth());
    if (mi % ev) return false;
    var last = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate(); return dt.getDate() === Math.min(f.md || ad.getDate(), last);
  }
  function addIv(f, n) {
    var ev = Math.max(1, f.ev || 1); if (f.u === 'd') return n + ev; if (f.u === 'w') return n + 7 * ev;
    var d = fromDn(n), t = new Date(d.getFullYear(), d.getMonth() + ev, 1, 12), last = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
    t.setDate(Math.min(d.getDate(), last)); return dn(t);
  }
  function doneOn(h, k) { if (isGroup(h)) return groupRes(h, k).ok; var v = S.val(h.id, k); return v != null && (h.type === 'yn' ? !!v : met(h, v)); }
  var RC = null;   // repeat status per habit; cleared on every save and render
  var _save = S.save; S.save = function () { RC = null; return _save.apply(S, arguments); };
  function rep(h) {
    if (!isRep(h)) return null; RC = RC || {}; if (RC[h.id]) return RC[h.id];
    var f = fq(h), m = missOf(h), stay = m.t === 'stay' && h.kind !== 'bad', keep = stay && m.keep > 0 ? m.keep : 0;
    var T = kDn(S.today()), a = kDn(f.a || '2000-01-01'), O = [], next = null;
    var span = function (o) { return stay ? (keep ? o + keep + 1 : Infinity) : o + 1; };
    var find = function (o, e) { for (var n = o; n < Math.min(e, T + 1); n++) if (doneOn(h, S.key(fromDn(n)))) return n; return -1; };
    var put = function (o, e) { var d = find(o, e); O.push(d >= 0 ? { o: o, d: d } : e <= T ? { o: o, miss: 1 } : { o: o, open: 1 }); return d; };
    if (f.from === 'done') {
      var o = Math.max(a, T - 2000), g = 0;
      while (o <= T && g++ < 2000) { var d = put(o, span(o)); if (O[O.length - 1].open) break; o = addIv(f, d >= 0 ? d : o); }
      if (!O.length || !O[O.length - 1].open) next = o;
    } else {
      var oc = []; for (var n = Math.max(a, T - 800); n <= T; n++) if (onSched(f, n)) oc.push(n);
      oc.forEach(function (o, i) { put(o, Math.min(span(o), i + 1 < oc.length ? oc[i + 1] : Infinity)); });
      for (var q = T + 1; q < T + 800 && next == null; q++) if (onSched(f, q)) next = q;
    }
    var r = { occ: {}, ok: {}, late: {}, miss: {}, on: 0, lt: 0, ms: 0, next: next }, L = O[O.length - 1];
    O.forEach(function (x) { r.occ[x.o] = 1; if (x.miss) { r.miss[x.o] = 1; r.ms++; } else if (x.d != null) { r.ok[x.o] = 1; if (x.d > x.o) { r.late[x.d] = x.o; r.lt++; } else r.on++; } });
    r.open = !!(L && L.open); r.due = r.open ? T - L.o : -1;   // 0 = due today, n = n days overdue
    r.show = r.open || !!(L && L.d === T);                    // on today's list: due, overdue, or done today
    r.lastMiss = !!(L && L.miss);
    return (RC[h.id] = r);
  }
  function scheduled(h, dt) { return isRep(h) ? !!rep(h).occ[dn(dt)] : true; }
  function dayTxt(n) { var d = fromDn(n); return WD[d.getDay()] + ' ' + d.getDate() + ' ' + MON3[d.getMonth()] + (d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : ''); }
  function freqTxt(h) {
    var f = fq(h), U = { d: ['day', 'days'], w: ['week', 'weeks'], m: ['month', 'months'] };
    if (f.t === 'week') return f.n + '× a week'; if (f.t === 'month') return f.n + '× a month'; if (f.t !== 'rep') return 'Every day';
    var ev = Math.max(1, f.ev || 1), u = U[f.u] || U.d, s = 'Every ' + (ev > 1 ? ev + ' ' + u[1] : u[0]), a = fromDn(kDn(f.a || '2000-01-01'));
    if (f.from === 'done') s += ' after done';
    else if (f.u === 'w') s += ' on ' + (f.days && f.days.length ? f.days : [a.getDay()]).map(function (d) { return WD[d]; }).join(', ');
    else if (f.u === 'm') s += ' on day ' + (f.md || a.getDate());
    var m = missOf(h); if (m.t === 'stay' && h.kind !== 'bad') s += ' · stays due' + (m.keep ? ' up to ' + m.keep + ' d' : '');
    return s;
  }
  function dueTag(h) {
    var r = rep(h); if (!r) return '';
    return r.due > 0 ? '<small class="due">(due ' + r.due + 'd)</small>' : view() === 'due' && r.lastMiss ? '<small class="due">(missed)</small>' : '';
  }
  function cellHtml(h, d) {
    var v = S.val(h.id, d.k), r = rep(h), tdy = d.k === S.today(), sch = scheduled(h, d.dt) || (tdy && r && r.open);
    var cls = 'c' + (sch ? '' : ' off') + (tdy ? ' tdy' : '') + (r && r.miss[dn(d.dt)] ? ' miss' : ''), inner;
    if (S.skipped(h.id, d.k)) { cls += ' skp'; inner = ICON.skip; }
    else if (h.type === 'yn') {
      if (v) { cls += h.kind === 'bad' ? ' bad' : ' ok'; inner = ICON.tick; } else inner = ICON.cross;
    } else {
      var has = v != null;
      if (has) cls += h.kind === 'bad' ? (met(h, v) ? ' nb' : ' bad') : (met(h, v) ? ' ok' : ' part');
      inner = '<b>' + (has ? num(v) : 0) + '</b>' + (h.unit ? '<i>' + esc(h.unit) + '</i>' : '');
    }
    return '<div class="' + cls + '" data-h="' + h.id + '" data-k="' + d.k + '">' + inner + '</div>';
  }

  /* ---- Groups: one level. A habit with sub-habits is a group; its cells show the sub-habits' result
     (Sum of their values, or a tick when N of them are done). Archived sub-habits don't count. ---- */
  function subs(id) { return S.habits().filter(function (x) { return x.parent === id; }); }
  function liveSubs(id) { return subs(id).filter(function (x) { return !x.archived; }); }
  function isGroup(h) { return !h.parent && subs(h.id).length > 0; }
  function subDone(x, k) { var v = S.val(x.id, k); return v != null && (x.type === 'yn' ? !!v : met(x, v)); }
  function groupRes(h, k) {
    var ss = liveSubs(h.id).filter(function (x) { return !S.skipped(x.id, k); }), sum = 0, done = 0;   // a skipped sub-habit doesn't count
    ss.forEach(function (x) { var v = S.val(x.id, k); if (v != null) sum += x.type === 'yn' ? (v ? 1 : 0) : v; if (subDone(x, k)) done++; });
    var need = h.agg && h.agg.t === 'count' ? Math.min(h.agg.n || ss.length, ss.length) : 0;
    var ok = h.agg && h.agg.t === 'count' ? (ss.length > 0 && done >= need) : (h.target > 0 ? sum >= h.target : false);
    return { sum: num(sum), done: done, total: ss.length, need: need, ok: ok };
  }
  function groupCell(h, d) {
    var r = groupRes(h, d.k), cls = 'c grp-c' + (d.k === S.today() ? ' tdy' : ''), inner;
    if (h.agg && h.agg.t === 'count') {
      if (r.ok) { cls += ' ok'; inner = ICON.tick; }
      else if (r.done && h.agg.prog !== false) { cls += ' part'; inner = '<b>' + r.done + '</b><i>of ' + r.need + '</i>'; }
      else inner = ICON.cross;
    } else {
      if (r.sum) cls += r.ok ? ' ok' : ' part';
      inner = '<b>' + r.sum + '</b>' + (h.unit ? '<i>' + esc(h.unit) + '</i>' : '');
    }
    return '<div class="' + cls + '" data-h="' + h.id + '" data-k="' + d.k + '">' + inner + '</div>';
  }
  function anyCell(h, d) { return isGroup(h) ? groupCell(h, d) : cellHtml(h, d); }
  /* Fold modes (bottom bar): 'open' all expanded, 'shut' all collapsed, 'man' each group's own default (h.fold0, set in Edit).
     Tapping a group overrides it until the mode changes (ui.fx). In 'shut', opening one group closes the others. */
  function foldMode() { return S.d.ui.foldMode || 'man'; }
  // Starred view: a group that isn't starred itself only frames its starred sub-habits — always open, italic, can't be edited or selected.
  function ctxGrp(h) { return !!h && view() === 'star' && !h.parent && !h.star && isGroup(h); }
  function folded(id) {
    if (ctxGrp(S.habit(id))) return false;
    var fx = S.d.ui.fx || {}, m = foldMode(), h = S.habit(id);
    if (id in fx) return fx[id];
    return m === 'open' ? false : m === 'shut' ? true : !!(h && h.fold0);
  }

  /* ---- v4 Time window: "Show from" / "Hide after" (clock time). Applies to today's list only.
     A group's window covers its whole card; a sub-habit can also have its own. Returns -1 not yet, 1 expired, 0 inside. ---- */
  /* SL 35: a window edge is a clock time 'HH:MM' or a prayer 'p:<prayer>:<offset min>' (e.g. 'p:asr:-15'),
     worked out for today at his saved location; with no location set, a prayer edge is treated as no limit. */
  var ptCache = {};
  function prayerToday() {
    var L = S.d.settings.pt; if (!L || L.lat == null) return null;
    var k = S.today() + JSON.stringify(L); if (!ptCache[k]) { ptCache = {}; ptCache[k] = Prayer.times(S.todayDate(), L); }
    return ptCache[k];
  }
  function mins(s) {
    if (!s) return null;
    if (s.indexOf('p:') === 0) { var q = s.split(':'), T = prayerToday(); return T && T[q[1]] != null ? T[q[1]] + (+q[2] || 0) : null; }
    var p = s.split(':'); return +p[0] * 60 + (+p[1] || 0);
  }
  function edgeTxt(s) {
    if (s.indexOf('p:') !== 0) return s;
    var q = s.split(':'), o = +q[2] || 0, m = mins(s);
    return m != null ? Prayer.hm(m) : Prayer.NAMES[q[1]] + (o ? (o > 0 ? '+' : '−') + Math.abs(o) + 'm' : '');   // the list shows today's actual time
  }
  function winOwn(h) {
    var w = h.win || {}, f = mins(w.from), t = mins(w.to); if (f == null && t == null) return 0;
    var ext = (S.d.settings.extendH || 0) * 60, n = new Date(), m = n.getHours() * 60 + n.getMinutes();
    if (f == null) f = 0; if (t == null) t = 1440 + ext;
    if (t < f) t += 1440;                                  // window crosses midnight, e.g. 21:00 → 01:00
    if (m < f && (m < ext || m + 1440 <= t)) m += 1440;    // after midnight but still "today" (Extend day) or inside a midnight-crossing window
    return m < f ? -1 : m > t ? 1 : 0;
  }
  function winOf(h) { var g = h.parent && S.habit(h.parent), w = g ? winOwn(g) : 0; return w || winOwn(h); }
  function winTxt(h) { var w = h.win || {}, f = w.from && edgeTxt(w.from), t = w.to && edgeTxt(w.to); return f && t ? f + '–' + t : f ? 'from ' + f : t ? 'until ' + t : ''; }

  /* ---- v4 Views: 'all', 'star', a tab id, 'arch' (archived), 'win' (hidden by time window) ---- */
  function tabsMode() { var m = S.d.settings.tabsMode; return m === 'top' || m === 'off' ? m : 'bottom'; }   // tab strip at top, above the bottom bar, or one page
  function visTabs() { return S.tabs().filter(function (t) { return !t.hidden; }); }
  function stripTabs() { var sa = S.d.ui.showArchTabs; return S.tabs().filter(function (t) { return !t.hidden || sa; }); }   // archived tabs only when "Archived" is flipped on
  function view() {
    var v = S.d.ui.view || 'all';
    if (VIEW_NAME[v]) return v;
    var t = S.tab(v); return t && (!t.hidden || S.d.ui.showArchTabs) && tabsMode() !== 'off' ? v : 'all';
  }
  function tabOrder() { return ['all'].concat(stripTabs().map(function (t) { return t.id; })); }
  function toggleView(x) {   // Starred / Archived / Later / Overdue: tap again = back to the tab you came from
    var v = view(); if (v === x) return setView(S.d.ui.prev && tabOrder().indexOf(S.d.ui.prev) >= 0 ? S.d.ui.prev : 'all');
    if (tabOrder().indexOf(v) >= 0) S.d.ui.prev = v; setView(x);
  }
  function setView(v) { S.d.ui.view = v; S.saveUi(); var sc = document.getElementById('sc'); if (sc) sc.scrollTop = 0; App.render(true); }
  function topOf(h) { return h.parent && S.habit(h.parent) || h; }
  function tabOf(h) { return S.tab(topOf(h).tab); }
  // base: may this habit be on screen at all right now (hidden tab, archive, time window, entered)?
  function base(h, v) {
    var tb = tabOf(h), g = h.parent && S.habit(h.parent), f = S.d.settings;
    if (tb && tb.hidden && !(S.d.ui.showArchTabs && v === tb.id)) return false;   // an archived tab's habits show only while you're in it
    if (v === 'arch') return true;
    if (f.hideArchived && (h.archived || (g && g.archived))) return false;
    if (v === 'win' || v === 'due') return true;
    if (winOf(h)) return false;
    if (f.hideNotDue !== false && !sel && isRep(h) && !rep(h).show) return false;   // v5.5: a repeat shows only when due (or overdue)
    if (f.skipDays && f.hideSkipped && !sel && skippedToday(h)) return false;
    if (f.hideEntered && !sel && enteredToday(h) && !skippedToday(h)) return false;
    return true;
  }
  // member: does it belong to this view (tab, starred, archived, outside its window)?
  function member(h, v) {
    var g = h.parent && S.habit(h.parent);
    if (v === 'arch') return !!(h.archived || (g && g.archived));
    if (v === 'win') return winOf(h) !== 0;
    if (v === 'star') return !!(h.star || (g && g.star));
    if (v === 'due') { var r = rep(h); return !!r && (r.due > 0 || r.lastMiss); }
    if (v === 'all') return tabsMode() === 'off' || !tabOf(h);   // Main = habits with no tab of their own
    var tb = tabOf(h); return !!tb && tb.id === v;
  }
  // Habits on screen, in order. A group shows when it belongs itself, or (as context) when one of its sub-habits does.
  function shownList() {
    var v = view(), all = S.habits(), keep = {};
    all.forEach(function (h) {
      if (h.parent && S.habit(h.parent)) return;
      if (!base(h, v)) return;
      var ss = subs(h.id).filter(function (x) { return base(x, v) && member(x, v); });
      if (member(h, v) || ss.length) { if (member(h, v) || v !== 'star' || S.d.settings.starGroups !== false) keep[h.id] = 1; ss.forEach(function (x) { keep[x.id] = 1; }); }
    });
    return all.filter(function (h) { return keep[h.id]; });
  }
  var lastWin = '';
  function winSig() { return S.habits().map(function (h) { return winOf(h); }).join(''); }
  function winCount() {
    return S.habits().filter(function (h) { var tb = tabOf(h); return winOf(h) !== 0 && !h.archived && !(tb && tb.hidden); }).length;
  }

  var App = {
    render: function (resetScroll) {
      var sc = document.getElementById('sc'), keep = sc && !resetScroll ? { l: sc.scrollLeft, t: sc.scrollTop } : null;
      RC = null;
      var days = S.days(NDAYS), all = S.habits(), list = shownList(), v = view(), mode = tabsMode(), f = S.d.settings;
      if (sel) Object.keys(sel).forEach(function (id) { if (!S.habit(id)) delete sel[id]; });
      var head = '<div class="drow"><div class="nm"></div>' + days.map(function (d, i) {
        return '<div class="dh' + (i === 0 ? ' tdy' : '') + '"><span>' + WD[d.dt.getDay()].toUpperCase() + '</span><b>' + d.dt.getDate() + '</b></div>';
      }).join('') + '</div>';
      // Top-level habits in order; each group card holds its parent row and (unless folded) its sub-habits.
      var shown = {}; list.forEach(function (h) { shown[h.id] = 1; });
      var rowHtml = function (h, cls, grp) {
        var wt = (v === 'win' || winOwn(h)) && winTxt(h), cx = grp && ctxGrp(h);
        if (cx) { grp = false; cls += ' ctx'; }
        return '<div class="hrow' + cls + (sel && sel[h.id] ? ' sel' : '') + (h.archived ? ' arch' : '') + '" data-row="' + h.id + '">' +
          '<div class="nm" data-act="edit" data-id="' + h.id + '"><div class="nmi">' +
          (grp ? '<svg class="chev' + (folded(h.id) ? '' : ' open') + '" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>' : cls.indexOf(' sub') < 0 ? '<i class="chev"></i>' : '') +
          '<span style="color:' + esc(h.color) + '">' + esc(h.name) + dueTag(h) + (wt ? '<small class="wt">' + esc(wt) + '</small>' : '') + '</span>' +
          (h.star && v !== 'star' ? '<svg class="st" viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>' : '') +
          (grp && folded(h.id) ? '<em>' + liveSubs(h.id).length + '</em>' : '') + '</div></div>' +
          days.map(function (d) { return anyCell(h, d); }).join('') + '</div>';
      };
      var card = function (h) {
        var grp = isGroup(h), ss = grp && !folded(h.id) ? subs(h.id).filter(function (x) { return shown[x.id]; }) : [];
        return '<div class="grp' + (grp ? ' isgrp' : '') + '" data-grp="' + h.id + '">' +
          rowHtml(h, ' gtop rt' + (ss.length ? '' : ' rb'), grp) +
          ss.map(function (x, i) { return rowHtml(x, ' sub' + (i === ss.length - 1 ? ' rb' : ''), false); }).join('') + '</div>';
      };
      var tops = list.filter(function (h) { return !h.parent || !S.habit(h.parent) || !shown[h.parent]; }), rows;
      if (mode === 'off' && (v === 'all' || v === 'star') && S.tabs().length) {
        // One page, a header per tab: habits with no tab first, then each tab's habits under its name.
        // SL 41: tap a header to fold/unfold that tab's section (ui.secFold, this phone only); headers stay pinned under the date row.
        var by = function (id) { return tops.filter(function (h) { var t = S.tab(h.tab); return (t ? t.id : null) === id; }); };
        var sf = S.d.ui.secFold || {};
        var sec = function (id, name, hs) {
          var shut = !!sf[id];
          return '<button class="sech" data-act="secFold" data-sec="' + id + '"><svg class="chev' + (shut ? '' : ' open') + '" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg><span>' + esc(name) + '</span>' +
            (shut ? '<em>' + hs.length + '</em>' : '') + '</button>' + (shut ? '' : hs.map(card).join(''));
        };
        rows = (by(null).length && visTabs().length ? sec('main', 'Main', by(null)) : by(null).map(card).join('')) + visTabs().map(function (t) {
          var hs = by(t.id); return hs.length ? sec(t.id, t.name, hs) : '';
        }).join('');
      } else rows = tops.map(card).join('');
      var n = sel ? Object.keys(sel).length : 0, lit = f.hideEntered || !f.hideArchived;
      var bar, logo = '<button class="logo" data-act="home" aria-label="Main"><img src="icons/icon-192.png" alt=""></button>';
      // v5.5 tab strip: Main first, full name on the open tab, short name on the others; side-scrolls
      // Full names; fitChips() swaps inactive tabs to their short names only when the strip runs out of room
      var chips = '<div class="chips' + (tp ? ' editing' : '') + '" id="chips">' + [{ id: 'all', name: 'Main' }].concat(stripTabs()).map(function (t) {
          return '<button class="tchip' + (v === t.id ? ' on' : '') + (t.hidden ? ' arch' : '') + (tp && tp.id === t.id ? ' tsel' : '') + '" data-act="goTab" data-tab="' + t.id + '" data-full="' + esc(t.name) + '" data-short="' + esc(t.short || t.name) + '">' + esc(t.name) + '</button>';
        }).join('') + '</div>';   // new tabs: hold any tab → panel → New
      var tpan = tp && mode !== 'off' ? tabPanel() : '';
      var gOn = f.starGroups !== false;
      var vbar = v === 'star' ? '<div class="vbar"><span>' + (mode === 'top' ? 'Starred' : '') + '</span><button class="flip" data-act="flipGroups" aria-pressed="' + gOn + '">Show groups<i class="tgl' + (gOn ? ' on' : '') + '"></i></button></div>'
        : mode === 'top' && VIEW_NAME[v] && v !== 'all' ? '<div class="vlabel">' + VIEW_NAME[v] + '</div>' : '';
      if (sel) bar = '<header class="top selbar"><button class="ib" data-act="selDone" aria-label="Done">' + ICON.back + '</button><h1>' + n + '</h1>' +
        (n === 1 ? '<button class="ib" data-act="selEdit" aria-label="Edit">' + ICON.pen + '</button>' : '') +
        '<button class="ib' + (allStarred() ? ' lit' : '') + '" data-act="selStar" aria-label="' + (allStarred() ? 'Unstar' : 'Star') + '"' + (n ? '' : ' disabled') + '>' + (allStarred() ? ICON.starOn : ICON.star) + '</button>' +
        '<button class="ib" data-act="selArchive" aria-label="' + (allArchived() ? 'Unarchive' : 'Archive') + '"' + (n ? '' : ' disabled') + '>' + (allArchived() ? ICON.unarchive : ICON.archive) + '</button>' +
        '<button class="ib" data-act="selDelete" aria-label="Delete"' + (n ? '' : ' disabled') + '>' + ICON.bin + '</button>' +
        '<button class="ib" data-act="selMore" aria-label="More"' + (n ? '' : ' disabled') + '>' + ICON.more + '</button></header>';
      else if (mode === 'top') bar = '<header class="top tstrip">' + logo + chips + syncBtn() + '<button class="ib" data-act="menu" aria-label="More">' + ICON.more + '</button></header>' + tpan + vbar;
      else bar = '<header class="top">' + logo + '<h1>' + esc(v === 'all' && mode === 'off' ? 'Habits' : VIEW_NAME[v] || S.tab(v).name) + '</h1>' +
        '<button class="ib" data-act="add" aria-label="Add habit">' + ICON.plus + '</button>' +
        '<button class="ib' + (lit ? ' lit' : '') + '" data-act="filter" aria-label="Filter">' + ICON.filter + '</button>' +
        syncBtn() + '<button class="ib" data-act="menu" aria-label="More">' + ICON.more + '</button></header>' + vbar;
      var wc = winCount(), tabV = !VIEW_NAME[v] || v === 'all';
      var rb = function (act, icon, label, on, extra) { return '<button class="rbtn' + (on ? ' on' : '') + '" data-act="' + act + '" aria-label="' + label + '">' + icon + '<span>' + label + '</span>' + (extra || '') + '</button>'; };
      var ribbon = (mode === 'bottom' && !sel ? tpan + '<div class="bstrip">' + chips + '</div>' : '') + '<nav class="rib">' +
        rb('starToggle', v === 'star' ? ICON.starOn : ICON.star, 'Starred', v === 'star') +
        (mode === 'top' ? rb('filter', ICON.filter, 'Filter', lit) + rb('add', ICON.plus, 'Add', false) : '') +
        rb('viewArch', ICON.archive, 'Archived', v === 'arch') +
        rb('viewWin', ICON.clock, 'Later', v === 'win', wc ? '<i class="bdg">' + wc + '</i>' : '') +
        (all.some(isGroup) ? '<button class="rbtn ionly" data-act="foldCycle" aria-label="' + { open: 'All groups expanded', shut: 'All groups collapsed', man: 'Groups as set in Edit' }[foldMode()] + '">' +
          { open: ICON.fOpen, shut: ICON.fShut, man: ICON.fMan }[foldMode()] + '</button>' : '') +
        rb('weight', ICON.scale, 'Weight', false) + '</nav>';
      var empty = {
        star: 'No starred habits yet. Hold a habit’s name, then tap ☆.',
        arch: 'No archived habits.',
        due: 'Nothing overdue or missed.',
        win: 'Nothing is waiting for its time window right now.'
      }[v];
      var nd = f.hideNotDue !== false && !list.length ? all.filter(function (h) { return !h.parent && isRep(h) && member(h, v) && !rep(h).show && !(f.hideArchived && h.archived); }).length : 0;
      var demoBar = S.demo ? '<div class="demobar"><span>Demo data · your own habits are safe</span><button class="btn sm" data-act="demoOff">Exit demo</button></div>' : '';
      root.innerHTML = bar + demoBar +
        (list.length ? '<div class="sc" id="sc"><div class="grid" id="grid">' + head + rows + '</div><div class="swp" id="swp"></div></div>'
          : empty ? '<div class="empty"><p>' + empty + '</p></div>'
          : all.length ? '<div class="empty"><p>' + (nd ? 'Nothing due today here.' : f.hideEntered ? 'All done for now.' : 'Nothing to show here.') + '</p>' + (nd ? '<p class="small">' + nd + ' repeat' + (nd > 1 ? 's' : '') + ' not due today — Filter shows them.</p>' : '') + '<button class="btn" data-act="' + (tabV ? 'add' : 'filter') + '">' + (tabV ? 'Add a habit to this tab' : 'Filter') + '</button></div>'
          : '<div class="empty"><p>No habits yet.</p><button class="btn pri" data-act="add">Add your first habit</button><button class="btn" data-act="demoOn">Try demo data</button></div>') + ribbon;
      root.classList.toggle('sublines', f.subLines !== false);
      root.classList.toggle('noscr', f.hScroll === false);
      root.classList.toggle('nofrz', f.freezeToday === false);
      sizeCols();
      var dr = root.querySelector('.drow'); if (dr) root.style.setProperty('--dh', dr.offsetHeight + 'px');
      var scx = document.getElementById('sc'); if (scx) root.style.setProperty('--scw', scx.clientWidth + 'px');   // section headers pin just below the date row
      sc = document.getElementById('sc');
      var swp = document.getElementById('swp'); if (swp) swp.style.minHeight = Math.max(96, sc.clientHeight - document.getElementById('grid').offsetHeight - 24) + 'px';   // blank area: swipe to change tab
      if (sc && keep) { sc.scrollLeft = f.hScroll === false ? 0 : keep.l; sc.scrollTop = keep.t; }
      if (sc) { var edge = function () { sc.classList.toggle('hs', sc.scrollLeft > 2); }; sc.addEventListener('scroll', edge, { passive: true }); edge(); }
      fitChips();
      var on = document.querySelector('.tchip.on'); if (on && resetScroll) on.scrollIntoView({ inline: 'center', block: 'nearest' });
      lastWin = winSig();
    },
    refreshRow: function (hid) {   // after a mark: redraw one row's cells, keep scroll
      var h = S.habit(hid); if (!h) return App.render();
      var g = h.parent && S.habit(h.parent);
      var ids = {}; shownList().forEach(function (x) { ids[x.id] = 1; });
      if (!ids[h.id] || (g && !ids[g.id]) || isRep(h) || (g && isRep(g))) return App.render();   // a repeat's due count may change   // Hide entered: row leaves once today is done
      S.days(NDAYS).forEach(function (d) {
        var el = root.querySelector('.c[data-h="' + hid + '"][data-k="' + d.k + '"]');
        if (el) el.outerHTML = cellHtml(h, d);
        if (h.parent) { var g = S.habit(h.parent), ge = g && root.querySelector('.c[data-h="' + g.id + '"][data-k="' + d.k + '"]'); if (ge) ge.outerHTML = groupCell(g, d); }
      });
    },
    syncChanged: function () {
      var b = document.getElementById('syncBtn'); if (b) b.outerHTML = syncBtn(); else if (S.d.acct && !S.demo && !sel) App.render();   // just signed in: header gains the button
      if (sheetOpen === 'settings') { var y = sheet.scrollTop; openSettings(); sheet.scrollTop = y; }
    },
    toast: function (m) { var t = document.getElementById('toast'); t.textContent = m; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('on'); }, 2600); }
  };
  window.App = App;

  /* ---- Filter: Hide archived, Hide entered (looks at TODAY only) ---- */
  function enteredToday(h) {
    if (isGroup(h)) { var t = S.today(), ss = liveSubs(h.id); return groupRes(h, t).ok || (ss.length > 0 && ss.every(function (x) { return enteredToday(x); })); }
    if (S.skipped(h.id, S.today())) return true;
    var v = S.val(h.id, S.today());
    if (v == null) return false;
    return h.type === 'yn' ? !!v : met(h, v);   // measurable leaves only once today's target is met
  }
  function skippedToday(h) { var t = S.today(); return isGroup(h) ? liveSubs(h.id).length > 0 && liveSubs(h.id).every(function (x) { return S.skipped(x.id, t); }) : S.skipped(h.id, t); }
  function setFold(ids, on) {
    var F = S.d.ui.fx = S.d.ui.fx || {};
    if (!on && foldMode() === 'shut' && ids.length === 1) { F = S.d.ui.fx = {}; }   // collapsed mode: only one group open at a time
    ids.forEach(function (id) { F[id] = on; });
    S.saveUi(); App.render();
  }

  /* ---- Select mode (hold a habit name and release) ---- */
  var sel = null;   // { id: true } while selecting
  function allStarred() { var ids = sel ? Object.keys(sel) : []; return ids.length > 0 && ids.every(function (id) { var h = S.habit(id); return h && h.star; }); }
  function selIn() { return sel ? S.habits().filter(function (h) { return sel[h.id] && !isGroup(h); }).map(function (h) { return h.id; }) : []; }   // display order
  function selOut() { return sel ? S.habits().filter(function (h) { return sel[h.id] && h.parent && S.habit(h.parent); }).map(function (h) { return h.id; }) : []; }
  function allArchived() { var ids = sel ? Object.keys(sel) : []; return ids.length > 0 && ids.every(function (id) { var h = S.habit(id); return h && h.archived; }); }
  function selStart(id) {
    if (!sel) { sel = {}; history.pushState({ sel: 1 }, ''); }
    sel[id] = true; App.render();
  }
  function selToggle(id) { if (sel[id]) delete sel[id]; else sel[id] = true; if (!Object.keys(sel).length) return selEnd(); App.render(); }
  function selEnd(then) { if (then) after.push(then); if (!sel) return flush(); if (!closing) { closing = true; history.back(); } }

  // Habit-name column takes whatever is left after 4 day columns; older days scroll in from the right.
  function sizeCols() {
    // Landscape phone: keep the portrait name width; the extra width shows more day columns (SL 33)
    // Laptop/desktop (≥ 900px wide): a fixed 300px name column; the page widens to show as many days as fit (up to 31).
    var land = window.innerWidth > window.innerHeight && window.innerHeight <= 600;
    if (window.innerWidth >= 900) { document.documentElement.style.setProperty('--nw', '300px'); return; }
    var w = Math.min(land ? window.innerHeight : window.innerWidth, 720) - 12;   // 12px right gutter; the left gutter is inside .nm
    document.documentElement.style.setProperty('--nw', Math.max(120, w - 4 * CELL) + 'px');
  }
  window.addEventListener('resize', sizeCols);
  function fitChips() {
    var box = document.getElementById('chips'); if (!box) return;
    var cs = [].slice.call(box.querySelectorAll('.tchip[data-full]'));
    cs.forEach(function (c) { c.textContent = c.dataset.full; });
    if (box.scrollWidth > box.clientWidth + 1) cs.forEach(function (c) { if (!c.classList.contains('on')) c.textContent = c.dataset.short; });
  }
  window.addEventListener('resize', fitChips);

  /* ---- Sheets & dialogs (pushState so Android back closes them) ---- */
  var sheetOpen = null, sheet = document.getElementById('sheet'), scrim = document.getElementById('scrim');
  function showSheet(name, html, cls) {
    if (!sheetOpen) history.pushState({ sheet: name }, '');
    sheetOpen = name; sheet.innerHTML = html; sheet.className = 'sheet' + (cls ? ' ' + cls : ''); sheet.hidden = false; scrim.hidden = cls === 'page';
    sheet.scrollTop = 0;
  }
  var closing = false, after = [];
  function hideSheet() { sheetOpen = null; sheet.hidden = true; scrim.hidden = true; }
  function closeSheet(then) { if (then) after.push(then); if (!sheetOpen) return flush(); if (!closing) { closing = true; history.back(); } }
  function flush() { var q = after; after = []; q.forEach(function (f) { f(); }); }
  window.addEventListener('popstate', function () {
    var wasW = !closing && (sheetOpen === 'wlog' || sheetOpen === 'wset');   // phone Back on a weight dialog → back to the Weight screen
    closing = false;
    if (wasW) { hideSheet(); flush(); return openWeight(true); }
    if (sheetOpen) hideSheet(); else if (tp) { tp = null; App.render(); } else if (sel) { sel = null; App.render(); }
    flush();
  });
  scrim.addEventListener('click', function () { closeSheet(); });

  function confirmBox(msg, okTxt, cb) {
    showSheet('confirm', '<p>' + esc(msg) + '</p><div class="row end"><button class="btn" data-act="close">Cancel</button><button class="btn danger" data-act="confirmOk">' + esc(okTxt) + '</button></div>');
    App._confirm = function () { closeSheet(cb); };
  }

  /* ---- Number entry (measurable): dialog at the TOP, Enter = OK ---- */
  function askNumber(h, k) {
    var v = S.val(h.id, k), dt = new Date(k + 'T12:00:00'), st = h.step || 1;
    showSheet('num',
      '<h3 style="color:' + esc(h.color) + '">' + esc(h.name) + '</h3>' +
      '<p class="small muted">' + WD[dt.getDay()] + ' ' + dt.getDate() + ' ' + dt.toLocaleString('en', { month: 'short' }) +
      ' · target ' + (h.tt === 'max' ? 'at most ' : 'at least ') + num(h.target) + ' ' + esc(h.unit) + '</p>' +
      '<div class="numrow"><button class="btn step" data-act="numStep" data-d="' + (-st) + '" aria-label="Minus ' + num(st) + '">−</button>' +
      '<input id="numIn" inputmode="decimal" enterkeyhint="done" autocomplete="off" value="' + num(v == null ? st : v) + '" placeholder="0">' +
      '<button class="btn step" data-act="numStep" data-d="' + st + '" aria-label="Plus ' + num(st) + '">+</button></div>' +
      '<div class="row end"><button class="btn" data-act="numClear">Clear</button>' + (S.d.settings.skipDays ? '<button class="btn" data-act="numSkip">Skip</button>' : '') + '<span class="grow"></span><button class="btn" data-act="close">Cancel</button><button class="btn pri" data-act="numOk">OK</button></div>', 'attop');
    var inp = document.getElementById('numIn');   // no keyboard until he taps the number
    inp.addEventListener('focus', function () { inp.select(); });
    App._num = function (clear, skip) {
      if (skip) return closeSheet(function () { S.setSkip(h.id, k); App.refreshRow(h.id); });
      var t = inp.value.replace(',', '.').trim(), x = clear || t === '' ? null : parseFloat(t);
      if (x != null && !isFinite(x)) return App.toast('Enter a number');
      closeSheet(function () { S.setVal(h.id, k, x == null ? null : num(x)); App.refreshRow(h.id); });
    };
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') App._num(false); });
  }

  /* ---- Mark a day ---- */
  function mark(cell) {
    var h = S.habit(cell.dataset.h), k = cell.dataset.k; if (!h) return;
    if (isGroup(h)) return App.toast('A group shows its sub-habits’ result — mark those');
    if (h.type === 'num') return askNumber(h, k);
    var sk = S.d.settings.skipDays;   // with Skip days on: empty → tick → skip → empty
    if (S.skipped(h.id, k)) S.setVal(h.id, k, null);
    else if (S.val(h.id, k)) { if (sk) S.setSkip(h.id, k); else S.setVal(h.id, k, null); }
    else S.setVal(h.id, k, 1);
    if (navigator.vibrate) navigator.vibrate(15);
    App.refreshRow(h.id);
  }

  /* ---- Touch: hold a DAY CELL = mark it (short tap only hints, unless "Toggle with short press" is on).
     Hold a HABIT NAME: release without moving = select; move up/down = drag to reorder.
     Moving before the hold fires = an ordinary scroll, so nothing happens. ---- */
  var lp = null, drag = null, HOLD = 450, quietClick = false;
  root.addEventListener('pointerdown', function (e) {
    if (e.button > 0 || drag) return;
    quietClick = false;
    var cell = e.target.closest('.c'), nm = e.target.closest('.hrow .nm');
    if (!cell && !nm) return;
    if (nm && nm.closest('.hrow.ctx')) return;
    var el = cell || nm;
    lp = { el: el, cell: cell, id: nm ? nm.dataset.id : null, x: e.clientX, y: e.clientY, fired: false, pid: e.pointerId };
    lp.t = setTimeout(function () {
      if (!lp) return; lp.fired = true; el.classList.remove('press');
      if (cell) mark(cell);
      else { if (navigator.vibrate) navigator.vibrate(20); el.closest('.hrow').classList.add('held'); }
    }, HOLD);
    el.classList.add('press');
  });
  function lpCancel() { if (lp) { clearTimeout(lp.t); lp.el.classList.remove('press'); var r = lp.el.closest('.hrow'); if (r) r.classList.remove('held'); } }
  root.addEventListener('pointermove', function (e) {
    if (drag) return dragMove(e);
    if (!lp) return;
    var dx = e.clientX - lp.x, dy = e.clientY - lp.y;
    if (!lp.fired) { if (Math.abs(dx) > 10 || Math.abs(dy) > 10) { lpCancel(); lp = null; } return; }
    if (!lp.id) return;
    var p;
    if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) { p = lp; lp = null; shiftStart(p, e); }
    else if (Math.abs(dy) > 8) { p = lp; lp = null; dragStart(p, e); }
  });
  root.addEventListener('pointercancel', function () { if (drag) dragEnd(true); lpCancel(); lp = null; });
  root.addEventListener('pointerup', function () {
    if (drag) return dragEnd(false);
    if (!lp) return; lpCancel(); var p = lp; lp = null;
    if (p.fired) {
      quietClick = true;   // the click that follows a hold must not open Edit
      if (p.id) { if (sel) selToggle(p.id); else selStart(p.id); }
      return;
    }
    if (p.cell) { if (S.d.settings.shortPress) mark(p.cell); else App.toast('Hold to mark'); }
  });
  // Once a hold has fired, the page must not scroll under the finger (first touchmove is still cancelable).
  root.addEventListener('touchmove', function (e) { if (drag || (lp && lp.fired)) e.preventDefault(); }, { passive: false });
  root.addEventListener('contextmenu', function (e) { if (e.target.closest('.c, .nm')) e.preventDefault(); });

  /* ---- v5.5 Swipe left/right on the blank area below the list (or an empty page) = next / previous tab.
     touch-action:pan-y there keeps the browser from scrolling the dates sideways. ---- */
  var sw = null;
  root.addEventListener('pointerdown', function (e) { sw = e.target.closest('.swp, .empty') && !sel ? { x: e.clientX, y: e.clientY } : null; });
  root.addEventListener('pointerup', function (e) {
    if (!sw) return; var dx = e.clientX - sw.x, dy = e.clientY - sw.y; sw = null;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5 || tabsMode() === 'off') return;
    var o = tabOrder(), i = o.indexOf(view()), j = i + (dx < 0 ? 1 : -1);
    if (i >= 0 && j >= 0 && j < o.length) { setView(o[j]); }
  });
  root.addEventListener('pointercancel', function () { sw = null; });

  /* ---- Drag to reorder: the row follows the finger; neighbours swap as it passes their middle ---- */
  // A sub-habit moves among its group's sub-habits; a top-level habit moves with its whole group card.
  function dragStart(p, e) {
    var hr = p.el.closest('.hrow'), sub = hr.classList.contains('sub'), row = sub ? hr : hr.closest('.grp'), r = row.getBoundingClientRect();
    hr.classList.remove('held'); row.classList.add('drag');
    drag = { mode: 'y', row: row, sib: sub ? 'sub' : 'grp', id: p.id, grab: p.y - r.top, y: e.clientY, sc: document.getElementById('sc') };
    drag.auto = requestAnimationFrame(autoScroll);
    dragMove(e);
  }
  // Hold and slide right = put it inside the group above; slide left = take it out of its group.
  var SHIFT = 36;
  function shiftStart(p, e) {
    var hr = p.el.closest('.hrow'); hr.classList.remove('held'); hr.classList.add('shift');
    drag = { mode: 'x', row: hr, id: p.id, x0: p.x, dx: 0 };
    dragMove(e);
  }
  function shiftEnd() {
    var d = drag, h = S.habit(d.id), dx = d.dx;
    var ids = function () { return [].map.call(document.querySelectorAll('#grid .hrow'), function (r) { return r.dataset.row; }); };
    var lastOf = function (grp) {   // last row of a group card, not counting the row being moved
      var rs = [].filter.call(grp.querySelectorAll('.hrow'), function (r) { return r.dataset.row !== d.id; });
      return rs[rs.length - 1].dataset.row;
    };
    var moveAfter = function (list, id, afterId) { list.splice(list.indexOf(id), 1); list.splice(list.indexOf(afterId) + 1, 0, id); return list; };
    if (dx > SHIFT && !h.parent) {
      if (isGroup(h)) return App.toast('A group can’t go inside another group');
      var above = d.row.closest('.grp').previousElementSibling;
      if (!above || !above.classList.contains('grp')) return App.toast('No habit above to go under');
      var g = S.habit(above.dataset.grp); if (g.parent) return;
      S.reorder(moveAfter(ids(), h.id, lastOf(above)));
      h.parent = g.id; S.putHabit(h);
      if (folded(g.id)) { S.d.ui.fx = S.d.ui.fx || {}; S.d.ui.fx[g.id] = false; S.saveUi(); }
      App.toast('Moved into ' + g.name);
    } else if (dx < -SHIFT && h.parent) {
      var grp = d.row.closest('.grp');
      S.reorder(moveAfter(ids(), h.id, lastOf(grp)));
      h.parent = null; S.putHabit(h);
      App.toast('Moved out of the group');
    }
  }
  function rowTop(row) { return document.getElementById('grid').getBoundingClientRect().top + row.offsetTop; }
  function dragMove(e) {
    if (drag.mode === 'x') {
      drag.dx = e.clientX - drag.x0;
      var ok = drag.dx > 0 ? !S.habit(drag.id).parent : !!S.habit(drag.id).parent;
      drag.row.style.transform = 'translateX(' + Math.max(-40, Math.min(40, drag.dx)) + 'px)';
      drag.row.classList.toggle('armed', ok && Math.abs(drag.dx) > SHIFT);
      return;
    }
    drag.y = e.clientY;
    var row = drag.row, want = drag.y - drag.grab;
    var prev = row.previousElementSibling, next = row.nextElementSibling;
    if (prev && prev.classList.contains(drag.sib) && want < rowTop(prev) + prev.offsetHeight / 2) row.parentNode.insertBefore(row, prev);
    else if (next && next.classList.contains(drag.sib) && want + row.offsetHeight > rowTop(next) + next.offsetHeight / 2) row.parentNode.insertBefore(next, row);
    row.style.transform = 'translateY(' + (want - rowTop(row)) + 'px)';
  }
  function autoScroll() {   // near the top/bottom edge, keep scrolling while dragging
    if (!drag || drag.mode !== 'y') return;
    var r = drag.sc.getBoundingClientRect(), edge = 56, v = 0;
    if (drag.y < r.top + edge) v = -Math.ceil((r.top + edge - drag.y) / 6);
    else if (drag.y > r.bottom - edge) v = Math.ceil((drag.y - r.bottom + edge) / 6);
    if (v) { drag.sc.scrollTop += v; dragMove({ clientY: drag.y }); }
    drag.auto = requestAnimationFrame(autoScroll);
  }
  function dragEnd(cancel) {
    var d = drag; quietClick = true;
    if (d.mode === 'x') { d.row.style.transform = ''; d.row.classList.remove('shift', 'armed'); if (!cancel) shiftEnd(); drag = null; return App.render(); }
    drag = null; cancelAnimationFrame(d.auto);
    d.row.classList.remove('drag'); d.row.style.transform = '';
    if (cancel) return App.render();
    var ids = [].map.call(document.querySelectorAll('#grid .hrow'), function (r) { return r.dataset.row; });
    S.reorder(ids); App.render();
  }

  /* ---- v7 Stats page: tap a habit's name (groups: chart button in Edit). Pen opens Edit; Edit's back/Save return here. ---- */
  var stId = null, stMon = 0;
  function startOf(h) {   // creation time from the id, or the first entry, whichever is earlier
    var ids = [h.id].concat(isGroup(h) ? subs(h.id).map(function (x) { return x.id; }) : []), t = S.todayDate(), best = t;
    ids.forEach(function (id) {
      var ms = parseInt(String(id).slice(0, -4), 36); if (ms > 1.6e12 && ms < Date.now() + 864e5) { var c = new Date(ms); c.setHours(12, 0, 0, 0); if (c < best) best = c; }
      Object.keys(S.d.entries).forEach(function (k) { if (k.indexOf(id + '|') === 0) { var p = k.slice(id.length + 1).split('-'), d = new Date(+p[0], +p[1] - 1, +p[2], 12); if (d < best) best = d; } });
    });
    return best;
  }
  /* SL 39: each sub-habit's success this month vs the same days last month (e.g. Fajr 60%, Isha 90%).
     Rate = done ÷ scheduled, unskipped days since the sub-habit started; today counts only once done.
     N-a-week / N-a-month sub-habits show times done instead of a rate. Bad sub-habits: clean days. */
  function subRates(h) {
    var L = liveSubs(h.id); if (!L.length) return '';
    var t = S.todayDate(), D = t.getDate(), tk = S.today(), M3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var lm = new Date(t.getFullYear(), t.getMonth() - 1, 1), lLen = new Date(lm.getFullYear(), lm.getMonth() + 1, 0).getDate();
    var calc = function (x, y, m, upTo) {
      var st = startOf(x), per = fq(x).t === 'week' || fq(x).t === 'month', bad = x.kind === 'bad', n = 0, ok = 0;
      for (var d = 1; d <= upTo; d++) {
        var dt = new Date(y, m, d, 12), k = S.key(dt); if (dt < st || k > tk) continue;
        var v = S.val(x.id, k), did = v != null && (x.type === 'yn' ? !!v : (bad ? !met(x, v) : met(x, v))), good = bad ? !did : did;
        if (S.skipped(x.id, k) || (!per && !scheduled(x, dt))) continue;
        if (k === tk && !good) continue;
        n++; if (good) ok++;
      }
      return per ? (n ? ok : null) : (n ? Math.round(ok / n * 100) : null);
    };
    var rows = L.map(function (x) {
      var xf = fq(x), per = xf.t === 'week' || xf.t === 'month';
      var a = calc(x, t.getFullYear(), t.getMonth(), D), b = calc(x, lm.getFullYear(), lm.getMonth(), Math.min(D, lLen));
      var txt = function (v) { return v == null ? '–' : per ? v + '×' : v + '%'; };
      var w = a == null ? 0 : per ? Math.min(100, a / Math.max(1, (xf.n || 1) * (xf.t === 'week' ? Math.ceil(D / 7) : 1)) * 100) : a;
      var cls = a == null || b == null || a === b ? 'same' : (a > b ? 'cur' : 'worse');
      return '<div class="mvr srr"><span class="mvl">' + esc(x.name) + '</span><div class="mvt"><div class="mvb ' + cls + '" style="width:' + Math.max(2, w) + '%"></div></div><b>' + txt(a) + '<em>' + txt(b) + '</em></b></div>';
    }).join('');
    return '<section class="stc"><h4>Each sub-habit · ' + M3[t.getMonth()] + ' 1–' + D + '</h4>' + rows +
      '<p class="small muted">Small number = same days last month (' + M3[lm.getMonth()] + ' 1–' + Math.min(D, lLen) + '). Green = better than last month, red = worse.</p></section>';
  }
  function repCard(r) {
    return '<section class="stc"><h4>Each time it was due</h4><div class="tiles t3">' + [['On time', r.on], ['Done late', r.lt], ['Missed', r.ms]].map(function (x) {
        return '<div class="tile"><span>' + x[0] + '</span><b>' + x[1] + '</b></div>'; }).join('') + '</div>' +
      '<p class="small muted" style="margin:8px 0 0">' + (r.open ? (r.due > 0 ? 'Due now — ' + r.due + ' day' + (r.due > 1 ? 's' : '') + ' overdue. ' : 'Due today. ') : r.next != null ? 'Next due ' + dayTxt(r.next) + '. ' : '') +
      'A tick after the due day counts as done late.</p></section>';
  }
  function openStats(id, keepMonth) {
    RC = null;
    var h = S.habit(id); if (!h) return;
    if (stId !== id || !keepMonth) stMon = 0; stId = id;
    var grp = isGroup(h), bad = !grp && h.kind === 'bad', numT = grp ? h.agg && h.agg.t === 'sum' : h.type === 'num';
    var res = grp ? function (k) { var r = groupRes(h, k); return { v: h.agg && h.agg.t === 'sum' ? r.sum : r.done, ok: r.ok, s: r.total === 0 && liveSubs(h.id).length > 0 }; }
      : function (k) { var v = S.val(h.id, k), sk = S.skipped(h.id, k), did = v != null && (h.type === 'yn' ? !!v : (bad ? !met(h, v) : met(h, v)));
          return { v: v, s: sk, ok: bad ? !did : did }; };
    var rr = rep(h);
    if (rr && !bad) { var r0 = res; res = function (k) { var x = r0(k), n = kDn(k); if (rr.late[n] != null) x.ok = false; if (rr.ok[n]) x.ok = true; return x; }; }   // a late tick counts on its due day
    var sub = grp ? (h.agg && h.agg.t === 'sum' ? 'Group · sum' + (h.target ? ', target ' + num(h.target) + (h.unit ? ' ' + esc(h.unit) : '') : '') : 'Group · done when ' + Math.min(h.agg.n || 1, liveSubs(h.id).length) + ' of ' + liveSubs(h.id).length + ' are done')
      : (bad ? 'Bad habit · ' : '') + (h.type === 'num' ? (h.tt === 'max' ? 'at most ' : 'at least ') + num(h.target) + (h.unit ? ' ' + esc(h.unit) : '') + ' · ' : '') + freqTxt(h);
    var html = '<div class="ptop"><button class="ib" data-act="close" aria-label="Back">' + ICON.back + '</button><h2 class="sth"><i style="background:' + esc(h.color) + '"></i>' + esc(h.name) + '</h2>' +
      '<button class="ib" data-act="statEdit" aria-label="Edit">' + ICON.pen + '</button></div>' +
      '<div class="stats"><p class="stsub">' + sub + '</p>' +
      Stats.build({ h: h, res: res, sched: function (dt) { return scheduled(h, dt); }, start: startOf(h), today: S.todayDate(), ws: S.d.settings.weekStart || 0,
        bad: bad, num: numT, unit: grp ? h.unit : h.unit, target: numT ? h.target : 0, color: h.color, mon: stMon, extra: (grp ? subRates(h) : '') + (rr && !bad ? repCard(rr) : '') }) + '</div>';
    if (sheetOpen === 'stats' || sheetOpen === 'edit') { sheetOpen = 'stats'; sheet.innerHTML = html; sheet.className = 'sheet page'; if (!keepMonth) sheet.scrollTop = 0; }
    else showSheet('stats', html, 'page');
  }

  /* ---- v5 sync button in the top bar (only once signed in): green tick-cloud = synced, amber = changes waiting,
     spinning = syncing, red = error. Tap = sync now. ---- */
  function syncBtn() {
    if (!S.d.acct || S.demo || !Sync.enabled()) return '';
    var st = Sync.state, waiting = S.dirty && st !== 'syncing';
    var cls = st === 'error' ? 'err' : st === 'syncing' ? 'spin' : waiting || st === 'paused' ? 'wait' : st === 'ok' ? 'ok' : '';
    var lab = { err: 'Sync error — tap to retry', spin: 'Syncing', wait: 'Changes waiting — tap to sync', ok: 'Synced' }[cls] || 'Tap to sync';
    return '<button class="ib sync ' + cls + '" id="syncBtn" data-act="syncNow" aria-label="' + lab + '">' + (cls === 'ok' ? ICON.cloudOk : ICON.sync) + '</button>';
  }

  /* ---- Weight (SL 34, redesigned v5.8): its own screen from the bottom bar. Readings in kg (2 decimals), several a day
     allowed (key 'YYYY-MM-DDTHH:MM'; older readings are date-only keys). Widgets: Summary, Change over, Trend, Log —
     the pen turns on edit mode: eye = show/hide, handle = drag to reorder, plus "One entry per day" (Latest / Smallest /
     Highest). Start-day switch: on = every widget counts only readings from that day; off = all readings. ---- */
  var wRange = 'all', wEdit = false, MON3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var WG = { sum: 'Summary', perf: 'Change over', chart: 'Trend', log: 'Log' };
  function kg(v) { return (Math.round(v * 100) / 100).toFixed(2); }
  function dLab(k) { var p = k.split('-'), t = S.today(); return k === t ? 'Today' : (+p[2]) + ' ' + MON3[+p[1] - 1] + (p[0] !== t.slice(0, 4) ? ' ' + p[0] : ''); }
  function dLong(k) { var p = k.split('-'); return (+p[2]) + ' ' + MON3[+p[1] - 1] + ' ' + p[0]; }
  function kAgo(k, n) { var p = k.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2] - n, 12); return S.key(d); }
  function hm12(t) { if (!t) return ''; var p = t.split(':'), h = +p[0]; return (h % 12 || 12) + ':' + p[1] + (h < 12 ? ' am' : ' pm'); }
  function bmiTxt(v) {
    var h = S.d.settings.heightCm; if (!h) return '';
    var b = v / Math.pow(h / 100, 2), c = b < 18.5 ? 'Underweight' : b < 25 ? 'Healthy' : b < 30 ? 'Overweight' : 'Obese';
    return 'BMI ' + b.toFixed(1) + ' · ' + c;
  }
  function wOrder() {
    var w = S.d.settings.wW || {}, o = (w.o || []).filter(function (id) { return WG[id]; });
    Object.keys(WG).forEach(function (id) { if (o.indexOf(id) < 0) o.push(id); }); return o;
  }
  function wData() {   // the readings every widget uses: start day applied, then one per day if that switch is on
    var st = S.d.settings, L = S.wList();
    if (st.wStartOn && st.wStart) L = L.filter(function (e) { return e.d >= st.wStart; });
    if (st.wOne === false) return L;
    var out = [], at = {}, p = st.wPick || 'last';
    L.forEach(function (e) {
      if (!(e.d in at)) { at[e.d] = out.length; out.push(e); return; }
      var b = out[at[e.d]]; if (p === 'last' || (p === 'min' ? e.v < b.v : e.v > b.v)) out[at[e.d]] = e;
    });
    return out;
  }
  function openWeight(keepY) {
    var st = S.d.settings, L = wData(), all = S.wList(), tgt = st.wTarget, last = L[L.length - 1], first = L[0], tk = S.today();
    var sdOn = !!(st.wStartOn && st.wStart), dir = tgt && last && tgt > last.v ? 1 : -1;   // +1 = aiming to gain
    var good = function (c) { return c * dir > 0; }, cls = function (c) { return c == null || Math.abs(c) < 0.005 ? '' : good(c) ? 'gd' : 'bd'; }, sign = function (c) { return (c > 0 ? '+' : c < 0 ? '−' : '±') + kg(Math.abs(c)); };
    var W = {
      sum: function () {
        if (!last) return '<button class="wnow" data-act="wLog"><b>No weight yet</b><i>Tap to log one</i></button>';
        var chg = last.v - first.v, pr = tgt && first.v !== tgt ? Math.max(0, Math.min(1, (first.v - last.v) / (first.v - tgt))) : null, reached = tgt && Math.abs(last.v - tgt) < 0.005;
        return '<button class="wbig" data-act="wLog"><b>' + kg(last.v) + '<small> kg</small></b><span>' + dLab(last.d) + (last.t ? ' · ' + hm12(last.t) : '') + (bmiTxt(last.v) ? ' · ' + bmiTxt(last.v) : '') + '</span></button>' +
          '<div class="wsg"><span>Start <b>' + kg(first.v) + '</b></span><span>' + (tgt ? 'Goal <b>' + kg(tgt) + '</b>' : '<a data-act="wSetup">Set a goal</a>') + '</span></div>' +
          (pr != null ? '<div class="wbar"><i style="width:' + Math.round(pr * 100) + '%"></i></div>' : '') +
          '<div class="wtwo"><div><b class="' + (L.length > 1 ? (good(chg) ? 'gd' : chg ? 'bd' : '') : '') + '">' + (L.length > 1 ? sign(chg) + ' kg' : '–') + '</b><span>Since ' + (sdOn ? 'start day' : 'first reading') + '</span></div>' +
          '<div><b>' + (tgt ? (reached ? 'Reached' : kg(Math.abs(last.v - tgt)) + ' kg') : '–') + '</b><span>' + (tgt && !reached ? (last.v > tgt ? 'To lose' : 'To gain') : 'To goal') + '</span></div></div>';
      },
      perf: function () {
        if (L.length < 2) return '<p class="small muted" style="margin:0">Needs two readings.</p>';
        var at = function (n) { var c = kAgo(last.d, n), b = null; L.forEach(function (e) { if (e.d <= c) b = e; }); return b; };
        var rows = [['1 week', at(7)], ['4 weeks', at(28)], ['3 months', at(91)], [sdOn ? 'Since start' : 'All time', first]].map(function (r) { return [r[0], r[1] && r[1] !== last ? last.v - r[1].v : null]; });
        var mx = Math.max.apply(null, rows.map(function (r) { return Math.abs(r[1] || 0); })) || 1;
        return rows.map(function (r) {
          var c = r[1], w = c == null ? 0 : Math.max(2, Math.abs(c) / mx * 46);
          return '<div class="wpr"><span>' + r[0] + '</span><div class="wpt"><i class="' + cls(c) + '" style="' + (c > 0 ? 'left' : 'right') + ':50%;width:' + (cls(c) ? w : 0) + '%"></i></div><b class="' + cls(c) + '">' + (c == null ? '–' : sign(c)) + '</b></div>';
        }).join('');
      },
      chart: function () {
        var sp = { '1m': 30, '3m': 91, '6m': 182, '1y': 365 }[wRange], from = sp ? kAgo(tk, sp) : first ? first.d : tk;
        var R = L.filter(function (e) { return e.d >= from; });
        return '<div class="seg">' + [['all', 'All'], ['1m', '1M'], ['3m', '3M'], ['6m', '6M'], ['1y', '1Y']].map(function (r) { return '<button class="' + (wRange === r[0] ? 'on' : '') + '" data-act="wRange" data-v="' + r[0] + '">' + r[1] + '</button>'; }).join('') + '</div>' + wChart(R, tgt, from, tk);
      },
      log: function () {
        if (!L.length) return '<p class="small muted" style="margin:0">Nothing logged' + (sdOn ? ' since the start day' : '') + ' yet.</p>';
        return L.slice(-30).reverse().map(function (e, i, A) {
          var p = A[i + 1], d = p ? e.v - p.v : null;
          return '<button class="wrow" data-act="wLog" data-k="' + e.k + '"><span>' + dLab(e.d) + (e.t ? '<small>' + hm12(e.t) + '</small>' : '') + '</span><b>' + kg(e.v) + '</b><em class="' + (d == null || Math.abs(d) < 0.005 ? '' : good(d) ? 'dn' : 'upw') + '">' + (d == null ? '' : sign(d)) + '</em></button>';
        }).join('') + (L.length > 30 ? '<p class="small muted" style="margin:8px 0 0">Latest 30 shown · the Trend chart covers them all.</p>' : '');
      }
    };
    var off = (st.wW || {}).off || {}, one = st.wOne !== false, pick = st.wPick || 'last';
    var html = '<div class="ptop"><button class="ib" data-act="close" aria-label="Back">' + ICON.back + '</button><h2>Weight</h2>' +
      '<button class="ib' + (wEdit ? ' lit' : '') + '" data-act="wEditTg" aria-label="' + (wEdit ? 'Done editing' : 'Edit widgets') + '">' + (wEdit ? ICON.check : ICON.pen) + '</button>' +
      '<button class="ib" data-act="wLog" aria-label="Log a weight">' + ICON.plus + '</button></div><div class="stats wst">' +
      '<div class="wsd"><button class="wsdt" data-act="wSdPick">' + ICON.cal + '<span>' + (sdOn ? 'Since ' + dLong(st.wStart) + ' (start day)' : all.length ? 'All readings, from ' + dLong(all[0].d) : 'Start day') + '</span></button>' +
        '<button class="flip" data-act="wSdTg" aria-label="Start day" aria-pressed="' + sdOn + '"><i class="tgl' + (sdOn ? ' on' : '') + '"></i></button></div>' +
      (wEdit ? '<section class="stc wedc"><div class="frow"><label>One entry per day<br><span class="small muted">' + (one ? 'If you weigh more than once a day, this one counts:' : 'Off: every reading shows, with its time.') + '</span></label><button class="flip" data-act="wOneTg" aria-pressed="' + one + '"><i class="tgl' + (one ? ' on' : '') + '"></i></button></div>' +
        (one ? '<div class="seg">' + [['last', 'Latest'], ['min', 'Smallest'], ['max', 'Highest']].map(function (r) { return '<button class="' + (pick === r[0] ? 'on' : '') + '" data-act="wPick" data-v="' + r[0] + '">' + r[1] + '</button>'; }).join('') + '</div>' : '') +
        '<p class="small muted" style="margin:8px 0 0">Eye = show or hide a widget. Drag ⠿ to reorder. Tap ✓ when done.</p></section>' : '') +
      '<div id="wgs">' + wOrder().map(function (id) {
        if (off[id] && !wEdit) return '';
        return '<section class="stc wg' + (off[id] ? ' woff' : '') + '" data-wg="' + id + '">' + (wEdit || id !== 'sum' ? '<div class="wgh"><h4>' + WG[id] + '</h4>' +
          (wEdit ? '<button class="wgb" data-act="wEye" data-v="' + id + '" aria-label="' + (off[id] ? 'Show' : 'Hide') + '">' + (off[id] ? ICON.eyeOff : ICON.eye) + '</button><span class="wgb wgd" aria-label="Drag to reorder">⠿</span>' : '') + '</div>' : '') +
          W[id]() + '</section>';
      }).join('') + '</div>' +
      '<button class="mi wset" data-act="wSetup"><span>Height ' + (st.heightCm ? ftIn(st.heightCm) : 'not set') + ' · Goal ' + (tgt ? kg(tgt) + ' kg' : 'none') + '</span><span class="small muted">Change</span></button></div>';
    var y = sheet.scrollTop, inW = /^w(eight|log|set)$/.test(sheetOpen || '');
    if (inW) { sheetOpen = 'weight'; sheet.className = 'sheet page'; sheet.innerHTML = html; scrim.hidden = true; sheet.scrollTop = keepY ? y : 0; } else { wEdit = false; showSheet('weight', html, 'page'); }
  }
  function wTs(e) { var p = e.d.split('-'), t = (e.t || '12:00').split(':'); return new Date(+p[0], +p[1] - 1, +p[2], +t[0], +t[1]).getTime(); }
  function wChart(R, tgt, from, tk) {
    if (R.length < 2) return '<p class="small muted" style="margin:6px 0 0">The graph appears once there are two readings in this range.</p>';
    var W = 340, H = 160, pl = 30, pr = 6, pt = 10, pb = 20;
    var vs = R.map(function (e) { return e.v; }), lo = Math.min.apply(null, vs), hi = Math.max.apply(null, vs), spr = Math.max(0.5, hi - lo);
    var tIn = tgt && tgt >= lo - spr && tgt <= hi + spr;   // a far goal would squash the curve flat: note it instead
    if (tIn) { lo = Math.min(lo, tgt); hi = Math.max(hi, tgt); }
    var pad = Math.max(0.3, (hi - lo) * 0.12); lo -= pad; hi += pad;
    var t0 = new Date(from + 'T00:00:00').getTime(), t1 = Math.max(wTs(R[R.length - 1]), new Date(tk + 'T12:00:00').getTime()); if (t1 <= t0) t1 = t0 + 864e5;
    var X = function (e) { return pl + (wTs(e) - t0) / (t1 - t0) * (W - pl - pr); }, Y = function (v) { return pt + (hi - v) / (hi - lo) * (H - pt - pb); };
    var path = R.map(function (e, i) { return (i ? 'L' : 'M') + X(e).toFixed(1) + ' ' + Y(e.v).toFixed(1); }).join('');
    var lastE = R[R.length - 1], ticks = [lo + (hi - lo) * 0.15, (lo + hi) / 2, hi - (hi - lo) * 0.15];
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="chart wch">' +
      ticks.map(function (v) { return '<line x1="' + pl + '" x2="' + W + '" y1="' + Y(v) + '" y2="' + Y(v) + '" class="gl"/><text x="' + (pl - 4) + '" y="' + (Y(v) + 3.5) + '" class="yl">' + v.toFixed(1) + '</text>'; }).join('') +
      (tgt && !tIn ? '<text x="' + (W - 2) + '" y="' + (tgt < lo ? H - pb - 4 : pt + 8) + '" class="tlt">goal ' + kg(tgt) + (tgt < lo ? ' ↓' : ' ↑') + '</text>' : '') +
      (tIn ? '<line x1="' + pl + '" x2="' + W + '" y1="' + Y(tgt) + '" y2="' + Y(tgt) + '" class="tl wgoal"/><text x="' + (W - 2) + '" y="' + (Y(tgt) - 4) + '" class="tlt wgt">goal ' + kg(tgt) + '</text>' : '') +
      '<path d="' + path + '" class="wl"/>' + (R.length <= 40 ? R.map(function (e) { return '<circle cx="' + X(e) + '" cy="' + Y(e.v) + '" r="2.4" class="wd"/>'; }).join('') : '') +
      '<circle cx="' + X(lastE) + '" cy="' + Y(lastE.v) + '" r="4.5" class="wd wlast"/>' +
      '<text x="' + pl + '" y="' + (H - 3) + '" class="cl" text-anchor="start">' + dLab(from) + '</text><text x="' + W + '" y="' + (H - 3) + '" class="cl" text-anchor="end">' + dLab(lastE.d) + '</text></svg>';
  }
  function nowHM() { var n = new Date(); return (n.getHours() < 10 ? '0' : '') + n.getHours() + ':' + (n.getMinutes() < 10 ? '0' : '') + n.getMinutes(); }
  function wLog(key) {
    var L = S.wList(), e = key ? L.filter(function (x) { return x.k === key; })[0] : null, last = L[L.length - 1], tk = S.today();
    App._wk = e ? e.k : null;
    wDlg('wlog', '<h3>' + (e ? 'Edit reading' : 'Log weight') + '</h3><div class="two"><label class="fl">Day<input type="date" id="wDate" value="' + (e ? e.d : tk) + '" max="' + tk + '"></label>' +
      '<label class="fl">Time<input type="time" id="wTime" value="' + (e ? e.t : nowHM()) + '"></label></div>' +
      '<div class="numrow" style="margin-top:12px"><button class="btn step" data-act="wStep" data-d="-0.1" aria-label="Minus 0.1">−</button>' +
      '<input id="wIn" inputmode="decimal" enterkeyhint="done" autocomplete="off" value="' + (e ? kg(e.v) : last ? kg(last.v) : '') + '" placeholder="kg">' +
      '<button class="btn step" data-act="wStep" data-d="0.1" aria-label="Plus 0.1">+</button></div><p class="small muted" style="margin-top:6px">In kg, up to 2 decimals (e.g. 78.45). Tap the number to type.</p>' +
      '<div class="row end">' + (e ? '<button class="btn danger-o" data-act="wDel">Delete</button><span class="grow"></span>' : '') + '<button class="btn" data-act="close">Cancel</button><button class="btn pri" data-act="wSave">Save</button></div>');
    var inp = document.getElementById('wIn'); inp.addEventListener('focus', function () { inp.select(); });
    inp.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') actions.wSave(); });
  }
  function wSdPick() {
    var st = S.d.settings, L = S.wList();
    wDlg('wset', '<h3>Start day</h3><label class="fl">Count readings from<input type="date" id="wSd" value="' + (st.wStart || (L.length ? L[0].d : S.today())) + '" max="' + S.today() + '"></label>' +
      '<p class="small muted" style="margin-top:8px">With the switch on, Summary, Change over, Trend and Log only use readings from this day. Turn it off to see everything again.</p>' +
      '<div class="row end"><button class="btn" data-act="close">Cancel</button><button class="btn pri" data-act="wSdSave">Save</button></div>');
  }
  // Drag a widget by its ⠿ handle (edit mode)
  var wd = null;
  document.addEventListener('pointerdown', function (e) {
    var h = e.target.closest('.wgd'); if (!h || !wEdit) return;
    var sec = h.closest('.wg'); wd = { el: sec, grab: e.clientY - sec.getBoundingClientRect().top }; sec.classList.add('wdrag'); e.preventDefault();
  });
  document.addEventListener('pointermove', function (e) {
    if (!wd) return; var el = wd.el, box = el.parentNode, want = e.clientY - wd.grab;
    var top = function (c) { return box.getBoundingClientRect().top + c.offsetTop; };
    var p = el.previousElementSibling, n = el.nextElementSibling;
    if (p && want < top(p) + p.offsetHeight / 2) box.insertBefore(el, p);
    else if (n && want + el.offsetHeight > top(n) + n.offsetHeight / 2) box.insertBefore(n, el);
    var r = sheet.getBoundingClientRect(); if (e.clientY < r.top + 60) sheet.scrollTop -= 10; else if (e.clientY > r.bottom - 60) sheet.scrollTop += 10;
    el.style.transform = 'translateY(' + (want - top(el)) + 'px)';
  });
  ['pointerup', 'pointercancel'].forEach(function (n) { document.addEventListener(n, function () {
    if (!wd) return; var box = wd.el.parentNode; wd = null;
    var o = [].map.call(box.querySelectorAll('.wg'), function (s) { return s.dataset.wg; });
    var w = S.d.settings.wW = S.d.settings.wW || {}; w.o = o; S.saveSettings(); openWeight(true);
  }); });
  // Height is entered and shown in feet + inches; it is still stored as heightCm (BMI, sync unchanged)
  function ftParts(cm) { var t = Math.round(cm / 2.54), f = Math.floor(t / 12); return [f, t - f * 12]; }
  function ftIn(cm) { var p = ftParts(cm); return p[0] + '′ ' + p[1] + '″'; }
  function wSetup() {
    var st = S.d.settings, p = st.heightCm ? ftParts(st.heightCm) : ['', ''];
    wDlg('wset', '<h3>Height &amp; target</h3><div class="two"><label class="fl">Height<span class="ftin"><input id="wFt" inputmode="numeric" value="' + p[0] + '" placeholder="5"><em>ft</em><input id="wIn2" inputmode="numeric" value="' + p[1] + '" placeholder="8"><em>in</em></span></label>' +
      '<label class="fl">Target (kg)<input id="wT" inputmode="decimal" value="' + (st.wTarget ? kg(st.wTarget) : '') + '" placeholder="optional"></label></div>' +
      '<p class="small muted" style="margin-top:8px">Height is used only for BMI. Leave the target blank for none.</p>' +
      '<div class="row end"><button class="btn" data-act="close">Cancel</button><button class="btn pri" data-act="wSetSave">Save</button></div>');
  }
  function wDlg(name, html) {   // a dialog over the Weight screen, which stays visible behind it
    if (!/^w(eight|log|set)$/.test(sheetOpen || '')) openWeight(); else openWeight(true);
    sheet.insertAdjacentHTML('beforeend', '<div class="wscrim" data-act="close"></div><div class="wdlg">' + html + '</div>'); sheetOpen = name;
  }
  function wBack() { openWeight(true); }   // dialogs swap in place on the Weight screen's history entry

  /* ---- Create / edit habit (full-screen page) ---- */
  var draft = null;
  function openEdit(id) {
    var h = id ? S.habit(id) : null;
    draft = JSON.parse(JSON.stringify(h || S.newHabit()));
    draft._new = !h; draft._ttSet = !!h;
    if (!h) { var v = view(); if (S.tab(v)) draft.tab = v; if (v === 'star') draft.star = true; }
    if (!draft.win) draft.win = { from: '', to: '' };
    if (!draft.miss) draft.miss = { t: 'drop', keep: null };
    if (draft.freq.t === 'days') draft.freq = draft.freq.days && draft.freq.days.length ? { t: 'rep', n: 1, ev: 1, u: 'w', days: draft.freq.days, from: 'sch', a: S.key(startOf(h)), md: 1 } : { t: 'day', n: 1, days: [] };
    draft._from = sheetOpen === 'stats' ? 'stats' : null;
    drawEdit();
  }
  function edgeField(id, label, v) {   // SL 35: clock time, or a prayer ± minutes
    var pr = v && v.indexOf('p:') === 0, q = pr ? v.split(':') : [], T = prayerToday();
    return '<label class="tl">' + label + '<select id="f' + id + 'K" data-act="edgeKind" class="sel">' + [['', 'Clock time']].concat(Object.keys(Prayer.NAMES).map(function (k) { return [k, Prayer.NAMES[k] + (T && T[k] != null ? ' · ' + Prayer.hm(T[k]) : '')]; })).map(function (o) {
        return '<option value="' + o[0] + '"' + ((pr ? q[1] : '') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>' +
      (pr ? '<span class="offs"><input id="f' + id + 'O" inputmode="numeric" value="' + (+q[2] || 0) + '" autocomplete="off"><em>min (−before / +after)</em></span>'
        : '<input id="f' + id + '" type="time" value="' + esc(v || '') + '">') + '</label>';
  }
  function edgeRead(id) {
    var k = document.getElementById('f' + id + 'K'); if (!k) return null;
    if (!k.value) { var t = document.getElementById('f' + id); return t ? t.value || '' : ''; }
    var o = document.getElementById('f' + id + 'O'), n = o ? parseInt((o.value || '0').replace('−', '-'), 10) : 0;
    return 'p:' + k.value + ':' + (isFinite(n) ? Math.max(-720, Math.min(720, n)) : 0);
  }
  function seg(name, cur, opts, locked) {
    return '<div class="seg' + (locked ? ' locked' : '') + '">' + opts.map(function (o) {
      return '<button class="' + (cur === o[0] ? 'on' : '') + '" data-act="ef" data-f="' + name + '" data-v="' + o[0] + '"' + (locked ? ' disabled' : '') + '>' + o[1] + '</button>';
    }).join('') + '</div>';
  }
  function drawEdit() {
    var h = draft, f = h.freq, ws = S.d.settings.weekStart || 0;
    var wdOrder = [0, 1, 2, 3, 4, 5, 6].map(function (i) { return (i + ws) % 7; });
    var grp = !h._new && isGroup(S.habit(h.id)), nSub = grp ? liveSubs(h.id).length : 0, inG = h.parent && S.habit(h.parent);
    var a = h.agg || { t: 'count', n: 1 };
    var groupFields =
      '<div class="fl">Shown as' + seg('fold0', h.fold0 ? '1' : '0', [['0', 'Expanded'], ['1', 'Collapsed']]) +
      '<span class="small muted">Used when the bottom-bar group button is on “as set in Edit”.</span></div>' +
      '<div class="fl">Group result' + seg('agg', a.t, [['count', 'Tick when done'], ['sum', 'Sum of values']]) +
      '<span class="small muted">' + (a.t === 'count' ? 'The group gets a tick when enough of its sub-habits are done that day.' : 'The group shows the total of its sub-habits (a tick counts as 1).') + '</span></div>' +
      (a.t === 'count' ? '<label class="inl">Done when <input id="fAggN" inputmode="numeric" value="' + (a.n || 1) + '"> sub-habits are done</label>' +
          '<span class="small muted">' + nSub + ' sub-habit' + (nSub === 1 ? '' : 's') + ' now.' + ((a.n || 1) > nSub ? ' With fewer sub-habits than this, all of them must be done.' : '') + '</span>' +
          '<button class="mi tg flat" data-act="ef" data-f="prog"><span>Show progress (e.g. “2 of ' + (a.n || 1) + '”)<br><span class="small muted">Off: the group stays ✗ until it’s done.</span></span><span class="box' + (a.prog !== false ? ' on' : '') + '">' + (a.prog !== false ? ICON.check : '') + '</span></button>'
        : '<div class="two"><label class="fl">Unit<input id="fUnit" value="' + esc(h.unit) + '" placeholder="pages, min" autocomplete="off"></label>' +
          '<label class="fl">Target (at least)<input id="fTarget" inputmode="decimal" value="' + num(h.target) + '" autocomplete="off"></label></div>');
    var html =
      '<div class="ptop"><button class="ib" data-act="close" aria-label="Back">' + ICON.back + '</button><h2>' + (h._new ? 'New habit' : 'Edit habit') + '</h2>' +
      (!h._new && !h._from ? '<button class="ib" data-act="statOpen" aria-label="Stats">' + ICON.chart + '</button>' : '') + '<button class="btn pri sm" data-act="saveHabit">Save</button></div>' +
      '<div class="form">' +
      '<label class="fl">Name<input id="fName" value="' + esc(h.name) + '" placeholder="e.g. Qur’an pages" enterkeyhint="done" autocomplete="off"></label>' +
      '<div class="fl">Colour<div class="sw">' + COLORS.map(function (c) {
        return '<button class="dot' + (c === h.color ? ' on' : '') + '" style="background:' + c + '" data-act="ef" data-f="color" data-v="' + c + '" aria-label="Colour ' + c + '"></button>';
      }).join('') + '</div></div>' +
      (inG ? '<p class="small muted">Sub-habit of <b style="color:' + esc(inG.color) + '">' + esc(inG.name) + '</b>. To take it out: hold its name and slide left.</p>' : '') +
      (grp ? groupFields :
      '<div class="fl">Type' + seg('type', h.type, [['yn', 'Yes / No'], ['num', 'Measurable']]) + typeNote(h) + '</div>' +
      '<div class="fl">Habit is' + seg('kind', h.kind, [['good', 'Good — build it'], ['bad', 'Bad — quit it']]) +
      '<span class="small muted">' + (h.kind === 'bad' ? 'A tick means you did it (shown red). Empty days are clean days.' : 'A tick means you did it.') + '</span></div>') +
      (!grp && h.type === 'num' ?
        '<div class="two"><label class="fl">Unit<input id="fUnit" value="' + esc(h.unit) + '" placeholder="pages, min, km" autocomplete="off"></label>' +
        '<label class="fl">Target<input id="fTarget" inputmode="decimal" value="' + num(h.target) + '" autocomplete="off"></label></div>' +
        '<div class="fl">Target type' + seg('tt', h.tt, [['min', 'At least'], ['max', 'At most']]) + '</div>' : '') +
      freqFields(h, grp) +
      (!grp && h.type === 'num' ? '<label class="fl">Default value<input id="fStep" inputmode="decimal" value="' + (h.step ? num(h.step) : '') + '" placeholder="1" autocomplete="off">' +
        '<span class="small muted">The number box opens with this filled in, so OK saves it in one tap. + and − change by this much.</span></label>' : '') +
      (!inG ? '<div class="fl">Tab<div class="chips wrap">' +
        [{ id: '', name: 'Main' }].concat(S.tabs()).map(function (t) {
          return '<button class="tchip' + ((h.tab || '') === t.id ? ' on' : '') + '" data-act="ef" data-f="tab" data-v="' + t.id + '">' + esc(t.name) + (t.hidden ? ' (hidden)' : '') + '</button>';
        }).join('') + '</div></div>' : '') +
      '<div class="fl">Time window' + (grp ? ' (whole group)' : '') + '<div class="two">' + edgeField('From', 'Show from', h.win.from) + edgeField('To', 'Hide after', h.win.to) + '</div>' +
        (/p:/.test(h.win.from + h.win.to) && !prayerToday() ? '<span class="small" style="color:var(--bad)">Set your location in Settings → Prayer times, or prayer-based edges are ignored.</span>' : '') +
        '<span class="small muted">Outside this time it leaves today’s list; find it under <b>Later</b> on the bottom bar. Leave blank for all day.' +
        (h.win.from || h.win.to ? ' <a href="#" data-act="ef" data-f="winClear">Clear</a>' : '') + '</span></div>' +
      (!h._new ? '<div class="row"><button class="btn danger-o" data-act="delHabit">Delete habit</button></div>' : '') +
      '</div>';
    if (sheetOpen === 'edit') { sheet.innerHTML = html; } else showSheet('edit', html, 'page');
  }
  /* v5.5 Repeat section (Google Tasks "Repeats": only the fields that matter) + If not done + group Enforce.
     A sub-habit of an enforcing group shows the group's settings greyed out. */
  function freqFields(h, grp) {
    var G = enfG(h), dis = !!G, f = dis ? fq(h) : h.freq, D = dis ? ' disabled' : '', ws = S.d.settings.weekStart || 0;
    var wdOrder = [0, 1, 2, 3, 4, 5, 6].map(function (i) { return (i + ws) % 7; });
    var o = '<div class="fl' + (dis ? ' lockf' : '') + '">Repeat' + (dis ? '<span class="small muted">Set by the group ' + esc(G.name) + '</span>' : '') +
      seg('freq', f.t, [['day', 'Every day'], ['week', 'Per week'], ['month', 'Per month'], ['rep', 'Repeats']], dis);
    if (f.t === 'week' || f.t === 'month') o += '<label class="inl"><input id="fN" inputmode="numeric" value="' + (f.n || 1) + '"' + D + '> times per ' + f.t + '</label>';
    if (f.t === 'rep') {
      var done = f.from === 'done';
      o += '<div class="repl">Every <input id="fEv" inputmode="numeric" value="' + (f.ev || 1) + '"' + D + '>' + seg('ru', f.u || 'w', [['d', 'Days'], ['w', 'Weeks'], ['m', 'Months']], dis) + '</div>' +
        '<div class="fl">Count from' + seg('rfrom', done ? 'done' : 'sch', [['sch', 'The schedule'], ['done', 'Day it’s done']], dis) +
        '<span class="small muted">' + (done ? 'The next one is due this long after you actually do it (e.g. car oil every 90 days).' : 'Fixed dates, whenever you did the last one.') + '</span></div>' +
        (!done && f.u === 'w' ? '<div class="wd">' + wdOrder.map(function (i) {
          return '<button class="' + ((f.days || []).indexOf(i) >= 0 ? 'on' : '') + '" data-act="ef" data-f="wd" data-v="' + i + '"' + D + '>' + WD[i].slice(0, 2) + '</button>'; }).join('') + '</div>' : '') +
        (!done && f.u === 'm' ? '<label class="inl">On day <input id="fMd" inputmode="numeric" value="' + (f.md || 1) + '"' + D + '> of the month <span class="small muted">(31 = last day)</span></label>' : '') +
        '<label class="fl">' + (done ? 'First due' : 'Starts') + '<input id="fRa" type="date" value="' + esc(f.a || S.today()) + '"' + D + '></label>';
    }
    o += '</div>';
    if (f.t === 'rep' && h.kind !== 'bad') {
      var m = (dis ? G.miss : h.miss) || { t: 'drop' };
      o += '<div class="fl' + (dis ? ' lockf' : '') + '">If not done' + seg('miss', m.t, [['drop', 'Disappear'], ['stay', 'Stay as due']], dis) +
        '<span class="small muted">' + (m.t === 'stay' ? 'Stays on the list with a red “due” count until done or its next turn comes. A later tick counts as done late.' : 'Missed once its day is over (e.g. Friday Surah Al-Kahf).') + '</span>' +
        (m.t === 'stay' ? '<label class="inl">Keep for at most <input id="fKeep" inputmode="numeric" value="' + (m.keep || '') + '" placeholder="–"' + D + '> days <span class="small muted">(blank = until done)</span></label>' : '') + '</div>';
    }
    if (grp) o += '<button class="mi tg flat" data-act="ef" data-f="enf"><span>Enforce on sub-habits<br><span class="small muted">Sub-habits follow this group’s repeat and if-not-done settings (shown greyed in their Edit).</span></span><span class="box' + (h.enf ? ' on' : '') + '">' + (h.enf ? ICON.check : '') + '</span></button>';
    return o;
  }
  // v6: what switching type does to past days (only for a saved habit with history)
  function typeNote(h) {
    var o = !h._new && S.habit(h.id); if (!o || o.type === h.type) return '';
    var n = S.countEntries(h.id); if (!n) return '';
    if (h.type === 'yn') return '<span class="small muted">On Save, ' + n + ' past day' + (n === 1 ? '' : 's') + ' change: ' + (h.kind === 'bad' ? 'any amount becomes a tick' : 'days that met the target become ticks') + '. The numbers are kept, so switching back restores them.</span>';
    return '<label class="inl">Each past tick becomes <input id="fTick" inputmode="decimal" value="' + num(h._tick != null ? h._tick : (h.target || 1)) + '"></label>' +
      '<span class="small muted">Ticks that were numbers before go back to those numbers.</span>';
  }
  function readInputs() {   // keep typed values before a redraw
    var g = function (id) { var el = document.getElementById(id); return el && !el.disabled ? el.value : null; };   // greyed (enforced) fields stay the group's
    if (g('fName') != null) draft.name = g('fName');
    if (g('fUnit') != null) draft.unit = g('fUnit').trim();
    if (g('fTarget') != null) { var t = parseFloat(g('fTarget').replace(',', '.')); draft.target = isFinite(t) ? t : draft.target; }
    if (g('fN') != null) { var n = parseInt(g('fN'), 10); draft.freq.n = n > 0 ? n : 1; }
    if (g('fEv') != null) { var ev = parseInt(g('fEv'), 10); draft.freq.ev = ev > 0 ? Math.min(ev, 999) : 1; }
    if (g('fMd') != null) { var md = parseInt(g('fMd'), 10); draft.freq.md = md > 0 ? Math.min(md, 31) : 1; }
    if (g('fRa') != null && g('fRa')) draft.freq.a = g('fRa');
    if (g('fKeep') != null) { var kp = parseInt(g('fKeep'), 10); draft.miss = draft.miss || { t: 'stay' }; draft.miss.keep = kp > 0 ? kp : null; }
    if (g('fStep') != null) { var st = parseFloat(g('fStep').replace(',', '.')); draft.step = isFinite(st) && st > 0 ? st : null; }
    if (g('fTick') != null) { var tk = parseFloat(g('fTick').replace(',', '.')); draft._tick = isFinite(tk) && tk >= 0 ? tk : null; }
    if (document.getElementById('fFromK')) draft.win = { from: edgeRead('From'), to: edgeRead('To') };
    if (g('fAggN') != null) { var m = parseInt(g('fAggN'), 10); draft.agg = draft.agg || { t: 'count' }; draft.agg.n = m > 0 ? m : 1; }
  }

  /* ---- SL 29 Demo data: switch between his data and a fresh example ---- */
  function setDemo(on) {
    sel = null; S.setDemo(on); S.d.ui.view = 'all';
    document.documentElement.dataset.theme = S.d.settings.theme || 'dark';
    App.render(true); App.toast(on ? 'Demo data on' : 'Your own habits are back');
  }

  /* ---- Settings & menu ---- */
  function openMenu() {
    var g = S.habits().some(isGroup);
    showSheet('menu', 
      (S.tabs().some(function (t) { return t.hidden; }) ? '<button class="mi" data-act="hiddenTabs">Archived tabs</button>' : '') +
      (tabsMode() === 'off' ? '<button class="mi" data-act="tabsSheet">Tabs</button>' : '') +
      '<button class="mi" data-act="settings">Settings</button>', 'menu');
  }
  function openSettings() {
    var s = S.d.settings, tg = function (k, label, hint) {
      var on = k === 'demo' ? S.demo : !!s[k]; return '<button class="mi tg flat" data-act="setTg" data-k="' + k + '"><span>' + label + (hint ? '<br><span class="small muted">' + hint + '</span>' : '') + '</span><span class="box' + (on ? ' on' : '') + '">' + (on ? ICON.check : '') + '</span></button>';
    };
    var dtg = function (k, label, hint) { var on = s[k] !== false; return '<button class="mi tg flat" data-act="setTg" data-k="' + k + '"><span>' + label + '<br><span class="small muted">' + hint + '</span></span><span class="box' + (on ? ' on' : '') + '">' + (on ? ICON.check : '') + '</span></button>'; };
    showSheet('settings',
      '<h3>Settings</h3>' +
      '<h4>Theme</h4><div class="row">' + [['dark', 'Dark'], ['light', 'Light']].map(function (t) { return '<button class="btn sm' + (s.theme === t[0] ? ' pri' : '') + '" data-act="theme" data-t="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>' +
      '<h4>Tabs layout</h4><div class="seg">' + [['top', 'Strip on top'], ['bottom', 'Strip at bottom'], ['off', 'One page']].map(function (m) {
        return '<button class="' + (tabsMode() === m[0] ? 'on' : '') + '" data-act="tabsMode" data-v="' + m[0] + '">' + m[1] + '</button>';
      }).join('') + '</div><p class="small muted" style="margin-top:6px">' + {
        bottom: 'Main and your tabs sit in a strip just above the bottom bar. Hold any tab to add a new one; swipe the blank area below the list to change tab.',
        top: 'Main and your tabs sit in a strip across the top; Filter and Add move to the bottom bar. Hold any tab to add a new one; swipe the blank area below the list to change tab.',
        off: 'No tabs: one page with each tab’s name as a header above its habits.' }[tabsMode()] + '</p>' +
      '<h4>Marking</h4>' + tg('shortPress', 'Toggle with short press', 'Off: hold a day to mark it, so a stray tap changes nothing.') +
      tg('skipDays', 'Skip days', 'Yes/no: hold again after a tick to mark a skip (neither done nor missed). Measurable: Skip button in the number box.') +
      '<h4>Day &amp; week</h4><div class="fl">Extend day<div class="seg">' + [0, 1, 2, 3, 4, 5].map(function (x) {
        return '<button class="' + ((s.extendH || 0) === x ? 'on' : '') + '" data-act="setNum" data-k="extendH" data-v="' + x + '">' + (x ? x + ' h' : 'Off') + '</button>';
      }).join('') + '</div><span class="small muted">Until this many hours after midnight, you are still logging the day before.</span></div>' +
      '<div class="fl" style="margin-top:12px">First day of week<div class="seg">' + [[6, 'Saturday'], [0, 'Sunday'], [1, 'Monday']].map(function (w) {
        return '<button class="' + ((s.weekStart || 0) === w[0] ? 'on' : '') + '" data-act="setNum" data-k="weekStart" data-v="' + w[0] + '">' + w[1] + '</button>';
      }).join('') + '</div></div>' +
      '<h4>Main list</h4>' + dtg('hScroll', 'Scroll back through past days', 'Off: only the days that fit on screen, no side-scrolling.') +
      (s.hScroll !== false ? dtg('freezeToday', 'Keep today’s column fixed', 'Off: today scrolls away with the other days.') : '') +
      '<h4>Groups</h4><button class="mi tg flat" data-act="setTg" data-k="subLines"><span>Lines between sub-habits</span><span class="box' + (s.subLines !== false ? ' on' : '') + '">' + (s.subLines !== false ? ICON.check : '') + '</span></button>' +
      '<button class="mi tg flat" data-act="setTg" data-k="starGroups"><span>In Starred, show the group above a starred sub-habit</span><span class="box' + (s.starGroups !== false ? ' on' : '') + '">' + (s.starGroups !== false ? ICON.check : '') + '</span></button>' +
      '<h4>Prayer times</h4><div class="frow"><label>' + (s.pt && s.pt.lat != null ? esc(s.pt.name || 'My location') + '<br><span class="small muted">' + esc((Prayer.METHODS[s.pt.method] || {}).name || '') + ' · Asr ' + (s.pt.asr === 'hanafi' ? 'Hanafi' : 'Hanbali/Shafi’i') + '</span>'
        : 'Not set<br><span class="small muted">Lets a time window start or end at a prayer, e.g. “Asr − 15 min”</span>') + '</label><button class="btn sm" data-act="ptOpen">' + (s.pt ? 'Change' : 'Set') + '</button></div>' +
      '<h4>App</h4><div class="frow"><label>Update app <span class="ver">' + esc(C.appVersion.split(' ·')[0]) + '</span></label><button class="btn sm" data-act="updateApp">Update</button></div>' +
      tg('demo', 'Demo data', S.demo ? 'On: showing an example. Turn off to get your own habits back, exactly as they were.' : 'Show a filled example instead of your habits, e.g. to show someone the app. Your data stays untouched.') +
      '<div class="frow"><label>Share this app</label><button class="btn sm" data-act="share">Copy link</button></div>' +
      '<h4>Account &amp; sync</h4>' + (S.demo ? '<p class="small muted">Exit demo data to sign in.</p>'
        : !S.d.acct ? '<p class="small muted">Everything is saved on this phone and works offline. Sign in to keep a copy in your Google Drive, use it on other devices, and see your history in a Google Sheet.</p><button class="btn pri" data-act="signIn">Sign in with Google</button>'
        : '<div class="frow"><label><b>' + esc(S.d.acct) + '</b><br><span class="small muted">' + ({ ok: 'Synced to your Google Drive', syncing: 'Syncing…', paused: 'Changes waiting — they go up on your next tap online', idle: 'Signed in · syncs when you make a change', error: 'Last sync failed' }[Sync.state] || '') + '</span></label><button class="btn sm" data-act="syncNow">Sync now</button></div>' +
          (S.d.settings.sheetId ? '<div class="frow"><label>History in Google Sheets<br><span class="small muted">Updated every few minutes while syncing</span></label><a class="btn sm" href="https://docs.google.com/spreadsheets/d/' + encodeURIComponent(S.d.settings.sheetId) + '" target="_blank" rel="noopener">Open</a></div>'
            : Sync.sheetOk === false ? '<div class="frow"><label>History in Google Sheets<br><span class="small muted">Needs one more permission from Google</span></label><button class="btn sm" data-act="signInFull">Allow</button></div>'
            : '<p class="small muted">Your history Sheet (“Habits history”) is created in your Drive on the next sync.</p>') +
          '<div class="row"><button class="btn sm" data-act="signOut">Sign out</button></div>') +
      '<div class="row end"><button class="btn" data-act="close">Close</button></div>');
  }

  /* ---- SL 35 Prayer times setup: location typed in (or picked), method, Asr school; preview of today's times ---- */
  function openPt() {
    var p = S.d.settings.pt || {}, has = p.lat != null;
    showSheet('pt', '<h3>Prayer times</h3>' +
      '<label class="fl">Place<select id="ptCity" data-act="ptCity" class="sel"><option value="">' + (has ? esc(p.name || 'My location') : 'Pick a city, or type coordinates below') + '</option>' +
        Prayer.CITIES.map(function (c, i) { return '<option value="' + i + '">' + c[0] + '</option>'; }).join('') + '</select></label>' +
      '<div class="two" style="margin-top:10px"><label class="fl">Latitude<input id="ptLat" inputmode="decimal" value="' + (has ? p.lat : '') + '" placeholder="23.81"></label>' +
      '<label class="fl">Longitude<input id="ptLng" inputmode="decimal" value="' + (has ? p.lng : '') + '" placeholder="90.41"></label></div>' +
      '<label class="fl" style="margin-top:10px">Name (optional)<input id="ptName" value="' + esc(p.name || '') + '" placeholder="e.g. Home" autocomplete="off"></label>' +
      '<label class="fl" style="margin-top:10px">Calculation method<select id="ptMethod" data-act="ptMethod" class="sel">' + Object.keys(Prayer.METHODS).map(function (k) {
        return '<option value="' + k + '"' + ((p.method || 'karachi') === k ? ' selected' : '') + '>' + Prayer.METHODS[k].name + '</option>'; }).join('') + '</select></label>' +
      '<div class="fl" style="margin-top:10px">Asr<div class="seg" id="ptAsr">' + [['std', 'Hanbali / Shafi’i'], ['hanafi', 'Hanafi']].map(function (o) {
        return '<button class="' + ((p.asr || 'std') === o[0] ? 'on' : '') + '" data-act="ptAsr" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div></div>' +
      '<div id="ptPrev" class="ptprev"></div>' +
      '<p class="small muted">Worked out on your phone, in its own time zone — no internet needed. Find coordinates in Google Maps: hold a spot, the numbers appear at the top.</p>' +
      '<div class="row end">' + (has ? '<button class="btn danger-o" data-act="ptClear">Remove</button><span class="grow"></span>' : '') + '<button class="btn" data-act="ptBack">Cancel</button><button class="btn pri" data-act="ptSave">Save</button></div>');
    ['ptLat', 'ptLng'].forEach(function (id) { document.getElementById(id).addEventListener('input', ptPreview); });
    ptPreview();
  }
  function ptRead() {
    var n = function (id) { return parseFloat((document.getElementById(id).value || '').replace(',', '.')); };
    var on = document.querySelector('#ptAsr .on');
    return { name: document.getElementById('ptName').value.trim(), lat: n('ptLat'), lng: n('ptLng'), method: document.getElementById('ptMethod').value, asr: on ? on.dataset.v : 'std' };
  }
  function ptOk(L) { return isFinite(L.lat) && isFinite(L.lng) && Math.abs(L.lat) <= 66 && Math.abs(L.lng) <= 180; }
  function ptPreview() {
    var L = ptRead(), el = document.getElementById('ptPrev'); if (!el) return;
    if (!ptOk(L)) { el.innerHTML = '<p class="small muted">Today’s times appear here once the place is set.</p>'; return; }
    var T = Prayer.times(S.todayDate(), L);
    el.innerHTML = Object.keys(Prayer.NAMES).map(function (k) { return '<div><span>' + Prayer.NAMES[k] + '</span><b>' + Prayer.hm(T[k]) + '</b></div>'; }).join('');
  }
  function ptFill(i) {
    var c = Prayer.CITIES[+i]; if (i === '' || !c) return;
    document.getElementById('ptLat').value = c[1]; document.getElementById('ptLng').value = c[2]; document.getElementById('ptName').value = c[0];
    document.getElementById('ptMethod').value = c[3]; ptPreview();
  }

  /* ---- v4 Tabs: sheet (ribbon layout), new/rename, hold a tab for its actions ---- */
  function tabAll(id) { return S.habits().filter(function (h) { return !h.parent && h.tab === id; }).length; }   // incl. archived
  function tabCount(id) { return S.habits().filter(function (h) { return !h.parent && h.tab === id && !h.archived; }).length; }
  function openTabsSheet() {
    var v = view(), hid = S.tabs().filter(function (t) { return t.hidden; });
    showSheet('tabs', '<h3>Tabs</h3>' +
      '<button class="mi trow' + (v === 'all' ? ' on' : '') + '" data-act="goTab" data-tab="all"><span>Main</span></button>' +
      visTabs().map(function (t) {
        return '<button class="mi trow' + (v === t.id ? ' on' : '') + '" data-act="goTab" data-tab="' + t.id + '" data-hold="' + t.id + '"><span>' + esc(t.name) + '</span><small>' + tabCount(t.id) + '</small></button>';
      }).join('') +
      '<button class="mi trow add" data-act="newTab">' + ICON.plus + '<span>New tab</span></button>' +
      (hid.length ? '<button class="mi trow muted" data-act="hiddenTabs"><span>Archived tabs</span><small>' + hid.length + '</small></button>' : '') +
      '<p class="small muted hint">Hold a tab to edit, archive, move or delete it.</p>');
  }
  function openHiddenTabs() {
    var hid = S.tabs().filter(function (t) { return t.hidden; });
    showSheet('hidden', '<h3>Archived tabs</h3><p class="small muted">Archived tabs and their habits stay out of every list. Tap or hold one to bring it back.</p>' +
      (hid.length ? hid.map(function (t) { return '<button class="mi trow" data-act="tabActs" data-tab="' + t.id + '" data-hold="' + t.id + '"><span>' + esc(t.name) + '</span><small>' + tabCount(t.id) + '</small></button>'; }).join('')
        : '<p class="muted">None.</p>') + '<div class="row end"><button class="btn" data-act="close">Close</button></div>');
  }
  function askTabName(t) {   // v5.5: name + optional short name (shown on the strip when the tab isn't open)
    showSheet('tabname', '<h3>' + (t ? 'Edit tab' : 'New tab') + '</h3><input id="tabIn" value="' + esc(t ? t.name : '') + '" placeholder="e.g. Daily, Weekly, Monthly" maxlength="30" enterkeyhint="next" autocomplete="off">' +
      '<label class="fl" style="margin-top:10px">Short name (optional)<input id="tabSh" value="' + esc(t && t.short || '') + '" placeholder="e.g. Wk" maxlength="10" enterkeyhint="done" autocomplete="off"></label>' +
      '<p class="small muted" style="margin-top:6px">The full name shows on the open tab, the short name on the others.</p>' +
      '<div class="row end"><button class="btn" data-act="close">Cancel</button><button class="btn pri" data-act="tabSave">' + (t ? 'Save' : 'Create') + '</button></div>', 'attop');
    var inp = document.getElementById('tabIn'), sh = document.getElementById('tabSh'); inp.focus(); inp.select();
    App._tab = function () {
      var name = inp.value.trim(), short = sh.value.trim(); if (!name) return App.toast('Give the tab a name');
      closeSheet(function () {
        if (t) { t.name = name; t.short = short; S.putTab(t); App.render(); }
        else { var nt = S.putTab({ name: name, short: short }); if (tabsMode() === 'off') App.render(); else setView(nt.id); App.toast('Tab “' + name + '” created'); }
      });
    };
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') sh.focus(); });
    sh.addEventListener('keydown', function (e) { if (e.key === 'Enter') App._tab(); });
  }
  function openTabActs(id) {
    var nt = '<button class="mi" data-act="newTab">' + ICON.plus + ' New tab</button>';
    if (id === 'all') return showSheet('tabacts', '<h3>Main</h3>' + nt + '<p class="small muted hint">Main is always first and can’t be renamed, archived or deleted.</p>');
    var t = S.tab(id); if (!t) return;
    var vis = visTabs(), i = vis.findIndex(function (x) { return x.id === id; });
    var lr = tabsMode() === 'off' ? ['Move up', 'Move down'] : ['Move left', 'Move right'], n = tabAll(id);
    showSheet('tabacts', '<h3>' + esc(t.name) + '</h3>' + nt +
      '<button class="mi" data-act="tabRename" data-tab="' + id + '">Edit name &amp; short name</button>' +
      (t.hidden ? '<button class="mi" data-act="tabHide" data-tab="' + id + '">Unarchive tab</button>' :
        '<button class="mi" data-act="tabHide" data-tab="' + id + '">Archive tab and its habits</button>') +
      (!t.hidden && i > 0 ? '<button class="mi" data-act="tabMove" data-tab="' + id + '" data-d="-1">' + lr[0] + '</button>' : '') +
      (!t.hidden && i < vis.length - 1 ? '<button class="mi" data-act="tabMove" data-tab="' + id + '" data-d="1">' + lr[1] + '</button>' : '') +
      (n ? '<button class="mi muted" disabled>Delete tab<br><span class="small">Only an empty tab can be deleted — it still has ' + n + ' habit' + (n > 1 ? 's' : '') + ' (archived ones count). Move or delete them first.</span></button>'
        : '<button class="mi danger-t" data-act="tabDel" data-tab="' + id + '">Delete tab</button>'));
  }
  function openMoveToTab() {
    showSheet('movetab', '<h3>Move to tab</h3>' +
      '<button class="mi trow" data-act="moveTo" data-tab=""><span>Main</span></button>' +
      S.tabs().map(function (t) { return '<button class="mi trow" data-act="moveTo" data-tab="' + t.id + '"><span>' + esc(t.name) + (t.hidden ? ' (hidden)' : '') + '</span></button>'; }).join('') +
      '<button class="mi trow add" data-act="moveToNew">' + ICON.plus + '<span>New tab…</span></button>');
  }
  // Hold a tab chip / tab row (450 ms) → its actions. A short tap still opens the tab.
  /* ---- v5.6 Tab panel: hold a tab → a slim icon panel beside the strip (tabs stay visible, the held one outlined):
     New · Rename · Archive · Delete · "Archived" flip (archived tabs shown in italics) · Done.
     While it is open, press and slide a tab sideways to drag it to a new place (Main stays first). Phone Back closes it. ---- */
  var tp = null;
  function openTp(id) { if (!tp) history.pushState({ tp: 1 }, ''); tp = { id: id }; App.render(); }
  function closeTp() { if (tp && !closing) { closing = true; history.back(); } }
  function tabPanel() {
    var t = S.tab(tp.id), main = !t, n = t ? tabAll(t.id) : 0, sa = !!S.d.ui.showArchTabs;
    var ib = function (act, icon, label, dis) { return '<button class="pbtn' + (dis ? ' dis' : '') + '" data-act="' + act + '" aria-label="' + label + '">' + icon + '<span>' + label + '</span></button>'; };
    return '<div class="tpanel"><div class="tpbtns">' + ib('newTab', ICON.plus, 'New') + ib('tpRename', ICON.pen, 'Rename', main) +
      ib('tpArchive', t && t.hidden ? ICON.unarchive : ICON.archive, t && t.hidden ? 'Unarchive' : 'Archive', main) + ib('tpDelete', ICON.bin, 'Delete', main || n > 0) +
      '<button class="flip pflip" data-act="tpArchShow" aria-pressed="' + sa + '"><i class="tgl' + (sa ? ' on' : '') + '"></i><span>Archived</span></button>' +
      ib('tpDone', ICON.check, 'Done') + '</div><p class="tphint">' + esc(main ? 'Main' : t.name) + ' · drag tabs sideways to reorder</p></div>';
  }
  function reorderTabs(ids) {
    var all = S.tabs(), shown = {}, q = ids.slice(), now = Date.now(); ids.forEach(function (id) { shown[id] = 1; });
    all.map(function (t) { return shown[t.id] ? q.shift() : t.id; }).forEach(function (id, i) { var t = S.d.tabs[id]; if (t && t.order !== i + 1) { t.order = i + 1; t.u = now; } });
    S.save();
  }
  var cd = null;   // a press on a tab chip: hold → panel; with the panel open, slide sideways → drag
  document.addEventListener('pointerdown', function (e) {
    var el = e.target.closest('.tchip[data-tab]'); if (!el || e.button > 0 || sheetOpen || sel) return;
    thQuiet = false; cd = { el: el, id: el.dataset.tab, x: e.clientX, y: e.clientY, armed: !!tp, drag: false };
    cd.t = setTimeout(function () {
      if (!cd || cd.drag) return; cd.armed = true; thQuiet = true; if (navigator.vibrate) navigator.vibrate(20);
      if (tp) { tp.id = cd.id; App.render(); } else openTp(cd.id);
      cd.el = document.querySelector('.tchip[data-tab="' + cd.id + '"]');
    }, HOLD);
  });
  document.addEventListener('pointermove', function (e) {
    if (!cd) return; var dx = e.clientX - cd.x, dy = e.clientY - cd.y;
    if (cd.drag) return chipMove(e);
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
    if (cd.armed && cd.id !== 'all' && Math.abs(dx) > Math.abs(dy)) { clearTimeout(cd.t); chipStart(e); } else { clearTimeout(cd.t); cd = null; }
  });
  document.addEventListener('touchmove', function (e) { if (cd && cd.armed) e.preventDefault(); }, { passive: false });
  ['pointerup', 'pointercancel'].forEach(function (n) { document.addEventListener(n, function () {
    if (!cd) return; clearTimeout(cd.t); var d = cd; cd = null;
    if (d.drag) { thQuiet = true; chipEnd(d); }
  }); });
  function chipStart(e) {
    var el = cd.el; cd.drag = true; tp.id = cd.id; el.classList.add('cdrag');
    cd.grab = e.clientX - el.getBoundingClientRect().left; chipMove(e);
  }
  function chipMove(e) {
    var el = cd.el, box = el.parentNode, want = e.clientX - cd.grab;
    var nat = function (c) { return box.getBoundingClientRect().left - box.scrollLeft + c.offsetLeft; };
    var prev = el.previousElementSibling, next = el.nextElementSibling;
    if (prev && prev.dataset.tab !== 'all' && want < nat(prev) + prev.offsetWidth / 2) box.insertBefore(el, prev);
    else if (next && next.dataset.tab && want + el.offsetWidth > nat(next) + next.offsetWidth / 2) box.insertBefore(next, el);
    var r = box.getBoundingClientRect(); if (e.clientX < r.left + 30) box.scrollLeft -= 8; else if (e.clientX > r.right - 30) box.scrollLeft += 8;
    el.style.transform = 'translateX(' + (want - nat(el)) + 'px)';
  }
  function chipEnd(d) {
    var ids = [].map.call(d.el.parentNode.querySelectorAll('.tchip[data-tab]'), function (c) { return c.dataset.tab; }).filter(function (id) { return id !== 'all'; });
    reorderTabs(ids); App.render();
  }

  var th = null, thQuiet = false;
  document.addEventListener('pointerdown', function (e) {
    var el = e.target.closest('[data-hold]'); if (!el || e.button > 0) return;   // tab rows in the Tabs / Archived tabs sheets
    thQuiet = false;
    th = { x: e.clientX, y: e.clientY, t: setTimeout(function () { th = null; thQuiet = true; if (navigator.vibrate) navigator.vibrate(20); var id = el.dataset.hold || el.dataset.tab; if (sheetOpen) closeSheet(function () { openTabActs(id); }); else openTabActs(id); }, HOLD) };
  });
  document.addEventListener('pointermove', function (e) { if (th && (Math.abs(e.clientX - th.x) > 10 || Math.abs(e.clientY - th.y) > 10)) { clearTimeout(th.t); th = null; } });
  ['pointerup', 'pointercancel'].forEach(function (n) { document.addEventListener(n, function () { if (th) { clearTimeout(th.t); th = null; } }); });
  document.addEventListener('contextmenu', function (e) { if (e.target.closest('.tchip, [data-hold]')) e.preventDefault(); });

  /* ---- Actions ---- */
  var actions = {
    add: function () { openEdit(null); },   // a new habit lands in the tab you're looking at (or starred, on Starred)
    edit: function (el) {
      var id = el.dataset.id, h = S.habit(id);
      if (ctxGrp(h)) return;
      if (sel) return selToggle(id);
      if (h && isGroup(h)) { setFold([id], !folded(id)); return; }   // tap a group = fold / unfold
      openStats(id);
    },
    selFold: function () {
      if (sheetOpen) return closeSheet(actions.selFold);
      var gs = Object.keys(sel).filter(function (id) { var h = S.habit(id); return h && isGroup(h); });
      setFold(gs, !gs.every(folded)); selEnd();
    },
    foldCycle: function () {
      var next = { open: 'shut', shut: 'man', man: 'open' }[foldMode()];
      S.d.ui.foldMode = next; S.d.ui.fx = {}; S.saveUi(); App.render();
      App.toast({ open: 'All groups expanded', shut: 'All groups collapsed', man: 'Each group as set in Edit' }[next]);
    },
    selDone: function () { selEnd(); },
    selStar: function () {
      var ids = Object.keys(sel), on = !allStarred();
      ids.forEach(function (id) { var h = S.habit(id); if (h) { h.star = on; S.putHabit(h); } });
      selEnd(function () { App.toast((on ? 'Starred ' : 'Unstarred ') + ids.length); });
    },
    selMore: function () {
      var g = Object.keys(sel).some(function (id) { var h = S.habit(id); return h && isGroup(h); });
      showSheet('selmore', '<button class="mi" data-act="selColor">Change colour</button>' +
        '<button class="mi" data-act="selTab">Move to tab</button>' +
        (selIn().length ? '<button class="mi" data-act="selIntoAsk">Put into a group…</button>' : '') +
        (selOut().length ? '<button class="mi" data-act="selOut">Take out of group</button>' : '') +
        (g ? '<button class="mi" data-act="selFold">Fold / unfold group</button>' : ''), 'menu');
    },
    // Several selected habits go under one group together, or all come out of their groups at once.
    selIntoAsk: function () {
      closeSheet(function () {
        var ts = S.habits().filter(function (h) { return !h.parent && !h.archived && !sel[h.id]; });
        if (!ts.length) return App.toast('No habit to put them under');
        showSheet('selinto', '<h3>Put ' + selIn().length + ' under…</h3>' + ts.map(function (h) {
          return '<button class="mi trow" data-act="selInto" data-id="' + h.id + '"><span style="color:' + esc(h.color) + '">' + esc(h.name) + '</span>' + (isGroup(h) ? '<small class="muted">' + subs(h.id).length + '</small>' : '') + '</button>';
        }).join(''), 'menu');
      });
    },
    selInto: function (el) {
      var g = S.habit(el.dataset.id), ids = selIn(), skip = Object.keys(sel).length - ids.length;
      var order = S.habits().map(function (h) { return h.id; }).filter(function (id) { return ids.indexOf(id) < 0; });
      var last = [g.id].concat(subs(g.id).map(function (x) { return x.id; })).pop();
      order.splice.apply(order, [order.indexOf(last) + 1, 0].concat(ids));
      S.reorder(order);
      ids.forEach(function (id) { var h = S.habit(id); h.parent = g.id; S.putHabit(h); });
      if (folded(g.id)) { S.d.ui.fx = S.d.ui.fx || {}; S.d.ui.fx[g.id] = false; S.saveUi(); }
      closeSheet(function () { selEnd(function () { App.toast('Moved ' + ids.length + ' into ' + g.name + (skip ? ' · groups can’t go inside a group' : '')); }); });
    },
    selOut: function () {
      var ids = selOut(), order = S.habits().map(function (h) { return h.id; }).filter(function (id) { return ids.indexOf(id) < 0; }), by = {};
      ids.forEach(function (id) { var p = S.habit(id).parent; (by[p] = by[p] || []).push(id); });
      Object.keys(by).forEach(function (p) {   // they land just after their own group, keeping their order
        var at = 0; order.forEach(function (id, i) { if (id === p || S.habit(id).parent === p) at = i + 1; });
        order.splice.apply(order, [at, 0].concat(by[p]));
      });
      ids.forEach(function (id) { S.habit(id).parent = null; });
      S.reorder(order);
      ids.forEach(function (id) { S.putHabit(S.habit(id)); });
      closeSheet(function () { selEnd(function () { App.toast('Moved ' + ids.length + ' out of the group'); }); });
    },
    selTab: function () { closeSheet(openMoveToTab); },
    moveTo: function (el) {
      var ids = Object.keys(sel), tid = el.dataset.tab || null, n = 0, skipped = 0;
      ids.forEach(function (id) { var h = S.habit(id); if (!h) return; if (h.parent && S.habit(h.parent)) { skipped++; return; } h.tab = tid; S.putHabit(h); n++; });
      var t = S.tab(tid);
      closeSheet(function () { selEnd(function () { App.toast((n ? 'Moved ' + n + (t ? ' to ' + t.name : ' out of tabs') : '') + (skipped ? (n ? ' · ' : '') + 'sub-habits follow their group' : '')); }); });
    },
    moveToNew: function () {
      closeSheet(function () {
        showSheet('tabname', '<h3>New tab</h3><input id="tabIn" placeholder="Tab name" maxlength="30" autocomplete="off"><div class="row end"><button class="btn" data-act="close">Cancel</button><button class="btn pri" data-act="tabSave">Create &amp; move</button></div>', 'attop');
        var inp = document.getElementById('tabIn'); inp.focus();
        App._tab = function () {
          var name = inp.value.trim(); if (!name) return App.toast('Give the tab a name');
          var t = S.putTab({ name: name }); actions.moveTo({ dataset: { tab: t.id } });
        };
      });
    },
    secFold: function (el) { var F = S.d.ui.secFold = S.d.ui.secFold || {}, id = el.getAttribute('data-sec'); if (F[id]) delete F[id]; else F[id] = 1; S.saveUi(); App.render(); },
    home: function () { var sc = document.getElementById('sc'); if (view() !== 'all') setView('all'); else if (sc) sc.scrollTop = 0; sc = document.getElementById('sc'); if (sc) sc.scrollLeft = 0; },
    starToggle: function () { toggleView('star'); },
    viewArch: function () { toggleView('arch'); },
    viewWin: function () { toggleView('win'); },
    viewDue: function () { closeSheet(function () { toggleView('due'); }); },
    flipGroups: function () { S.d.settings.starGroups = S.d.settings.starGroups === false; S.saveSettings(); App.render(); },
    tabsSheet: openTabsSheet,
    tpDone: function () { closeTp(); },
    tpRename: function () { var t = S.tab(tp.id); if (!t) return App.toast('Main can’t be renamed'); askTabName(t); },
    tpArchive: function () {
      var t = S.tab(tp.id); if (!t) return App.toast('Main can’t be archived');
      t.hidden = !t.hidden; S.putTab(t);
      if (t.hidden && !S.d.ui.showArchTabs) { tp.id = 'all'; if (view() === 'all') S.d.ui.view = 'all'; }
      App.render(); App.toast(t.hidden ? 'Archived “' + t.name + '”' + (S.d.ui.showArchTabs ? '' : ' — flip “Archived” to see it') : '“' + t.name + '” is back');
    },
    tpDelete: function () {
      var t = S.tab(tp.id); if (!t) return App.toast('Main can’t be deleted');
      var n = tabAll(t.id); if (n) return App.toast('Only an empty tab can be deleted — it has ' + n + ' habit' + (n > 1 ? 's' : '') + ' (archived count)');
      confirmBox('Delete tab “' + t.name + '”?', 'Delete', function () { S.delTab(t.id); tp.id = 'all'; App.render(); App.toast('Tab deleted'); });
    },
    tpArchShow: function () { S.d.ui.showArchTabs = !S.d.ui.showArchTabs; S.saveUi(); App.render(); },
    goTab: function (el) {
      if (thQuiet) { thQuiet = false; return; }
      if (tp) tp.id = el.dataset.tab;
      var id = el.dataset.tab, go = function () { setView(id); };
      if (sheetOpen) closeSheet(go); else go();
    },
    newTab: function () { if (sheetOpen) closeSheet(function () { askTabName(null); }); else askTabName(null); },
    tabSave: function () { App._tab(); },
    hiddenTabs: function () { closeSheet(openHiddenTabs); },
    tabActs: function (el) { if (thQuiet) { thQuiet = false; return; } var id = el.dataset.tab; closeSheet(function () { openTabActs(id); }); },
    tabRename: function (el) { var t = S.tab(el.dataset.tab); closeSheet(function () { askTabName(t); }); },
    tabHide: function (el) {
      var t = S.tab(el.dataset.tab), hide = !t.hidden;
      closeSheet(function () { t.hidden = hide; S.putTab(t); App.render(); App.toast(hide ? 'Tab archived — find it in ⋮ → Archived tabs' : 'Tab “' + t.name + '” is back'); });
    },
    tabMove: function (el) { var id = el.dataset.tab, d = +el.dataset.d; closeSheet(function () { S.moveTab(id, d); App.render(); openTabActs(id); }); },
    tabDel: function (el) {
      var t = S.tab(el.dataset.tab); if (tabAll(t.id)) return App.toast('Only an empty tab can be deleted');
      closeSheet(function () {
        confirmBox('Delete tab “' + t.name + '”?', 'Delete', function () { S.delTab(t.id); App.render(); App.toast('Tab deleted'); });
      });
    },
    selEdit: function () { var id = Object.keys(sel)[0]; selEnd(function () { openEdit(id); }); },
    selColor: function () {
      if (sheetOpen) return closeSheet(actions.selColor);
      showSheet('color', '<h3>Change colour</h3><div class="sw">' + COLORS.map(function (c) {
        return '<button class="dot" style="background:' + c + '" data-act="pickColor" data-v="' + c + '" aria-label="Colour ' + c + '"></button>';
      }).join('') + '</div><div class="row end"><button class="btn" data-act="close">Cancel</button></div>');
    },
    pickColor: function (el) {
      var ids = Object.keys(sel), c = el.dataset.v;
      closeSheet(function () { ids.forEach(function (id) { var h = S.habit(id); if (h) { h.color = c; S.putHabit(h); } }); selEnd(); });
    },
    selArchive: function () {
      var ids = Object.keys(sel), arch = !allArchived();
      ids.forEach(function (id) { var h = S.habit(id); if (h) { h.archived = arch; S.putHabit(h); } });
      selEnd(function () { App.toast((arch ? 'Archived ' : 'Unarchived ') + ids.length + (arch && S.d.settings.hideArchived ? ' — see them via Filter' : '')); });
    },
    selDelete: function () {
      var ids = Object.keys(sel);
      confirmBox('Delete ' + (ids.length === 1 ? '“' + S.habit(ids[0]).name + '”' : ids.length + ' habits') + ' and all history? This can’t be undone.', 'Delete', function () {
        ids.forEach(function (id) { S.delHabit(id); }); selEnd(function () { App.toast('Deleted'); });
      });
    },
    filter: function () {
      var f = S.d.settings, row = function (k, label) {
        return '<button class="mi tg" data-act="fToggle" data-k="' + k + '"><span>' + label + '</span><span class="box' + (f[k] ? ' on' : '') + '">' + (f[k] ? ICON.check : '') + '</span></button>';
      };
      var nd = f.hideNotDue !== false, due = S.habits().filter(function (h) { return member(h, 'due'); }).length;
      showSheet('filter', row('hideArchived', 'Hide archived') + row('hideEntered', 'Hide entered') + (f.skipDays ? row('hideSkipped', 'Hide skip days') : '') +
        '<button class="mi tg" data-act="fToggle" data-k="hideNotDue"><span>Hide repeats not due today</span><span class="box' + (nd ? ' on' : '') + '">' + (nd ? ICON.check : '') + '</span></button>' +
        '<button class="mi trow" data-act="viewDue"><span>Overdue &amp; missed</span><small>' + (due || '') + '</small></button>', 'menu');
    },
    fToggle: function (el) { var k = el.dataset.k; S.d.settings[k] = k === 'hideNotDue' ? S.d.settings[k] === false : !S.d.settings[k]; S.saveSettings(); App.render(); actions.filter(); },
    ef: function (el) {   // edit-form field change
      readInputs();
      var f = el.dataset.f, v = el.dataset.v, h = draft;
      if (f === 'color') h.color = v;
      else if (f === 'type') { h.type = v; if (v === 'num') { if (!(h.target >= 0)) h.target = 1; if (!h.tt) h.tt = h.kind === 'bad' ? 'max' : 'min'; if (h.unit == null) h.unit = ''; } }
      else if (f === 'kind') { h.kind = v; if (!h._ttSet) h.tt = v === 'bad' ? 'max' : 'min'; }
      else if (f === 'tt') { h.tt = v; h._ttSet = true; }
      else if (f === 'agg') { h.agg = h.agg || { n: 1 }; h.agg.t = v; if (v === 'sum') h.tt = 'min'; }
      else if (f === 'freq') {
        h.freq.t = v;
        if (v === 'rep') { var td = S.todayDate(), q = h.freq; q.ev = q.ev || 1; q.u = q.u || 'w'; q.from = q.from || 'sch'; q.a = q.a || S.today(); q.md = q.md || td.getDate(); if (!q.days || !q.days.length) q.days = [td.getDay()]; }
      }
      else if (f === 'ru') h.freq.u = v;
      else if (f === 'rfrom') h.freq.from = v;
      else if (f === 'miss') { h.miss = h.miss || { keep: null }; h.miss.t = v; }
      else if (f === 'enf') h.enf = !h.enf;
      else if (f === 'tab') h.tab = v || null;
      else if (f === 'fold0') h.fold0 = v === '1';
      else if (f === 'prog') { h.agg = h.agg || { t: 'count', n: 1 }; h.agg.prog = h.agg.prog === false; }
      else if (f === 'winClear') h.win = { from: '', to: '' };
      else if (f === 'wd') { var i = +v, a = h.freq.days, p = a.indexOf(i); if (p >= 0) a.splice(p, 1); else a.push(i); a.sort(); }
      drawEdit();
    },
    saveHabit: function () {
      readInputs();
      var h = draft;
      h.name = (h.name || '').trim();
      if (!h.name) { App.toast('Give the habit a name'); var n = document.getElementById('fName'); if (n) n.focus(); return; }
      if (h.type === 'num' && !(h.target >= 0)) return App.toast('Enter a target number');
      if (h.freq.t === 'rep' && h.freq.u === 'w' && h.freq.from !== 'done' && !(h.freq.days || []).length) return App.toast('Pick at least one weekday');
      var o = !h._new && S.habit(h.id), sw = o && o.type !== h.type && S.countEntries(h.id);
      if (sw && h.type === 'num' && h._tick == null) return App.toast('Enter what each past tick becomes');
      var tick = h._tick;
      var back = h._from === 'stats';
      delete h._new; delete h._ttSet; delete h._tick; delete h._from;
      var done = function () {
        if (sw) S.switchType(h, h.type, tick); S.putHabit(h); App.render();
        var rr = rep(h);
        if (sw) App.toast('Type changed · ' + sw + ' day' + (sw === 1 ? '' : 's') + ' converted');
        else if (rr && !rr.show && S.d.settings.hideNotDue !== false) App.toast('Saved · not due today' + (rr.next != null ? ' — next on ' + dayTxt(rr.next) : ''));
      };
      if (back) { done(); openStats(h.id, true); } else closeSheet(done);
    },
    delHabit: function () {
      var id = draft.id, name = draft.name;
      closeSheet(function () {
        var g = S.habit(id) && isGroup(S.habit(id));
        confirmBox('Delete “' + name + '” and all its history?' + (g ? ' Its sub-habits stay, as normal habits.' : ''), 'Delete', function () { S.delHabit(id); App.render(); App.toast('Deleted'); });
      });
    },
    numStep: function (el) {
      var inp = document.getElementById('numIn'), x = parseFloat((inp.value || '0').replace(',', '.')) || 0;
      inp.value = Math.max(0, num(x + (+el.dataset.d)));
    },
    numOk: function () { App._num(false); },
    numClear: function () { App._num(true); },
    numSkip: function () { App._num(true, true); },
    menu: openMenu,
    settings: function () { closeSheet(openSettings); },
    demoOn: function () { setDemo(true); },
    demoOff: function () { setDemo(false); },
    weight: function () { openWeight(); },
    ptOpen: function () { openPt(); },
    ptAsr: function (el) { [].forEach.call(document.querySelectorAll('#ptAsr button'), function (b) { b.classList.toggle('on', b === el); }); ptPreview(); },
    ptSave: function () {
      var L = ptRead(); if (!ptOk(L)) return App.toast('Enter latitude and longitude (or pick a city)');
      L.lat = Math.round(L.lat * 10000) / 10000; L.lng = Math.round(L.lng * 10000) / 10000; if (!L.name) L.name = 'My location';
      S.d.settings.pt = L; S.saveSettings(); App.render(); openSettings(); App.toast('Prayer times set');
    },
    ptClear: function () { S.d.settings.pt = null; S.saveSettings(); App.render(); openSettings(); },
    ptBack: function () { openSettings(); },
    syncNow: function () { if (!S.d.acct) return actions.settings(); Sync.now(); },
    signIn: function () { Sync.signIn(false); },
    signInFull: function () { Sync.client = null; Sync.signIn(false); },
    signOut: function () { confirmBox('Sign out? Your habits stay safe in your Google Drive and come back when you sign in again. This phone’s copy is cleared.', 'Sign out', function () { Sync.signOut(); }); },
    wRange: function (el) { wRange = el.dataset.v; openWeight(true); },
    wLog: function (el) { wLog(el.dataset.k || null); },
    wEditTg: function () { wEdit = !wEdit; openWeight(true); },
    wEye: function (el) { var w = S.d.settings.wW = S.d.settings.wW || {}, off = w.off = w.off || {}, id = el.dataset.v; off[id] = !off[id]; S.saveSettings(); openWeight(true); },
    wOneTg: function () { S.d.settings.wOne = S.d.settings.wOne === false; S.saveSettings(); openWeight(true); },
    wPick: function (el) { S.d.settings.wPick = el.dataset.v; S.saveSettings(); openWeight(true); },
    wSdTg: function () { var st = S.d.settings; if (!st.wStart) return wSdPick(); st.wStartOn = !st.wStartOn; S.saveSettings(); openWeight(true); },
    wSdPick: function () { wSdPick(); },
    wSdSave: function () { var v = document.getElementById('wSd').value; if (!v) return App.toast('Pick a day'); S.d.settings.wStart = v; S.d.settings.wStartOn = true; S.saveSettings(); wBack(); },
    wStep: function (el) { var i = document.getElementById('wIn'), v = parseFloat((i.value || '0').replace(',', '.')) || 0; i.value = kg(Math.max(0, v + +el.dataset.d)); },
    wSave: function () {
      var d = document.getElementById('wDate').value || S.today(), tm = document.getElementById('wTime').value, t = document.getElementById('wIn').value.replace(',', '.').trim(), v = parseFloat(t);
      if (!(v > 0 && v < 500)) return App.toast('Enter your weight in kg');
      if (d > S.today()) return App.toast('That day hasn’t come yet');
      var k = d + (tm ? 'T' + tm : '');
      if (App._wk && App._wk !== k) S.wSet(App._wk, null);   // moved to another day or time
      S.wSet(k, v); wBack();
    },
    wDel: function () { if (App._wk) S.wSet(App._wk, null); wBack(); App.toast('Deleted'); },
    wSetup: function () { wSetup(); },
    wSetSave: function () {
      var fs = document.getElementById('wFt').value.trim(), is = document.getElementById('wIn2').value.trim(), t = parseFloat(document.getElementById('wT').value.replace(',', '.'));
      var ft = parseFloat(fs || '0'), inch = parseFloat((is || '0').replace(',', '.')), h = (ft * 12 + inch) * 2.54;
      if ((fs || is) && !(ft >= 0 && inch >= 0 && inch < 12 && h > 50 && h < 260)) return App.toast('Height in feet and inches, e.g. 5 ft 8 in');
      if (document.getElementById('wT').value.trim() && !(t > 0 && t < 500)) return App.toast('Target in kg, e.g. 75');
      S.d.settings.heightCm = h > 0 ? Math.round(h * 10) / 10 : null; S.d.settings.wTarget = t > 0 ? Math.round(t * 100) / 100 : null;
      S.saveSettings(); wBack();
    },
    close: function () { if (sheetOpen === 'pt') return openSettings(); if (sheetOpen === 'wlog' || sheetOpen === 'wset') return wBack(); if (sheetOpen === 'edit' && draft && draft._from === 'stats' && S.habit(draft.id)) return openStats(draft.id, true); closeSheet(); },
    statEdit: function () { openEdit(stId); },
    statOpen: function () { readInputs(); var id = draft.id; openStats(id); },
    stMon: function (el) { stMon += +el.dataset.d; if (stMon > 0) stMon = 0; var y = sheet.scrollTop; openStats(stId, true); sheet.scrollTop = y; },
    confirmOk: function () { App._confirm(); },
    setTg: function (el) { if (el.dataset.k === 'demo') { setDemo(!S.demo); var y0 = sheet.scrollTop; openSettings(); sheet.scrollTop = y0; return; } var k = el.dataset.k, s = S.d.settings; s[k] = s[k] === false; S.saveSettings(); App.render(); var y = sheet.scrollTop; openSettings(); sheet.scrollTop = y; },
    setNum: function (el) { S.d.settings[el.dataset.k] = +el.dataset.v; S.saveSettings(); App.render(true); var y = sheet.scrollTop; openSettings(); sheet.scrollTop = y; },
    tabsMode: function (el) { S.d.settings.tabsMode = el.dataset.v; S.saveSettings(); App.render(true); openSettings(); },
    theme: function (el) { S.d.settings.theme = el.dataset.t; document.documentElement.dataset.theme = el.dataset.t; S.saveSettings(); openSettings(); },
    share: function () { var u = location.origin + location.pathname; (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(function () { App.toast('Link copied'); }, function () { App.toast(u); }); },
    updateApp: function (el) {
      el.disabled = true; el.textContent = 'Updating…';
      var files = ['./', 'index.html', 'css/app.css', 'js/config.js', 'js/store.js', 'js/sync.js', 'js/demo.js', 'js/app.js', 'sw.js'];
      var sw = navigator.serviceWorker;
      var p1 = sw ? sw.getRegistrations().then(function (rs) { return Promise.all(rs.map(function (r) { return r.unregister(); })); }) : Promise.resolve();
      var p2 = window.caches ? caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k.indexOf('-assets') < 0; }).map(function (k) { return caches.delete(k); })); }) : Promise.resolve();
      var p3 = Promise.all(files.map(function (f) { return fetch(f, { cache: 'reload' }).catch(function () {}); }));
      try { sessionStorage.setItem('habits.upd', JSON.stringify({ v: C.appVersion, y: sheet.scrollTop })); } catch (e) {}
      Promise.all([p1, p2, p3]).catch(function () {}).then(function () { location.replace(location.pathname + '?v=' + Date.now()); });
    }
  };
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]'); if (!el) return;
    if (quietClick && el.closest('.hrow')) { quietClick = false; return e.preventDefault(); }
    var fn = actions[el.dataset.act]; if (!fn) return;
    e.preventDefault();
    if (closing) after.push(function () { fn(el); }); else fn(el);
  });
  document.addEventListener('change', function (e) {
    var a = e.target.dataset && e.target.dataset.act;
    if (a === 'edgeKind') { readInputs(); var y = sheet.scrollTop; drawEdit(); sheet.scrollTop = y; }
    else if (a === 'ptCity') ptFill(e.target.value);
    else if (a === 'ptMethod') ptPreview();
  });
  document.addEventListener('keydown', function (e) {   // Enter in the edit form = Save
    if (e.key === 'Enter' && sheetOpen === 'edit' && e.target.tagName === 'INPUT') { e.preventDefault(); actions.saveHabit(); }
  });

  /* ---- Day rollover: redraw when "today" changes while the app stays open ---- */
  var lastDay = null;
  function checkDay() {
    var t = S.today(), busy = sheetOpen || sel || drag || lp;
    if (lastDay && t !== lastDay && !busy) App.render();
    else if (!busy && winSig() !== lastWin) App.render();   // a time window just opened or closed
    lastDay = t;
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) checkDay(); });
  setInterval(checkDay, 30000);

  /* ---- Boot ---- */
  S.load();
  // Reopened within an hour: same view and scroll position. Later than that: back to All, at the top.
  var U = S.d.ui, fresh = U.left && Date.now() - U.left < 3600000;
  if (!fresh) { U.view = 'all'; U.scroll = null; }
  App.render();
  (function () { var sc = document.getElementById('sc'); if (fresh && sc && U.scroll) { sc.scrollLeft = U.scroll.l; sc.scrollTop = U.scroll.t; } })();
  function leaving() { var sc = document.getElementById('sc'); U.left = Date.now(); U.scroll = sc ? { l: sc.scrollLeft, t: sc.scrollTop } : null; S.saveUi(); }
  document.addEventListener('visibilitychange', function () { if (document.hidden) leaving(); });
  window.addEventListener('pagehide', leaving);
  lastDay = S.today();
  Sync.init();
  (function () {   // after Update app: reopen Settings and say what happened
    var old = null; try { old = JSON.parse(sessionStorage.getItem('habits.upd')); sessionStorage.removeItem('habits.upd'); } catch (e) {}
    if (!old) return;
    history.replaceState(null, '', location.pathname); openSettings(); sheet.scrollTop = old.y || 0;   // back to Settings, same scroll position
    old = old.v;
    var v = C.appVersion.split(' ·')[0]; App.toast(old !== C.appVersion ? 'Updated to ' + v : 'Already on the latest version (' + v + ')');
  })();
  if ('serviceWorker' in navigator) {
    var hadSW = !!navigator.serviceWorker.controller, reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () { if (hadSW && !reloaded) { reloaded = true; location.reload(); } });
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(function (reg) { reg.update(); }).catch(function () {});
  }
})();
