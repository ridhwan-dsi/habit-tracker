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
    cross: '<svg class="xx" viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg>'
  };
  var SYNC_TXT = { off: 'Not signed in', syncing: 'Syncing…', ok: 'Synced', paused: 'Sync paused', error: 'Sync error' };

  /* ---- what a cell shows ---- */
  function scheduled(h, dt) { return h.freq.t !== 'days' || !h.freq.days.length || h.freq.days.indexOf(dt.getDay()) >= 0; }
  function met(h, v) { return h.tt === 'max' ? v <= h.target : v >= h.target; }
  function cellHtml(h, d) {
    var v = S.val(h.id, d.k), cls = 'c' + (scheduled(h, d.dt) ? '' : ' off') + (d.k === S.today() ? ' tdy' : ''), inner;
    if (h.type === 'yn') {
      if (v) { cls += h.kind === 'bad' ? ' bad' : ' ok'; inner = ICON.tick; } else inner = ICON.cross;
    } else {
      var has = v != null;
      if (has) cls += h.kind === 'bad' ? (met(h, v) ? ' nb' : ' bad') : (met(h, v) ? ' ok' : ' part');
      inner = '<b>' + (has ? num(v) : 0) + '</b>' + (h.unit ? '<i>' + esc(h.unit) + '</i>' : '');
    }
    return '<div class="' + cls + '" data-h="' + h.id + '" data-k="' + d.k + '">' + inner + '</div>';
  }

  var App = {
    render: function () {
      var sc = document.getElementById('sc'), keep = sc ? { l: sc.scrollLeft, t: sc.scrollTop } : null;
      var days = S.days(NDAYS), list = S.habits().filter(function (h) { return !h.archived; });
      var head = '<div class="drow"><div class="nm"></div>' + days.map(function (d, i) {
        return '<div class="dh' + (i === 0 ? ' tdy' : '') + '"><span>' + WD[d.dt.getDay()].toUpperCase() + '</span><b>' + d.dt.getDate() + '</b></div>';
      }).join('') + '</div>';
      var rows = list.map(function (h) {
        return '<div class="hrow"><div class="nm" data-act="edit" data-id="' + h.id + '"><div class="nmi"><span style="color:' + esc(h.color) + '">' + esc(h.name) + '</span></div></div>' +
          days.map(function (d) { return cellHtml(h, d); }).join('') + '</div>';
      }).join('');
      root.innerHTML =
        '<header class="top"><h1>Habits</h1>' +
        '<button class="ib" data-act="add" aria-label="Add habit">' + ICON.plus + '</button>' +
        '<button class="ib" data-act="menu" aria-label="More">' + ICON.more + '</button></header>' +
        (list.length ? '<div class="sc" id="sc"><div class="grid">' + head + rows + '</div></div>'
          : '<div class="empty"><p>No habits yet.</p><button class="btn pri" data-act="add">Add your first habit</button></div>');
      sizeCols();
      sc = document.getElementById('sc');
      if (sc && keep) { sc.scrollLeft = keep.l; sc.scrollTop = keep.t; }
    },
    refreshRow: function (hid) {   // after a mark: redraw one row's cells, keep scroll
      var h = S.habit(hid); if (!h) return App.render();
      S.days(NDAYS).forEach(function (d) {
        var el = root.querySelector('.c[data-h="' + hid + '"][data-k="' + d.k + '"]');
        if (el) el.outerHTML = cellHtml(h, d);
      });
    },
    syncChanged: function () { if (sheetOpen === 'settings') openSettings(); },
    toast: function (m) { var t = document.getElementById('toast'); t.textContent = m; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('on'); }, 2600); }
  };
  window.App = App;

  // Habit-name column takes whatever is left after 4 day columns; older days scroll in from the right.
  function sizeCols() {
    var w = Math.min(window.innerWidth, 720) - 12;   // 12px right gutter; the left gutter is inside .nm
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
  window.addEventListener('popstate', function () { closing = false; if (sheetOpen) hideSheet(); flush(); });
  scrim.addEventListener('click', function () { closeSheet(); });

  function confirmBox(msg, okTxt, cb) {
    showSheet('confirm', '<p>' + esc(msg) + '</p><div class="row end"><button class="btn" data-act="close">Cancel</button><button class="btn danger" data-act="confirmOk">' + esc(okTxt) + '</button></div>');
    App._confirm = function () { closeSheet(cb); };
  }

  /* ---- Number entry (measurable): dialog at the TOP, Enter = OK ---- */
  function askNumber(h, k) {
    var v = S.val(h.id, k), dt = new Date(k + 'T12:00:00');
    showSheet('num',
      '<h3 style="color:' + esc(h.color) + '">' + esc(h.name) + '</h3>' +
      '<p class="small muted">' + WD[dt.getDay()] + ' ' + dt.getDate() + ' ' + dt.toLocaleString('en', { month: 'short' }) +
      ' · target ' + (h.tt === 'max' ? 'at most ' : 'at least ') + num(h.target) + ' ' + esc(h.unit) + '</p>' +
      '<div class="numrow"><button class="btn step" data-act="numStep" data-d="-1" aria-label="Minus one">−</button>' +
      '<input id="numIn" inputmode="decimal" enterkeyhint="done" autocomplete="off" value="' + (v == null ? '' : num(v)) + '" placeholder="0">' +
      '<button class="btn step" data-act="numStep" data-d="1" aria-label="Plus one">+</button></div>' +
      '<div class="row end"><button class="btn" data-act="numClear">Clear</button><span class="grow"></span><button class="btn" data-act="close">Cancel</button><button class="btn pri" data-act="numOk">OK</button></div>', 'attop');
    var inp = document.getElementById('numIn'); inp.focus(); inp.select();
    App._num = function (clear) {
      var t = inp.value.replace(',', '.').trim(), x = clear || t === '' ? null : parseFloat(t);
      if (x != null && !isFinite(x)) return App.toast('Enter a number');
      closeSheet(function () { S.setVal(h.id, k, x == null ? null : num(x)); App.refreshRow(h.id); });
    };
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') App._num(false); });
  }

  /* ---- Mark a day ---- */
  function mark(cell) {
    var h = S.habit(cell.dataset.h), k = cell.dataset.k; if (!h) return;
    if (h.type === 'num') return askNumber(h, k);
    S.setVal(h.id, k, S.val(h.id, k) ? null : 1);
    if (navigator.vibrate) navigator.vibrate(15);
    App.refreshRow(h.id);
  }

  // Long-press on a day cell marks it (short tap only hints, unless "Toggle with short press" is on).
  var lp = null, HOLD = 450;
  root.addEventListener('pointerdown', function (e) {
    var cell = e.target.closest('.c'); if (!cell || e.button > 0) return;
    lp = { cell: cell, x: e.clientX, y: e.clientY, fired: false };
    lp.t = setTimeout(function () { if (lp) { lp.fired = true; cell.classList.remove('press'); mark(cell); } }, HOLD);
    cell.classList.add('press');
  });
  function lpCancel() { if (lp) { clearTimeout(lp.t); lp.cell.classList.remove('press'); } }
  root.addEventListener('pointermove', function (e) { if (lp && (Math.abs(e.clientX - lp.x) > 10 || Math.abs(e.clientY - lp.y) > 10)) { lpCancel(); lp = null; } });
  root.addEventListener('pointercancel', function () { lpCancel(); lp = null; });
  root.addEventListener('pointerup', function () {
    if (!lp) return; lpCancel(); var p = lp; lp = null;
    if (p.fired) return;
    if (S.d.settings.shortPress) mark(p.cell); else App.toast('Hold to mark');
  });
  root.addEventListener('contextmenu', function (e) { if (e.target.closest('.c')) e.preventDefault(); });

  /* ---- Create / edit habit (full-screen page) ---- */
  var draft = null;
  function openEdit(id) {
    var h = id ? S.habit(id) : null;
    draft = JSON.parse(JSON.stringify(h || S.newHabit()));
    draft._new = !h; draft._ttSet = !!h;
    drawEdit();
  }
  function seg(name, cur, opts, locked) {
    return '<div class="seg' + (locked ? ' locked' : '') + '">' + opts.map(function (o) {
      return '<button class="' + (cur === o[0] ? 'on' : '') + '" data-act="ef" data-f="' + name + '" data-v="' + o[0] + '"' + (locked ? ' disabled' : '') + '>' + o[1] + '</button>';
    }).join('') + '</div>';
  }
  function drawEdit() {
    var h = draft, f = h.freq, ws = S.d.settings.weekStart || 0;
    var wdOrder = [0, 1, 2, 3, 4, 5, 6].map(function (i) { return (i + ws) % 7; });
    var html =
      '<div class="ptop"><button class="ib" data-act="close" aria-label="Back">' + ICON.back + '</button><h2>' + (h._new ? 'New habit' : 'Edit habit') + '</h2>' +
      '<button class="btn pri sm" data-act="saveHabit">Save</button></div>' +
      '<div class="form">' +
      '<label class="fl">Name<input id="fName" value="' + esc(h.name) + '" placeholder="e.g. Qur’an pages" enterkeyhint="done" autocomplete="off"></label>' +
      '<div class="fl">Colour<div class="sw">' + COLORS.map(function (c) {
        return '<button class="dot' + (c === h.color ? ' on' : '') + '" style="background:' + c + '" data-act="ef" data-f="color" data-v="' + c + '" aria-label="Colour ' + c + '"></button>';
      }).join('') + '</div></div>' +
      '<div class="fl">Type' + seg('type', h.type, [['yn', 'Yes / No'], ['num', 'Measurable']], !h._new) +
      (!h._new ? '<span class="small muted">Switching type comes in a later version.</span>' : '') + '</div>' +
      '<div class="fl">Habit is' + seg('kind', h.kind, [['good', 'Good — build it'], ['bad', 'Bad — quit it']]) +
      '<span class="small muted">' + (h.kind === 'bad' ? 'A tick means you did it (shown red). Empty days are clean days.' : 'A tick means you did it.') + '</span></div>' +
      (h.type === 'num' ?
        '<div class="two"><label class="fl">Unit<input id="fUnit" value="' + esc(h.unit) + '" placeholder="pages, min, km" autocomplete="off"></label>' +
        '<label class="fl">Target<input id="fTarget" inputmode="decimal" value="' + num(h.target) + '" autocomplete="off"></label></div>' +
        '<div class="fl">Target type' + seg('tt', h.tt, [['min', 'At least'], ['max', 'At most']]) + '</div>' : '') +
      '<div class="fl">Frequency' + seg('freq', f.t, [['day', 'Every day'], ['week', 'Per week'], ['month', 'Per month'], ['days', 'Weekdays']]) +
      (f.t === 'week' || f.t === 'month' ? '<label class="inl"><input id="fN" inputmode="numeric" value="' + (f.n || 1) + '"> times per ' + f.t + '</label>' : '') +
      (f.t === 'days' ? '<div class="wd">' + wdOrder.map(function (i) {
        return '<button class="' + (f.days.indexOf(i) >= 0 ? 'on' : '') + '" data-act="ef" data-f="wd" data-v="' + i + '">' + WD[i].slice(0, 2) + '</button>';
      }).join('') + '</div>' : '') + '</div>' +
      (!h._new ? '<div class="row"><button class="btn danger-o" data-act="delHabit">Delete habit</button></div>' : '') +
      '</div>';
    if (sheetOpen === 'edit') { sheet.innerHTML = html; } else showSheet('edit', html, 'page');
  }
  function readInputs() {   // keep typed values before a redraw
    var g = function (id) { var el = document.getElementById(id); return el ? el.value : null; };
    if (g('fName') != null) draft.name = g('fName');
    if (g('fUnit') != null) draft.unit = g('fUnit').trim();
    if (g('fTarget') != null) { var t = parseFloat(g('fTarget').replace(',', '.')); draft.target = isFinite(t) ? t : draft.target; }
    if (g('fN') != null) { var n = parseInt(g('fN'), 10); draft.freq.n = n > 0 ? n : 1; }
  }

  /* ---- Settings & menu ---- */
  function openMenu() {
    showSheet('menu', '<button class="mi" data-act="settings">Settings</button>', 'menu');
  }
  function openSettings() {
    var s = S.d.settings;
    showSheet('settings',
      '<h3>Settings</h3>' +
      '<h4>Theme</h4><div class="row">' + [['dark', 'Dark'], ['light', 'Light']].map(function (t) { return '<button class="btn sm' + (s.theme === t[0] ? ' pri' : '') + '" data-act="theme" data-t="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>' +
      '<h4>Update app</h4><div class="frow"><label>Load the latest version<br><span class="small muted">Your data is kept. Version: ' + esc(C.appVersion) + '</span></label><button class="btn sm" data-act="updateApp">Update app</button></div>' +
      '<div class="frow"><label>Share this app</label><button class="btn sm" data-act="share">Copy link</button></div>' +
      '<p class="small muted">Google sign-in and sync to your Drive arrive in a later version. Everything is saved on this device.</p>' +
      '<div class="row end"><button class="btn" data-act="close">Close</button></div>');
  }

  /* ---- Actions ---- */
  var actions = {
    add: function () { openEdit(null); },
    edit: function (el) { openEdit(el.dataset.id); },
    ef: function (el) {   // edit-form field change
      readInputs();
      var f = el.dataset.f, v = el.dataset.v, h = draft;
      if (f === 'color') h.color = v;
      else if (f === 'type') { h.type = v; if (v === 'num' && h.target === 1 && !h.unit) h.target = 1; }
      else if (f === 'kind') { h.kind = v; if (!h._ttSet) h.tt = v === 'bad' ? 'max' : 'min'; }
      else if (f === 'tt') { h.tt = v; h._ttSet = true; }
      else if (f === 'freq') { h.freq.t = v; if (v === 'days' && !h.freq.days.length) h.freq.days = [0, 1, 2, 3, 4, 5, 6]; }
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
      delete h._new; delete h._ttSet;
      closeSheet(function () { S.putHabit(h); App.render(); });
    },
    delHabit: function () {
      var id = draft.id, name = draft.name;
      closeSheet(function () {
        confirmBox('Delete “' + name + '” and all its history?', 'Delete', function () { S.delHabit(id); App.render(); App.toast('Deleted'); });
      });
    },
    numStep: function (el) {
      var inp = document.getElementById('numIn'), x = parseFloat((inp.value || '0').replace(',', '.')) || 0;
      inp.value = Math.max(0, num(x + (+el.dataset.d)));
    },
    numOk: function () { App._num(false); },
    numClear: function () { App._num(true); },
    menu: openMenu,
    settings: function () { closeSheet(openSettings); },
    close: function () { closeSheet(); },
    confirmOk: function () { App._confirm(); },
    theme: function (el) { S.d.settings.theme = el.dataset.t; document.documentElement.dataset.theme = el.dataset.t; S.saveSettings(); openSettings(); },
    share: function () { var u = location.origin + location.pathname; (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(function () { App.toast('Link copied'); }, function () { App.toast(u); }); },
    updateApp: function (el) {
      el.disabled = true; el.textContent = 'Updating…';
      var files = ['./', 'index.html', 'css/app.css', 'js/config.js', 'js/store.js', 'js/sync.js', 'js/app.js', 'sw.js'];
      var sw = navigator.serviceWorker;
      var p1 = sw ? sw.getRegistrations().then(function (rs) { return Promise.all(rs.map(function (r) { return r.unregister(); })); }) : Promise.resolve();
      var p2 = window.caches ? caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k.indexOf('-assets') < 0; }).map(function (k) { return caches.delete(k); })); }) : Promise.resolve();
      var p3 = Promise.all(files.map(function (f) { return fetch(f, { cache: 'reload' }).catch(function () {}); }));
      try { sessionStorage.setItem('habits.upd', C.appVersion); } catch (e) {}
      Promise.all([p1, p2, p3]).catch(function () {}).then(function () { location.replace(location.pathname + '?v=' + Date.now()); });
    }
  };
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]'); if (!el) return;
    var fn = actions[el.dataset.act]; if (!fn) return;
    e.preventDefault();
    if (closing) after.push(function () { fn(el); }); else fn(el);
  });
  document.addEventListener('keydown', function (e) {   // Enter in the edit form = Save
    if (e.key === 'Enter' && sheetOpen === 'edit' && e.target.tagName === 'INPUT') { e.preventDefault(); actions.saveHabit(); }
  });

  /* ---- Day rollover: redraw when "today" changes while the app stays open ---- */
  var lastDay = null;
  function checkDay() { var t = S.today(); if (lastDay && t !== lastDay && !sheetOpen) App.render(); lastDay = t; }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) checkDay(); });
  setInterval(checkDay, 60000);

  /* ---- Boot ---- */
  S.load();
  App.render();
  lastDay = S.today();
  Sync.init();
  (function () {   // after Update app: reopen Settings and say what happened
    var old = null; try { old = sessionStorage.getItem('habits.upd'); sessionStorage.removeItem('habits.upd'); } catch (e) {}
    if (old == null) return;
    history.replaceState(null, '', location.pathname); openSettings();
    var v = C.appVersion.split(' ·')[0]; App.toast(old !== C.appVersion ? 'Updated to ' + v : 'Already on the latest version (' + v + ')');
  })();
  if ('serviceWorker' in navigator) {
    var hadSW = !!navigator.serviceWorker.controller, reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () { if (hadSW && !reloaded) { reloaded = true; location.reload(); } });
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(function (reg) { reg.update(); }).catch(function () {});
  }
})();
