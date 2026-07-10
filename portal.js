/* =====================================================================
   EEHS Algebra 1 Portal — shared progress layer (portal.js, schema v1)
   ---------------------------------------------------------------------
   One tiny file that every app and the hub share. It does three jobs:
     1. Holds the SKILL REGISTRY (the single source of truth for what
        TEKS standards exist, which section they live in, and which file
        runs them). A standard may bundle several MODULES; its progress
        is the roll-up of those modules.
     2. Reads/writes progress to storage under one key.
     3. Exposes a drop-in API for the practice apps:

        Portal.record('A.2A', true, {level: 2})   // after grading a module
        Portal.hint('A.2A')                        // when a hint opens
        Portal.skill('A.2')                        // -> rolled-up stats
        Portal.summary()                           // per-section rollup
        Portal.reportCode()                        // teacher code (manual backup)

   TRACKING LAYER (added):
     - A student identifies with their 6-digit ID (not a generated code).
     - GUEST mode  : nothing is saved past the browser tab/session.
     - STUDENT mode: progress persists on the device AND syncs to a Google
                     Sheet (via Apps Script) keyed on the ID, so it follows
                     them to another Chromebook.
     - The student NAME is teacher-authoritative: it is typed by the teacher
       in the Sheet and travels DOWN to the client only. The client never
       writes the name upward.

   Modules record under their own id (e.g. 'A.2A'..'A.2I'); the standard
   'A.2' aggregates them automatically. Apps keep working standalone: every
   call is guarded, and the storage layer degrades gracefully if a storage
   API is unavailable.
   ===================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /*  SYNC CONFIG                                                        */
  /*  Paste the Apps Script /exec deployment URL here after Part C.      */
  /* ------------------------------------------------------------------ */
  var SYNC_URL = 'https://script.google.com/macros/s/AKfycbwvP9DR8ZfNloUR0Mn1IogfjyPB1kZKTP_ss1o8-sivIY2EYCIR9WBOoY5aX8qHRLnrCQ/exec';

  var LS_KEY = 'eehsAlg1.v1';          // student data (persists across sessions)
  var SS_KEY = 'eehsAlg1.guest.v1';    // guest data  (dies with the tab)
  var SS_MODE = 'eehsAlg1.mode';       // 'guest' once guest mode is chosen
  var KEY = LS_KEY;                     // back-compat alias for anything reading Portal.KEY

  var ID_RE = /^\d{6}$/;               // valid student ID: exactly 6 digits

  /* ---------------- SECTIONS (the four function-family strands) ----------------
     Names + strand titles use the official TEKS language. */
  var SECTIONS = [
    { id: 'linear',      name: 'Linear functions, equations, and inequalities', teks: 'TEKS A.2 \u2013 A.5',  accent: '#2f6cff' },
    { id: 'quadratic',   name: 'Quadratic functions and equations',            teks: 'TEKS A.6 \u2013 A.8',  accent: '#8e78ff' },
    { id: 'exponential', name: 'Exponential functions and equations',          teks: 'TEKS A.9',             accent: '#36c2a0' },
    { id: 'methods',     name: 'Number and algebraic methods',                 teks: 'TEKS A.10 \u2013 A.12', accent: '#f4a531' }
  ];

  /* ---------------- STANDARD REGISTRY ----------------
     Order inside a section IS the suggested path.
     - id      : the TEKS standard (also the storage key for single-page standards)
     - code    : short badge shown on the hub (e.g. 'A.2')
     - name    : the official knowledge-and-skills statement
     - file    : the practice page that runs the standard's modules
     - status  : 'ready' (file exists) | 'soon' (planned)
     - modules : (optional) the sub-skill ids the page records under; the
                 standard's progress is the roll-up of these. */
  var REGISTRY = [
    /* --- Section 1 · Linear functions, equations, and inequalities (A.2–A.5) --- */
    { sec: 'linear', id: 'A.2', code: 'A.2',
      name: 'Write and represent linear equations, inequalities, and systems of equations.',
      file: 'apps/teks-a2.html', status: 'ready',
      modules: ['A.2A','A.2B','A.2C','A.2D','A.2E','A.2F','A.2G','A.2H','A.2I'] },
    { sec: 'linear', id: 'A.3', code: 'A.3',
      name: 'Use graphs of linear functions, key features, and related transformations to represent and solve equations, inequalities, and systems of equations.',
      file: 'apps/teks-a3.html', status: 'ready',
      modules: ['A.3A','A.3B','A.3C','A.3D','A.3E','A.3F','A.3G','A.3H'] },
    { sec: 'linear', id: 'A.4', code: 'A.4',
      name: 'Formulate statistical relationships and evaluate their reasonableness based on real-world data.',
      file: 'apps/teks-a4.html', status: 'ready',
      modules: ['A.4A','A.4B','A.4C'] },
    { sec: 'linear', id: 'A.5', code: 'A.5',
      name: 'Solve linear equations and evaluate the reasonableness of their solutions.',
      file: 'apps/teks-a5.html', status: 'ready',
      modules: ['A.5A','A.5B','A.5C'] },

    /* --- Section 2 · Quadratic functions and equations (A.6–A.8) --- */
    { sec: 'quadratic', id: 'A.6', code: 'A.6',
      name: 'Write and represent quadratic equations.',
      file: 'apps/teks-a6.html', status: 'ready',
      modules: ['A.6A','A.6B','A.6C'] },
    { sec: 'quadratic', id: 'A.7', code: 'A.7',
      name: 'Use graphs of quadratic functions and their related transformations to represent and determine the solutions to equations.',
      file: 'apps/teks-a7.html', status: 'ready',
      modules: ['A.7A','A.7B','A.7C'] },
    { sec: 'quadratic', id: 'A.8', code: 'A.8',
      name: 'Solve quadratic equations and evaluate the reasonableness of their solutions.',
      file: 'apps/teks-a8.html', status: 'ready',
      modules: ['A.8A','A.8B'] },

    /* --- Section 3 · Exponential functions and equations (A.9) --- */
    { sec: 'exponential', id: 'A.9', code: 'A.9',
      name: 'Write, graph, and represent exponential equations and evaluate the reasonableness of their solutions.',
      file: 'apps/teks-a9.html', status: 'ready',
      modules: ['A.9A','A.9B','A.9C','A.9D','A.9E'] },

    /* --- Section 4 · Number and algebraic methods (A.10–A.12) --- */
    { sec: 'methods', id: 'A.10', code: 'A.10',
      name: 'Rewrite in equivalent forms and perform operations on polynomial expressions.',
      file: 'apps/teks-a10.html', status: 'ready',
      modules: ['A.10A','A.10B','A.10C','A.10D','A.10E','A.10F'] },
    { sec: 'methods', id: 'A.11', code: 'A.11',
      name: 'Rewrite algebraic expressions into equivalent forms.',
      file: 'apps/teks-a11.html', status: 'ready',
      modules: ['A.11A','A.11B'] },
    { sec: 'methods', id: 'A.12', code: 'A.12',
      name: 'Write, solve, analyze, and evaluate equations, relations, and functions.',
      file: 'apps/teks-a12.html', status: 'ready',
      modules: ['A.12A','A.12B','A.12C','A.12D','A.12E'] },
  ];

  function regById(id) {
    for (var i = 0; i < REGISTRY.length; i++) { if (REGISTRY[i].id === id) return REGISTRY[i]; }
    return null;
  }

  /* ================================================================== */
  /*  STORAGE + MODE                                                    */
  /*  - localStorage holds STUDENT data (has a valid 6-digit code).      */
  /*  - sessionStorage holds GUEST data (dies with the tab).             */
  /*  - `mem` is a last-ditch fallback if neither API is available       */
  /*    (e.g. a locked-down sandbox); it lasts only for one page.        */
  /* ================================================================== */
  var mem = null;         // fallback store
  var memMode = 'none';   // fallback mode when no storage APIs exist

  var HAS_LS = (function () {
    try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); return true; }
    catch (e) { return false; }
  })();
  var HAS_SS = (function () {
    try { sessionStorage.setItem('__ts', '1'); sessionStorage.removeItem('__ts'); return true; }
    catch (e) { return false; }
  })();

  function blank() { return { v: 1, student: { name: '', code: '' }, skills: {}, sessions: {} }; }

  function hasValidCode(d) {
    return !!(d && d.student && ID_RE.test(d.student.code || ''));
  }

  /* Resolve the current mode from whatever storage is present. */
  function currentMode() {
    if (HAS_LS) {
      try { if (hasValidCode(JSON.parse(localStorage.getItem(LS_KEY)))) return 'student'; }
      catch (e) {}
    } else if (hasValidCode(mem)) {
      return memMode === 'student' ? 'student' : 'none';
    }
    if (HAS_SS && sessionStorage.getItem(SS_MODE) === 'guest') return 'guest';
    if (!HAS_SS && memMode === 'guest') return 'guest';
    return 'none';
  }

  function load() {
    var mode = currentMode();
    if (mode === 'student') {
      if (!HAS_LS) return mem || (mem = blank());
      try { var d = JSON.parse(localStorage.getItem(LS_KEY)); return (d && d.v === 1) ? d : blank(); }
      catch (e) { return blank(); }
    }
    /* guest or none -> session store */
    if (HAS_SS) {
      try { var g = JSON.parse(sessionStorage.getItem(SS_KEY)); if (g && g.v === 1) return g; }
      catch (e) {}
      return blank();
    }
    return mem || (mem = blank());
  }

  function save(d) {
    var mode = currentMode();
    if (mode === 'student') {
      if (!HAS_LS) { mem = d; return; }
      try { localStorage.setItem(LS_KEY, JSON.stringify(d)); } catch (e) {}
      return;
    }
    if (HAS_SS) { try { sessionStorage.setItem(SS_KEY, JSON.stringify(d)); } catch (e) {} return; }
    mem = d;
  }

  function today() { return new Date().toISOString().slice(0, 10); }

  /* ================================================================== */
  /*  CORE API — recording answers                                      */
  /* ================================================================== */

  /* Call once per graded answer. skillId is the MODULE id (e.g. 'A.2C'). */
  function record(skillId, correct, opts) {
    opts = opts || {};
    var d = load();
    var s = d.skills[skillId] || (d.skills[skillId] = { a: 0, c: 0, h: [], lv: 1, t: 0, hints: 0 });
    var wasMastered = computeStats(s).mastered;    // capture pre-record state
    s.a += 1;
    if (correct) s.c += 1;
    s.h.push(correct ? 1 : 0);
    if (s.h.length > 20) s.h.shift();          // keep last 20 only
    if (opts.level) s.lv = opts.level;
    s.t = Date.now();
    // Stamp attempts-at-mastery the first time this SE crosses the threshold.
    // Never overwritten — this records the effort it took to get there, not the
    // count today. Absent when not yet mastered.
    var nowMastered = computeStats(s).mastered;
    if (!wasMastered && nowMastered && s.am == null) s.am = s.a;
    var day = d.sessions[today()] || (d.sessions[today()] = { a: 0, c: 0 });
    day.a += 1;
    if (correct) day.c += 1;
    save(d);
    schedulePush();                            // student mode only (guarded inside)
    return computeStats(s);
  }

  /* Call when a student opens a hint / step reveal (does NOT count as an attempt). */
  function hint(skillId) {
    var d = load();
    var s = d.skills[skillId] || (d.skills[skillId] = { a: 0, c: 0, h: [], lv: 1, t: 0, hints: 0 });
    s.hints = (s.hints || 0) + 1;
    save(d);
    schedulePush();
  }

  /* ================================================================== */
  /*  MASTERY MATH (unchanged)                                          */
  /* ================================================================== */

  /* Mastery model (gentle, no penalties), per module:
       recentAcc = accuracy over the last 10 answers
       mastered  = at least 15 total attempts AND recentAcc >= 80%
       progress  = (attempts capped at 15 / 15) x recentAcc  -> 0..1 */
  function computeStats(s) {
    if (!s || !s.a) {
      return { attempts: 0, correct: 0, recentAcc: 0, mastered: false, progress: 0, level: 1, last: 0, hints: 0, attemptsToMastery: null };
    }
    var last10 = s.h.slice(-10);
    var recentAcc = last10.length ? last10.reduce(function (x, y) { return x + y; }, 0) / last10.length : 0;
    var mastered = s.a >= 15 && last10.length >= 10 && recentAcc >= 0.8;
    var progress = Math.min(1, s.a / 15) * recentAcc;
    return {
      attempts: s.a, correct: s.c, recentAcc: recentAcc,
      mastered: mastered, progress: progress,
      level: s.lv || 1, last: s.t || 0, hints: s.hints || 0,
      attemptsToMastery: (s.am != null ? s.am : null)
    };
  }

  /* Roll a standard's modules up into one stats object. */
  function aggregateModules(d, ids) {
    var attempts = 0, correct = 0, progSum = 0, masteredCount = 0,
        accSum = 0, accN = 0, last = 0, hints = 0;
    ids.forEach(function (mid) {
      var st = computeStats(d.skills[mid]);
      attempts += st.attempts; correct += st.correct; progSum += st.progress;
      if (st.mastered) masteredCount += 1;
      if (st.attempts) { accSum += st.recentAcc; accN += 1; }
      if (st.last > last) last = st.last;
      hints += st.hints;
    });
    var n = ids.length || 1;
    return {
      attempts: attempts, correct: correct,
      recentAcc: accN ? accSum / accN : 0,
      mastered: ids.length > 0 && masteredCount === ids.length,
      progress: progSum / n,
      level: 1, last: last, hints: hints,
      modulesMastered: masteredCount, moduleCount: ids.length
    };
  }

  function statsForD(d, reg) {
    if (reg && reg.modules && reg.modules.length) return aggregateModules(d, reg.modules);
    return computeStats(d.skills[reg ? reg.id : undefined]);
  }

  function skill(id) {
    var d = load();
    return statsForD(d, regById(id) || { id: id });
  }

  function summary() {
    var d = load();
    var out = {};
    SECTIONS.forEach(function (sec) {
      var ready = REGISTRY.filter(function (r) { return r.sec === sec.id && r.status === 'ready'; });
      var progSum = 0, mastered = 0, attempts = 0, correct = 0;
      ready.forEach(function (r) {
        var st = statsForD(d, r);
        progSum += st.progress;
        attempts += st.attempts;
        correct += st.correct;
        if (st.mastered) mastered += 1;
      });
      out[sec.id] = {
        progress: ready.length ? progSum / ready.length : 0,
        mastered: mastered, readyCount: ready.length,
        attempts: attempts, correct: correct
      };
    });
    return out;
  }

  function totals() {
    var d = load(), a = 0, c = 0, m = 0;
    REGISTRY.forEach(function (r) {
      if (r.status !== 'ready') return;
      var st = statsForD(d, r);
      a += st.attempts; c += st.correct;
      if (st.mastered) m += 1;
    });
    return { attempts: a, correct: c, mastered: m };
  }

  function nextOnPath() {
    var d = load();
    for (var i = 0; i < REGISTRY.length; i++) {
      var r = REGISTRY[i];
      if (r.status !== 'ready') continue;
      if (!statsForD(d, r).mastered) return r;
    }
    return null;
  }

  /* ================================================================== */
  /*  IDENTITY (guest / student) + SYNC                                 */
  /* ================================================================== */

  function validId(id) { return ID_RE.test(String(id == null ? '' : id).trim()); }

  function mode() { return currentMode(); }

  /* The student's own id (6 digits) when tracking, else ''. */
  function studentId() {
    var d = load();
    return (d.student && ID_RE.test(d.student.code || '')) ? d.student.code : '';
  }

  /* READ-ONLY. The name is teacher-authored in the Sheet and only ever
     travels down to the client. Kept as a getter for the hub greeting. */
  function studentName() {
    var d = load();
    return (d.student && d.student.name) || '';
  }

  /* Enter GUEST mode: an in-tab session that never touches the Sheet and
     is gone when the tab closes. */
  function startGuest() {
    if (HAS_SS) {
      try {
        sessionStorage.setItem(SS_MODE, 'guest');
        if (!sessionStorage.getItem(SS_KEY)) sessionStorage.setItem(SS_KEY, JSON.stringify(blank()));
      } catch (e) {}
    } else {
      memMode = 'guest';
      if (!mem) mem = blank();
    }
  }

  /* Switch / clear identity on THIS device. Erases local progress with NO
     merge (a deliberate clean switch, per the design). The student's synced
     record in the Sheet is untouched, so nothing is truly lost — re-entering
     the correct id pulls it back. Reopens the chooser (mode becomes 'none'). */
  function switchId() {
    if (HAS_LS) { try { localStorage.removeItem(LS_KEY); } catch (e) {} }
    if (HAS_SS) { try { sessionStorage.removeItem(SS_KEY); sessionStorage.removeItem(SS_MODE); } catch (e) {} }
    mem = null; memMode = 'none';
  }

  function syncConfigured() {
    return !!SYNC_URL && SYNC_URL.indexOf('PASTE_') !== 0;
  }

  /* Commit a data blob as the STUDENT record on this device (flips mode to
     'student') and clears any guest session. */
  function commitStudent(d) {
    if (HAS_SS) { try { sessionStorage.removeItem(SS_KEY); sessionStorage.removeItem(SS_MODE); } catch (e) {} }
    if (HAS_LS) { try { localStorage.setItem(LS_KEY, JSON.stringify(d)); } catch (e) {} }
    else { mem = d; memMode = 'student'; }
  }

  /* Push (server merges) then pull the merged record back down.
     cb(true, mergedData) on a confirmed round trip, else cb(false, reason). */
  function syncRoundTrip(id, data, cb) {
    fetch(SYNC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids CORS preflight
      body: JSON.stringify({ code: id, data: data })
    })
    .then(function () { return fetch(SYNC_URL + '?code=' + encodeURIComponent(id)); })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      if (res && res.found && res.data && res.data.v === 1) cb(true, res.data);
      else cb(false, 'norow');
    })
    .catch(function () { cb(false, 'network'); });
  }

  /* Student enters their ID to START or RESTORE tracking. Same action does
     both: any local (guest) work is pushed up first so the server merges it
     in, then the merged record is pulled back down.

     FAIL HARD: if the round trip does not fully complete, we do NOT flip to
     student mode and we do NOT half-save anything — the student stays exactly
     as they were (still a guest, work intact) and gets an error to retry.
     cb(ok, errMessage, name). */
  function identify(id, cb) {
    cb = cb || function () {};
    id = String(id == null ? '' : id).trim();
    if (!ID_RE.test(id)) { cb(false, 'That ID should be exactly 6 digits.'); return; }
    if (!syncConfigured()) { cb(false, 'Progress saving is not set up yet. Ask your teacher.'); return; }

    var local = load();                 // current guest/session snapshot
    local.student = local.student || {};
    local.student.code = id;

    syncRoundTrip(id, local, function (ok, resOrReason) {
      if (!ok) {
        var msg = (resOrReason === 'norow')
          ? 'Could not confirm your record. Please try again.'
          : 'Could not reach the server. Check the connection and try again.';
        cb(false, msg);                 // stay guest, nothing committed
        return;
      }
      var merged = resOrReason;
      merged.student = merged.student || {};
      merged.student.code = id;          // ensure the id is present locally
      commitStudent(merged);             // now a student on this device
      cb(true, null, merged.student.name || '');
    });
  }

  /* Called on hub load in student mode: pushes local work up (server merges)
     and pulls the merged record back, so cross-device progress and the
     teacher-typed name refresh automatically. Silent on failure — the
     student is already tracking; a missed refresh is harmless.
     cb(ok, name). */
  function refresh(cb) {
    cb = cb || function () {};
    if (currentMode() !== 'student' || !syncConfigured()) { cb(false); return; }
    var d = load();
    if (!d.student || !ID_RE.test(d.student.code || '')) { cb(false); return; }
    syncRoundTrip(d.student.code, d, function (ok, resOrReason) {
      if (!ok) { cb(false); return; }
      var merged = resOrReason;
      merged.student = merged.student || {};
      merged.student.code = d.student.code;
      if (HAS_LS) { try { localStorage.setItem(LS_KEY, JSON.stringify(merged)); } catch (e) {} }
      else { mem = merged; }
      cb(true, merged.student.name || '');
    });
  }

  /* Debounced background push after each record()/hint(). Student mode only. */
  var pushTimer = null;
  function schedulePush() {
    if (currentMode() !== 'student' || !syncConfigured()) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(doPush, 4000); // 4s debounce
  }
  function doPush() {
    if (currentMode() !== 'student' || !syncConfigured()) return;
    var d = load();
    if (!d.student || !ID_RE.test(d.student.code || '')) return;
    fetch(SYNC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ code: d.student.code, data: d })
    }).catch(function () { /* offline — retried on next record() */ });
  }

  /* Best-effort push when the tab is hidden/closed (student mode only). */
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState !== 'hidden') return;
      if (currentMode() !== 'student' || !syncConfigured()) return;
      var d = load();
      if (d.student && ID_RE.test(d.student.code || '')) {
        try { navigator.sendBeacon(SYNC_URL, JSON.stringify({ code: d.student.code, data: d })); } catch (e) {}
      }
    });
  }

  /* ================================================================== */
  /*  MANUAL REPORT CODE (kept as a no-network backup)                  */
  /* ================================================================== */

  function reportCode() {
    var d = load();
    var parts = [d.student.name || 'anon', today()];
    Object.keys(d.skills).forEach(function (id) {
      var s = d.skills[id];
      parts.push(id + ':' + s.a + '.' + s.c + '.' + (s.lv || 1));
    });
    var raw = parts.join('|');
    try { return btoa(unescape(encodeURIComponent(raw))); }
    catch (e) { return raw; }
  }

  function decodeReport(code) {
    try {
      var raw = decodeURIComponent(escape(atob(code.trim())));
      var parts = raw.split('|');
      var out = { name: parts[0], date: parts[1], skills: [] };
      for (var i = 2; i < parts.length; i++) {
        var m = parts[i].match(/^(.+):(\d+)\.(\d+)\.(\d+)$/);
        if (m) out.skills.push({ id: m[1], attempts: +m[2], correct: +m[3], level: +m[4] });
      }
      return out;
    } catch (e) { return null; }
  }

  function resetAll() {
    if (HAS_LS) { try { localStorage.removeItem(LS_KEY); } catch (e) {} }
    if (HAS_SS) { try { sessionStorage.removeItem(SS_KEY); sessionStorage.removeItem(SS_MODE); } catch (e) {} }
    mem = null; memMode = 'none';
  }

  /* ---------------- expose ---------------- */
  window.Portal = {
    KEY: KEY,
    SECTIONS: SECTIONS,
    REGISTRY: REGISTRY,
    regById: regById,
    load: load,
    record: record,
    hint: hint,
    skill: skill,
    summary: summary,
    totals: totals,
    nextOnPath: nextOnPath,

    /* identity + sync */
    mode: mode,
    validId: validId,
    studentId: studentId,
    studentName: studentName,
    startGuest: startGuest,
    identify: identify,
    refresh: refresh,
    switchId: switchId,

    /* manual backup */
    reportCode: reportCode,
    decodeReport: decodeReport,
    resetAll: resetAll,

    storageAvailable: HAS_LS,
    sessionAvailable: HAS_SS,
    syncConfigured: syncConfigured
  };
})();
