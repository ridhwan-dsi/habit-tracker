/* Public config. The OAuth client ID is not a secret. Empty client ID = local-only app (no sign-in). */
window.APP_CONFIG = {
  appName: 'Habits',
  appVersion: 'v5.15 · 12 Nov 2026',      // bump with sw.js SHELL every release
  // Shared with the Hifz app: same origin, same Google project; Hifz uses hifz.json, Habits habits.json (+ its own Sheet).
  googleClientId: '821072899008-ca195enamr9si60pr3s3ruu6q4qa98u1.apps.googleusercontent.com',
  scope: 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file openid email',
  driveFile: 'habits.json'
};
