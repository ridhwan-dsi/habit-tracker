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
    clock: '<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>'
  };
  var VIEW_NAME = { all: 'Habits', star: 'Starred', arch: 'Archived', win: 'Outside time window' };
  var SYNC_TXT = { off: 'Not signed in', syncing: 'Syncing…', ok: 'Synced', paused: 'Sync paused', error: 'Sync error' };

  /* ---- what a cell shows ---- */
  function scheduled(h, dt) { return h.freq.t !== 'days' || !h.freq.days.length || h.freq.days.indexOf(dt.getDay()) >= 0; }
  function met(h, v) { return h.tt === 'max' ? v <= h.target : v >= h.target; }
  function cellHtml(h, d) {
    var v = S.val(h.id, d.k), cls = 'c' + (scheduled(h, d.dt) ? '' : ' off') + (d.k === S.today() ? ' tdy' : ''), inner;
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
  function tabsMode() { return S.d.settings.tabsMode || 'ribbon'; }
  function visTabs() { return S.tabs().filter(function (t) { return !t.hidden; }); }
  function view() {
    var v = S.d.ui.view || 'all';
    if (VIEW_NAME[v]) return v;
    var t = S.tab(v); return t && !t.hidden && tabsMode() !== 'off' ? v : 'all';
  }
  function setView(v) { S.d.ui.view = v; S.saveUi(); var sc = document.getElementById('sc'); if (sc) sc.scrollTop = 0; App.render(true); }
  function topOf(h) { return h.parent && S.habit(h.parent) || h; }
  function tabOf(h) { return S.tab(topOf(h).tab); }
  // base: may this habit be on screen at all right now (hidden tab, archive, time window, entered)?
  function base(h, v) {
    var tb = tabOf(h), g = h.parent && S.habit(h.parent), f = S.d.settings;
    if (tb && tb.hidden) return false;
    if (v === 'arch') return true;
    if (f.hideArchived && (h.archived || (g && g.archived))) return false;
    if (v !== 'win' && winOf(h)) return false;
    if (v !== 'win' && f.skipDays && f.hideSkipped && !sel && skippedToday(h)) return false;
    if (v !== 'win' && f.hideEntered && !sel && enteredToday(h) && !skippedToday(h)) return false;
    return true;
  }
  // member: does it belong to this view (tab, starred, archived, outside its window)?
  function member(h, v) {
    var g = h.parent && S.habit(h.parent);
    if (v === 'arch') return !!(h.archived || (g && g.archived));
    if (v === 'win') return winOf(h) !== 0;
    if (v === 'star') return !!(h.star || (g && g.star));
    if (v === 'all') return true;
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
          '<span style="color:' + esc(h.color) + '">' + esc(h.name) + (wt ? '<small class="wt">' + esc(wt) + '</small>' : '') + '</span>' +
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
        var by = function (id) { return tops.filter(function (h) { var t = S.tab(h.tab); return (t ? t.id : null) === id; }); };
        rows = by(null).map(card).join('') + visTabs().map(function (t) {
          var hs = by(t.id); if (!hs.length) return '';
          return '<div class="sech"><span>' + esc(t.name) + '</span></div>' + hs.map(card).join('');
        }).join('');
      } else rows = tops.map(card).join('');
      var n = sel ? Object.keys(sel).length : 0, lit = f.hideEntered || !f.hideArchived;
      var bar;
      if (sel) bar = '<header class="top selbar"><button class="ib" data-act="selDone" aria-label="Done">' + ICON.back + '</button><h1>' + n + '</h1>' +
        (n === 1 ? '<button class="ib" data-act="selEdit" aria-label="Edit">' + ICON.pen + '</button>' : '') +
        '<button class="ib' + (allStarred() ? ' lit' : '') + '" data-act="selStar" aria-label="' + (allStarred() ? 'Unstar' : 'Star') + '"' + (n ? '' : ' disabled') + '>' + (allStarred() ? ICON.starOn : ICON.star) + '</button>' +
        '<button class="ib" data-act="selArchive" aria-label="' + (allArchived() ? 'Unarchive' : 'Archive') + '"' + (n ? '' : ' disabled') + '>' + (allArchived() ? ICON.unarchive : ICON.archive) + '</button>' +
        '<button class="ib" data-act="selDelete" aria-label="Delete"' + (n ? '' : ' disabled') + '>' + ICON.bin + '</button>' +
        '<button class="ib" data-act="selMore" aria-label="More"' + (n ? '' : ' disabled') + '>' + ICON.more + '</button></header>';
      else if (mode === 'top') bar = '<header class="top tstrip">' + '<button class="logo" data-act="home" aria-label="All habits"><img src="icons/icon-192.png" alt=""></button>' + '<div class="chips" id="chips">' + visTabs().map(function (t) {
          return '<button class="tchip' + (v === t.id ? ' on' : '') + '" data-act="goTab" data-tab="' + t.id + '">' + esc(t.name) + '</button>';
        }).join('') + '<button class="tchip add" data-act="newTab" aria-label="New tab">' + ICON.plus + (S.tabs().length ? '' : '<span>New tab</span>') + '</button></div>' +
        syncBtn() + '<button class="ib" data-act="menu" aria-label="More">' + ICON.more + '</button></header>' +
        (VIEW_NAME[v] && v !== 'all' ? '<div class="vlabel">' + VIEW_NAME[v] + '</div>' : '');
      else bar = '<header class="top">' + '<button class="logo" data-act="home" aria-label="All habits"><img src="icons/icon-192.png" alt=""></button>' + '<h1>' + esc(VIEW_NAME[v] || S.tab(v).name) + '</h1>' +
        '<button class="ib" data-act="add" aria-label="Add habit">' + ICON.plus + '</button>' +
        '<button class="ib' + (lit ? ' lit' : '') + '" data-act="filter" aria-label="Filter">' + ICON.filter + '</button>' +
        syncBtn() + '<button class="ib" data-act="menu" aria-label="More">' + ICON.more + '</button></header>';
      var wc = winCount(), tabV = !VIEW_NAME[v];
      var rb = function (act, icon, label, on, extra) { return '<button class="rbtn' + (on ? ' on' : '') + '" data-act="' + act + '" aria-label="' + label + '">' + icon + '<span>' + label + '</span>' + (extra || '') + '</button>'; };
      var ribbon = '<nav class="rib">' +
        (v === 'star' ? rb('starToggle', ICON.list, 'All', false) : rb('starToggle', ICON.star, 'Starred', false)) +
        (mode === 'ribbon' ? rb('tabsSheet', ICON.tabs, tabV ? S.tab(v).name : 'Tabs', tabV) : '') +
        (mode === 'top' ? rb('filter', ICON.filter, 'Filter', lit) + rb('add', ICON.plus, 'Add', false) : '') +
        rb('viewArch', ICON.archive, 'Archived', v === 'arch') +
        rb('viewWin', ICON.clock, 'Later', v === 'win', wc ? '<i class="bdg">' + wc + '</i>' : '') +
        (all.some(isGroup) ? '<button class="rbtn ionly" data-act="foldCycle" aria-label="' + { open: 'All groups expanded', shut: 'All groups collapsed', man: 'Groups as set in Edit' }[foldMode()] + '">' +
          { open: ICON.fOpen, shut: ICON.fShut, man: ICON.fMan }[foldMode()] + '</button>' : '') +
        rb('weight', ICON.scale, 'Weight', false) + '</nav>';
      var empty = {
        star: 'No starred habits yet. Hold a habit’s name, then tap ☆.',
        arch: 'No archived habits.',
        win: 'Nothing is waiting for its time window right now.'
      }[v];
      var demoBar = S.demo ? '<div class="demobar"><span>Demo data · your own habits are safe</span><button class="btn sm" data-act="demoOff">Exit demo</button></div>' : '';
      root.innerHTML = bar + demoBar +
        (list.length ? '<div class="sc" id="sc"><div class="grid" id="grid">' + head + rows + '</div></div>'
          : empty ? '<div class="empty"><p>' + empty + '</p></div>'
          : all.length ? '<div class="empty"><p>' + (f.hideEntered ? 'All done for now.' : 'Nothing to show here.') + '</p><button class="btn" data-act="' + (tabV ? 'add' : 'filter') + '">' + (tabV ? 'Add a habit to this tab' : 'Filter') + '</button></div>'
          : '<div class="empty"><p>No habits yet.</p><button class="btn pri" data-act="add">Add your first habit</button><button class="btn" data-act="demoOn">Try demo data</button></div>') + ribbon;
      root.classList.toggle('sublines', f.subLines !== false);
      root.classList.toggle('noscr', f.hScroll === false);
      root.classList.toggle('nofrz', f.freezeToday === false);
      sizeCols();
      sc = document.getElementById('sc');
      if (sc && keep) { sc.scrollLeft = f.hScroll === false ? 0 : keep.l; sc.scrollTop = keep.t; }
      if (sc) { var edge = function () { sc.classList.toggle('hs', sc.scrollLeft > 2); }; sc.addEventListener('scroll', edge, { passive: true }); edge(); }
      var on = document.querySelector('.tchip.on'); if (on && resetScroll) on.scrollIntoView({ inline: 'center', block: 'nearest' });
      lastWin = winSig();
    },
    refreshRow: function (hid) {   // after a mark: redraw one row's cells, keep scroll
      var h = S.habit(hid); if (!h) return App.render();
      var g = h.parent && S.habit(h.parent);
      var ids = {}; shownList().forEach(function (x) { ids[x.id] = 1; });
      if (!ids[h.id] || (g && !ids[g.id])) return App.render();   // Hide entered: row leaves once today is done
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
    if (sheetOpen) hideSheet(); else if (sel) { sel = null; App.render(); }
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
      var st = startOf(x), per = x.freq && (x.freq.t === 'week' || x.freq.t === 'month'), bad = x.kind === 'bad', n = 0, ok = 0;
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
      var per = x.freq && (x.freq.t === 'week' || x.freq.t === 'month');
      var a = calc(x, t.getFullYear(), t.getMonth(), D), b = calc(x, lm.getFullYear(), lm.getMonth(), Math.min(D, lLen));
      var txt = function (v) { return v == null ? '–' : per ? v + '×' : v + '%'; };
      var w = a == null ? 0 : per ? Math.min(100, a / Math.max(1, (x.freq.n || 1) * (x.freq.t === 'week' ? Math.ceil(D / 7) : 1)) * 100) : a;
      var cls = a == null || b == null || a === b ? 'same' : (a > b ? 'cur' : 'worse');
      return '<div class="mvr srr"><span class="mvl">' + esc(x.name) + '</span><div class="mvt"><div class="mvb ' + cls + '" style="width:' + Math.max(2, w) + '%"></div></div><b>' + txt(a) + '<em>' + txt(b) + '</em></b></div>';
    }).join('');
    return '<section class="stc"><h4>Each sub-habit · ' + M3[t.getMonth()] + ' 1–' + D + '</h4>' + rows +
      '<p class="small muted">Small number = same days last month (' + M3[lm.getMonth()] + ' 1–' + Math.min(D, lLen) + '). Green = better than last month, red = worse.</p></section>';
  }
  function openStats(id, keepMonth) {
    var h = S.habit(id); if (!h) return;
    if (stId !== id || !keepMonth) stMon = 0; stId = id;
    var grp = isGroup(h), bad = !grp && h.kind === 'bad', numT = grp ? h.agg && h.agg.t === 'sum' : h.type === 'num';
    var res = grp ? function (k) { var r = groupRes(h, k); return { v: h.agg && h.agg.t === 'sum' ? r.sum : r.done, ok: r.ok, s: r.total === 0 && liveSubs(h.id).length > 0 }; }
      : function (k) { var v = S.val(h.id, k), sk = S.skipped(h.id, k), did = v != null && (h.type === 'yn' ? !!v : (bad ? !met(h, v) : met(h, v)));
          return { v: v, s: sk, ok: bad ? !did : did }; };
    var f = h.freq || {}, fq = f.t === 'week' ? f.n + '× a week' : f.t === 'month' ? f.n + '× a month' : f.t === 'days' && f.days.length ? f.days.map(function (d) { return WD[d]; }).join(', ') : 'Every day';
    var sub = grp ? (h.agg && h.agg.t === 'sum' ? 'Group · sum' + (h.target ? ', target ' + num(h.target) + (h.unit ? ' ' + esc(h.unit) : '') : '') : 'Group · done when ' + Math.min(h.agg.n || 1, liveSubs(h.id).length) + ' of ' + liveSubs(h.id).length + ' are done')
      : (bad ? 'Bad habit · ' : '') + (h.type === 'num' ? (h.tt === 'max' ? 'at most ' : 'at least ') + num(h.target) + (h.unit ? ' ' + esc(h.unit) : '') + ' · ' : '') + fq;
    var html = '<div class="ptop"><button class="ib" data-act="close" aria-label="Back">' + ICON.back + '</button><h2 class="sth"><i style="background:' + esc(h.color) + '"></i>' + esc(h.name) + '</h2>' +
      '<button class="ib" data-act="statEdit" aria-label="Edit">' + ICON.pen + '</button></div>' +
      '<div class="stats"><p class="stsub">' + sub + '</p>' +
      Stats.build({ h: h, res: res, sched: function (dt) { return scheduled(h, dt); }, start: startOf(h), today: S.todayDate(), ws: S.d.settings.weekStart || 0,
        bad: bad, num: numT, unit: grp ? h.unit : h.unit, target: numT ? h.target : 0, color: h.color, mon: stMon, extra: grp ? subRates(h) : '' }) + '</div>';
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

  /* ---- SL 34 Weight: its own screen from the bottom bar. One reading a day in kg (2 decimals), BMI from a height
     entered once, change over week / month / year, optional target drawn as a flat line. ---- */
  var wRange = 'week', MON3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function kg(v) { return (Math.round(v * 100) / 100).toFixed(2); }
  function dLab(k) { var p = k.split('-'), t = S.today(); return k === t ? 'Today' : (+p[2]) + ' ' + MON3[+p[1] - 1] + (p[0] !== t.slice(0, 4) ? ' ' + p[0] : ''); }
  function kAgo(k, n) { var p = k.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2] - n, 12); return S.key(d); }
  function bmiTxt(v) {
    var h = S.d.settings.heightCm; if (!h) return '';
    var b = v / Math.pow(h / 100, 2), c = b < 18.5 ? 'Underweight' : b < 25 ? 'Healthy' : b < 30 ? 'Overweight' : 'Obese';
    return 'BMI ' + b.toFixed(1) + ' · ' + c;
  }
  function openWeight(keepY) {
    var L = S.wList(), st = S.d.settings, tgt = st.wTarget, last = L[L.length - 1], tk = S.today();
    var span = { week: 7, month: 30, year: 365 }[wRange], from = kAgo(tk, span);
    var R = L.filter(function (e) { return e.k >= from; });
    var base = null; L.forEach(function (e) { if (e.k <= from) base = e; }); if (!base) base = R[0];
    var chg = last && base && base !== last ? last.v - base.v : null;
    var toward = chg == null || !tgt ? null : (last.v > tgt) === (chg < 0) || Math.abs(chg) < 0.005;
    var html = '<div class="ptop"><button class="ib" data-act="close" aria-label="Back">' + ICON.back + '</button><h2>Weight</h2>' +
      '<button class="ib" data-act="wLog" aria-label="Log a weight">' + ICON.plus + '</button></div><div class="stats">' +
      '<button class="wnow" data-act="wLog" data-k="' + tk + '">' + (last ? '<span>' + dLab(last.k) + '</span><b>' + kg(last.v) + ' <small>kg</small></b>' + (bmiTxt(last.v) ? '<em>' + bmiTxt(last.v) + '</em>' : '') : '<b>No weight yet</b>') +
        '<i>' + (last && last.k === tk ? 'Tap to change today' : 'Tap to log today') + '</i></button>' +
      (L.length ? '<div class="seg">' + [['week', 'Week'], ['month', 'Month'], ['year', 'Year']].map(function (r) { return '<button class="' + (wRange === r[0] ? 'on' : '') + '" data-act="wRange" data-v="' + r[0] + '">' + r[1] + '</button>'; }).join('') + '</div>' +
      '<div class="tiles"><div class="tile"><span>' + (chg == null ? 'Change' : chg <= 0 ? 'Lost' : 'Gained') + ' · last ' + { week: '7 days', month: '30 days', year: 'year' }[wRange] + '</span><b class="' + (toward == null ? '' : toward ? 'up' : 'down') + '">' + (chg == null ? '–' : kg(Math.abs(chg)) + ' kg') + '</b>' + (chg != null ? '<em>from ' + kg(base.v) + ' on ' + dLab(base.k) + '</em>' : '<em>needs two readings</em>') + '</div>' +
        '<div class="tile"><span>Target</span><b>' + (tgt ? (Math.abs(last.v - tgt) < 0.005 ? 'Reached' : kg(Math.abs(last.v - tgt)) + ' kg') : '–') + '</b><em>' + (tgt ? (Math.abs(last.v - tgt) < 0.005 ? kg(tgt) + ' kg' : (last.v > tgt ? 'to lose' : 'to gain') + ' · goal ' + kg(tgt)) : '<a data-act="wSetup">Set a target</a>') + '</em></div></div>' +
      wChart(R, tgt, from, tk) +
      '<section class="stc"><h4>Recent</h4>' + L.slice(-14).reverse().map(function (e, i, A) {
        var prev = A[i + 1], d = prev ? e.v - prev.v : null;
        return '<button class="wrow" data-act="wLog" data-k="' + e.k + '"><span>' + dLab(e.k) + '</span><b>' + kg(e.v) + '</b><em class="' + (d == null || Math.abs(d) < 0.005 ? '' : d < 0 ? 'dn' : 'upw') + '">' + (d == null ? '' : (d > 0 ? '+' : d < 0 ? '−' : '±') + kg(Math.abs(d))) + '</em></button>';
      }).join('') + '</section>' : '') +
      '<button class="mi wset" data-act="wSetup"><span>Height ' + (st.heightCm ? st.heightCm + ' cm' : 'not set') + ' · Target ' + (tgt ? kg(tgt) + ' kg' : 'none') + '</span><span class="small muted">Change</span></button></div>';
    var y = sheet.scrollTop, inW = /^w(eight|log|set)$/.test(sheetOpen || '');
    if (inW) { sheetOpen = 'weight'; sheet.className = 'sheet page'; sheet.innerHTML = html; scrim.hidden = true; sheet.scrollTop = keepY ? y : 0; } else showSheet('weight', html, 'page');
  }
  function wChart(R, tgt, from, tk) {
    if (R.length < 2) return '<section class="stc"><p class="small muted" style="margin:0">The graph appears once there are two readings in this range.</p></section>';
    var W = 340, H = 150, pl = 30, pr = 6, pt = 10, pb = 20;
    var vs = R.map(function (e) { return e.v; }), lo = Math.min.apply(null, vs), hi = Math.max.apply(null, vs), spr = Math.max(0.5, hi - lo);
    var tIn = tgt && tgt >= lo - spr && tgt <= hi + spr;   // a far target would squash the curve flat: note it instead
    if (tIn) { lo = Math.min(lo, tgt); hi = Math.max(hi, tgt); }
    var pad = Math.max(0.3, (hi - lo) * 0.12); lo -= pad; hi += pad;
    var t0 = new Date(from + 'T12:00:00').getTime(), t1 = new Date(tk + 'T12:00:00').getTime();
    var X = function (k) { return pl + (new Date(k + 'T12:00:00').getTime() - t0) / (t1 - t0) * (W - pl - pr); }, Y = function (v) { return pt + (hi - v) / (hi - lo) * (H - pt - pb); };
    var path = R.map(function (e, i) { return (i ? 'L' : 'M') + X(e.k).toFixed(1) + ' ' + Y(e.v).toFixed(1); }).join('');
    var ticks = [lo + (hi - lo) * 0.15, (lo + hi) / 2, hi - (hi - lo) * 0.15];
    return '<section class="stc"><svg viewBox="0 0 ' + W + ' ' + H + '" class="chart wch">' +
      ticks.map(function (v) { return '<line x1="' + pl + '" x2="' + W + '" y1="' + Y(v) + '" y2="' + Y(v) + '" class="gl"/><text x="' + (pl - 4) + '" y="' + (Y(v) + 3.5) + '" class="yl">' + v.toFixed(1) + '</text>'; }).join('') +
      (tgt && !tIn ? '<text x="' + (W - 2) + '" y="' + (tgt < lo ? H - pb - 4 : pt + 8) + '" class="tlt">target ' + kg(tgt) + (tgt < lo ? ' ↓' : ' ↑') + '</text>' : '') +
      (tIn ? '<line x1="' + pl + '" x2="' + W + '" y1="' + Y(tgt) + '" y2="' + Y(tgt) + '" class="tl"/><text x="' + (W - 2) + '" y="' + (Y(tgt) - 4) + '" class="tlt">target ' + kg(tgt) + '</text>' : '') +
      '<path d="' + path + '" class="wl"/>' + (R.length <= 40 ? R.map(function (e) { return '<circle cx="' + X(e.k) + '" cy="' + Y(e.v) + '" r="2.6" class="wd"/>'; }).join('') : '') +
      '<text x="' + pl + '" y="' + (H - 3) + '" class="cl" text-anchor="start">' + dLab(from) + '</text><text x="' + W + '" y="' + (H - 3) + '" class="cl" text-anchor="end">Today</text></svg></section>';
  }
  function wLog(k) {
    var L = S.wList(), cur = (S.d.weights[k] || {}).v, last = L[L.length - 1], tk = S.today();
    wDlg('wlog', '<h3>Weight</h3><label class="fl">Day<input type="date" id="wDate" value="' + k + '" max="' + tk + '"></label>' +
      '<div class="numrow" style="margin-top:12px"><button class="btn step" data-act="wStep" data-d="-0.1" aria-label="Minus 0.1">−</button>' +
      '<input id="wIn" inputmode="decimal" enterkeyhint="done" autocomplete="off" value="' + (cur != null ? kg(cur) : last ? kg(last.v) : '') + '" placeholder="kg">' +
      '<button class="btn step" data-act="wStep" data-d="0.1" aria-label="Plus 0.1">+</button></div><p class="small muted" style="margin-top:6px">In kg, up to 2 decimals (e.g. 78.45). Tap the number to type.</p>' +
      '<div class="row end">' + (cur != null ? '<button class="btn danger-o" data-act="wDel">Delete</button><span class="grow"></span>' : '') + '<button class="btn" data-act="close">Cancel</button><button class="btn pri" data-act="wSave">Save</button></div>');
    var inp = document.getElementById('wIn'); inp.addEventListener('focus', function () { inp.select(); });
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') actions.wSave(); });
    document.getElementById('wDate').addEventListener('change', function () {   // switching day shows that day's reading
      var v = (S.d.weights[this.value] || {}).v; if (v != null) inp.value = kg(v);
    });
  }
  function wSetup() {
    var st = S.d.settings;
    wDlg('wset', '<h3>Height &amp; target</h3><div class="two"><label class="fl">Height (cm)<input id="wH" inputmode="decimal" value="' + (st.heightCm || '') + '" placeholder="e.g. 172"></label>' +
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
      '<div class="fl">Frequency' + seg('freq', f.t, [['day', 'Every day'], ['week', 'Per week'], ['month', 'Per month'], ['days', 'Weekdays']]) +
      (f.t === 'week' || f.t === 'month' ? '<label class="inl"><input id="fN" inputmode="numeric" value="' + (f.n || 1) + '"> times per ' + f.t + '</label>' : '') +
      (f.t === 'days' ? '<div class="wd">' + wdOrder.map(function (i) {
        return '<button class="' + (f.days.indexOf(i) >= 0 ? 'on' : '') + '" data-act="ef" data-f="wd" data-v="' + i + '">' + WD[i].slice(0, 2) + '</button>';
      }).join('') + '</div>' : '') + '</div>' +
      (!grp && h.type === 'num' ? '<label class="fl">Default value<input id="fStep" inputmode="decimal" value="' + (h.step ? num(h.step) : '') + '" placeholder="1" autocomplete="off">' +
        '<span class="small muted">The number box opens with this filled in, so OK saves it in one tap. + and − change by this much.</span></label>' : '') +
      (!inG ? '<div class="fl">Tab<div class="chips wrap">' +
        [{ id: '', name: 'No tab' }].concat(S.tabs()).map(function (t) {
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
  // v6: what switching type does to past days (only for a saved habit with history)
  function typeNote(h) {
    var o = !h._new && S.habit(h.id); if (!o || o.type === h.type) return '';
    var n = S.countEntries(h.id); if (!n) return '';
    if (h.type === 'yn') return '<span class="small muted">On Save, ' + n + ' past day' + (n === 1 ? '' : 's') + ' change: ' + (h.kind === 'bad' ? 'any amount becomes a tick' : 'days that met the target become ticks') + '. The numbers are kept, so switching back restores them.</span>';
    return '<label class="inl">Each past tick becomes <input id="fTick" inputmode="decimal" value="' + num(h._tick != null ? h._tick : (h.target || 1)) + '"></label>' +
      '<span class="small muted">Ticks that were numbers before go back to those numbers.</span>';
  }
  function readInputs() {   // keep typed values before a redraw
    var g = function (id) { var el = document.getElementById(id); return el ? el.value : null; };
    if (g('fName') != null) draft.name = g('fName');
    if (g('fUnit') != null) draft.unit = g('fUnit').trim();
    if (g('fTarget') != null) { var t = parseFloat(g('fTarget').replace(',', '.')); draft.target = isFinite(t) ? t : draft.target; }
    if (g('fN') != null) { var n = parseInt(g('fN'), 10); draft.freq.n = n > 0 ? n : 1; }
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
      (S.tabs().some(function (t) { return t.hidden; }) ? '<button class="mi" data-act="hiddenTabs">Hidden tabs</button>' : '') +
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
      '<h4>Tabs layout</h4><div class="seg">' + [['ribbon', 'Bottom bar'], ['top', 'Tabs on top'], ['off', 'One page']].map(function (m) {
        return '<button class="' + (tabsMode() === m[0] ? 'on' : '') + '" data-act="tabsMode" data-v="' + m[0] + '">' + m[1] + '</button>';
      }).join('') + '</div><p class="small muted" style="margin-top:6px">' + {
        ribbon: 'Tabs open from the Tabs button on the bottom bar.',
        top: 'Your tabs sit in a row across the top; Filter and Add move to the bottom bar.',
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
  function tabCount(id) { return S.habits().filter(function (h) { return !h.parent && h.tab === id && !h.archived; }).length; }
  function openTabsSheet() {
    var v = view(), hid = S.tabs().filter(function (t) { return t.hidden; });
    showSheet('tabs', '<h3>Tabs</h3>' +
      '<button class="mi trow' + (v === 'all' ? ' on' : '') + '" data-act="goTab" data-tab="all"><span>All habits</span></button>' +
      visTabs().map(function (t) {
        return '<button class="mi trow' + (v === t.id ? ' on' : '') + '" data-act="goTab" data-tab="' + t.id + '" data-hold="' + t.id + '"><span>' + esc(t.name) + '</span><small>' + tabCount(t.id) + '</small></button>';
      }).join('') +
      '<button class="mi trow add" data-act="newTab">' + ICON.plus + '<span>New tab</span></button>' +
      (hid.length ? '<button class="mi trow muted" data-act="hiddenTabs"><span>Hidden tabs</span><small>' + hid.length + '</small></button>' : '') +
      '<p class="small muted hint">Hold a tab to rename, hide, move or delete it.</p>');
  }
  function openHiddenTabs() {
    var hid = S.tabs().filter(function (t) { return t.hidden; });
    showSheet('hidden', '<h3>Hidden tabs</h3><p class="small muted">Hidden tabs and their habits stay out of every list. Tap or hold one to show it again.</p>' +
      (hid.length ? hid.map(function (t) { return '<button class="mi trow" data-act="tabActs" data-tab="' + t.id + '" data-hold="' + t.id + '"><span>' + esc(t.name) + '</span><small>' + tabCount(t.id) + '</small></button>'; }).join('')
        : '<p class="muted">None.</p>') + '<div class="row end"><button class="btn" data-act="close">Close</button></div>');
  }
  function askTabName(t) {
    showSheet('tabname', '<h3>' + (t ? 'Rename tab' : 'New tab') + '</h3><input id="tabIn" value="' + esc(t ? t.name : '') + '" placeholder="e.g. Daily, Weekly, Monthly" maxlength="30" enterkeyhint="done" autocomplete="off">' +
      '<div class="row end"><button class="btn" data-act="close">Cancel</button><button class="btn pri" data-act="tabSave">' + (t ? 'Save' : 'Create') + '</button></div>', 'attop');
    var inp = document.getElementById('tabIn'); inp.focus(); inp.select();
    App._tab = function () {
      var name = inp.value.trim(); if (!name) return App.toast('Give the tab a name');
      closeSheet(function () {
        if (t) { t.name = name; S.putTab(t); App.render(); }
        else { var nt = S.putTab({ name: name }); if (tabsMode() === 'off') App.render(); else setView(nt.id); App.toast('Tab “' + name + '” created'); }
      });
    };
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') App._tab(); });
  }
  function openTabActs(id) {
    var t = S.tab(id); if (!t) return;
    var vis = visTabs(), i = vis.findIndex(function (x) { return x.id === id; });
    var lr = tabsMode() === 'top' ? ['Move left', 'Move right'] : ['Move up', 'Move down'];
    showSheet('tabacts', '<h3>' + esc(t.name) + '</h3>' +
      (t.hidden ? '<button class="mi" data-act="tabHide" data-tab="' + id + '">Show this tab again</button>' :
        '<button class="mi" data-act="tabHide" data-tab="' + id + '">Hide tab and its habits</button>') +
      '<button class="mi" data-act="tabRename" data-tab="' + id + '">Rename</button>' +
      (!t.hidden && i > 0 ? '<button class="mi" data-act="tabMove" data-tab="' + id + '" data-d="-1">' + lr[0] + '</button>' : '') +
      (!t.hidden && i < vis.length - 1 ? '<button class="mi" data-act="tabMove" data-tab="' + id + '" data-d="1">' + lr[1] + '</button>' : '') +
      '<button class="mi danger-t" data-act="tabDel" data-tab="' + id + '">Delete tab</button>');
  }
  function openMoveToTab() {
    showSheet('movetab', '<h3>Move to tab</h3>' +
      '<button class="mi trow" data-act="moveTo" data-tab=""><span>No tab</span></button>' +
      S.tabs().map(function (t) { return '<button class="mi trow" data-act="moveTo" data-tab="' + t.id + '"><span>' + esc(t.name) + (t.hidden ? ' (hidden)' : '') + '</span></button>'; }).join('') +
      '<button class="mi trow add" data-act="moveToNew">' + ICON.plus + '<span>New tab…</span></button>');
  }
  // Hold a tab chip / tab row (450 ms) → its actions. A short tap still opens the tab.
  var th = null, thQuiet = false;
  document.addEventListener('pointerdown', function (e) {
    var el = e.target.closest('.tchip[data-tab], [data-hold]'); if (!el || e.button > 0) return;
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
    home: function () { var sc = document.getElementById('sc'); if (view() !== 'all') setView('all'); else if (sc) sc.scrollTop = 0; sc = document.getElementById('sc'); if (sc) sc.scrollLeft = 0; },
    starToggle: function () { setView(view() === 'star' ? 'all' : 'star'); },
    viewArch: function () { setView(view() === 'arch' ? 'all' : 'arch'); },
    viewWin: function () { setView(view() === 'win' ? 'all' : 'win'); },
    tabsSheet: openTabsSheet,
    goTab: function (el) {
      if (thQuiet) { thQuiet = false; return; }
      var id = el.dataset.tab, go = function () { setView(id === view() && id !== 'all' && tabsMode() === 'top' ? 'all' : id); };
      if (sheetOpen) closeSheet(go); else go();
    },
    newTab: function () { if (sheetOpen) closeSheet(function () { askTabName(null); }); else askTabName(null); },
    tabSave: function () { App._tab(); },
    hiddenTabs: function () { closeSheet(openHiddenTabs); },
    tabActs: function (el) { if (thQuiet) { thQuiet = false; return; } var id = el.dataset.tab; closeSheet(function () { openTabActs(id); }); },
    tabRename: function (el) { var t = S.tab(el.dataset.tab); closeSheet(function () { askTabName(t); }); },
    tabHide: function (el) {
      var t = S.tab(el.dataset.tab), hide = !t.hidden;
      closeSheet(function () { t.hidden = hide; S.putTab(t); App.render(); App.toast(hide ? 'Tab hidden — find it under Hidden tabs' : 'Tab “' + t.name + '” is back'); });
    },
    tabMove: function (el) { var id = el.dataset.tab, d = +el.dataset.d; closeSheet(function () { S.moveTab(id, d); App.render(); openTabActs(id); }); },
    tabDel: function (el) {
      var t = S.tab(el.dataset.tab), n = tabCount(t.id);
      closeSheet(function () {
        confirmBox('Delete tab “' + t.name + '”?' + (n ? ' Its ' + n + ' habit' + (n > 1 ? 's stay' : ' stays') + ', with no tab (in All).' : ''), 'Delete', function () { S.delTab(t.id); App.render(); App.toast('Tab deleted'); });
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
      showSheet('filter', row('hideArchived', 'Hide archived') + row('hideEntered', 'Hide entered') + (f.skipDays ? row('hideSkipped', 'Hide skip days') : ''), 'menu');
    },
    fToggle: function (el) { var k = el.dataset.k; S.d.settings[k] = !S.d.settings[k]; S.saveSettings(); App.render(); actions.filter(); },
    ef: function (el) {   // edit-form field change
      readInputs();
      var f = el.dataset.f, v = el.dataset.v, h = draft;
      if (f === 'color') h.color = v;
      else if (f === 'type') { h.type = v; if (v === 'num') { if (!(h.target >= 0)) h.target = 1; if (!h.tt) h.tt = h.kind === 'bad' ? 'max' : 'min'; if (h.unit == null) h.unit = ''; } }
      else if (f === 'kind') { h.kind = v; if (!h._ttSet) h.tt = v === 'bad' ? 'max' : 'min'; }
      else if (f === 'tt') { h.tt = v; h._ttSet = true; }
      else if (f === 'agg') { h.agg = h.agg || { n: 1 }; h.agg.t = v; if (v === 'sum') h.tt = 'min'; }
      else if (f === 'freq') { h.freq.t = v; if (v === 'days' && !h.freq.days.length) h.freq.days = [0, 1, 2, 3, 4, 5, 6]; }
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
      if (h.freq.t === 'days' && !h.freq.days.length) return App.toast('Pick at least one weekday');
      var o = !h._new && S.habit(h.id), sw = o && o.type !== h.type && S.countEntries(h.id);
      if (sw && h.type === 'num' && h._tick == null) return App.toast('Enter what each past tick becomes');
      var tick = h._tick;
      var back = h._from === 'stats';
      delete h._new; delete h._ttSet; delete h._tick; delete h._from;
      var done = function () { if (sw) S.switchType(h, h.type, tick); S.putHabit(h); App.render(); if (sw) App.toast('Type changed · ' + sw + ' day' + (sw === 1 ? '' : 's') + ' converted'); };
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
    wLog: function (el) { wLog(el.dataset.k || S.today()); },
    wStep: function (el) { var i = document.getElementById('wIn'), v = parseFloat((i.value || '0').replace(',', '.')) || 0; i.value = kg(Math.max(0, v + +el.dataset.d)); },
    wSave: function () {
      var k = document.getElementById('wDate').value || S.today(), t = document.getElementById('wIn').value.replace(',', '.').trim(), v = parseFloat(t);
      if (!(v > 0 && v < 500)) return App.toast('Enter your weight in kg');
      if (k > S.today()) return App.toast('That day hasn’t come yet');
      S.wSet(k, v); wBack();
    },
    wDel: function () { var k = document.getElementById('wDate').value; S.wSet(k, null); wBack(); App.toast('Deleted'); },
    wSetup: function () { wSetup(); },
    wSetSave: function () {
      var h = parseFloat(document.getElementById('wH').value.replace(',', '.')), t = parseFloat(document.getElementById('wT').value.replace(',', '.'));
      if (document.getElementById('wH').value.trim() && !(h > 50 && h < 260)) return App.toast('Height in cm, e.g. 172');
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
