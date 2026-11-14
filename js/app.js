/* App: main list (frozen habit column, 31 days side-scroll, newest day on the left), create/edit habit,
   long-press to mark, number entry for measurable habits, Settings, Update app, SW registration.
   One delegated click handler: data-act → actions[name](el). Long-press handled separately on .c cells. */
(function () {
  var S = window.Store, C = window.APP_CONFIG, root = document.getElementById('app');
  var NDAYS = 31, CELL = 48;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function num(v) { return Math.round(v * 100) / 100; }
  var WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var COLORS = ['#E5737B', '#F28C6B', '#F2A65A', '#F5D27A', '#5BC48A', '#9EC27A', '#D4D86A', '#F2E25A',
    '#5BC4C0', '#6AD3E0', '#7FB3FF', '#4E9BF0', '#F27BA8', '#C98BE0', '#A99BF0', '#8F9BE0',
    '#C4A49A', '#F0F0F0', '#C9CDD2', '#9AA0A6'];
  var ICON = {
    plus: '<svg class="i" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    gear: '<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
    chev: '<svg class="i chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',
    more: '<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/></svg>',
    back: '<svg class="i" viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    tick: '<svg class="tk" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    cross: '<svg class="xx" viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg>',
    filter: '<svg class="i" viewBox="0 0 24 24"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
    pen: '<svg class="i" viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg>',
    palette: '<svg class="i" viewBox="0 0 24 24"><path d="M12 3a9 9 0 100 18c1.1 0 1.6-.8 1.6-1.6 0-.9-.7-1.3-.7-2.1 0-.9.7-1.5 1.6-1.5H17a4 4 0 004-4c0-4.9-4-8.8-9-8.8z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="14.5" cy="7" r="1"/></svg>',
    doneDay: '<svg class="i" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4M8.5 14.5l2.5 2.5 4.5-4.5"/></svg>',
    hide: '<svg class="i" viewBox="0 0 24 24"><path d="M3 3l18 18M10.6 6.1A10 10 0 0 1 12 6c5 0 9 6 9 6a17 17 0 0 1-3 3.4M6.3 7.8C4.1 9.4 3 12 3 12s4 6 9 6a8.6 8.6 0 0 0 3.4-.7M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>',
    unhide: '<svg class="i" viewBox="0 0 24 24"><path d="M3 12s4-6 9-6 9 6 9 6-4 6-9 6-9-6-9-6z"/><circle cx="12" cy="12" r="3"/></svg>',
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
    flag: '<svg class="i" viewBox="0 0 24 24"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
    clock: '<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>'
  };
  var SPC = { g: '#5DCA8A', a: '#EFB43F', r: '#EC6A6A' };
  var VIEW_NAME = { all: 'Main', star: 'Starred', arch: 'Archived', done: 'Done today' };
  var SYNC_TXT = { off: 'Not signed in', syncing: 'Syncing…', ok: 'Synced', paused: 'Sync paused', error: 'Sync error' };

  /* ---- what a cell shows ---- */
  function met(h, v, k) { var tg = h.target, it = SPT && (SPT.sprint.items || {})[h.id]; if (k && bookOn(h) && h.book.end && k >= h.book.a) tg = bookNeed(h, k); if (it && it.m === 'day' && it.t != null && h.type === 'num') tg = it.t; return h.tt === 'max' ? v <= tg : v >= tg; }   // v5.22: inside a sprint tab its per-day target decides; v5.24: a book's target = pace needed that day
  /* ---- v5.24 Book: a measurable habit can carry a book. h.book = { on, title, showT, total, p0 (page he was on at the start),
     a (start day), end (finish by), hist: [{t, n, p0, a, f, read}] }. Entries stay "pages read that day"; the page reached is
     p0 + pages read since a. The day's target = pages left at the start of that day ÷ days left (that day to end, inclusive). ---- */
  var BKC = {};
  function bookOn(h) { return !!(h && h.type === 'num' && h.book && h.book.on && h.book.total > 0 && h.book.a); }
  function dayDiff(a, b) { return Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5); }
  function addDays(k, n) { var d = new Date(k + 'T12:00:00'); d.setDate(d.getDate() + n); return S.key(d); }
  function fmtK(k) { var d = new Date(k + 'T12:00:00'); return d.getDate() + ' ' + d.toLocaleString('en', { month: 'short' }) + (d.getFullYear() !== S.todayDate().getFullYear() ? ' ' + d.getFullYear() : ''); }
  function bookRead(h) {   // [[day, pages]] since the start day, oldest first
    if (BKC[h.id]) return BKC[h.id];
    var pre = h.id + '|', E = S.d.entries, a = h.book.a, L = [];
    Object.keys(E).forEach(function (x) { if (x.indexOf(pre) !== 0) return; var k = x.slice(pre.length), e = E[x]; if (k >= a && e && !e.d && e.v != null) L.push([k, +e.v]); });
    L.sort(function (x, y) { return x[0] < y[0] ? -1 : 1; });
    return (BKC[h.id] = L);
  }
  function bookBefore(h, k) { var n = 0; bookRead(h).forEach(function (r) { if (r[0] < k) n += r[1]; }); return n; }
  function bookNeed(h, k) {   // pages to read on day k to finish by the end date (0 = finished)
    var b = h.book, left = b.total - b.p0 - bookBefore(h, k); if (left <= 0) return 0;
    if (!b.end) return h.target || 1;
    var dl = dayDiff(k, b.end) + 1; return dl >= 1 ? Math.ceil(left / dl) : left;
  }
  function bookInfo(h) {
    var b = h.book, t = S.today(), rd = 0, last = null, todayV = null;
    bookRead(h).forEach(function (r) { if (r[0] <= t) { rd += r[1]; if (r[1] > 0) last = r[0]; } if (r[0] === t) todayV = r[1]; });
    var cur = Math.min(b.total, b.p0 + rd), left = Math.max(0, b.total - cur), el = t < b.a ? 0 : dayDiff(b.a, t) + 1, avg = el ? rd / el : 0;
    var dl = b.end ? dayDiff(t, b.end) + 1 - (todayV ? 1 : 0) : null;   // today counts as a day left until something is logged
    var need = dl == null ? null : left <= 0 ? 0 : dl >= 1 ? left / dl : left;
    var orig = b.end ? (b.total - b.p0) / Math.max(1, dayDiff(b.a, b.end) + 1) : null;
    var fin = avg > 0 && left > 0 ? addDays(t, Math.ceil(left / avg) - (todayV ? 0 : 1)) : null;
    return { cur: cur, left: left, read: rd, el: el, avg: avg, dl: dl, need: need, orig: orig, fin: fin, last: last };
  }
  function f1(x) { return Math.round(x * 10) / 10; }
  function bkDone(x) { return x.done || x.read >= (x.n || 0) - (x.p0 || 0); }   // v5.27: a run counts as a finished book (old runs: read to the end)
  function bookCard(h) {   // v5.27: four coloured numbers on top (current page · finish today at · still needed today · daily target), the rest below
    var b = h.book, i = bookInfo(h), pct = Math.min(100, Math.round(100 * i.cur / b.total)), t = S.today();
    var tg = t >= b.a ? bookNeed(h, t) : 0, X = Math.min(b.total, b.p0 + bookBefore(h, t)), tv = S.val(h.id, t) || 0, still = Math.max(0, tg - tv);
    var B = [['c1', 'Current page', i.cur, ''], ['c2', 'Today finish at', Math.min(b.total, X + tg), ''],
      ['c3' + (still ? '' : ' ok'), 'Still needed today', still ? still : '✓', still ? 'pages' : ''], ['c4', 'Daily target', tg, 'pages']];
    var T = [['Pages left', i.left, ''], ['Original plan', i.orig == null ? '–' : Math.ceil(i.orig) + '/day', ''], ['Your average', Math.round(i.avg) + '/day', ''],
      ['Weekly avg', Math.round(i.avg * 7) + '/wk', ''], ['Finish at pace', i.left <= 0 ? 'Done' : i.fin ? fmtK(i.fin) : '–', i.fin && b.end ? (i.fin > b.end ? 'down' : 'up') : ''], ['Days reading', i.el, '']];
    var o = '<section class="stc bkc"><h4>Book' + (b.title ? ' · ' + esc(b.title) : '') + '</h4>' + (b.au ? '<p class="small muted" style="margin:-6px 0 10px">' + esc(b.au) + '</p>' : '') +
      '<div class="bkb">' + B.map(function (x) { return '<div class="' + x[0] + '"><span>' + x[1] + '</span><b>' + x[2] + '</b>' + (x[3] ? ' <small>' + x[3] + '</small>' : '') + '</div>'; }).join('') + '</div>' +
      '<div class="bkbar"><i style="width:' + pct + '%;background:' + esc(h.color) + '"></i></div>' +
      '<p class="small muted" style="margin:6px 0 10px">p. ' + i.cur + ' of ' + b.total + ' · ' + i.read + ' read since ' + fmtK(b.a) + (b.end ? ' · ' + (i.left > 0 ? Math.max(0, dayDiff(t, b.end) + 1) + ' days left' : 'due ' + fmtK(b.end)) : '') + '</p>' +
      '<div class="tiles t3">' + T.map(function (x) { return '<div class="tile"><span>' + x[0] + '</span><b' + (x[2] ? ' class="' + x[2] + '"' : '') + '>' + x[1] + '</b></div>'; }).join('') + '</div>' +
      '<div class="row" style="margin-top:10px;flex-wrap:wrap"><button class="btn sm pri" data-act="bookFin">Finish book…</button><button class="btn sm" data-act="bookEnd" data-v="new">Switch to a new book</button>' +
      ((b.hist || []).length ? '<button class="btn sm" data-act="bookLog">Reading log</button>' : '') + '</div>';
    return o + '</section>';
  }
  function bookLogBtn(h) { return h && h.type === 'num' && h.book && !h.book.on && (h.book.hist || []).length ? '<section class="stc"><h4>Books</h4><button class="btn sm" data-act="bookLog">Reading log</button> <button class="btn sm" data-act="bookRestart">Start a new book</button></section>' : ''; }
  /* v5.27 Finish book: title, author, finished on, the run's numbers; then new book / read again / stop */
  function openBookFin() {
    var h = S.habit(stId); if (!bookOn(h)) return;
    var b = h.book, i = bookInfo(h), f = i.last || S.today(), d = Math.max(1, dayDiff(b.a, f) + 1);
    var html = '<div class="ptop"><button class="ib" data-act="close" aria-label="Back">' + ICON.back + '</button><h2 class="sth">Finish book</h2></div><div class="stats">' +
      '<label class="fl">Title<input id="bfT" value="' + esc(b.title || '') + '" autocomplete="off"></label>' +
      '<label class="fl">Author (optional)<input id="bfA" value="' + esc(b.au || '') + '" autocomplete="off"></label>' +
      '<label class="fl">Finished on<input id="bfF" type="date" value="' + f + '"></label>' +
      '<div class="tiles t3"><div class="tile"><span>Total pages</span><b>' + b.total + '</b></div><div class="tile"><span>Days taken</span><b>' + d + '</b></div><div class="tile"><span>Avg / day</span><b>' + Math.round(i.read / d) + '</b></div></div>' +
      (i.left > 0 ? '<p class="small muted">' + i.left + ' pages not logged — the book is saved as finished anyway.</p>' : '') +
      '<h4 class="bfh">Save to the log, then</h4><div class="col">' +
      '<button class="btn pri" data-act="bookFinOk" data-v="new">Start a new book</button><button class="btn" data-act="bookFinOk" data-v="again">Read it again</button><button class="btn" data-act="bookFinOk" data-v="stop">Stop for now</button></div></div>';
    sheetOpen = 'bfin'; sheet.innerHTML = html; sheet.className = 'sheet page'; sheet.scrollTop = 0;
  }
  function bookFinOk(v) {
    var h = S.habit(stId); if (!bookOn(h)) return;
    var b = h.book, i = bookInfo(h), g = function (id) { return (document.getElementById(id).value || '').trim(); }, f = g('bfF') || i.last || S.today();
    if (f < b.a) return App.toast('Finished on must be after ' + fmtK(b.a));
    b.title = g('bfT'); b.au = g('bfA');
    b.hist = (b.hist || []).concat([{ t: b.title, au: b.au, n: b.total, p0: b.p0, a: b.a, f: f, read: i.read, done: 1 }]);
    BKC = {};
    if (v === 'stop') { b.on = false; S.putHabit(h); App.render(); App.toast('Saved to the reading log'); return openStats(h.id); }
    S.putHabit(h); openEdit(h.id); var nb = draft.book; nb.p0 = 0; nb.a = addDays(f, 1) > S.today() ? addDays(S.today(), 1) : addDays(f, 1); nb.end = '';
    if (v !== 'again') { nb.title = ''; nb.au = ''; nb.total = 0; }
    drawEdit(); App.toast(v === 'again' ? 'Same book from page 1 — set Finish by and Save' : 'Enter the new book and Save');
  }
  /* v5.27 Reading log (per habit): books finished, pages, averages for Week / Month / Year / All with comparison, monthly bars, finished list */
  var blP = 'y';
  function habitPages(h) { var pre = h.id + '|', E = S.d.entries, L = []; Object.keys(E).forEach(function (x) { if (x.indexOf(pre) !== 0) return; var e = E[x]; if (e && !e.d && e.v != null && !e.s) L.push([x.slice(pre.length), +e.v]); }); return L; }
  function openBookLog() {
    var h = S.habit(stId); if (!h || !h.book) return;
    var P = habitPages(h), H = (h.book.hist || []).filter(bkDone), td = S.todayDate(), t = S.today(), ws = S.d.settings.weekStart || 0;
    var sum = function (a, e) { var n = 0; P.forEach(function (r) { if (r[0] >= a && r[0] <= e) n += r[1]; }); return n; };
    var books = function (a, e) { return H.filter(function (x) { return x.f >= a && x.f <= e; }); };
    var first = P.reduce(function (m, r) { return r[0] < m ? r[0] : m; }, H.reduce(function (m, x) { return x.a < m ? x.a : m; }, t));
    var a, e = t, pa, pe, cmpL, y = td.getFullYear(), mo = td.getMonth(), pad = function (n) { return String(n).padStart(2, '0'); };
    var back = function (k, yrs) { return (+k.slice(0, 4) - yrs) + k.slice(4); };
    if (blP === 'w') { var dw = (td.getDay() - ws + 7) % 7; a = addDays(t, -dw); pa = addDays(a, -7); pe = addDays(t, -7); cmpL = 'last week'; }
    else if (blP === 'm') { a = y + '-' + pad(mo + 1) + '-01'; pa = back(a, 1); pe = back(t, 1); cmpL = MON[mo] + ' ' + (y - 1); }
    else if (blP === 'y') { a = y + '-01-01'; pa = back(a, 1); pe = back(t, 1); cmpL = String(y - 1); }
    else { a = first; pa = null; cmpL = ''; }
    var nd = dayDiff(a, e) + 1, cur = { b: books(a, e), p: sum(a, e) }, prv = pa ? { b: books(pa, pe), p: sum(pa, pe) } : null;
    var avgD = function (x) { return x.b.length ? Math.round(x.b.reduce(function (s, z) { return s + dayDiff(z.a, z.f) + 1; }, 0) / x.b.length) : null; };
    var dlt = function (c, p, pct) { if (!prv) return ''; var d = c - p; if (!d) return '<small class="muted"> = ' + esc(cmpL) + '</small>'; return '<small class="' + (d > 0 ? 'up' : 'down') + '"> ' + (d > 0 ? '▲ ' : '▼ ') + (pct && p ? Math.round(100 * Math.abs(d) / p) + '%' : Math.abs(d)) + ' vs ' + esc(cmpL) + '</small>'; };
    var lbl = { w: 'this week', m: 'this month', y: 'this year', a: 'all time' }[blP];
    var B = [['c4', 'Books ' + lbl, cur.b.length, dlt(cur.b.length, prv ? prv.b.length : 0)], ['c1', 'Pages ' + lbl, cur.p.toLocaleString('en'), dlt(cur.p, prv ? prv.p : 0, true)],
      ['c2', 'Avg pages / day', Math.round(cur.p / nd), prv ? dlt(Math.round(cur.p / nd), Math.round(prv.p / Math.max(1, dayDiff(pa, pe) + 1))) : ''], ['c3', 'Avg days / book', avgD(cur) == null ? '–' : avgD(cur), '']];
    // chart: Week/Month = pages per day; Year/All = pages per month, this year vs last year
    var bars = [], cap;
    if (blP === 'w' || blP === 'm') { var n = blP === 'w' ? 7 : new Date(y, mo + 1, 0).getDate(); for (var q = 0; q < n; q++) { var k = addDays(a, q); bars.push([k <= t ? sum(k, k) : 0, null, blP === 'w' ? WD[new Date(k + 'T12:00:00').getDay()].slice(0, 2) : q % 5 ? '' : k.slice(8) * 1]); } cap = 'Pages per day ' + lbl; }
    else { for (var m = 0; m < 12; m++) { var ma = y + '-' + pad(m + 1) + '-01', me = y + '-' + pad(m + 1) + '-31'; bars.push([sum(ma, me), sum(back(ma, 1), back(me, 1)), MON[m][0]]); } cap = 'Pages per month · ' + y + ' vs ' + (y - 1); }
    var mx = Math.max.apply(null, bars.map(function (x) { return Math.max(x[0], x[1] || 0); }).concat([1]));
    var chart = '<div class="blc">' + bars.map(function (x) { return '<div title="' + x[0] + '"><i style="height:' + Math.round(100 * x[0] / mx) + '%"></i>' + (x[1] != null ? '<i class="ly" style="height:' + Math.round(100 * x[1] / mx) + '%"></i>' : '') + '<em>' + x[2] + '</em></div>'; }).join('') + '</div>';
    var allP = sum('0000', '9999'), allD = Math.max(1, dayDiff(first, t) + 1);
    var html = '<div class="ptop"><button class="ib" data-act="close" aria-label="Back">' + ICON.back + '</button><h2 class="sth"><i style="background:' + esc(h.color) + '"></i>Reading log</h2></div><div class="stats">' +
      '<p class="stsub">' + esc(h.name) + ' · books finished under this habit</p>' +
      seg2('blP', blP, [['w', 'Week'], ['m', 'Month'], ['y', 'Year'], ['a', 'All']]) +
      '<div class="bkb">' + B.map(function (x) { return '<div class="' + x[0] + '"><span>' + x[1] + '</span><b>' + x[2] + '</b>' + x[3] + '</div>'; }).join('') + '</div>' +
      '<section class="stc"><h4>' + cap + '</h4>' + chart + (blP === 'y' || blP === 'a' ? '<p class="small muted">coloured = ' + y + ', grey = ' + (y - 1) + '</p>' : '') + '</section>' +
      '<section class="stc"><h4>Finished books' + (H.length ? ' · ' + H.length : '') + '</h4>' + (H.length ? H.slice().sort(function (p, q) { return p.f < q.f ? 1 : -1; }).map(function (x) {
        var d = Math.max(1, dayDiff(x.a, x.f) + 1);
        return '<div class="blr"><span>' + esc(x.t || 'Untitled') + (x.au ? '<br><small class="muted">' + esc(x.au) + '</small>' : '') + '</span><em>' + x.n + ' p · ' + d + ' d · ' + Math.round(x.read / d) + '/day<br>done ' + fmtK(x.f) + '</em></div>';
      }).join('') : '<p class="small muted">None yet — use “Finish book…” on the habit’s stats.</p>') + '</section>' +
      '<section class="stc"><h4>All time</h4><div class="tiles t3"><div class="tile"><span>Books</span><b>' + H.length + '</b></div><div class="tile"><span>Pages</span><b>' + allP.toLocaleString('en') + '</b></div><div class="tile"><span>Avg / day</span><b>' + Math.round(allP / allD) + '</b></div></div></section></div>';
    var y0 = sheetOpen === 'blog' ? sheet.scrollTop : 0;
    sheetOpen = 'blog'; sheet.innerHTML = html; sheet.className = 'sheet page'; sheet.scrollTop = y0;
  }
  function seg2(act, cur, opts) { return '<div class="seg" style="margin-bottom:12px">' + opts.map(function (o) { return '<button class="' + (cur === o[0] ? 'on' : '') + '" data-act="' + act + '" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div>'; }
  function tgRow(f, title, note, on) { return '<button class="mi tg flat" data-act="ef" data-f="' + f + '"><span>' + title + (note ? '<br><span class="small muted">' + note + '</span>' : '') + '</span><span class="box' + (on ? ' on' : '') + '">' + (on ? ICON.check : '') + '</span></button>'; }
  function bookFields(h) {
    var b = h.book || {}, on = !!b.on;
    var o = tgRow('book', 'Book', 'Reading a book: pages left and the pace needed to finish by a date. The daily target follows that pace.', on);
    if (!on) return o + tgRow('pick', 'Number picker', 'The number box gets a row of numbers to swipe (steps of the default value).', h.pick);
    return o + '<label class="fl">Title (optional)<input id="fBkT" value="' + esc(b.title || '') + '" autocomplete="off"></label>' +
      '<label class="fl">Author (optional)<input id="fBkAu" value="' + esc(b.au || '') + '" autocomplete="off"></label>' +
      tgRow('bookT', 'Show the title under the habit name', 'Small italic subtitle; changes with each new book.', b.showT) +
      '<div class="two"><label class="fl">Total pages<input id="fBkN" inputmode="numeric" value="' + (b.total || '') + '" autocomplete="off"></label>' +
      '<label class="fl">' + (b.total && (b.hist || b.a < S.today()) ? 'Page at start' : 'Page you’re on') + '<input id="fBkP" inputmode="numeric" value="' + (b.p0 || 0) + '" autocomplete="off"></label></div>' +
      '<div class="two"><label class="fl">Start date<input id="fBkA" type="date" value="' + esc(b.a || S.today()) + '"></label>' +
      '<label class="fl">Finish by<input id="fBkE" type="date" value="' + esc(b.end || '') + '"></label></div>' +
      '<span class="small muted">Counting starts from that page on the start date, so a half-read book works. Each day’s target = pages left ÷ days left' +
      (b.end ? '' : ' (until you set Finish by, the Target above is used)') + '. Log pages read; the number box shows the page you reach.</span>';
  }
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
    if (f.t === 'week') return { t: 'rep', ev: 1, u: 'w', days: [0, 1, 2, 3, 4, 5, 6], from: 'sch', a: '2000-01-01', wn: Math.max(1, f.n || 1), ws: f.ws };   // v5.32: old "N per week" = weekly quota on every day
    return f;
  }
  /* ---- v5.32 weekly quota: a weekly repeat with "at least N days" (or, for measurable, a weekly total).
     Shows on the picked days until the week's goal is reached, then hides till next week. Ticks on any day count.
     Days mode: a day counts when done (measurable: its target met). Total mode: every amount adds up.
     A week is missed as soon as the picked days left can't reach N (days mode), or when it ends short. ---- */
  function qOn(h, f) { f = f || fq(h); return f.t === 'rep' && f.u === 'w' && f.from !== 'done' && h.kind !== 'bad' && !isGroup(h) && (f.wn > 0 || (f.wc === 'tot' && h.type === 'num' && f.wt > 0)); }
  function qTot(h, f) { return f.wc === 'tot' && h.type === 'num' && f.wt > 0; }
  function wsOf(f) { return f.ws != null && f.ws !== '' ? +f.ws : (S.d.settings.weekStart || 0); }
  function wk0(n, ws) { return n - ((fromDn(n).getDay() - ws + 7) % 7); }
  function qPick(f, n, ws) {
    var a = kDn(f.a || '2000-01-01'), ds = f.days && f.days.length ? f.days : [fromDn(a).getDay()]; if (n < a) return false;
    return ds.indexOf(fromDn(n).getDay()) >= 0 && Math.round((wk0(n, ws) - wk0(a, ws)) / 7) % Math.max(1, f.ev || 1) === 0;
  }
  function qAmt(h, f, k) {
    if (S.skipped(h.id, k)) return 0;
    if (qTot(h, f)) { var v = S.val(h.id, k); return typeof v === 'number' ? v : 0; }
    return doneOn(h, k) ? 1 : 0;
  }
  function qrep(h) {
    var f = fq(h), ws = wsOf(f), tot = qTot(h, f), T = kDn(S.today()), a = kDn(f.a || '2000-01-01');
    var nPk = (f.days && f.days.length) || 1, need = tot ? f.wt : f.wn, W = [], r = { occ: {}, ok: {}, late: {}, miss: {}, on: 0, lt: 0, ms: 0, q: 1, tot: tot, need: need };
    for (var w = wk0(Math.max(a, T - 800), ws); w <= T; w += 7) {
      var got = 0, metD = null, pk = 0, any = false;
      for (var n = w; n < w + 7; n++) {
        var p = qPick(f, n, ws); if (p) { pk++; any = true; }
        if (n > T) continue;
        if (p && metD == null) r.occ[n] = 1;
        got += qAmt(h, f, S.key(fromDn(n))); if (metD == null && got >= need) metD = n;
      }
      if (!any && !got) continue;
      var cur = w + 6 >= T, cap = 0;
      if (cur && metD == null) for (var m = T; m < w + 7; m++) if ((nPk >= need || tot ? qPick(f, m, ws) : true) && !(m === T && qAmt(h, f, S.key(fromDn(T))))) cap++;
      var miss = metD == null && (!cur || (!tot && got + cap < need));
      if (metD != null) r.on++; else if (miss) r.ms++;
      if (miss && !cur) { for (var z = w + 6; z >= w; z--) if (qPick(f, z, ws)) { r.miss[z] = 1; break; } }
      W.push({ w: w, got: got, met: metD, miss: miss, cur: cur });
    }
    var L = W.length && W[W.length - 1].cur ? W[W.length - 1] : { got: 0, met: null, miss: false };
    var doneT = qAmt(h, f, S.today()) > 0, pickT = qPick(f, T, ws), metB = L.met != null && L.met < T;
    r.wk = { got: num(L.got), need: need, met: L.met != null, miss: L.miss };
    r.open = pickT && !metB && !doneT && !L.miss; r.due = r.open ? 0 : -1;
    r.show = (pickT && !metB) || doneT; r.lastMiss = false;
    r.next = null; for (var q = T + 1; q < T + 60 && r.next == null; q++) if (qPick(f, q, ws) && (q >= wk0(T, ws) + 7 || !metB)) r.next = q;
    r.pick = function (dt) { var x = dn(dt); return qPick(f, x, ws) || qAmt(h, f, S.key(dt)) > 0; };
    return r;
  }
  function qTxt(h) {
    var r = rep(h), f = fq(h); if (!r || !r.q || f.wp === false) return '';
    var w = r.wk, u = r.tot ? (h.unit ? ' ' + esc(h.unit) : '') : (w.need === 1 ? ' day' : ' days');
    return '<small class="sbt qtx' + (w.met ? ' qok' : w.miss ? ' qms' : '') + '">' + num(w.got) + ' of ' + num(w.need) + u + ' this week' + (w.miss ? ' · missed' : '') + '</small>';
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
  function doneOn(h, k) { if (isGroup(h)) return groupRes(h, k).ok; var v = S.val(h.id, k); return v != null && (h.type === 'yn' ? !!v : met(h, v, k)); }
  var RC = null;   // repeat status per habit; cleared on every save and render
  var _save = S.save; S.save = function () { RC = null; BKC = {}; return _save.apply(S, arguments); };
  function rep(h) {
    if (!isRep(h)) return null; RC = RC || {}; if (RC[h.id]) return RC[h.id];
    if (qOn(h)) return (RC[h.id] = qrep(h));
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
    return r.due > 0 ? '<small class="due">(due ' + r.due + 'd)</small>' : !r.show && r.lastMiss ? '<small class="due">(missed)</small>' : '';
  }
  function cellHtml(h, d) {
    var v = S.val(h.id, d.k), r = rep(h), tdy = d.k === S.today(), sch = scheduled(h, d.dt) || (tdy && r && r.open);
    var cls = 'c' + (sch ? '' : ' off') + (tdy ? ' tdy' : '') + (r && r.miss[dn(d.dt)] ? ' miss' : ''), inner;
    if (S.skipped(h.id, d.k)) { cls += ' skp'; inner = ICON.skip; }
    else if (h.type === 'yn') {
      if (v) { cls += h.kind === 'bad' ? ' bad' : ' ok'; inner = ICON.tick; } else inner = ICON.cross;
    } else {
      var has = v != null;
      if (has) cls += h.kind === 'bad' ? (met(h, v, d.k) ? ' nb' : ' bad') : (met(h, v, d.k) ? ' ok' : ' part');
      inner = '<b>' + (has ? num(v) : 0) + '</b>' + (h.unit ? '<i>' + esc(h.unit) + '</i>' : '');
    }
    return '<div class="' + cls + '" data-h="' + h.id + '" data-k="' + d.k + '">' + inner + '</div>';
  }

  /* ---- Groups: one level. A habit with sub-habits is a group; its cells show the sub-habits' result
     (Sum of their values, or a tick when N of them are done). Archived sub-habits don't count. ---- */
  function subs(id) { return S.habits().filter(function (x) { return x.parent === id; }); }
  function liveSubs(id) { return subs(id).filter(function (x) { return !x.archived; }); }
  function isGroup(h) { return !h.parent && subs(h.id).length > 0; }
  /* v5.31: agg.n 0 (or missing) = ALL live sub-habits. A habit that becomes a group starts at 'all' — before, every habit
     carried the new-habit default n:1, so a new group ticked (and hid as done) as soon as ONE sub-habit was done. */
  function aggOf(h) { return h.agg || { t: 'count', n: 0 }; }
  function becomeGroup(g) { if (g && !g.parent && !subs(g.id).length) { g.agg = { t: 'count', n: 0, prog: !g.agg || g.agg.prog !== false }; S.putHabit(g); } }
  function subDone(x, k) { var v = S.val(x.id, k); return v != null && (x.type === 'yn' ? !!v : met(x, v, k)); }
  function groupRes(h, k) {
    var ss = liveSubs(h.id).filter(function (x) { return !S.skipped(x.id, k); }), sum = 0, done = 0;   // a skipped sub-habit doesn't count
    ss.forEach(function (x) { var v = S.val(x.id, k); if (v != null) sum += x.type === 'yn' ? (v ? 1 : 0) : v; if (subDone(x, k)) done++; });
    var a = aggOf(h), need = a.t === 'count' ? Math.min(a.n || ss.length, ss.length) : 0;
    var ok = a.t === 'count' ? (ss.length > 0 && done >= need) : (h.target > 0 ? sum >= h.target : false);
    return { sum: num(sum), done: done, total: ss.length, need: need, ok: ok };
  }
  function groupCell(h, d) {
    var r = groupRes(h, d.k), cls = 'c grp-c' + (d.k === S.today() ? ' tdy' : ''), inner;
    if (aggOf(h).t === 'count') {
      if (r.ok) { cls += ' ok'; inner = ICON.tick; }
      else if (r.done && aggOf(h).prog !== false) { cls += ' part'; inner = '<b>' + r.done + '</b><i>of ' + r.need + '</i>'; }
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
  function ctxGrp(h) { var v = !!h && view(); return v === 'star' ? !h.parent && !h.star && isGroup(h) : v === 'done' ? !h.parent && isGroup(h) && !doneToday(h) : false; }
  // v5.19: 'Done today' view — everything finished today, hidden ones included (not archived, not skipped)
  function doneToday(h) { return enteredToday(h) && !skippedToday(h); }
  // v5.19: Starred has its own drag order (settings.starOrd), separate from the real order
  function starRank(id) { var o = S.d.settings.starOrd || [], i = o.indexOf(id); return i < 0 ? 1e6 + ((S.habit(id) || {}).order || 0) : i; }
  function byStar(a, b) { return starRank(a.id) - starRank(b.id); }
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
    if (s.indexOf('p:') !== 0) return hm12(s);
    var q = s.split(':'), o = +q[2] || 0, m = mins(s);
    return m != null ? Prayer.hm(m) : Prayer.NAMES[q[1]] + (o ? (o > 0 ? '+' : '−') + offTxt(Math.abs(o)) : '');   // the list shows today's actual time
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
  function stripTabs() { var sa = S.d.ui.showArchTabs, cv = S.d.ui.view; return S.tabs().filter(function (t) { return (!t.hidden || sa) && (!isSpr(t) || sprPhase(t) !== 'end' || t.id === cv); }); }   // ended sprints leave the strip (Settings → Sprints)   // archived tabs only when "Archived" is flipped on
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
  // v5.31: a bottom-bar view button pressed while a page (habit stats, Stats, Weight…) covers the list closes the page and
  // goes to that view — it used to change the list hidden behind the page, so nothing seemed to happen.
  function ribGo(x) {
    if (!sheetOpen || sheetOpen === 'show') return toggleView(x);
    closeSheet(function () { if (view() !== x) toggleView(x); else App.render(true); });
  }
  function setView(v) { S.d.ui.view = v; S.saveUi(); var sc = document.getElementById('sc'); if (sc) sc.scrollTop = 0; App.render(true); }
  function topOf(h) { return h.parent && S.habit(h.parent) || h; }
  function tabOf(h) { return S.tab(topOf(h).tab); }
  /* ---- v5.22 Sprint tabs. t.sprint = { from, to ('YYYY-MM-DD'), color (rows coloured by progress), items: { habitId: { m, t, b } } }.
     A sprint owns no habits: it lists habits or whole groups from other tabs (like Starred); ticks are the same entries.
     m = 'day' (target per day) | 'total' (over the sprint) for measurable; 'pct' (% of days) | 'times' for yes/no and count groups.
     t = target, b = baseline (blank = auto: the same measure over the equal span just before the start). Bad habits: lower is better. ---- */
  var SPT = null;   // the sprint whose targets judge cells while its tab is being drawn
  function isSpr(t) { return !!(t && t.sprint); }
  function sprOf(v) { var t = S.tab(v); return isSpr(t) ? t : null; }
  function regTabs() { return S.tabs().filter(function (t) { return !t.sprint; }); }
  function sprPhase(t) { var k = S.today(), s = t.sprint; return k < s.from ? 'pre' : k > s.to ? 'end' : 'on'; }
  function sprLen(s) { return Math.max(1, kDn(s.to) - kDn(s.from) + 1); }
  function sprNum(h) { return isGroup(h) ? !!(h.agg && h.agg.t === 'sum') : h.type === 'num'; }
  function sprMode(h, it) { var n = sprNum(h), m = it && it.m; return n ? (m === 'total' ? 'total' : 'day') : (m === 'times' ? 'times' : 'pct'); }
  function sprDefT(h, m, L) { var tg = +h.target || 1; return m === 'day' ? tg : m === 'total' ? tg * L : m === 'pct' ? 80 : Math.ceil(L * 0.8); }
  function sprIn(t, h) { var it = t.sprint.items || {}; return !!(it[h.id] || (h.parent && it[h.parent])); }
  function sprDays(t) { var s = t.sprint, a = kDn(s.from), e = kDn(s.to), tk = kDn(S.today()); return { a: a, e: e, L: e - a + 1, n: tk < a ? 0 : Math.min(tk, e) - a + 1, left: Math.max(0, e - Math.max(tk, a - 1)) }; }
  function sprRange(h, res, from, to, st) {   // counted days, sum of values, good days; today counts only once entered
    var tk = kDn(S.today()), o = { n: 0, sum: 0, ok: 0 };
    for (var d = from; d <= to; d++) {
      var dt = fromDn(d); if (dt < st) continue;
      var k = S.key(dt), r = res(k); if (r.s || !scheduled(h, dt)) continue;
      if (d === tk && r.v == null && !r.ok) continue;
      o.n++; if (r.ok) o.ok++; if (r.v != null && !isNaN(+r.v)) o.sum += +r.v;
    }
    return o;
  }
  function sprCalc(t, h) {   // per-day rates: r (now), T (target), B (baseline); cls g/a/r/n
    var s = t.sprint, it = (s.items || {})[h.id]; if (!it) return null;
    var D = sprDays(t), L = D.L, m = sprMode(h, it), bad = !isGroup(h) && h.kind === 'bad', num = sprNum(h), res = dayRes(h), st = startOf(h);
    var tv = it.t != null && it.t !== '' ? +it.t : sprDefT(h, m, L);
    var rate = function (o) { if (!o.n) return null; var c = bad && !num ? o.n - o.ok : o.ok; return m === 'day' || m === 'total' ? o.sum / o.n : c / o.n; };
    var per = function (v) { return m === 'day' ? v : m === 'pct' ? v / 100 : v / L; };
    var disp = function (r) { return m === 'day' ? r : m === 'pct' ? r * 100 : r * L; };
    var cur = sprRange(h, res, D.a, Math.min(D.e, D.a + D.n - 1), st), r = rate(cur), T = per(tv);
    var B = it.b != null && it.b !== '' ? per(+it.b) : rate(sprRange(h, res, D.a - L, D.a - 1, st)), bAuto = !(it.b != null && it.b !== '');
    var cls = 'n';
    if (r != null && cur.n >= 3) cls = bad ? (r <= T ? 'g' : B != null && r < B ? 'a' : 'r') : (r >= T ? 'g' : B != null && r > B ? 'a' : 'r');
    var done = m === 'total' ? cur.sum : m === 'times' ? (bad && !num ? cur.n - cur.ok : cur.ok) : null;
    var pct = r == null ? null : bad ? (B ? Math.round((r - B) / B * 100) : null) : Math.round(r / (T || 1) * 100);
    var pace = r == null ? null : m === 'total' || m === 'times' ? Math.round(r * L / (tv || 1) * 100) : pct;
    var u = num && h.unit ? ' ' + h.unit : '', f = function (v) { return v == null ? '–' : String(num_(v)); };
    var line = m === 'day' ? (r == null ? 'no days yet' : 'avg ' + f(r) + u) + ' · ' + (bad ? 'limit ' : 'target ') + f(tv) + ' a day'
      : m === 'total' ? f(done) + ' / ' + f(tv) + u + ' total'
      : m === 'pct' ? (r == null ? '–' : Math.round(r * 100) + '%') + ' of days' + (bad ? ' slipped · limit ' : ' · target ') + f(tv) + '%'
      : f(done) + ' / ' + f(tv) + ' times';
    line += B != null ? ' · base ' + (m === 'pct' ? Math.round(B * 100) + '%' : f(disp(B))) : '';
    return { it: it, m: m, bad: bad, num: num, r: r, T: T, B: B, bAuto: bAuto, tv: tv, cls: cls, pct: pct, pace: pace, line: line, cur: cur, D: D, res: res, st: st, disp: disp };
  }
  function num_(v) { return Math.round(v * 10) / 10; }
  function sprLine(t, h) {   // row text + colour inside the sprint tab
    var c = sprCalc(t, h); if (!c) return null;
    var v = c.pct == null ? '' : c.bad ? (c.pct > 0 ? '+' : '') + c.pct + '%' : (c.m === 'total' || c.m === 'times' ? c.pace : c.pct) + '%';
    var f = function (x) { return x == null ? '–' : String(num_(x)); }, u = c.num && h.unit ? ' ' + h.unit : '', lim = c.bad ? '≤' : '';
    var sh = c.m === 'day' ? f(c.r) + ' / ' + lim + f(c.tv) + u + ' a day' : c.m === 'total' ? f(c.cur.sum) + ' / ' + lim + f(c.tv) + u
      : c.m === 'pct' ? (c.r == null ? '–' : Math.round(c.r * 100)) + '% / ' + lim + f(c.tv) + '% of days' : f(c.bad && !c.num ? c.cur.n - c.cur.ok : c.cur.ok) + ' / ' + lim + f(c.tv) + ' times';
    return { cls: c.cls, html: '<small class="spl">' + esc(sh) + (v ? ' · <b class="sp' + c.cls + '">' + v + '</b>' : '') + '</small>' };
  }
  function sprHead(t) {
    var s = t.sprint, D = sprDays(t), ph = sprPhase(t), dt = function (k) { var p = k.split('-'); return (+p[2]) + ' ' + MON3[+p[1] - 1]; };
    return dt(s.from) + ' – ' + dt(s.to) + ' · ' + (ph === 'pre' ? 'starts in ' + (D.a - kDn(S.today())) + ' day' + (D.a - kDn(S.today()) > 1 ? 's' : '') : ph === 'end' ? 'ended' : 'day ' + D.n + ' of ' + D.L + ' · ' + D.left + ' left');
  }
  function sprAdd(t, ids, on) {   // add / remove these habits (or groups) to a sprint
    var it = t.sprint.items = t.sprint.items || {};
    ids.forEach(function (id) { var h = S.habit(id); if (!h) return; if (on) { if (!it[id]) it[id] = { m: sprMode(h, null), t: null, b: null }; } else delete it[id]; });
    S.putTab(t);
  }
  function openAddSpr() {
    var ids = Object.keys(sel || {}), sp = S.tabs().filter(function (t) { return isSpr(t) && sprPhase(t) !== 'end'; });
    showSheet('addspr', '<h3>Add to sprint</h3>' + (sp.length ? sp.map(function (t) {
        var all = ids.every(function (id) { return (t.sprint.items || {})[id]; });
        return '<button class="mi trow" data-act="sprTog" data-tab="' + t.id + '"><span class="box' + (all ? ' on' : '') + '">' + (all ? ICON.check : '') + '</span><span>' + esc(t.name) + '<small class="muted" style="display:block">' + esc(sprHead(t)) + '</small></span></button>';
      }).join('') : '<p class="small muted">No running or upcoming sprints yet.</p>') +
      '<button class="mi trow add" data-act="sprNew">' + ICON.plus + '<span>New sprint</span></button><div class="row end"><button class="btn" data-act="close">Done</button></div>');
  }
  function openSprEdit(t, ids, copy) {   // new (t null) or edit: name, short, dates, colour switch, each habit's measure / target / baseline
    var k = S.today(), e = new Date(S.todayDate()); e.setDate(e.getDate() + 29);
    var s = t ? t.sprint : { from: k, to: S.key(e), color: copy ? copy.sprint.color !== false : true, items: copy ? copy.sprint.items : {} }, its = JSON.parse(JSON.stringify(s.items || {}));
    (ids || []).forEach(function (id) { var h = S.habit(id); if (h && !its[id]) its[id] = { m: sprMode(h, null), t: null, b: null }; });
    var L = sprLen(s), tmp = { sprint: { from: s.from, to: s.to, items: its } };
    var rows = Object.keys(its).filter(function (id) { return S.habit(id); }).map(function (id) {
      var h = S.habit(id), it = its[id], m = sprMode(h, it), c = sprCalc(tmp, h), num = sprNum(h);
      var bAuto = c && c.B != null ? (m === 'pct' ? Math.round(c.B * 100) : num_(c.disp(c.B))) : '';
      return '<div class="spe" data-id="' + id + '"><div class="spen"><b style="color:' + esc(h.color) + '">' + esc(h.name) + '</b>' + (isGroup(h) ? '<small class="muted"> group</small>' : '') +
        '<button class="ib sm" data-act="sprRm" data-id="' + id + '" aria-label="Remove">' + ICON.bin + '</button></div><div class="spef">' +
        '<select id="spm-' + id + '" class="sel">' + opts(num ? [['day', 'Per day'], ['total', 'Sprint total']] : [['pct', '% of days'], ['times', 'Times in sprint']], m) + '</select>' +
        '<label>' + (h.kind === 'bad' ? 'Limit' : 'Target') + '<input id="spt-' + id + '" inputmode="decimal" value="' + (it.t != null ? it.t : '') + '" placeholder="' + num_(sprDefT(h, m, L)) + '"></label>' +
        '<label>Baseline<input id="spb-' + id + '" inputmode="decimal" value="' + (it.b != null ? it.b : '') + '" placeholder="' + (bAuto === '' ? 'auto' : bAuto + ' auto') + '"></label></div></div>';
    }).join('');
    showSheet('spredit', '<div class="ptop"><button class="ib" data-act="close" aria-label="Back">' + ICON.back + '</button><h2>' + (t ? 'Edit sprint' : 'New sprint') + '</h2><button class="btn pri sm" data-act="sprSave">Save</button></div><div class="stats">' +
      '<label class="fl">Name<input id="spName" value="' + esc(t ? t.name : copy ? copy.name + ' 2' : '') + '" placeholder="e.g. Ramadan prep" maxlength="30"></label>' +
      '<label class="fl">Short name (optional)<input id="spShort" value="' + esc(t && t.short || '') + '" maxlength="10"></label>' +
      '<div class="spd"><label class="fl">Starts<input type="date" id="spFrom" value="' + s.from + '"></label><label class="fl">Ends<input type="date" id="spTo" value="' + s.to + '"></label></div>' +
      '<button class="flip srw" data-act="sprCol" aria-pressed="' + (s.color !== false) + '" style="width:100%;justify-content:space-between"><span>Colour by progress</span><i class="tgl' + (s.color !== false ? ' on' : '') + '" id="spCol"></i></button>' +
      '<p class="small muted">Green = on target, amber = better than baseline, red = at or below baseline, grey = fewer than 3 days so far. Only inside this tab.</p>' +
      '<h4 class="sph">Habits</h4>' + (rows || '<p class="small muted">None yet. Hold a habit name, select, then tap the flag on the top bar.</p>') +
      '<p class="small muted">Leave target blank for the suggestion; leave baseline blank to use your average over the same number of days before the start. Inside this tab a “per day” target also decides when the cell turns green.</p>' +
      (t ? '<div class="row"><button class="btn" data-act="sprAgain">Run again with new dates</button></div>' : '') + '</div>', 'page');
    App._spr = { t: t, its: its };
  }
  function sprRead() {
    var o = App._spr, f = function (id) { return document.getElementById(id); };
    Object.keys(o.its).forEach(function (id) {
      var m = f('spm-' + id), tv = f('spt-' + id), bv = f('spb-' + id); if (!m) return;
      var n = function (x) { var v = x.value.trim().replace(',', '.'); return v === '' || isNaN(+v) ? null : +v; };
      o.its[id] = { m: m.value, t: n(tv), b: n(bv) };
    });
    return { name: f('spName').value.trim(), short: f('spShort').value.trim(), from: f('spFrom').value, to: f('spTo').value, color: f('spCol').classList.contains('on') };
  }
  function openSprStats(t) {   // v5.22 sprint stats: tiles, pace per habit, each day, progress lines vs target and baseline
    RC = null;
    var s = t.sprint, D = sprDays(t), H = Object.keys(s.items || {}).map(function (id) { return S.habit(id); }).filter(function (h) { return h && !h.archived; });
    var C = H.map(function (h) { return { h: h, c: sprCalc(t, h) }; });
    var ok = C.filter(function (x) { return x.c.cls === 'g'; }).length, rated = C.filter(function (x) { return x.c.r != null; });
    var vt = rated.filter(function (x) { return !x.c.bad; }), avgT = vt.length ? Math.round(vt.reduce(function (a, x) { return a + Math.min(1.5, x.c.r / (x.c.T || 1)); }, 0) / vt.length * 100) : null;
    var vb = rated.filter(function (x) { return x.c.B; }), avgB = vb.length ? Math.round(vb.reduce(function (a, x) { return a + (x.c.r - x.c.B) / x.c.B * (x.c.bad ? -1 : 1); }, 0) / vb.length * 100) : null;
    var dN = [], dOk = [], perfect = 0, act = 0;
    for (var i = 0; i < D.n; i++) {
      var dt = fromDn(D.a + i), k = S.key(dt), n = 0, g = 0;
      C.forEach(function (x) { var r = x.c.res(k); if (dt < x.c.st || r.s || !scheduled(x.h, dt) || (k === S.today() && r.v == null && !r.ok)) return; n++; if (r.ok) g++; });
      dN.push(n); dOk.push(g); if (n) { act++; if (g === n) perfect++; }
    }
    var tile = function (l, v, cls) { return '<div class="tile"><span>' + l + '</span><b' + (cls ? ' class="' + cls + '"' : '') + '>' + v + '</b></div>'; };
    var tiles = '<div class="tiles">' + tile('On track', ok + '<small> / ' + C.length + '</small>', 'spg') + tile('Overall vs target', avgT == null ? '—' : avgT + '%') +
      tile('vs baseline', avgB == null ? '—' : (avgB > 0 ? '+' : '') + avgB + '%', avgB == null ? '' : avgB >= 0 ? 'spg' : 'spr') + tile('Perfect days', perfect + '<small> / ' + act + '</small>') + '</div>';
    var pace = '<section class="stc"><h4>' + (D.n ? 'Pace to finish' : 'Not started yet') + '</h4>' + C.map(function (x) {
      var c = x.c, v = c.bad ? c.pct : c.pace, w = c.bad ? (c.B ? Math.max(2, Math.min(100, (c.T / Math.max(c.r || 0, 1e-9)) * 100)) : 0) : Math.max(2, Math.min(100, v || 0));
      return '<button class="ovh" data-act="ovOpen" data-id="' + x.h.id + '"><i style="background:' + esc(x.h.color) + '"></i><span class="ovn">' + esc(x.h.name) + '<em>' + esc(c.line) + '</em></span>' +
        '<span class="ovb"><span class="sp' + c.cls + 'b" style="width:' + (v == null ? 0 : w) + '%"></span></span><b class="sp' + c.cls + '">' + (v == null ? '—' : (c.bad && v > 0 ? '+' : '') + v + '%') + '</b></button>';
    }).join('') + '<p class="small muted">Per day and % of days: where you are now against the target. Totals and times: where you’ll finish at this pace. Bad habits: change against baseline (minus is good).</p></section>';
    var W = 320, Hh = 80, bw = W / Math.max(1, D.L), bars = '';
    for (var j = 0; j < D.n; j++) { var v = dN[j] ? dOk[j] / dN[j] : null, hh = v == null ? 0 : Math.max(2, v * (Hh - 4)); if (v != null) bars += '<rect x="' + (j * bw + bw * 0.15).toFixed(1) + '" y="' + (Hh - hh).toFixed(1) + '" width="' + (bw * 0.7).toFixed(1) + '" height="' + hh.toFixed(1) + '" rx="2" class="' + (v === 1 ? 'bf' : 'bp') + '"/>'; }
    var daily = D.n ? '<section class="stc"><h4>Each day · share of sprint habits done</h4><svg class="ovc" viewBox="0 0 ' + W + ' ' + (Hh + 2) + '" preserveAspectRatio="none"><line x1="0" x2="' + W + '" y1="' + Hh / 2 + '" y2="' + Hh / 2 + '" class="gl"/>' + bars + '</svg><div class="ovx"><span>Start</span><span>End</span></div></section>' : '';
    var lines = D.n ? '<section class="stc"><h4>Running total vs target and baseline</h4>' + C.map(function (x) {
      var c = x.c, acc = 0, pts = [], mx = Math.max(c.T || 0, c.B || 0) * D.L || 1;
      for (var i = 0; i < D.n; i++) { var dt = fromDn(D.a + i), r = c.res(S.key(dt)); if (!(dt < c.st || r.s)) acc += c.m === 'day' || c.m === 'total' ? (+r.v || 0) : (c.bad && !c.num ? (r.ok ? 0 : 1) : (r.ok ? 1 : 0)); pts.push(acc); }
      mx = Math.max(mx, acc) || 1;
      var X = function (i) { return (i + 1) / D.L * 300; }, Y = function (v) { return 60 - v / mx * 56; };
      var ln = function (rt, cl) { return rt == null ? '' : '<line x1="0" y1="60" x2="300" y2="' + Y(rt * D.L).toFixed(1) + '" class="' + cl + '"/>'; };
      return '<div class="spc"><span><i style="background:' + esc(x.h.color) + '"></i>' + esc(x.h.name) + '</span><svg viewBox="0 0 300 62" preserveAspectRatio="none">' + ln(c.T, 'spt') + ln(c.B, 'spbl') +
        '<polyline points="0,60 ' + pts.map(function (p, i) { return X(i).toFixed(1) + ',' + Y(p).toFixed(1); }).join(' ') + '" class="spl2" style="stroke:' + esc(x.h.color) + '"/></svg></div>';
    }).join('') + '<p class="small muted">Coloured line = you · dashed green = target · dotted grey = baseline.</p></section>' : '';
    var html = '<div class="ptop"><button class="ib" data-act="close" aria-label="Back">' + ICON.back + '</button><h2>' + esc(t.name) + '</h2><button class="ib" data-act="sprEditOpen" data-tab="' + t.id + '" aria-label="Edit sprint">' + ICON.pen + '</button></div>' +
      '<div class="stats"><p class="stsub">' + esc(sprHead(t)) + '</p>' + (C.length ? tiles + pace + daily + lines : '<p class="muted">No habits in this sprint yet. Hold a habit name, select, then tap the flag.</p>') +
      (sprPhase(t) === 'end' ? '<div class="row"><button class="btn" data-act="sprAgainId" data-tab="' + t.id + '">Run again with new dates</button></div>' : '') + '</div>';
    App._sprSt = t.id;
    if (sheetOpen === 'stats') { sheetOpen = 'sprst'; sheet.innerHTML = html; sheet.className = 'sheet page'; sheet.scrollTop = 0; }
    else showSheet('sprst', html, 'page');
  }
  function openSprList() {
    var sp = S.tabs().filter(isSpr);
    showSheet('sprlist', '<h3>Sprints</h3>' + (sp.length ? sp.map(function (t) {
      return '<button class="mi trow" data-act="sprStatsId" data-tab="' + t.id + '"><span>' + esc(t.name) + '<small class="muted" style="display:block">' + esc(sprHead(t)) + '</small></span></button>'; }).join('')
      : '<p class="small muted">None yet. Hold a tab → New → Sprint.</p>') + '<div class="row end"><button class="btn" data-act="close">Close</button></div>');
  }
  // base: may this habit be on screen at all right now (hidden tab, archive, time window, entered)?
  function base(h, v) {
    var tb = tabOf(h), g = h.parent && S.habit(h.parent), f = S.d.settings;
    if (tb && tb.hidden && !(S.d.ui.showArchTabs && v === tb.id)) return false;   // an archived tab's habits show only while you're in it
    if (v === 'arch') return true;
    if (v === 'done') return !(h.archived || (g && g.archived));
    var s = SH(); return cats(h).every(function (c) { return s[c] || (sel && SELOK[c]); });   // v5.14: the eye drawer's switches decide
  }
  /* ---- v5.14 Show drawer (eye on the bottom bar): which kinds of item are on the list ---- */
  var SHOW = [   // key, group, name, what it is
    ['done', 'Today', 'Done for today', 'Ticked, or target reached'],
    ['skip', 'Today', 'Skipped today', 'Marked as a skip day'],
    ['rest', 'Today', 'Resting today', 'Repeats not due today'],
    ['late', 'Today', 'Running late', 'Still waiting, shown as (due Nd)'],
    ['past', 'By the clock', 'Time’s up', 'Their window has closed today'],
    ['soon', 'By the clock', 'Coming up later', 'Their window hasn’t opened yet'],
    ['gone', 'Put away', 'Missed and gone', 'Let go when their day ended'],
    ['hid', 'Put away', 'Hidden', 'Active habits kept off the list — still counted in Stats'],
    ['arch', 'Put away', 'Archived', 'Retired habits'],
    ['bad', 'Kind', 'Bad habits', 'Habits you are cutting down'],
    ['times', 'Display', 'Time windows', 'The time shown under a habit’s name'],
    ['heads', 'Display', 'Group names', 'Off: sub-habits stay in their card, always open, without the group row']];
  var SHOW_LOOK = { times: 1, heads: 1 };   // v5.30: display switches — not kinds, never hide a habit
  var SHOW_DEF = { done: true, skip: true, rest: false, late: true, past: false, soon: false, gone: false, hid: false, arch: false, bad: true, times: true, heads: true };
  var SELOK = { done: 1, skip: 1, rest: 1, late: 1, gone: 1 };   // in select mode these stay visible
  function SH() {
    var f = S.d.settings;
    if (!f.show) f.show = { done: !f.hideEntered, skip: !f.hideSkipped, rest: f.hideNotDue === false, late: true, past: false, soon: false, gone: false, arch: !f.hideArchived };   // from the old Filter
    if (!f.showPin) f.showPin = ['done', 'late', 'past', 'soon', 'bad'];
    if (f.show.bad === undefined) { f.show.bad = true; if (f.showPin.indexOf('bad') < 0) f.showPin.push('bad'); }   // v5.17
    ['times', 'heads'].forEach(function (k) { if (f.show[k] === undefined) { f.show[k] = true; if (f.showPin.indexOf(k) < 0) f.showPin.push(k); } });   // v5.30
    if (f.show.hid === undefined) { f.show.hid = false; if (f.showPin.indexOf('hid') < 0) f.showPin.push('hid'); }   // v5.18
    return f.show;
  }
  function cats(h) {   // which drawer kinds this habit falls under right now
    var g = h.parent && S.habit(h.parent), c = [], w = winOf(h);
    if (h.archived || (g && g.archived)) c.push('arch');
    else if (h.hid || (g && g.hid)) c.push('hid');
    if (h.kind === 'bad') c.push('bad');
    if (w > 0) c.push('past'); else if (w < 0) c.push('soon');
    if (isRep(h)) { var r = rep(h); if (r.due > 0) c.push('late'); if (!r.show) c.push(r.lastMiss ? 'gone' : 'rest'); }
    if (S.d.settings.skipDays && skippedToday(h)) c.push('skip');
    else if (enteredToday(h)) c.push('done');
    return c;
  }
  // member: does it belong to this view (tab, starred, archived, outside its window)?
  function member(h, v) {
    var g = h.parent && S.habit(h.parent);
    if (v === 'arch') return !!(h.archived || (g && g.archived));
    if (v === 'star') return !!(h.star || (g && g.star));
    if (v === 'done') return doneToday(h);
    if (v === 'all') return tabsMode() === 'off' || !tabOf(h);   // Main = habits with no tab of their own
    var st = sprOf(v); if (st) return sprIn(st, h);
    var tb = tabOf(h); return !!tb && tb.id === v;
  }
  // Habits on screen, in order. A group shows when it belongs itself, or (as context) when one of its sub-habits does.
  function shownList() {
    var v = view(), all = S.habits(), keep = {};
    all.forEach(function (h) {
      if (h.parent && S.habit(h.parent)) return;
      if (!base(h, v)) return;
      var ss = subs(h.id).filter(function (x) { return base(x, v) && member(x, v); });
      if (h.endAll && v !== 'arch' && v !== 'done' && liveSubs(h.id).length && !liveSubs(h.id).some(function (x) { return base(x, v); })) return;   // every sub-habit done / time's up / put away
      if (member(h, v) || ss.length) { if (member(h, v) || v !== 'star' || S.d.settings.starGroups !== false) keep[h.id] = 1; ss.forEach(function (x) { keep[x.id] = 1; }); }
    });
    return all.filter(function (h) { return keep[h.id]; });
  }
  var lastWin = '';
  function winSig() { return S.habits().map(function (h) { return winOf(h); }).join(''); }
  function showCounts(v) {   // per kind, among this view's habits; plus how many are hidden now
    var s = SH(), n = { hid: 0 };
    S.habits().forEach(function (h) {
      var tb = tabOf(h); if (isGroup(h) || (tb && tb.hidden) || !member(h, v)) return;
      var c = cats(h); c.forEach(function (k) { n[k] = (n[k] || 0) + 1; });
      if (v !== 'arch' && c.some(function (k) { return !s[k]; })) n.hid++;
    });
    return n;
  }
  var shwEdit = false;
  function drawShow() {
    var s = SH(), f = S.d.settings, u = S.d.ui, full = shwEdit || u.showFull, dsc = u.showDesc === true, pin = f.showPin, n = showCounts(view()), g = '', h = '';
    SHOW.forEach(function (x) {
      var k = x[0]; if (k === 'skip' && !f.skipDays) return;
      if (!full && pin.indexOf(k) < 0) return;
      if (full && x[1] !== g) { g = x[1]; h += '<div class="shg">' + g + '</div>'; }
      var p = pin.indexOf(k) >= 0, ct = SHOW_LOOK[k] ? '<em class="shc"></em>' : '<em class="shc">' + (n[k] || 0) + '</em>';
      h += shwEdit
        ? '<button class="mi shr" data-act="shwPin" data-k="' + k + '"><span class="box' + (p ? ' on' : '') + '">' + (p ? ICON.check : '') + '</span><span class="tx"><b>' + x[2] + '</b>' + (dsc ? '<small>' + x[3] + '</small>' : '') + '</span>' + ct + '</button>'
        : '<button class="mi shr" data-act="shwT" data-k="' + k + '" aria-pressed="' + !!s[k] + '"><span class="tx"><b>' + x[2] + '</b>' + (dsc ? '<small>' + x[3] + '</small>' : '') + '</span>' + ct + '<i class="tgl' + (s[k] ? ' on' : '') + '"></i></button>';
    });
    if (!h) h = '<p class="small muted shn">Tap the pen to pick the switches you want here.</p>';
    var html = '<div class="shh"><b>' + (shwEdit ? 'Pick your short list' : 'What’s on your list') + '</b>' +
      (shwEdit ? '' : '<a href="#" data-act="shwFull">' + (u.showFull ? 'Short' : 'See all') + '</a>') +
      '<button class="dtl" data-act="shwDesc" aria-pressed="' + dsc + '"><i class="tgl' + (dsc ? ' on' : '') + '"></i>Notes</button>' +
      '<button class="ib' + (shwEdit ? ' lit' : '') + '" data-act="shwPen" aria-label="' + (shwEdit ? 'Done' : 'Choose short list') + '">' + (shwEdit ? ICON.check : ICON.pen) + '</button></div>' +
      '<div class="shs">' + (shwEdit ? 'Checked items show when you tap the eye' : n.hid ? n.hid + ' tucked away' : 'Everything showing') + '</div>' + h +
      (shwEdit ? '' : '<div class="shf"><a href="#" data-act="shwAll">Show everything</a><a href="#" class="muted" data-act="shwUsual">Back to my usual</a></div>');
    if (sheetOpen === 'show') { sheet.innerHTML = html; } else showSheet('show', html, 'shw');
    var rb = root.querySelector('.rib'); sheet.style.bottom = rb ? Math.max(0, innerHeight - rb.getBoundingClientRect().top) + 'px' : '';
    document.body.classList.add('shw');
  }

  var App = {
    render: function (resetScroll) {
      var sc = document.getElementById('sc'), keep = sc && !resetScroll ? { l: sc.scrollLeft, t: sc.scrollTop } : null;
      RC = null;
      var days = S.days(NDAYS), all = S.habits(), list = shownList(), v = view(), mode = tabsMode(), f = S.d.settings, spT = sprOf(v);
      SPT = spT;
      if (sel) Object.keys(sel).forEach(function (id) { if (!S.habit(id)) delete sel[id]; });
      var head = '<div class="drow"><div class="nm"></div>' + days.map(function (d, i) {
        return '<div class="dh' + (i === 0 ? ' tdy' : '') + '"><span>' + WD[d.dt.getDay()].toUpperCase() + '</span><b>' + d.dt.getDate() + '</b></div>';
      }).join('') + '</div>';
      // Top-level habits in order; each group card holds its parent row and (unless folded) its sub-habits.
      var shown = {}; list.forEach(function (h) { shown[h.id] = 1; });
      var rowHtml = function (h, cls, grp) {
        var wt = SH().times !== false && winOwn(h) && winTxt(h), cx = grp && ctxGrp(h), sl = spT && sprLine(spT, h), scol = sl && spT.sprint.color !== false && sl.cls !== 'n' ? SPC[sl.cls] : null;
        if (cx) { grp = false; cls += ' ctx'; }
        return '<div class="hrow' + cls + (sel && sel[h.id] ? ' sel' : '') + (h.archived ? ' arch' : '') + (scol ? ' spx sp' + sl.cls + 'x' : '') + '" data-row="' + h.id + '">' +
          '<div class="nm" data-act="edit" data-id="' + h.id + '"><div class="nmi">' +
          (grp ? '<svg class="chev' + (folded(h.id) ? '' : ' open') + '" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>' : cls.indexOf(' sub') < 0 ? '<i class="chev"></i>' : '') +
          '<span class="hx" style="color:' + esc(scol || h.color) + '"><b class="hn">' + esc(h.name) + dueTag(h) + '</b>' + (h.subt ? '<small class="sbt">' + esc(h.subt) + '</small>' : '') + (bookOn(h) && h.book.showT && h.book.title ? '<small class="sbt">' + esc(h.book.title) + (h.book.au ? ' — ' + esc(h.book.au) : '') + '</small>' : '') + qTxt(h) + (wt ? '<small class="wt">' + esc(wt) + '</small>' : '') + (sl ? sl.html : '') + '</span>' +
          (h.star && v !== 'star' ? '<svg class="st" viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>' : '') +
          (grp && folded(h.id) ? '<em>' + liveSubs(h.id).length + '</em>' : '') + '</div></div>' +
          days.map(function (d) { return anyCell(h, d); }).join('') + '</div>';
      };
      var card = function (h) {
        var grp = isGroup(h), noHd = grp && SH().heads === false, ss = grp && (noHd || !folded(h.id)) ? subs(h.id).filter(function (x) { return shown[x.id]; }) : [];
        if (v === 'star') ss.sort(byStar);
        if (noHd) return ss.length ? '<div class="grp isgrp nohd" data-grp="' + h.id + '">' +   // v5.30 "Group names" off: same card, no group row, always open
          ss.map(function (x, i) { return rowHtml(x, ' sub' + (i === 0 ? ' rt' : '') + (i === ss.length - 1 ? ' rb' : ''), false); }).join('') + '</div>' : '';
        return '<div class="grp' + (grp ? ' isgrp' : '') + '" data-grp="' + h.id + '">' +
          rowHtml(h, ' gtop rt' + (ss.length ? '' : ' rb'), grp) +
          ss.map(function (x, i) { return rowHtml(x, ' sub' + (i === ss.length - 1 ? ' rb' : ''), false); }).join('') + '</div>';
      };
      var tops = list.filter(function (h) { return !h.parent || !S.habit(h.parent) || !shown[h.parent]; }), rows;
      if (v === 'star') tops.sort(byStar);
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
      var n = sel ? Object.keys(sel).length : 0;
      var bar, logo = '<button class="logo" data-act="home" aria-label="Main"><img src="icons/icon-192.png" alt=""></button>';
      // v5.5 tab strip: Main first, full name on the open tab, short name on the others; side-scrolls
      // Full names; fitChips() swaps inactive tabs to their short names only when the strip runs out of room
      var chips = '<div class="chips' + (tp ? ' editing' : '') + '" id="chips">' + [{ id: 'all', name: 'Main' }].concat(stripTabs()).map(function (t) {
          return '<button class="tchip' + (v === t.id ? ' on' : '') + (t.hidden ? ' arch' : '') + (t.sprint ? ' spr' : '') + (tp && tp.id === t.id ? ' tsel' : '') + '" data-act="goTab" data-tab="' + t.id + '" data-full="' + esc(t.name) + '" data-short="' + esc(t.short || t.name) + '">' + esc(t.name) + '</button>';
        }).join('') + '</div>';   // new tabs: hold any tab → panel → New
      var tpan = tp && mode !== 'off' ? tabPanel() : '';
      var gOn = f.starGroups !== false;
      var vbar = spT ? '<div class="vbar spv"><span>' + esc(sprHead(spT)) + '</span><button class="flip" data-act="sprEditOpen" data-tab="' + spT.id + '">Targets ' + ICON.pen + '</button></div>' : v === 'star' ? '<div class="vbar"><span>' + (mode === 'top' ? 'Starred' : '') + '</span><button class="flip" data-act="flipGroups" aria-pressed="' + gOn + '">Show groups<i class="tgl' + (gOn ? ' on' : '') + '"></i></button></div>'
        : mode === 'top' && VIEW_NAME[v] && v !== 'all' ? '<div class="vlabel">' + VIEW_NAME[v] + '</div>' : '';
      if (sel) bar = '<header class="top selbar"><button class="ib" data-act="selDone" aria-label="Done">' + ICON.back + '</button><h1>' + n + '</h1>' +
        (n === 1 ? '<button class="ib" data-act="selEdit" aria-label="Edit">' + ICON.pen + '</button>' : '') +
        '<button class="ib' + (allStarred() ? ' lit' : '') + '" data-act="selStar" aria-label="' + (allStarred() ? 'Unstar' : 'Star') + '"' + (n ? '' : ' disabled') + '>' + (allStarred() ? ICON.starOn : ICON.star) + '</button>' +
        (S.d.settings.skipDays ? '<button class="ib' + (allSkipped() ? ' lit' : '') + '" data-act="selSkip" aria-label="' + (allSkipped() ? 'Unskip today' : 'Skip today') + '"' + (n ? '' : ' disabled') + '>' + ICON.skip + '</button>' : '') +
        '<button class="ib" data-act="sprAddOpen" aria-label="Add to sprint"' + (n ? '' : ' disabled') + '>' + ICON.flag + '</button>' +
        '<button class="ib" data-act="selHide" aria-label=""' + (allHidden() ? 'Unhide' : 'Hide') + '"' + (n ? '' : ' disabled') + '>' + (allHidden() ? ICON.unhide : ICON.hide) + '</button>' +
        '<button class="ib" data-act="selArchive" aria-label="' + (allArchived() ? 'Unarchive' : 'Archive') + '"' + (n ? '' : ' disabled') + '>' + (allArchived() ? ICON.unarchive : ICON.archive) + '</button>' +
        '<button class="ib" data-act="selDelete" aria-label="Delete"' + (n ? '' : ' disabled') + '>' + ICON.bin + '</button>' +
        '<button class="ib" data-act="selMore" aria-label="More"' + (n ? '' : ' disabled') + '>' + ICON.more + '</button></header>';
      else if (mode === 'top') bar = '<header class="top tstrip">' + logo + chips + syncBtn() + '<button class="ib" data-act="settings" aria-label="Settings">' + ICON.gear + '</button></header>' + tpan + vbar;
      else bar = '<header class="top">' + logo + '<h1>' + esc(v === 'all' && mode === 'off' ? 'Habits' : VIEW_NAME[v] || S.tab(v).name) + '</h1>' +
        '<button class="ib" data-act="add" aria-label="Add habit">' + ICON.plus + '</button>' +
        syncBtn() + '<button class="ib" data-act="settings" aria-label="Settings">' + ICON.gear + '</button></header>' + vbar;
      var shc = showCounts(v), tabV = !VIEW_NAME[v] || v === 'all';
      var rb = function (act, icon, label, on, extra) { return '<button class="rbtn' + (on ? ' on' : '') + '" data-act="' + act + '" aria-label="' + label + '">' + icon + '<span>' + label + '</span>' + (extra || '') + '</button>'; };
      var ribbon = (mode === 'bottom' && !sel ? tpan + '<div class="bstrip">' + chips + '</div>' : '') + '<nav class="rib">' +
        rb('starToggle', v === 'star' ? ICON.starOn : ICON.star, 'Starred', v === 'star') +
        rb('doneToggle', ICON.doneDay, 'Done', v === 'done') +
        rb('shw', ICON.eye, 'Show', sheetOpen === 'show', shc.hid ? '<i class="bdg hid">' + shc.hid + '</i>' : '') +
        (mode === 'top' ? rb('add', ICON.plus, 'Add', false) : '') +
        rb('overview', ICON.chart, 'Stats', sheetOpen === 'ov' || sheetOpen === 'sprst') +
        (all.some(isGroup) ? '<button class="rbtn ionly" data-act="foldCycle" aria-label="' + { open: 'All groups expanded', shut: 'All groups collapsed', man: 'Groups as set in Edit' }[foldMode()] + '">' +
          { open: ICON.fOpen, shut: ICON.fShut, man: ICON.fMan }[foldMode()] + '</button>' : '') +
        rb('weight', ICON.scale, 'Weight', false) + '</nav>';
      var empty = {
        star: 'No starred habits yet. Hold a habit’s name, then tap ☆.',
        done: 'Nothing done yet today.',
        arch: 'No archived habits.',
      }[v];
      var nd = !list.length && !SH().rest ? shc.rest || 0 : 0;
      var demoBar = S.demo ? '<div class="demobar"><span>Demo data · your own habits are safe</span><button class="btn sm" data-act="demoOff">Exit demo</button></div>' : '';
      root.innerHTML = bar + demoBar +
        (list.length ? '<div class="sc" id="sc"><div class="grid" id="grid">' + head + rows + '</div><div class="swp" id="swp"></div></div>'
          : empty ? '<div class="empty"><p>' + empty + '</p></div>'
          : all.length ? '<div class="empty"><p>' + (nd ? 'Nothing due today here.' : shc.hid ? 'All done for now.' : 'Nothing to show here.') + '</p>' + (shc.hid ? '<p class="small">' + shc.hid + ' tucked away — the eye below shows them.</p>' : '') + '<button class="btn" data-act="' + (tabV ? 'add' : 'shw') + '">' + (tabV ? 'Add a habit to this tab' : 'What’s on your list') + '</button></div>'
          : '<div class="empty"><p>No habits yet.</p><button class="btn pri" data-act="add">Add your first habit</button><button class="btn" data-act="starters">Start from examples</button><button class="btn" data-act="demoOn">Try demo data</button></div>') + ribbon;
      SPT = null;
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
      if (sheetOpen === 'show') drawShow();
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
    return h.type === 'yn' ? !!v : met(h, v, S.today());   // measurable leaves only once today's target is met
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
  // v5.18: a Hidden (still active) habit with history must be archived before it can be deleted
  function lockedDel(id) { var h = S.habit(id); if (!h || h.archived || !h.hid) return false; return S.countEntries(id) > 0 || subs(id).some(function (x) { return !x.archived && S.countEntries(x.id) > 0; }); }
  function allHidden() { var ids = sel ? Object.keys(sel) : []; return ids.length > 0 && ids.every(function (id) { var h = S.habit(id); return h && h.hid; }); }
  // v5.20: Skip today for many at once from the select bar. A group stands for its live sub-habits; habits already done today are left alone.
  function skipTargets() { var o = []; Object.keys(sel || {}).forEach(function (id) { var h = S.habit(id); if (!h) return; (isGroup(h) ? liveSubs(id) : [h]).forEach(function (x) { if (o.indexOf(x) < 0) o.push(x); }); }); return o; }
  function allSkipped() { var t = S.today(), o = skipTargets(); return o.length > 0 && o.every(function (h) { return S.skipped(h.id, t); }); }
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
  function hideSheet() { if (sheetOpen === 'show') { shwEdit = false; sheet.style.bottom = ''; document.body.classList.remove('shw'); App.render(); } sheetOpen = null; sheet.hidden = true; scrim.hidden = true; }
  function closeSheet(then) { if (then) after.push(then); if (!sheetOpen) return flush(); if (!closing) { closing = true; history.back(); } }
  function flush() { var q = after; after = []; q.forEach(function (f) { f(); }); }
  window.addEventListener('popstate', function () {
    var wasW = !closing && (sheetOpen === 'wlog' || sheetOpen === 'wset');
    var wasB = !closing && (sheetOpen === 'blog' || sheetOpen === 'bfin');
    if (wasB) { closing = false; hideSheet(); flush(); return openStats(stId); }   // phone Back on a weight dialog → back to the Weight screen
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
    var bk = bookOn(h) && k >= h.book.a, X = bk ? Math.min(h.book.total, h.book.p0 + bookBefore(h, k)) : 0, need = bk ? bookNeed(h, k) : 0, vals = null, lab = null;
    if (bk) { st = need || h.step || 1; vals = []; for (var p = X; p <= h.book.total; p++) vals.push(p - X); lab = function (x) { return X + x; }; }
    else if (h.pick) { vals = []; var top = Math.max(st * 40, (h.target || 0) * 3, v || 0); for (var q = 0; q <= top + 1e-9; q += st) vals.push(num(q)); if (v != null && vals.indexOf(v) < 0) { vals.push(v); vals.sort(function (x, y) { return x - y; }); } lab = function (x) { return num(x); }; }
    var v0 = v == null ? (bk ? Math.min(st, h.book.total - X) : st) : v;
    showSheet('num',
      '<h3 style="color:' + esc(h.color) + '">' + esc(h.name) + '</h3>' +
      '<p class="small muted">' + WD[dt.getDay()] + ' ' + dt.getDate() + ' ' + dt.toLocaleString('en', { month: 'short' }) +
      ' · target ' + (bk && h.book.end ? (need ? need + ' ' + esc(h.unit || 'pages') + ' (pace to finish by ' + fmtK(h.book.end) + ')' : 'book finished') : (h.tt === 'max' ? 'at most ' : 'at least ') + num(h.target) + ' ' + esc(h.unit)) + '</p>' +
      '<div class="numrow"><button class="btn step" data-act="numStep" data-d="' + (-st) + '" aria-label="Minus ' + num(st) + '">−</button>' +
      '<input id="numIn" inputmode="decimal" enterkeyhint="done" autocomplete="off" value="' + num(v0) + '" placeholder="0">' +
      '<button class="btn step" data-act="numStep" data-d="' + st + '" aria-label="Plus ' + num(st) + '">+</button></div>' +
      (bk ? '<p class="bkp" id="bkp"></p>' : '') +
      (vals ? '<div class="pkw"><div class="pk" id="pk">' + vals.map(function (x, i) { return '<button class="pc" data-i="' + i + '">' + lab(x) + '</button>'; }).join('') + '</div></div>' : '') +
      '<div class="row end"><button class="btn" data-act="numClear">Clear</button>' + (S.d.settings.skipDays ? '<button class="btn" data-act="numSkip">Skip</button>' : '') + '<span class="grow"></span><button class="btn" data-act="close">Cancel</button><button class="btn pri" data-act="numOk">OK</button></div>', 'attop');
    var inp = document.getElementById('numIn');   // no keyboard until he taps the number
    inp.addEventListener('focus', function () { inp.select(); });
    App._numSync = null;
    if (vals) {   // v5.24 sideways number picker: the circle in the middle is the value; typing or ± moves it
      var pk = document.getElementById('pk'), bkp = document.getElementById('bkp'), quiet = false, tmr = null, onI = -1;
      var near = function (x) { var bi = 0; vals.forEach(function (y, i) { if (Math.abs(y - x) < Math.abs(vals[bi] - x)) bi = i; }); return bi; };
      var hi = function (i, scroll) {
        if (onI >= 0 && pk.children[onI]) pk.children[onI].classList.remove('on'); onI = i; var c = pk.children[i]; if (!c) return; c.classList.add('on');
        if (scroll) { quiet = true; pk.scrollLeft = c.offsetLeft - (pk.clientWidth - c.offsetWidth) / 2; requestAnimationFrame(function () { requestAnimationFrame(function () { quiet = false; }); }); }
      };
      var showP = function () { if (!bkp) return; var x = parseFloat((inp.value || '0').replace(',', '.')) || 0; bkp.innerHTML = 'p. ' + X + ' → <b>' + Math.min(h.book.total, X + x) + '</b> of ' + h.book.total; };
      App._numSync = function () { showP(); hi(near(parseFloat((inp.value || '0').replace(',', '.')) || 0), true); };
      var raf = 0;   // v5.26: the gold disc is fixed in the middle (CSS); numbers slide under it and the value follows live, no settle delay
      pk.addEventListener('scroll', function () {
        if (quiet || raf) return;
        raf = requestAnimationFrame(function () {
          raf = 0; var mid = pk.scrollLeft + pk.clientWidth / 2, bi = 0, bd = 1e9;
          Array.prototype.forEach.call(pk.children, function (c, i) { var d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < bd) { bd = d; bi = i; } });
          if (bi !== onI) { inp.value = num(vals[bi]); hi(bi, false); showP(); }
        });
      }, { passive: true });
      pk.addEventListener('click', function (e) { var c = e.target.closest('.pc'); if (!c) return; inp.value = num(vals[+c.dataset.i]); App._numSync(); });
      inp.addEventListener('input', function () { App._numSync(); });
      requestAnimationFrame(App._numSync);
    }
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
    // v5.30: marking only toggles tick <-> empty (a skipped day clears to empty); skip from the select bar or the number box
    if (S.skipped(h.id, k) || S.val(h.id, k)) S.setVal(h.id, k, null);
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
      becomeGroup(g); h.parent = g.id; S.putHabit(h);
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
    if (view() === 'star') { S.d.settings.starOrd = ids.concat((S.d.settings.starOrd || []).filter(function (id) { return ids.indexOf(id) < 0 && S.habit(id); })); S.save(); return App.render(); }   // own order, real order untouched
    S.reorder(ids); App.render();
  }

  /* ---- v7 Stats page: tap a habit's name (groups: chart button in Edit). Pen opens Edit; Edit's back/Save return here. ---- */
  var stId = null, stMon = 0;
  function startOf(h) {   // creation time from the id, or the first entry, whichever is earlier
    var ids = [h.id].concat(isGroup(h) ? liveSubs(h.id).map(function (x) { return x.id; }) : []), t = S.todayDate(), best = t;
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
        var v = S.val(x.id, k), did = v != null && (x.type === 'yn' ? !!v : (bad ? !met(x, v, k) : met(x, v, k))), good = bad ? !did : did;
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
  function qCard(h, r) {
    var w = r.wk, u = r.tot ? (h.unit ? ' ' + esc(h.unit) : '') : ' days';
    return '<section class="stc"><h4>Each week</h4><div class="tiles t3">' + [['Goal met', r.on], ['Missed', r.ms], ['This week', num(w.got) + ' / ' + num(w.need)]].map(function (x) {
        return '<div class="tile"><span>' + x[0] + '</span><b>' + x[1] + '</b></div>'; }).join('') + '</div>' +
      '<p class="small muted" style="margin:8px 0 0">Goal: ' + (r.tot ? num(r.need) + u + ' a week' : 'at least ' + r.need + u + ' a week') + ', week starting ' + WD[wsOf(fq(h))] + '. ' +
      (w.met ? 'Done for this week.' : w.miss ? 'This week can’t reach the goal any more.' : r.next != null && !r.open ? 'Next on ' + dayTxt(r.next) + '.' : '') + '</p></section>';
  }
  function dayRes(h) {   // k -> {v, s (skipped), ok}; bad habits: ok = clean; repeats: a late tick counts on its due day
    var grp = isGroup(h), bad = !grp && h.kind === 'bad';
    var res = grp ? function (k) { var r = groupRes(h, k); return { v: h.agg && h.agg.t === 'sum' ? r.sum : r.done, ok: r.ok, s: r.total === 0 && liveSubs(h.id).length > 0 }; }
      : function (k) { var v = S.val(h.id, k), sk = S.skipped(h.id, k), did = v != null && (h.type === 'yn' ? !!v : (bad ? !met(h, v, k) : met(h, v, k)));
          return { v: v, s: sk, ok: bad ? !did : did }; };
    var rr = rep(h);
    if (rr && !bad) { var r0 = res; res = function (k) { var x = r0(k), n = kDn(k); if (rr.late[n] != null) x.ok = false; if (rr.ok[n]) x.ok = true; return x; }; }   // a late tick counts on its due day
    return res;
  }
  function openStats(id, keepMonth) {
    RC = null;
    var h = S.habit(id); if (!h) return;
    if (stId !== id || !keepMonth) stMon = 0; stId = id;
    var grp = isGroup(h), bad = !grp && h.kind === 'bad', numT = grp ? h.agg && h.agg.t === 'sum' : h.type === 'num';
    var res = dayRes(h), rr = rep(h);
    var sub = grp ? (h.agg && h.agg.t === 'sum' ? 'Group · sum' + (h.target ? ', target ' + num(h.target) + (h.unit ? ' ' + esc(h.unit) : '') : '') : (aggOf(h).n ? 'Group · done when ' + Math.min(aggOf(h).n, liveSubs(h.id).length) + ' of ' + liveSubs(h.id).length + ' are done' : 'Group · done when all ' + liveSubs(h.id).length + ' are done'))
      : (bad ? 'Bad habit · ' : '') + (bookOn(h) ? 'Book · ' : '') + (h.type === 'num' ? (h.tt === 'max' ? 'at most ' : 'at least ') + num(h.target) + (h.unit ? ' ' + esc(h.unit) : '') + ' · ' : '') + freqTxt(h);
    var html = '<div class="ptop"><button class="ib" data-act="close" aria-label="Back">' + ICON.back + '</button><h2 class="sth"><i style="background:' + esc(h.color) + '"></i>' + esc(h.name) + '</h2>' +
      '<button class="ib" data-act="statEdit" aria-label="Edit">' + ICON.pen + '</button></div>' +
      '<div class="stats"><p class="stsub">' + sub + '</p>' +
      Stats.build({ h: rr && rr.q ? { id: h.id, freq: { t: 'week', n: rr.tot ? 1 : rr.need, wt: rr.tot ? rr.need : 0 } } : h, res: res, sched: rr && rr.q ? rr.pick : function (dt) { return scheduled(h, dt); }, start: startOf(h), today: S.todayDate(), ws: rr && rr.q ? wsOf(fq(h)) : S.d.settings.weekStart || 0,
        bad: bad, num: numT, unit: grp ? h.unit : h.unit, target: numT ? h.target : 0, dayT: bookOn(h) && h.book.end ? function (k) { return k >= h.book.a ? bookNeed(h, k) : h.target || 0; } : null, color: h.color, mon: stMon, extra: (bookOn(h) ? bookCard(h) : bookLogBtn(h)) + (grp ? subRates(h) : '') + (rr && !bad ? (rr.q ? qCard(h, rr) : repCard(rr)) : '') }) + '</div>';
    if (sheetOpen === 'stats' || sheetOpen === 'edit' || sheetOpen === 'sprst' || sheetOpen === 'blog' || sheetOpen === 'bfin') { sheetOpen = 'stats'; sheet.innerHTML = html; sheet.className = 'sheet page'; if (!keepMonth) sheet.scrollTop = 0; }
    else showSheet('stats', html, 'page');
  }

  /* ---- v5.15 Stats overview (bottom-bar Stats): every active top-level habit together, this app only.
     A day counts for a habit when it is scheduled, not skipped and after the habit started; today counts only once done.
     N-a-week / N-a-month habits are judged per period (done ÷ N × periods) and kept out of the daily chart. ---- */
  var ovR = 30, ovFrom = false;
  function openOverview(again) {
    var R = ovR, t = S.todayDate(), tk = S.today(), ws = S.d.settings.weekStart || 0;
    var H = S.habits().filter(function (h) { return !h.parent && !h.archived; });
    var dN = [], dOk = [], rows = [], tdyN = 0, tdyOk = 0, cN = 0, cOk = 0, pN = 0, pOk = 0, bestS = 0, bestH = null;
    for (var i = 0; i < R; i++) { dN.push(0); dOk.push(0); }
    H.forEach(function (h) {
      var res = dayRes(h), st = startOf(h), f = fq(h), per = f.t === 'week' || f.t === 'month', bad = !isGroup(h) && h.kind === 'bad';
      var a = [0, 0], b = [0, 0], streak = 0, open = true;
      for (var i = 0; i < 2 * R; i++) {
        var dt = new Date(t); dt.setDate(t.getDate() - i); if (dt < st) break;
        var k = S.key(dt), r = res(k); if (r.s) continue;
        if (per) { if (r.ok && !bad) (i < R ? a : b)[1]++; continue; }
        if (!scheduled(h, dt)) continue;
        if (k === tk && !bad) { tdyN++; if (r.ok) tdyOk++; }
        if (k === tk && !r.ok) continue;
        var x = i < R ? a : b; x[0]++; if (r.ok) x[1]++;
        if (i < R) { dN[i]++; if (r.ok) dOk[i]++; }
        if (open) { if (r.ok) streak++; else open = false; }
      }
      if (per) { var n = Math.max(1, f.n || 1), w = f.t === 'week' ? R / 7 : R / 30; a[0] = Math.max(1, Math.round(n * w)); b[0] = a[0]; a[1] = Math.min(a[1], a[0]); b[1] = Math.min(b[1], b[0]); streak = null; }
      cN += a[0]; cOk += a[1]; pN += b[0]; pOk += b[1];
      if (streak > bestS) { bestS = streak; bestH = h; }
      if (a[0]) rows.push({ h: h, r: a[1] / a[0], p: b[0] ? b[1] / b[0] : null, s: streak, bad: bad, per: per, a: a });
    });
    var pct = function (v) { return Math.round(v * 100) + '%'; };
    var cur = cN ? cOk / cN : 0, prev = pN ? pOk / pN : null, dl = prev == null ? null : Math.round((cur - prev) * 100);
    var perfect = 0, act = 0; dN.forEach(function (n, i) { if (n) { act++; if (dOk[i] === n) perfect++; } });
    var tile = function (l, v, e, cls) { return '<div class="tile"><span>' + l + '</span><b' + (cls ? ' class="' + cls + '"' : '') + '>' + v + '</b>' + (e ? '<em>' + e + '</em>' : '') + '</div>'; };
    var tiles = '<div class="tiles">' +
      tile('Done today', tdyN ? tdyOk + '<small> / ' + tdyN + '</small>' : '—', tdyN ? (tdyOk === tdyN ? 'All done' : (tdyN - tdyOk) + ' to go') : 'Nothing due') +
      tile('On track · ' + R + ' days', cN ? pct(cur) : '—', dl == null ? '' : (dl > 0 ? '+' : '') + dl + ' pts vs the ' + R + ' days before', dl == null ? '' : dl > 0 ? 'up' : dl < 0 ? 'down' : '') +
      tile('Perfect days', perfect + '<small> / ' + act + '</small>', 'Every due habit done') +
      tile('Best run now', bestS ? bestS + '<small> in a row</small>' : '—', bestH ? esc(bestH.name) : '') + '</div>';
    /* daily bars, oldest left */
    var W = 320, Hh = 90, bw = W / R, bars = '';
    for (var j = R - 1; j >= 0; j--) {
      var x0 = (R - 1 - j) * bw, v = dN[j] ? dOk[j] / dN[j] : null, hh = v == null ? 0 : Math.max(2, v * (Hh - 4));
      bars += v == null ? '' : '<rect x="' + (x0 + bw * 0.15).toFixed(1) + '" y="' + (Hh - hh).toFixed(1) + '" width="' + (bw * 0.7).toFixed(1) + '" height="' + hh.toFixed(1) + '" rx="' + Math.min(3, bw * 0.3).toFixed(1) + '" class="' + (v === 1 ? 'bf' : 'bp') + '"/>';
    }
    var chart = '<section class="stc"><h4>Each day · share of due habits done</h4><svg class="ovc" viewBox="0 0 ' + W + ' ' + (Hh + 2) + '" preserveAspectRatio="none">' +
      '<line x1="0" x2="' + W + '" y1="' + (Hh / 2) + '" y2="' + (Hh / 2) + '" class="gl"/>' + bars + '</svg>' +
      '<div class="ovx"><span>' + R + ' days ago</span><span>Today</span></div></section>';
    /* weekday pattern */
    var wd = [0, 0, 0, 0, 0, 0, 0].map(function () { return [0, 0]; }), WDN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dN.forEach(function (n, i) { if (!n) return; var dt = new Date(t); dt.setDate(t.getDate() - i); wd[dt.getDay()][0] += n; wd[dt.getDay()][1] += dOk[i]; });
    var wrows = [0, 1, 2, 3, 4, 5, 6].map(function (q) { var d = (ws + q) % 7, x = wd[d], r = x[0] ? x[1] / x[0] : null;
      return '<div class="ovw"><span>' + WDN[d] + '</span><div class="mvt"><div class="mvb ' + (r == null ? '' : r >= cur ? 'cur' : 'old') + '" style="width:' + (r == null ? 0 : Math.max(2, r * 100)) + '%"></div></div><b>' + (r == null ? '—' : pct(r)) + '</b></div>'; }).join('');
    var week = '<section class="stc"><h4>By weekday</h4>' + wrows + '</section>';
    /* each habit, best first */
    rows.sort(function (x, y) { return y.r - x.r; });
    var hrow = function (o) {
      var d = o.p == null ? '' : Math.round((o.r - o.p) * 100), h = o.h;
      return '<button class="ovh" data-act="ovOpen" data-id="' + h.id + '"><i style="background:' + esc(h.color) + '"></i><span class="ovn">' + esc(h.name) +
        '<em>' + (o.per ? o.a[1] + ' of ' + o.a[0] + ' times' : o.bad ? 'clean days' : '') + (o.s ? (o.per || o.bad ? ' · ' : '') + o.s + ' in a row' : '') + '</em></span>' +
        '<span class="ovb"><span style="width:' + Math.max(2, o.r * 100) + '%;background:' + esc(h.color) + '"></span></span>' +
        '<b>' + pct(o.r) + (d === '' || d === 0 ? '' : '<em class="' + (d > 0 ? 'up' : 'down') + '">' + (d > 0 ? '▲' : '▼') + Math.abs(d) + '</em>') + '</b></button>';
    };
    var good = rows.filter(function (o) { return !o.bad; }), badR = rows.filter(function (o) { return o.bad; });
    var list = (good.length ? '<section class="stc"><h4>Each habit · last ' + R + ' days</h4>' + good.map(hrow).join('') + '</section>' : '') +
      (badR.length ? '<section class="stc"><h4>Bad habits · clean days</h4>' + badR.map(hrow).join('') + '</section>' : '');
    var html = '<div class="ptop"><button class="ib" data-act="close" aria-label="Back">' + ICON.back + '</button><h2>Stats</h2></div>' +
      '<div class="stats"><div class="seg">' + [[7, '7 days'], [30, '30 days'], [90, '90 days']].map(function (o) {
        return '<button class="' + (R === o[0] ? 'on' : '') + '" data-act="ovRange" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div>' +
      (H.length ? tiles + chart + list + week + '<p class="small muted">Tap a habit for its own stats. ▲▼ = change in points against the ' + R + ' days before.</p>'
        : '<p class="muted">No habits yet.</p>') + '</div>';
    if (again && sheetOpen === 'ov') { var y = sheet.scrollTop; sheet.innerHTML = html; sheet.scrollTop = y; }
    else if (sheetOpen === 'stats') { sheetOpen = 'ov'; sheet.innerHTML = html; sheet.className = 'sheet page'; sheet.scrollTop = 0; }
    else showSheet('ov', html, 'page');
    App.render();
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
    wDlg('wlog', '<h3>' + (e ? 'Edit reading' : 'Log weight') + '</h3><div class="two wdt"><label class="fl">Day<input type="date" id="wDate" value="' + (e ? e.d : tk) + '" max="' + tk + '"></label>' +
      '<label class="fl">Time' + timePick('wTime', e && e.t ? e.t : nowHM(), 1) + '</label></div>' +
      '<div class="numrow" style="margin-top:12px"><button class="btn step" data-act="wStep" data-d="-0.1" aria-label="Minus 0.1">−</button>' +
      '<input id="wIn" inputmode="numeric" enterkeyhint="done" autocomplete="off" value="' + (e ? kg(e.v) : last ? kg(last.v) : '') + '" placeholder="kg">' +
      '<button class="btn step" data-act="wStep" data-d="0.1" aria-label="Plus 0.1">+</button></div><p class="small muted" style="margin-top:6px">In kg. Just type the digits — the point goes in by itself: 7845 → 78.45, 10230 → 102.30.</p>' +
      '<div class="row end">' + (e ? '<button class="btn danger-o" data-act="wDel">Delete</button><span class="grow"></span>' : '') + '<button class="btn" data-act="close">Cancel</button><button class="btn pri" data-act="wSave">Save</button></div>');
    var inp = document.getElementById('wIn'); inp.addEventListener('focus', function () { inp.select(); }); autoDec(inp);
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
  /* Weight typed as digits only: the last two digits are the decimals, so the point never has to be typed and
     any weight works (8.50, 78.45, 102.30). A typed '.' or ',' is still respected as normal. */
  function autoDec(inp) {
    inp.addEventListener('input', function (ev) {
      if ((ev.data === '.' || ev.data === ',') && !inp._man) {          // he typed a point himself: the digits so far become the whole kg, then leave his typing alone
        inp._man = true; var w = inp.value.slice(0, -1).replace(/\D/g, '').replace(/^0+(?=\d)/, ''); inp.value = (w || '0') + '.'; return;
      }
      if (inp._man) return; var v = inp.value;
      var d = v.replace(/\D/g, '').replace(/^0+(?=\d)/, ''); if (!d) { inp.value = ''; return; }
      while (d.length < 3) d = '0' + d;
      inp.value = String(+d.slice(0, -2)) + '.' + d.slice(-2);
      try { inp.setSelectionRange(inp.value.length, inp.value.length); } catch (e) {}
    });
    inp.addEventListener('focus', function () { inp._man = false; });
  }
  function ftParts(cm) { var t = Math.round(cm / 2.54), f = Math.floor(t / 12); return [f, t - f * 12]; }
  function ftIn(cm) { var p = ftParts(cm); return p[0] + '′ ' + p[1] + '″'; }
  function wSetup() {
    var st = S.d.settings, p = st.heightCm ? ftParts(st.heightCm) : ['', ''];
    wDlg('wset', '<h3>Height &amp; target</h3><div class="two"><label class="fl">Height<span class="ftin"><input id="wFt" inputmode="numeric" value="' + p[0] + '" placeholder="5"><em>ft</em><input id="wIn2" inputmode="numeric" value="' + p[1] + '" placeholder="8"><em>in</em></span></label>' +
      '<label class="fl">Target (kg)<input id="wT" inputmode="numeric" value="' + (st.wTarget ? kg(st.wTarget) : '') + '" placeholder="optional"></label></div>' +
      '<p class="small muted" style="margin-top:8px">Height is used only for BMI. Leave the target blank for none.</p>' +
      '<div class="row end"><button class="btn" data-act="close">Cancel</button><button class="btn pri" data-act="wSetSave">Save</button></div>');
    autoDec(document.getElementById('wT'));
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
    if (!h) { var v = view(); if (S.tab(v) && !sprOf(v)) draft.tab = v; if (sprOf(v)) draft._spr = v; if (v === 'star') draft.star = true; }
    if (!draft.win) draft.win = { from: '', to: '' };
    if (!draft.miss) draft.miss = { t: 'drop', keep: null };
    if (draft.freq.t === 'week') draft.freq = { t: 'rep', n: 1, ev: 1, u: 'w', days: [0, 1, 2, 3, 4, 5, 6], from: 'sch', a: S.key(startOf(h)), md: 1, wn: Math.max(1, draft.freq.n || 1) };   // v5.32 old N-per-week
    if (draft.freq.t === 'days') draft.freq = draft.freq.days && draft.freq.days.length ? { t: 'rep', n: 1, ev: 1, u: 'w', days: draft.freq.days, from: 'sch', a: S.key(startOf(h)), md: 1 } : { t: 'day', n: 1, days: [] };
    draft._from = sheetOpen === 'stats' ? 'stats' : null;
    drawEdit();
  }
  function offTxt(m) { var h = Math.floor(m / 60), r = m % 60; return (h ? h + 'h' : '') + (r || !h ? r + 'm' : ''); }
  function opts(list, cur) { return list.map(function (o) { return '<option value="' + o[0] + '"' + (String(o[0]) === String(cur) ? ' selected' : '') + '>' + o[1] + '</option>'; }).join(''); }
  // A clock time picked as hour · minute · am/pm (no 24-hour clock). Stored as 'HH:MM'. Blank = no limit.
  function timePick(id, v, step, blank) {
    var p = v ? v.split(':') : null, h = p ? +p[0] : null, m = p ? +p[1] : null, mm = [];
    for (var i = 0; i < 60; i += step) mm.push(i); if (m != null && mm.indexOf(m) < 0) { mm.push(m); mm.sort(function (a, b) { return a - b; }); }
    var hrs = []; for (var j = 1; j <= 12; j++) hrs.push([j, j]);
    return '<span class="tpk"><select id="' + id + 'H" class="sel">' + (blank ? '<option value="">–</option>' : '') + opts(hrs, h == null ? '' : (h % 12 || 12)) + '</select>' +
      '<b>:</b><select id="' + id + 'M" class="sel">' + opts(mm.map(function (x) { return [x, ('0' + x).slice(-2)]; }), m == null ? 0 : m) + '</select>' +
      '<select id="' + id + 'P" class="sel">' + opts([['am', 'am'], ['pm', 'pm']], h == null ? (blank ? 'am' : 'am') : h < 12 ? 'am' : 'pm') + '</select></span>';
  }
  function timeRead(id) {
    var H = document.getElementById(id + 'H'); if (!H || H.value === '') return '';
    var h = +H.value % 12 + (document.getElementById(id + 'P').value === 'pm' ? 12 : 0), m = +document.getElementById(id + 'M').value;
    return ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2);
  }
  function edgeField(id, label, v) {   // SL 35: clock time, or a prayer ± hours/minutes
    var pr = v && v.indexOf('p:') === 0, q = pr ? v.split(':') : [], T = prayerToday();
    var o = pr ? +q[2] || 0 : 0, a = Math.abs(o), hh = [], mm = [];
    for (var i = 0; i <= 12; i++) hh.push([i, i + ' h']); for (var j = 0; j < 60; j += 5) mm.push([j, j + ' min']);
    if (a % 5) { mm.push([a % 60, (a % 60) + ' min']); mm.sort(function (x, y) { return x[0] - y[0]; }); }
    return '<label class="tl">' + label + '<select id="f' + id + 'K" data-act="edgeKind" class="sel">' + [['', 'Clock time']].concat(Object.keys(Prayer.NAMES).map(function (k) { return [k, Prayer.NAMES[k] + (T && T[k] != null ? ' · ' + Prayer.hm(T[k]) : '')]; })).map(function (o) {
        return '<option value="' + o[0] + '"' + ((pr ? q[1] : '') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>' +
      (pr ? '<span class="offs"><select id="f' + id + 'S" class="sel">' + opts([['0', 'At that time'], ['-1', 'Before it'], ['1', 'After it']], o < 0 ? '-1' : o > 0 ? '1' : '0') + '</select>' +
          '<span class="tpk"><select id="f' + id + 'OH" class="sel">' + opts(hh, Math.floor(a / 60)) + '</select><select id="f' + id + 'OM" class="sel">' + opts(mm, a % 60) + '</select></span></span>'
        : timePick('f' + id, v || '', 5, true)) + '</label>';
  }
  function edgeRead(id) {
    var k = document.getElementById('f' + id + 'K'); if (!k) return null;
    if (!k.value) return timeRead('f' + id);
    var sg = document.getElementById('f' + id + 'S'), H = document.getElementById('f' + id + 'OH'), M = document.getElementById('f' + id + 'OM');
    var n = sg ? +sg.value * ((H ? +H.value : 0) * 60 + (M ? +M.value : 0)) : 0;
    return 'p:' + k.value + ':' + Math.max(-720, Math.min(720, n));
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
    var a = aggOf(h);
    var groupFields =
      '<div class="fl">Shown as' + seg('fold0', h.fold0 ? '1' : '0', [['0', 'Expanded'], ['1', 'Collapsed']]) +
      '<span class="small muted">Used when the bottom-bar group button is on “as set in Edit”.</span></div>' +
      '<div class="fl">Group result' + seg('agg', a.t, [['count', 'Tick when done'], ['sum', 'Sum of values']]) +
      '<span class="small muted">' + (a.t === 'count' ? 'The group gets a tick when enough of its sub-habits are done that day.' : 'The group shows the total of its sub-habits (a tick counts as 1).') + '</span></div>' +
      (a.t === 'count' ? '<label class="inl">Done when <input id="fAggN" inputmode="numeric" value="' + (a.n || '') + '" placeholder="all"> sub-habits are done</label>' +
          '<span class="small muted">' + nSub + ' sub-habit' + (nSub === 1 ? '' : 's') + ' now. Leave blank for all of them (follows as you add more).' + (a.n > nSub ? ' With fewer sub-habits than this, all of them must be done.' : '') + ' The group hides as done when this is reached.</span>' +
          '<button class="mi tg flat" data-act="ef" data-f="prog"><span>Show progress (e.g. “2 of ' + (a.n || nSub) + '”)<br><span class="small muted">Off: the group stays ✗ until it’s done.</span></span><span class="box' + (a.prog !== false ? ' on' : '') + '">' + (a.prog !== false ? ICON.check : '') + '</span></button>'
        : '<div class="two"><label class="fl">Unit<input id="fUnit" value="' + esc(h.unit) + '" placeholder="pages, min" autocomplete="off"></label>' +
          '<label class="fl">Target (at least)<input id="fTarget" inputmode="decimal" value="' + num(h.target) + '" autocomplete="off"></label></div>') +
      '<button class="mi tg flat" data-act="ef" data-f="endAll"><span>Hide the group when every sub-habit is done or its time is up<br><span class="small muted">For sub-habits with different hide times (e.g. each prayer). Follows the eye drawer: turn on “Done for today” or “Time’s up” there to see them again.</span></span><span class="box' + (h.endAll ? ' on' : '') + '">' + (h.endAll ? ICON.check : '') + '</span></button>';
    var html =
      '<div class="ptop"><button class="ib" data-act="close" aria-label="Back">' + ICON.back + '</button><h2>' + (h._new ? 'New habit' : 'Edit habit') + '</h2>' +
      (!h._new && !h._from ? '<button class="ib" data-act="statOpen" aria-label="Stats">' + ICON.chart + '</button>' : '') + '<button class="btn pri sm" data-act="saveHabit">Save</button></div>' +
      '<div class="form">' +
      '<label class="fl">Name<input id="fName" value="' + esc(h.name) + '" placeholder="e.g. Qur’an pages" enterkeyhint="done" autocomplete="off"></label>' +
      '<label class="fl">Subtitle (optional)<input id="fSub" value="' + esc(h.subt || '') + '" placeholder="Shown small under the name" enterkeyhint="done" autocomplete="off"></label>' +
      '<div class="fl">Colour<div class="sw">' + COLORS.map(function (c) {
        return '<button class="dot' + (c === h.color ? ' on' : '') + '" style="background:' + c + '" data-act="ef" data-f="color" data-v="' + c + '" aria-label="Colour ' + c + '"></button>';
      }).join('') + '</div></div>' +
      (grp ? '' : grpPick(h)) +
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
      (!grp && h.type === 'num' && h.kind !== 'bad' ? '<div class="fl">' + bookFields(h) + '</div>' : '') +
      (!grp && h.kind !== 'bad' && (h.link || window.HifzLink && HifzLink.have()) ? '<div class="fl">Fill from Hifz' +
        (h.type === 'num' ? seg('link', h.link || '', [['', 'Off'], ['pg', 'Qur’an pages'], ['hz', 'Hifz minutes']]) : seg('link', h.link ? 'rule' : '', [['', 'Off'], ['rule', 'On — by rule']])) +
        (h.type !== 'num' && h.link ? hzRule(h) : '') +
        '<span class="small muted">' + (!h.link ? 'Days are filled in from the Hifz app on this phone; your other devices get them through sync.'
          : h.type === 'num' ? (h.link === 'pg' ? 'Each day shows the pages you read in Hifz (all readings).' : 'Each day shows your Hifz memorisation minutes.')
          : 'Ticks on days the rule is met. Whole-page reads = a page counts once every one of its sections is read; reads of one section = done as soon as any single section reaches the number.') +
          ' Hifz never removes a mark you made yourself.</span></div>' : '') +
      (!inG ? '<div class="fl">Tab<div class="chips wrap">' +
        [{ id: '', name: 'Main' }].concat(regTabs()).map(function (t) {
          return '<button class="tchip' + ((h.tab || '') === t.id ? ' on' : '') + '" data-act="ef" data-f="tab" data-v="' + t.id + '">' + esc(t.name) + (t.hidden ? ' (hidden)' : '') + '</button>';
        }).join('') + '</div></div>' : '') +
      '<div class="fl">Time window' + (grp ? ' (whole group)' : '') + '<div class="two">' + edgeField('From', 'Show from', h.win.from) + edgeField('To', 'Hide after', h.win.to) + '</div>' +
        (/p:/.test(h.win.from + h.win.to) && !prayerToday() ? '<span class="small" style="color:var(--bad)">Set your location in Settings → Prayer times, or prayer-based edges are ignored.</span>' : '') +
        '<span class="small muted">Outside this time it leaves today’s list; the eye on the bottom bar can show it. Leave blank for all day.' +
        (h.win.from || h.win.to ? ' <a href="#" data-act="ef" data-f="winClear">Clear</a>' : '') + '</span></div>' +
      '<button class="mi tg flat" data-act="ef" data-f="hid"><span>Hidden<br><span class="small muted">Still active and counted in Stats, just kept off the list. The eye on the bottom bar → Hidden shows it.' + (inG ? '' : grp ? ' Hides the whole group.' : '') + '</span></span><span class="box' + (h.hid ? ' on' : '') + '">' + (h.hid ? ICON.check : '') + '</span></button>' +
      (!h._new ? '<div class="row"><button class="btn danger-o" data-act="delHabit">Delete habit</button></div>' : '') +
      '</div>';
    if (sheetOpen === 'edit') { sheet.innerHTML = html; } else showSheet('edit', html, 'page');
  }
  /* v5.5 Repeat section (Google Tasks "Repeats": only the fields that matter) + If not done + group Enforce.
     A sub-habit of an enforcing group shows the group's settings greyed out. */
  function freqFields(h, grp) {
    var G = enfG(h), dis = !!G, f = dis ? fq(h) : h.freq, D = dis ? ' disabled' : '', ws = f.t === 'rep' && f.u === 'w' ? wsOf(f) : S.d.settings.weekStart || 0;
    var wdOrder = [0, 1, 2, 3, 4, 5, 6].map(function (i) { return (i + ws) % 7; });
    var o = '<div class="fl' + (dis ? ' lockf' : '') + '">Repeat' + (dis ? '<span class="small muted">Set by the group ' + esc(G.name) + '</span>' : '') +
      seg('freq', f.t, [['day', 'Every day'], ['month', 'Per month'], ['rep', 'Repeats']], dis);
    if (f.t === 'week' || f.t === 'month') o += '<label class="inl"><input id="fN" inputmode="numeric" value="' + (f.n || 1) + '"' + D + '> times per ' + f.t + '</label>';
    if (f.t === 'rep') {
      var done = f.from === 'done';
      o += '<div class="repl">Every <input id="fEv" inputmode="numeric" value="' + (f.ev || 1) + '"' + D + '>' + seg('ru', f.u || 'w', [['d', 'Days'], ['w', 'Weeks'], ['m', 'Months']], dis) + '</div>' +
        '<div class="fl">Count from' + seg('rfrom', done ? 'done' : 'sch', [['sch', 'The schedule'], ['done', 'Day it’s done']], dis) +
        '<span class="small muted">' + (done ? 'The next one is due this long after you actually do it (e.g. car oil every 90 days).' : 'Fixed dates, whenever you did the last one.') + '</span></div>' +
        (!done && f.u === 'w' ? '<div class="wd">' + wdOrder.map(function (i) {
          return '<button class="' + ((f.days || []).indexOf(i) >= 0 ? 'on' : '') + '" data-act="ef" data-f="wd" data-v="' + i + '"' + D + '>' + WD[i].slice(0, 2) + '</button>'; }).join('') + '</div>' + qFields(h, f, D, dis, grp) : '') +
        (!done && f.u === 'm' ? '<label class="inl">On day <input id="fMd" inputmode="numeric" value="' + (f.md || 1) + '"' + D + '> of the month <span class="small muted">(31 = last day)</span></label>' : '') +
        '<label class="fl">' + (done ? 'First due' : 'Starts') + '<input id="fRa" type="date" value="' + esc(f.a || S.today()) + '"' + D + '></label>';
    }
    o += '</div>';
    if (f.t === 'rep' && h.kind !== 'bad' && !qOn(h, f)) {   // v5.32: a weekly goal has its own miss rule
      var m = (dis ? G.miss : h.miss) || { t: 'drop' };
      o += '<div class="fl' + (dis ? ' lockf' : '') + '">If not done' + seg('miss', m.t, [['drop', 'Disappear'], ['stay', 'Stay as due']], dis) +
        '<span class="small muted">' + (m.t === 'stay' ? 'Stays on the list with a red “due” count until done or its next turn comes. A later tick counts as done late.' : 'Missed once its day is over (e.g. Friday Surah Al-Kahf).') + '</span>' +
        (m.t === 'stay' ? '<label class="inl">Keep for at most <input id="fKeep" inputmode="numeric" value="' + (m.keep || '') + '" placeholder="–"' + D + '> days <span class="small muted">(blank = until done)</span></label>' : '') + '</div>';
    }
    if (grp) o += '<button class="mi tg flat" data-act="ef" data-f="enf"><span>Enforce on sub-habits<br><span class="small muted">Sub-habits follow this group’s repeat and if-not-done settings (shown greyed in their Edit).</span></span><span class="box' + (h.enf ? ' on' : '') + '">' + (h.enf ? ICON.check : '') + '</span></button>';
    return o;
  }
  /* v5.32 weekly goal fields under the weekday chips */
  function qFields(h, f, D, dis, grp) {
    if (grp || h.kind === 'bad') return '';
    var tot = f.wc === 'tot' && h.type === 'num', on = tot ? f.wt > 0 : f.wn > 0, ws0 = S.d.settings.weekStart || 0;
    var o = '<label class="fl">Week starts on<select id="fWs" class="sel"' + D + '>' + opts([['', 'App default (' + WD[ws0] + ')']].concat([6, 0, 1, 2, 3, 4, 5].map(function (i) { return [i, WD[i]]; })), f.ws == null ? '' : f.ws) + '</select></label>';
    if (h.type === 'num') o += '<div class="fl">Weekly goal counts' + seg('wc', tot ? 'tot' : 'days', [['days', 'Days target met'], ['tot', 'Weekly total']], dis) + '</div>';
    o += tot ? '<label class="inl"><input id="fWt" inputmode="decimal" value="' + (f.wt > 0 ? num(f.wt) : '') + '" placeholder="–"' + D + '> ' + esc(h.unit || 'units') + ' a week</label>' +
        '<span class="small muted">Every amount counts toward the weekly total, even big days. Shows on the picked days until the total is reached, then hides till next week.</span>'
      : '<label class="inl">At least <input id="fWn" inputmode="numeric" value="' + (f.wn > 0 ? f.wn : '') + '" placeholder="all"' + D + '> days a week</label>' +
        '<span class="small muted">' + (f.wn > 0 ? 'Ticks on other days count too' + (h.type === 'num' ? ' (a day counts once its target is met, however much you do)' : '') + '. Once ' + f.wn + ' ' + (f.wn === 1 ? 'is' : 'are') + ' done it hides till next week; the week is missed when the picked days left can’t reach ' + f.wn + '.' : 'Blank = every picked day is due on its own.') + '</span>';
    if (on) o += '<button class="mi tg flat" data-act="ef" data-f="wp"' + D + '><span>Show “x of ' + (tot ? num(f.wt) : f.wn) + ' this week” under the name</span><span class="box' + (f.wp !== false ? ' on' : '') + '">' + (f.wp !== false ? ICON.check : '') + '</span></button>';
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
  /* v5.28 Hifz rule editor for yes/no habits: conditions joined by AND / OR */
  var HZM = [['min', 'Hifz minutes'], ['pg', 'Qur’an pages read'], ['tl', 'Tally · whole-page reads'], ['ts', 'Tally · reads of one section']];
  function hzRule(h) {
    if (!h.hzr || !h.hzr.c || !h.hzr.c.length) h.hzr = JSON.parse(JSON.stringify(HifzLink.rule(h)));
    var r = h.hzr, td = HifzLink.day(S.today());
    return '<div class="hzr">' + (r.c.length > 1 ? seg('hzOp', r.op, [['or', 'Any one (OR)'], ['and', 'All of them (AND)']]) : '') +
      r.c.map(function (q, i) {
        return '<div class="hzc">' + (i ? '<em>' + (r.op === 'and' ? 'and' : 'or') + '</em>' : '') + '<select id="hzM' + i + '" class="sel">' + opts(HZM, q.m) + '</select><span>≥</span>' +
          '<input id="hzN' + i + '" inputmode="numeric" value="' + (q.n || 0) + '" autocomplete="off">' +
          (r.c.length > 1 ? '<button class="ib" data-act="ef" data-f="hzDel" data-v="' + i + '" aria-label="Remove">×</button>' : '') + '</div>';
      }).join('') +
      (r.c.length < 3 ? '<button class="btn sm" data-act="ef" data-f="hzAdd">+ Add condition</button>' : '') +
      (td ? '<p class="small muted">Today in Hifz: ' + td.min + ' min · ' + td.pg + ' pages read · ' + td.tl + ' whole-page reads · best section read ' + td.ts + '× → <b>' + (HifzLink.test(r, td) ? 'tick ✓' : 'no tick yet') + '</b></p>' : '') + '</div>';
  }
  // "In group": put a habit under another (or take it out) without the hold-and-slide gesture
  function grpPick(h) {
    var ts = S.habits().filter(function (x) { return !x.parent && !x.archived && x.id !== h.id; });
    return '<label class="fl">In group<select id="fPar" class="sel"><option value="">None (its own row)</option>' +
      ts.map(function (x) { return '<option value="' + x.id + '"' + (h.parent === x.id ? ' selected' : '') + '>' + esc(x.name) + (isGroup(x) ? ' · ' + subs(x.id).length : '') + '</option>'; }).join('') +
      '</select><span class="small muted">Or on the list: hold its name and slide right (in) / left (out).</span></label>';
  }
  function readInputs() {   // keep typed values before a redraw
    var g = function (id) { var el = document.getElementById(id); return el && !el.disabled ? el.value : null; };   // greyed (enforced) fields stay the group's
    if (document.getElementById('fPar')) draft.parent = document.getElementById('fPar').value || null;
    if (g('fName') != null) draft.name = g('fName');
    if (g('fSub') != null) { var st = g('fSub').trim(); if (st) draft.subt = st; else delete draft.subt; }   // v5.25 optional subtitle
    if (g('fUnit') != null) draft.unit = g('fUnit').trim();
    if (g('fTarget') != null) { var t = parseFloat(g('fTarget').replace(',', '.')); draft.target = isFinite(t) ? t : draft.target; }
    if (g('fN') != null) { var n = parseInt(g('fN'), 10); draft.freq.n = n > 0 ? n : 1; }
    if (g('fEv') != null) { var ev = parseInt(g('fEv'), 10); draft.freq.ev = ev > 0 ? Math.min(ev, 999) : 1; }
    if (g('fMd') != null) { var md = parseInt(g('fMd'), 10); draft.freq.md = md > 0 ? Math.min(md, 31) : 1; }
    if (g('fRa') != null && g('fRa')) draft.freq.a = g('fRa');
    if (g('fWn') != null) { var wn = parseInt(g('fWn'), 10); draft.freq.wn = wn > 0 ? Math.min(wn, 7) : 0; }   // v5.32 weekly goal
    if (g('fWt') != null) { var wt = parseFloat(g('fWt').replace(',', '.')); draft.freq.wt = wt > 0 ? wt : 0; }
    if (g('fWs') != null) draft.freq.ws = g('fWs') === '' ? null : +g('fWs');
    if (g('fKeep') != null) { var kp = parseInt(g('fKeep'), 10); draft.miss = draft.miss || { t: 'stay' }; draft.miss.keep = kp > 0 ? kp : null; }
    if (g('fBkN') != null && draft.book) { var B = draft.book, pi = function (x) { var n = parseInt(x, 10); return isFinite(n) && n >= 0 ? n : 0; };
      B.title = g('fBkT').trim(); if (g('fBkAu') != null) B.au = g('fBkAu').trim(); B.total = pi(g('fBkN')); B.p0 = pi(g('fBkP')); if (g('fBkA')) B.a = g('fBkA'); B.end = g('fBkE') || ''; }
    if (g('fStep') != null) { var st = parseFloat(g('fStep').replace(',', '.')); draft.step = isFinite(st) && st > 0 ? st : null; }
    if (g('fTick') != null) { var tk = parseFloat(g('fTick').replace(',', '.')); draft._tick = isFinite(tk) && tk >= 0 ? tk : null; }
    if (draft.hzr && document.getElementById('hzM0')) draft.hzr.c.forEach(function (q, i) { var m = document.getElementById('hzM' + i), n = document.getElementById('hzN' + i); if (m) q.m = m.value; if (n) { var x = parseInt(n.value, 10); q.n = isFinite(x) && x >= 0 ? x : 0; } });
    if (document.getElementById('fFromK')) draft.win = { from: edgeRead('From'), to: edgeRead('To') };
    if (g('fAggN') != null) { var m = parseInt(g('fAggN'), 10); draft.agg = draft.agg || { t: 'count' }; draft.agg.n = m > 0 ? m : 0; }
  }

  /* ---- SL 29 Demo data: switch between his data and a fresh example ---- */
  function setDemo(on) {
    sel = null; S.setDemo(on); S.d.ui.view = 'all';
    document.documentElement.dataset.theme = S.d.settings.theme || 'dark';
    App.render(true); App.toast(on ? 'Demo data on' : 'Your own habits are back');
  }

  /* ---- SL 31: Start from examples — tick starter habits, they're created with no history ---- */
  var stSel = {};
  function openStarters(again) {
    var have = {}; S.habits().forEach(function (h) { have[h.name.toLowerCase()] = 1; });
    var n = Object.keys(stSel).length;
    var html = '<div class="ptop"><button class="ib" data-act="close" aria-label="Back">' + ICON.back + '</button><h2>Start from examples</h2>' +
      '<button class="btn pri sm" data-act="stAdd"' + (n ? '' : ' disabled') + '>Add' + (n ? ' ' + n : '') + '</button></div>' +
      '<p class="small muted" style="padding:0 18px">Tick the ones you want. They start empty — no past days — and you can edit anything afterwards.</p>' +
      Starters.map(function (sec) {
        return '<h4 style="padding:0 18px">' + sec.sec + (sec.tab ? ' <span class="small muted">· goes in the “' + sec.tab[0] + '” tab</span>' : '') + '</h4>' + sec.items.map(function (it) {
          var got = have[it.name.toLowerCase()], on = !!stSel[it.k];
          return '<button class="mi tg" data-act="stTg" data-k="' + it.k + '"' + (got ? ' disabled style="opacity:.5"' : '') + '><span><span style="color:' + it.h.color + '">' + esc(it.name) + '</span><br><span class="small muted">' +
            (got ? 'already in your list' : esc(it.note)) + '</span></span><span class="box' + (on ? ' on' : '') + '">' + (on ? ICON.check : '') + '</span></button>';
        }).join('');
      }).join('') + '<div style="height:24px"></div>';
    if (again && sheetOpen === 'starters') { var y = sheet.scrollTop; sheet.innerHTML = html; sheet.scrollTop = y; } else showSheet('starters', html, 'page');
  }

  /* ---- Settings & menu ---- */
  /* ---- Settings (v5.15): a full page of grouped cards; each row = label + control. Explanations hidden unless the
     "Help" flip in the header is on (settings.help). The old ⋮ menu is gone — its items live here. ---- */
  function openSettings() {
    var s = S.d.settings, help = !!s.help;
    var hint = function (t) { return help && t ? '<em class="sx">' + t + '</em>' : ''; };
    var sw = function (on) { return '<i class="tgl' + (on ? ' on' : '') + '"></i>'; };
    var row = function (label, ctl, h, act, extra) {
      return (act ? '<button class="srw" ' + act + '>' : '<div class="srw">') + '<span class="sl">' + label + hint(h) + '</span>' + (ctl || '') + (act ? '</button>' : '</div>') + (extra || ''); };
    var tg = function (k, label, h, def) { var on = k === 'demo' ? S.demo : def ? s[k] !== false : !!s[k]; return row(label, sw(on), h, 'data-act="setTg" data-k="' + k + '"' + (def ? ' data-d="1"' : '')); };
    var go = function (act, label, val, h) { return row(label, '<span class="sv">' + (val || '') + '</span>' + ICON.chev, h, 'data-act="' + act + '"'); };
    var seg = function (act, k, opts, cur) { return '<div class="seg sseg">' + opts.map(function (o) {
      return '<button class="' + (cur === o[0] ? 'on' : '') + '" data-act="' + act + '" data-k="' + k + '" data-v="' + o[0] + '" data-t="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div>'; };
    var segRow = function (label, h, segHtml) { return '<div class="srw col"><span class="sl">' + label + hint(h) + '</span>' + segHtml + '</div>'; };
    var grp = function (title, body) { return body ? '<h4 class="sgh">' + title + '</h4><div class="sg">' + body + '</div>' : ''; };
    var acct = S.demo ? row('Google account', '', 'Exit demo data to sign in.')
      : !S.d.acct ? row('Not signed in', '<button class="btn sm pri" data-act="signIn">Sign in</button>', 'Everything is saved on this phone and works offline. Signing in keeps a copy in your Google Drive, syncs other devices and fills a “Habits history” Google Sheet.')
      : row('<b>' + esc(S.d.acct) + '</b><em class="ss">' + ({ ok: 'Synced', syncing: 'Syncing…', paused: 'Changes waiting', idle: 'Signed in', error: 'Last sync failed' }[Sync.state] || '') + '</em>', '<button class="btn sm" data-act="syncNow">Sync now</button>', 'Syncs by itself when you make a change; changes made offline go up on your next tap online.') +
        (s.sheetId ? row('History sheet', '<a class="btn sm" href="https://docs.google.com/spreadsheets/d/' + encodeURIComponent(s.sheetId) + '" target="_blank" rel="noopener">Open</a>', 'Your habits by day in Google Sheets, refreshed every few minutes while syncing.')
          : Sync.sheetOk === false ? row('History sheet', '<button class="btn sm" data-act="signInFull">Allow</button>', 'Google needs one more permission to create the Sheet.')
          : row('History sheet', '<span class="sv">next sync</span>', 'Created in your Drive as “Habits history”.')) +
        row('Sign out', '', '', 'data-act="signOut"');
    var archT = S.tabs().some(function (t) { return t.hidden; });
    showSheet('settings',
      '<div class="ptop"><button class="ib" data-act="close" aria-label="Back">' + ICON.back + '</button><h2>Settings</h2>' +
        '<button class="flip" data-act="setTg" data-k="help">Help ' + sw(help) + '</button></div><div class="sset">' +
      grp('Account &amp; sync', acct) +
      grp('Look', segRow('Theme', '', seg('theme', 'theme', [['dark', 'Dark'], ['light', 'Light']], s.theme || 'dark')) +
        segRow('Tabs', { bottom: 'Your tabs sit in a strip just above the bottom bar. Hold a tab for New, Rename, Archive, Delete; swipe the blank area under the list to change tab.',
          top: 'Your tabs sit across the top; Add moves to the bottom bar. Hold a tab for New, Rename, Archive, Delete.',
          off: 'No tab strip: one page, with each tab’s name as a header above its habits. Tap a header to fold it.' }[tabsMode()],
          seg('tabsMode', 'tabsMode', [['top', 'Top'], ['bottom', 'Bottom'], ['off', 'One page']], tabsMode()))) +
      grp('Habits', (S.demo ? '' : go('starters', 'Add from examples', '', 'Pick ready-made habits (Qur’an pages, Salah in Masjid, workout…). They start with no history.')) +
        (tabsMode() === 'off' ? go('tabsSheet', 'Tabs', S.tabs().filter(function (t) { return !t.hidden; }).length, 'Add, rename, archive or delete tabs.') : '') +
        (S.tabs().some(isSpr) ? go('sprList', 'Sprints', S.tabs().filter(isSpr).length, 'Every sprint, running or ended, with its report.') : '') +
        (archT ? go('hiddenTabs', 'Archived tabs', S.tabs().filter(function (t) { return t.hidden; }).length, 'Tabs you archived, with their habits. Hold one to bring it back.') : '') +
        go('ptOpen', 'Prayer times', s.pt && s.pt.lat != null ? esc(s.pt.name || 'Set') : 'Not set', 'Lets a time window start or end at a prayer, e.g. “Asr − 15 min”.')) +
      grp('Marking', tg('shortPress', 'Mark with a short tap', 'Off: hold a day to mark it, so a stray tap changes nothing.') +
        tg('skipDays', 'Skip days', 'A skip is neither done nor missed. Hold a habit name, select several, tap ⏭ to skip today for all. Also the Skip button in a measurable habit’s number box. Holding a day only ticks / clears.')) +
      grp('Day &amp; week', segRow('Day ends late', 'Until this many hours after midnight you are still logging the day before.',
          seg('setNum', 'extendH', [0, 1, 2, 3, 4, 5].map(function (x) { return [x, x ? x + 'h' : 'Off']; }), s.extendH || 0)) +
        segRow('Week starts', '', seg('setNum', 'weekStart', [[6, 'Sat'], [0, 'Sun'], [1, 'Mon']], s.weekStart || 0))) +
      grp('Main list', tg('hScroll', 'Scroll back through past days', 'Off: only the days that fit on screen.', 1) +
        (s.hScroll !== false ? tg('freezeToday', 'Keep today’s column fixed', 'Off: today scrolls away with the other days.', 1) : '') +
        tg('subLines', 'Lines between sub-habits', '', 1) +
        tg('starGroups', 'Starred: show the group above', 'In Starred, a starred sub-habit shows under its group’s name. Off: on its own.', 1)) +
      grp('App', row('Version&nbsp; <span class="ver">' + esc(C.appVersion.split(' ·')[0]) + '</span>', '<button class="btn sm" data-act="updateApp">Update</button>', 'Gets the newest version now instead of on the next open.') +
        tg('demo', 'Demo data', S.demo ? 'Showing an example. Turn off to get your own habits back, exactly as they were.' : 'Show a filled example instead of your habits, e.g. to show someone the app. Your data stays untouched.') +
        row('Share this app', '<button class="btn sm" data-act="share">Copy link</button>', '')) +
      '</div>', 'page');
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
    showSheet('tabname', '<h3>' + (t ? 'Edit tab' : 'New tab') + '</h3>' + (t ? '' : '<div class="seg" style="margin-bottom:10px"><button class="on">Regular</button><button data-act="sprNew">Sprint</button></div>') + '<input id="tabIn" value="' + esc(t ? t.name : '') + '" placeholder="e.g. Daily, Weekly, Monthly" maxlength="30" enterkeyhint="next" autocomplete="off">' +
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
      regTabs().map(function (t) { return '<button class="mi trow" data-act="moveTo" data-tab="' + t.id + '"><span>' + esc(t.name) + (t.hidden ? ' (hidden)' : '') + '</span></button>'; }).join('') +
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
      if (sheetOpen && sheetOpen !== 'show') return closeSheet(function () { actions.foldCycle(); });
      var next = { open: 'shut', shut: 'man', man: 'open' }[foldMode()];
      S.d.ui.foldMode = next; S.d.ui.fx = {}; S.saveUi(); App.render();
      App.toast({ open: 'All groups expanded', shut: 'All groups collapsed', man: 'Each group as set in Edit' }[next]);
    },
    selDone: function () { selEnd(); },
    selHide: function () {
      var ids = Object.keys(sel), on = !allHidden();
      ids.forEach(function (id) { var h = S.habit(id); if (h) { h.hid = on; S.putHabit(h); } });
      selEnd(function () { App.toast((on ? 'Hidden ' : 'Unhidden ') + ids.length + (on && !SH().hid ? ' — the eye below shows them' : '')); });
    },
    selSkip: function () {
      var t = S.today(), o = skipTargets(), on = !allSkipped(), n = 0, kept = 0;
      o.forEach(function (h) {
        if (on) { if (S.skipped(h.id, t)) return; if (S.val(h.id, t) != null) { kept++; return; } S.setSkip(h.id, t); n++; }
        else if (S.skipped(h.id, t)) { S.setVal(h.id, t, null); n++; }
      });
      selEnd(function () { App.toast((on ? 'Skipped today: ' : 'Skip cleared: ') + n + (kept ? ' · ' + kept + ' already done, left as is' : '')); });
    },
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
      S.reorder(order); becomeGroup(g);
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
    home: function () { if (sheetOpen && sheetOpen !== 'show') return closeSheet(function () { actions.home(); }); var sc = document.getElementById('sc'); if (view() !== 'all') setView('all'); else if (sc) sc.scrollTop = 0; sc = document.getElementById('sc'); if (sc) sc.scrollLeft = 0; },
    starToggle: function () { ribGo('star'); },
    doneToggle: function () { ribGo('done'); },
    viewArch: function () { toggleView('arch'); },
    shw: function () { if (sheetOpen === 'show') closeSheet(); else if (sheetOpen) closeSheet(drawShow); else { drawShow(); App.render(); } },
    shwT: function (el) { var s = SH(), k = el.dataset.k; s[k] = !s[k]; S.d.ui.showStash = null; S.saveSettings(); S.saveUi(); App.render(); },
    shwDesc: function () { S.d.ui.showDesc = !(S.d.ui.showDesc === true); S.saveUi(); drawShow(); },
    shwFull: function () { S.d.ui.showFull = !S.d.ui.showFull; S.saveUi(); drawShow(); },
    shwPen: function () { shwEdit = !shwEdit; drawShow(); },
    shwPin: function (el) { var p = S.d.settings.showPin, k = el.dataset.k, i = p.indexOf(k); if (i < 0) p.push(k); else p.splice(i, 1); S.saveSettings(); drawShow(); },
    shwAll: function () { var s = SH(), st = {}; Object.keys(SHOW_DEF).forEach(function (k) { st[k] = !!s[k]; s[k] = true; }); S.d.ui.showStash = st; S.saveSettings(); S.saveUi(); App.render(); },
    shwUsual: function () { var st = S.d.ui.showStash || SHOW_DEF; S.d.settings.show = JSON.parse(JSON.stringify(st)); S.d.ui.showStash = null; S.saveSettings(); S.saveUi(); App.render(); },
    flipGroups: function () { S.d.settings.starGroups = S.d.settings.starGroups === false; S.saveSettings(); App.render(); },
    tabsSheet: openTabsSheet,
    tpDone: function () { closeTp(); },
    tpRename: function () { var t = S.tab(tp.id); if (!t) return App.toast('Main can’t be renamed'); if (isSpr(t)) return openSprEdit(t); askTabName(t); },
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
      closeSheet(function () { t.hidden = hide; S.putTab(t); App.render(); App.toast(hide ? 'Tab archived — find it in Settings → Archived tabs' : 'Tab “' + t.name + '” is back'); });
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
      selEnd(function () { App.toast((arch ? 'Archived ' : 'Unarchived ') + ids.length + (arch && !SH().arch ? ' — the eye below shows them' : '')); });
    },
    selDelete: function () {
      var ids = Object.keys(sel), lk = ids.filter(lockedDel);
      if (lk.length) return App.toast((lk.length === 1 ? '“' + S.habit(lk[0]).name + '” is hidden but has history' : lk.length + ' hidden habits have history') + ' — archive first, then delete');
      confirmBox('Delete ' + (ids.length === 1 ? '“' + S.habit(ids[0]).name + '”' : ids.length + ' habits') + ' and all history? This can’t be undone.', 'Delete', function () {
        ids.forEach(function (id) { S.delHabit(id); }); selEnd(function () { App.toast('Deleted'); });
      });
    },
    filter: function () { actions.shw(); },
    ef: function (el) {   // edit-form field change
      readInputs();
      var f = el.dataset.f, v = el.dataset.v, h = draft;
      if (f === 'color') h.color = v;
      else if (f === 'type') { h.type = v; if (v === 'num') { if (!(h.target >= 0)) h.target = 1; if (!h.tt) h.tt = h.kind === 'bad' ? 'max' : 'min'; if (h.unit == null) h.unit = ''; } }
      else if (f === 'kind') { h.kind = v; if (!h._ttSet) h.tt = v === 'bad' ? 'max' : 'min'; }
      else if (f === 'tt') { h.tt = v; h._ttSet = true; }
      else if (f === 'endAll') h.endAll = !h.endAll;
      else if (f === 'hid') h.hid = !h.hid;
      else if (f === 'book') { h.book = h.book || { total: 0, p0: 0, a: S.today(), end: '', title: '', showT: true, hist: [] }; h.book.on = !h.book.on; if (h.book.on && !h.unit) h.unit = 'pages'; }
      else if (f === 'bookT') h.book.showT = !h.book.showT;
      else if (f === 'pick') h.pick = !h.pick;
      else if (f === 'agg') { h.agg = h.agg || { n: 0 }; h.agg.t = v; if (v === 'sum') h.tt = 'min'; }
      else if (f === 'freq') {
        h.freq.t = v;
        if (v === 'rep') { var td = S.todayDate(), q = h.freq; q.ev = q.ev || 1; q.u = q.u || 'w'; q.from = q.from || 'sch'; q.a = q.a || S.today(); q.md = q.md || td.getDate(); if (!q.days || !q.days.length) q.days = [td.getDay()]; }
      }
      else if (f === 'ru') h.freq.u = v;
      else if (f === 'rfrom') h.freq.from = v;
      else if (f === 'wc') h.freq.wc = v;
      else if (f === 'wp') h.freq.wp = h.freq.wp === false;
      else if (f === 'miss') { h.miss = h.miss || { keep: null }; h.miss.t = v; }
      else if (f === 'enf') h.enf = !h.enf;
      else if (f === 'tab') h.tab = v || null;
      else if (f === 'link') { h.link = v || null; if (!v) delete h.hzr; }
      else if (f === 'hzOp') h.hzr.op = v;
      else if (f === 'hzAdd') h.hzr.c.push({ m: h.hzr.c.some(function (q) { return q.m === 'tl' || q.m === 'ts'; }) ? 'pg' : 'tl', n: 1 });
      else if (f === 'hzDel') h.hzr.c.splice(+v, 1);
      else if (f === 'fold0') h.fold0 = v === '1';
      else if (f === 'prog') { h.agg = h.agg || { t: 'count', n: 0 }; h.agg.prog = h.agg.prog === false; }
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
      if (h.book && h.book.on && h.type === 'num') {
        if (!(h.book.total > 0)) return App.toast('Enter the book’s total pages');
        if (h.book.p0 >= h.book.total) return App.toast('Page you’re on must be less than total pages');
        if (h.book.end && h.book.end < h.book.a) return App.toast('Finish by must be after the start date');
      }
      if (h._bkArch && h.book) { h.book.hist = (h.book.hist || []).concat([h._bkArch]); }
      delete h._bkArch;
      if (h.freq.t === 'rep' && h.freq.u === 'w' && h.freq.from !== 'done' && !(h.freq.days || []).length) return App.toast('Pick at least one weekday');
      var o = !h._new && S.habit(h.id), sw = o && o.type !== h.type && S.countEntries(h.id);
      if (sw && h.type === 'num' && h._tick == null) return App.toast('Enter what each past tick becomes');
      var tick = h._tick;
      var back = h._from === 'stats';
      var nspr = h._spr; delete h._new; delete h._ttSet; delete h._tick; delete h._from; delete h._spr;
      var done = function () {
        if (sw) S.switchType(h, h.type, tick);
        var op = o ? o.parent || null : null, np = h.parent || null;
        if (o && op !== np) {
          if (np) becomeGroup(S.habit(np));
          var order = S.habits().map(function (x) { return x.id; }).filter(function (id) { return id !== h.id; }), anchor = np || op, at = order.length;
          if (anchor) { order.forEach(function (id, i) { if (id === anchor || S.habit(id).parent === anchor) at = i + 1; }); }
          order.splice(at, 0, h.id); S.reorder(order);
          if (np && folded(np)) { S.d.ui.fx = S.d.ui.fx || {}; S.d.ui.fx[np] = false; S.saveUi(); }
        }
        S.putHabit(h); if (nspr && S.tab(nspr)) sprAdd(S.tab(nspr), [h.id], true); if (h.link) fillHifz(false); App.render();
        var rr = rep(h);
        if (sw) App.toast('Type changed · ' + sw + ' day' + (sw === 1 ? '' : 's') + ' converted');
        else if (rr && !rr.show && !SH().rest) App.toast('Saved · not due today' + (rr.next != null ? ' — next on ' + dayTxt(rr.next) : ''));
      };
      if (back) { done(); openStats(h.id, true); } else closeSheet(done);
    },
    delHabit: function () {
      var id = draft.id, name = draft.name;
      if (lockedDel(id)) return App.toast('Hidden with history — archive it first, then delete');
      closeSheet(function () {
        var g = S.habit(id) && isGroup(S.habit(id));
        confirmBox('Delete “' + name + '” and all its history?' + (g ? ' Its sub-habits stay, as normal habits.' : ''), 'Delete', function () { S.delHabit(id); App.render(); App.toast('Deleted'); });
      });
    },
    numStep: function (el) {
      var inp = document.getElementById('numIn'), x = parseFloat((inp.value || '0').replace(',', '.')) || 0;
      inp.value = Math.max(0, num(x + (+el.dataset.d)));
      if (App._numSync) App._numSync();
    },
    numOk: function () { App._num(false); },
    numClear: function () { App._num(true); },
    numSkip: function () { App._num(true, true); },
    sprAddOpen: function () { openAddSpr(); },
    sprTog: function (el) {
      var t = S.tab(el.dataset.tab), ids = Object.keys(sel || {}); if (!t) return;
      var on = !ids.every(function (id) { return (t.sprint.items || {})[id]; }); sprAdd(t, ids, on);
      closeSheet(function () { selEnd(function () { App.toast((on ? 'Added to “' : 'Removed from “') + t.name + '”'); }); });
    },
    sprNew: function () { var ids = sel ? Object.keys(sel) : [], go = function () { openSprEdit(null, ids); }; closeSheet(function () { if (sel) selEnd(go); else go(); }); },
    sprEditOpen: function (el) { var t = S.tab(el.dataset.tab); if (!t) return; if (sheetOpen) closeSheet(function () { openSprEdit(t); }); else openSprEdit(t); },
    sprStatsId: function (el) { var t = S.tab(el.dataset.tab); closeSheet(function () { openSprStats(t); }); },
    sprList: function () { closeSheet(openSprList); },
    sprCol: function (el) { var i = document.getElementById('spCol'); i.classList.toggle('on'); el.setAttribute('aria-pressed', i.classList.contains('on')); },
    sprRm: function (el) { var o = App._spr; sprRead(); delete o.its[el.dataset.id]; var e = el.closest('.spe'); if (e) e.remove(); },
    sprAgain: function () { var t = App._spr.t; closeSheet(function () { openSprEdit(null, null, t); }); },
    sprAgainId: function (el) { var t = S.tab(el.dataset.tab); closeSheet(function () { openSprEdit(null, null, t); }); },
    sprSave: function () {
      var o = App._spr, v = sprRead();
      if (!v.name) return App.toast('Give the sprint a name');
      if (!v.from || !v.to || v.to < v.from) return App.toast('Pick an end date on or after the start');
      var sp = { from: v.from, to: v.to, color: v.color, items: o.its };
      closeSheet(function () {
        if (o.t) { o.t.name = v.name; o.t.short = v.short; o.t.sprint = sp; S.putTab(o.t); App.render(); App.toast('Sprint saved'); }
        else { var nt = S.putTab({ name: v.name, short: v.short, sprint: sp }); if (tabsMode() === 'off') App.render(); else setView(nt.id); App.toast('Sprint “' + v.name + '” created'); }
      });
    },
    overview: function () { var spt = sprOf(view()); if (spt) { if (sheetOpen === 'sprst') return closeSheet(); return sheetOpen ? closeSheet(function () { openSprStats(spt); }) : openSprStats(spt); }
      if (sheetOpen === 'ov') return closeSheet(); ovFrom = false; if (sheetOpen) closeSheet(openOverview); else openOverview(); },
    ovRange: function (el) { ovR = +el.dataset.v; openOverview(true); },
    ovOpen: function (el) { ovFrom = sheetOpen === 'sprst' ? 'spr' : true; openStats(el.dataset.id); },
    settings: function () { closeSheet(openSettings); },
    demoOn: function () { setDemo(true); },
    starters: function () { stSel = {}; if (sheetOpen) closeSheet(function () { openStarters(); }); else openStarters(); },
    stTg: function (el) { var k = el.dataset.k; if (stSel[k]) delete stSel[k]; else stSel[k] = 1; openStarters(true); },
    stAdd: function () {
      var keys = Object.keys(stSel); if (!keys.length) return;
      closeSheet(function () { var n = Starters.add(keys); stSel = {}; S.d.ui.view = 'all'; App.render(); App.toast(n + ' habit' + (n > 1 ? 's' : '') + ' added'); });
    },
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
      var d = document.getElementById('wDate').value || S.today(), tm = timeRead('wTime'), t = document.getElementById('wIn').value.replace(',', '.').trim(), v = parseFloat(t);
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
    close: function () { if (sheetOpen === 'pt') return openSettings(); if (sheetOpen === 'stats' && ovFrom) { var fs = ovFrom; ovFrom = false; return fs === 'spr' && S.tab(App._sprSt) ? openSprStats(S.tab(App._sprSt)) : openOverview(); } if (sheetOpen === 'wlog' || sheetOpen === 'wset') return wBack(); if (sheetOpen === 'blog' || sheetOpen === 'bfin') return openStats(stId, true); if (sheetOpen === 'edit' && draft && draft._from === 'stats' && S.habit(draft.id)) return openStats(draft.id, true); closeSheet(); },
    statEdit: function () { openEdit(stId); },
    bookEnd: function (el) {   // finished (or switching): open Edit for the next run; the old run goes into the history on Save
      var h = S.habit(stId); if (!bookOn(h)) return;
      var b = h.book, i = bookInfo(h), arch = { t: b.title || '', n: b.total, p0: b.p0, a: b.a, f: i.last || S.today(), read: i.read };
      openEdit(h.id); var nb = draft.book, again = el.dataset.v === 'again';
      draft._bkArch = arch; nb.p0 = 0; nb.a = addDays(S.today(), 1); nb.end = ''; if (!again) { nb.title = ''; nb.total = 0; }
      drawEdit(); App.toast(again ? 'Same book from page 1 — set Finish by and Save' : 'Enter the new book and Save');
    },
    bookFin: function () { openBookFin(); },
    bookFinOk: function (el) { bookFinOk(el.dataset.v); },
    bookLog: function () { openBookLog(); },
    blP: function (el) { blP = el.dataset.v; openBookLog(); },
    bookRestart: function () { var h = S.habit(stId); if (!h || !h.book) return; openEdit(h.id); var nb = draft.book; nb.on = true; nb.title = ''; nb.au = ''; nb.total = 0; nb.p0 = 0; nb.a = S.today(); nb.end = ''; drawEdit(); App.toast('Enter the new book and Save'); },
    statOpen: function () { readInputs(); var id = draft.id; openStats(id); },
    stMon: function (el) { stMon += +el.dataset.d; if (stMon > 0) stMon = 0; var y = sheet.scrollTop; openStats(stId, true); sheet.scrollTop = y; },
    confirmOk: function () { App._confirm(); },
    setTg: function (el) { if (el.dataset.k === 'demo') { setDemo(!S.demo); var y0 = sheet.scrollTop; openSettings(); sheet.scrollTop = y0; return; } var k = el.dataset.k, s = S.d.settings; s[k] = el.dataset.d ? s[k] === false : !s[k]; S.saveSettings(); App.render(); var y = sheet.scrollTop; openSettings(); sheet.scrollTop = y; },
    setNum: function (el) { S.d.settings[el.dataset.k] = +el.dataset.v; S.saveSettings(); App.render(true); var y = sheet.scrollTop; openSettings(); sheet.scrollTop = y; },
    tabsMode: function (el) { S.d.settings.tabsMode = el.dataset.v; S.saveSettings(); App.render(true); openSettings(); },
    theme: function (el) { S.d.settings.theme = el.dataset.t; var y = sheet.scrollTop; document.documentElement.dataset.theme = el.dataset.t; S.saveSettings(); openSettings(); },
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
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { checkDay(); fillHifz(true); } });

  /* ---- SL 26: days filled in from the Hifz app on this phone (js/hifz.js). Only adds: a higher Hifz number replaces
     a lower one, a tick is added, nothing is ever cleared. Runs on open, on return to the app and when Hifz saves. ---- */
  function fillHifz(draw) {
    if (S.demo || !window.HifzLink) return;
    var hs = S.habits().filter(function (h) { return h.link && !h.archived && !isGroup(h); });
    if (!hs.length || !HifzLink.have()) return;
    var n = 0, now = Date.now(), ds = S.days(31);
    hs.forEach(function (h) {
      ds.forEach(function (d) {
        var v = HifzLink.value(h, d.k), cur = S.val(h.id, d.k);
        if (v == null || S.skipped(h.id, d.k) || (cur != null && cur >= v)) return;
        S.d.entries[h.id + '|' + d.k] = { v: v, s: 0, u: now, hz: 1 }; n++;
      });
    });
    if (n) { S.save(); if (draw && !(sheetOpen || sel || drag || lp)) App.render(); }
  }
  window.addEventListener('storage', function (e) { if (e.key === 'hifz.v2') fillHifz(true); });
  setInterval(checkDay, 30000);
  /* ---- One-time import (v5.23): "Fall" lapse days from the old Loop Habits export (2026-11-13). Fills only empty days
     of the habit named Fall, then marks itself done on this phone. Retries (on open + every 30 s) until the habit
     is here, e.g. after the first sync pull. Remove once applied on all devices. ---- */
  var IMP_FALL = ['2026-02-09','2026-02-13','2026-02-14','2026-03-31','2026-04-22','2026-04-23','2026-04-24','2026-04-25','2026-05-04','2026-05-09','2026-06-05','2026-06-08','2026-06-13','2026-07-23','2026-07-25','2026-07-31','2026-08-09','2026-08-11','2026-08-12','2026-09-03','2026-09-19','2026-09-20','2026-10-10'];
  function importFall() {
    if (S.demo) return;
    try { if (localStorage.getItem('habits.imp.fall') === '1') return; } catch (e) { return; }
    var h = S.habits().filter(function (x) { return !isGroup(x) && x.type === 'yn' && String(x.name || '').trim().toLowerCase() === 'fall'; })[0];
    if (!h) return;
    var n = 0, now = Date.now();
    IMP_FALL.forEach(function (k) {
      var e = S.d.entries[h.id + '|' + k];
      if (e && !e.d && (e.v != null || e.s === 1)) return;   // already logged in this app: keep it
      S.d.entries[h.id + '|' + k] = { v: 1, s: 0, u: now }; n++;
    });
    try { localStorage.setItem('habits.imp.fall', '1'); } catch (e) {}
    if (n) { S.save(); if (!(sheetOpen || sel || drag || lp)) App.render(); App.toast('Imported ' + n + ' old "Fall" days'); }
  }
  setInterval(function () { try { importFall(); } catch (e) {} }, 30000);

  /* ---- Boot ---- */
  S.load();
  try { fillHifz(false); } catch (e) { console.warn('Hifz link', e); }
  try { importFall(); } catch (e) { console.warn('Fall import', e); }
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
