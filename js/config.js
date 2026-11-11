/* Public config. The OAuth client ID is not a secret. Empty client ID = local-only app (no sign-in). */
window.APP_CONFIG = {
  appName: 'Habits',
  appVersion: 'v4.10 · 11 Nov 2026',      // bump with sw.js SHELL every release
  googleClientId: '',                  // set in v5 (Google sign-in + Drive sync)
  scope: 'https://www.googleapis.com/auth/drive.appdata openid email',
  driveFile: 'habits.json'
};
