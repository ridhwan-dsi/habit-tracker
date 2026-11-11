# Habits

Personal habit tracker — installable PWA on GitHub Pages, works fully offline, data on the device
(Google Drive sync arrives in v5). Built with the toolkit in `D:\Claud Cowork\1. Master\Toolkit for Developing Apps like Hifz tracker`.

Live: https://ridhwan-dsi.github.io/habit-tracker/

Files: index.html · manifest.webmanifest · sw.js (cache-first shell) · css/app.css · js/config.js ·
js/store.js (data model, merge) · js/sync.js (Google sign-in + Drive, inactive until v5) · js/app.js (UI).
Every release: bump `appVersion` in js/config.js AND `SHELL` in sw.js. Icons: `python3 tools/make_icons.py`.
