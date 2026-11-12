/* SL 35 Prayer times for time windows (no network: computed on the phone).
   Standard astronomical method (as in praytimes.org): sun declination + equation of time, Fajr/Isha by twilight angle,
   Asr by shadow factor (1 = Hanbali/Shafi'i/Maliki, 2 = Hanafi). Location is typed in by him (auto-location is unreliable).
   Times are in the phone's own time zone. Umm al-Qura's Isha = Maghrib + 90 min (120 in Ramadan, not applied). */
(function () {
  var METHODS = {
    karachi: { name: 'Karachi (Univ. of Islamic Sciences)', fajr: 18, isha: 18 },
    uaq: { name: 'Umm al-Qura, Makkah', fajr: 18.5, ishaMin: 90 },
    mwl: { name: 'Muslim World League', fajr: 18, isha: 17 },
    egypt: { name: 'Egyptian General Authority', fajr: 19.5, isha: 17.5 },
    gulf: { name: 'Gulf region (Dubai)', fajr: 18.2, isha: 18.2 },
    qatar: { name: 'Qatar', fajr: 18, ishaMin: 90 },
    isna: { name: 'ISNA (North America)', fajr: 15, isha: 15 }
  };
  var CITIES = [   // a quick pick; anything else is typed in as latitude / longitude
    ['Dhaka', 23.8103, 90.4125, 'karachi'], ['Chattogram', 22.3569, 91.7832, 'karachi'], ['Sylhet', 24.8949, 91.8687, 'karachi'],
    ['Makkah', 21.4225, 39.8262, 'uaq'], ['Madinah', 24.4672, 39.6111, 'uaq'], ['Riyadh', 24.7136, 46.6753, 'uaq'], ['Jeddah', 21.4858, 39.1925, 'uaq'],
    ['Dammam', 26.4207, 50.0888, 'uaq'], ['Doha', 25.2854, 51.531, 'qatar'], ['Dubai', 25.2048, 55.2708, 'gulf'], ['Abu Dhabi', 24.4539, 54.3773, 'gulf'],
    ['Istanbul', 41.0082, 28.9784, 'mwl'], ['London', 51.5072, -0.1276, 'mwl']
  ];
  var NAMES = { fajr: 'Fajr', sunrise: 'Sunrise', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha', midnight: 'Midnight (half the night)' };
  var rad = Math.PI / 180;
  function sin(d) { return Math.sin(d * rad); } function cos(d) { return Math.cos(d * rad); } function tan(d) { return Math.tan(d * rad); }
  function asin(x) { return Math.asin(x) / rad; } function acos(x) { return Math.acos(x) / rad; } function atan2(y, x) { return Math.atan2(y, x) / rad; }
  function acot(x) { return Math.atan(1 / x) / rad; }
  function fix(a, b) { a = a - b * Math.floor(a / b); return a < 0 ? a + b : a; }
  function julian(y, m, d) { if (m <= 2) { y -= 1; m += 12; } var A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4); return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5; }
  function sun(jd) {
    var D = jd - 2451545.0, g = fix(357.529 + 0.98560028 * D, 360), q = fix(280.459 + 0.98564736 * D, 360);
    var L = fix(q + 1.915 * sin(g) + 0.020 * sin(2 * g), 360), e = 23.439 - 0.00000036 * D;
    var RA = fix(atan2(cos(e) * sin(L), cos(L)) / 15, 24);
    return { decl: asin(sin(e) * sin(L)), eqt: q / 15 - RA };
  }
  /* times(date, {lat, lng, method, asr}) → minutes after local midnight for each prayer (null where the sun never gets there) */
  function times(date, loc) {
    var M = METHODS[loc.method] || METHODS.karachi, lat = loc.lat, lng = loc.lng, fac = loc.asr === 'hanafi' ? 2 : 1;
    var jd = julian(date.getFullYear(), date.getMonth() + 1, date.getDate()) - lng / (15 * 24);
    var tz = -new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12).getTimezoneOffset() / 60;
    var mid = function (t) { return fix(12 - sun(jd + t).eqt, 24); };
    var ang = function (a, t, ccw) {
      var dec = sun(jd + t).decl, x = (-sin(a) - sin(dec) * sin(lat)) / (cos(dec) * cos(lat));
      if (x < -1 || x > 1) return null;
      var T = acos(x) / 15; return mid(t) + (ccw ? -T : T);
    };
    var asr = function (t) { var dec = sun(jd + t).decl; return ang(-acot(fac + tan(Math.abs(lat - dec))), t); };
    var h = { fajr: 5, sunrise: 6, dhuhr: 12, asr: 13, maghrib: 18, isha: 18 };
    for (var it = 0; it < 2; it++) {   // second pass refines with the first pass's times
      var p = function (k) { return (h[k] == null ? 12 : h[k]) / 24; };
      h = { fajr: ang(M.fajr, p('fajr'), true), sunrise: ang(0.833, p('sunrise'), true), dhuhr: mid(p('dhuhr')),
        asr: asr(p('asr')), maghrib: ang(0.833, p('maghrib')), isha: M.ishaMin ? null : ang(M.isha, p('isha')) };
    }
    var out = {};
    Object.keys(h).forEach(function (k) { out[k] = h[k] == null ? null : Math.round((h[k] + tz - lng / 15) * 60); });
    if (M.ishaMin && out.maghrib != null) out.isha = out.maghrib + M.ishaMin;
    // Islamic midnight = halfway from Maghrib to the next Fajr (today's Fajr + 24 h is within a minute of tomorrow's)
    out.midnight = out.maghrib != null && out.fajr != null ? Math.round(out.maghrib + (out.fajr + 1440 - out.maghrib) / 2) : null;
    return out;
  }
  function hm(m) { if (m == null) return '–'; m = ((m % 1440) + 1440) % 1440; var h = Math.floor(m / 60); return (h % 12 || 12) + ':' + ('0' + (m % 60)).slice(-2) + (h < 12 ? ' am' : ' pm'); }   // 12-hour, am/pm
  window.Prayer = { times: times, hm: hm, METHODS: METHODS, CITIES: CITIES, NAMES: NAMES };
})();
