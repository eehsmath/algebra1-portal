/* =====================================================================
   EEHS Algebra 1 Portal — shared progress layer (portal.js, schema v1)
   ---------------------------------------------------------------------
   One tiny file that every app and the hub share. It does three jobs:
     1. Holds the SKILL REGISTRY (the single source of truth for what
        skills exist, which section they live in, and which file runs them).
     2. Reads/writes progress to localStorage under one key.
     3. Exposes a drop-in API for the practice apps:

        Portal.record('lin.slope', true, {level: 2})  // after grading
        Portal.hint('lin.slope')                       // when a hint opens
        Portal.skill('lin.slope')                      // -> stats object
        Portal.summary()                               // per-section rollup
        Portal.reportCode()                            // teacher code

   Apps keep working standalone: every call is guarded, and if
   localStorage is unavailable (sandboxed iframe) it falls back to
   in-memory storage for the session.
   ===================================================================== */
(function () {
  'use strict';

  var KEY = 'eehsAlg1.v1';

  /* ---------------- SECTIONS ---------------- */
  var SECTIONS = [
    { id: 'linear',    name: 'Linear Functions',      teks: 'TEKS A.2 · A.3 · A.4 · A.5', accent: '#2f6cff' },
    { id: 'quadratic', name: 'Quadratic Functions',   teks: 'TEKS A.6 · A.7 · A.8',       accent: '#8e78ff' },
    { id: 'exponential', name: 'Exponential Functions', teks: 'TEKS A.9',                 accent: '#36c2a0' },
    { id: 'methods',   name: 'Algebraic Methods',     teks: 'TEKS A.10 · A.11 · A.12',    accent: '#f4a531' }
  ];

  /* ---------------- SKILL REGISTRY ----------------
     Order inside a section IS the suggested path.
     status: 'ready' (file exists) | 'soon' (planned)
     To add a skill later: add one line here, upload the app file. Done. */
  var REGISTRY = [
    /* --- Section 1 · Linear --- */
    { sec: 'linear', id: 'lin.plot',      name: 'Plot the Point',                 file: 'apps/plot-point.html',                  status: 'ready' },
    { sec: 'linear', id: 'lin.funcnot',   name: 'Function or Not?',               file: 'apps/function-or-not.html',             status: 'ready' },
    { sec: 'linear', id: 'lin.domran',    name: 'Domain & Range Lab',             file: 'apps/domain-range.html',                status: 'ready' },
    { sec: 'linear', id: 'lin.slope',     name: 'Slope Trainer',                  file: 'apps/slope.html',                       status: 'ready' },
    { sec: 'linear', id: 'lin.sf2sip',    name: 'Standard → Slope-Intercept',     file: 'apps/standard-to-slope-intercept.html', status: 'ready' },
    { sec: 'linear', id: 'lin.parperp',   name: 'Parallel · Perpendicular',       file: 'apps/parallel-perpendicular.html',      status: 'ready' },
    { sec: 'linear', id: 'lin.eqineq',    name: 'Equations & Inequalities',       file: 'apps/equations-inequalities.html',      status: 'ready' },
    { sec: 'linear', id: 'lin.words',     name: 'Word Problems (MathText)',       file: 'apps/word-problems.html',               status: 'ready' },
    { sec: 'linear', id: 'lin.attr',      name: 'Attributes: Linear',             file: 'apps/attributes.html?mode=lin',         status: 'ready' },

    /* --- Section 2 · Quadratic --- */
    { sec: 'quadratic', id: 'quad.attr',    name: 'Attributes: Quadratic',        file: 'apps/attributes.html?mode=quad',        status: 'ready' },
    { sec: 'quadratic', id: 'quad.domran',  name: 'Domain & Range: Quadratic',    file: 'apps/domain-range.html?mode=quad',      status: 'ready' },
    { sec: 'quadratic', id: 'quad.transf',  name: 'Transformations Lab',          file: 'apps/transformations.html',             status: 'soon'  },
    { sec: 'quadratic', id: 'quad.solvefac', name: 'Solve by Factoring',          file: 'apps/solve-by-factoring.html',          status: 'soon'  },
    { sec: 'quadratic', id: 'quad.formula', name: 'Quadratic Formula',            file: 'apps/quadratic-formula.html',           status: 'soon'  },
    { sec: 'quadratic', id: 'quad.vertex',  name: 'Vertex ↔ Standard Form',       file: 'apps/vertex-form.html',                 status: 'soon'  },

    /* --- Section 3 · Exponential --- */
    { sec: 'exponential', id: 'exp.attr',   name: 'Attributes: Exponential',      file: 'apps/attributes.html?mode=exp',         status: 'ready' },
    { sec: 'exponential', id: 'exp.growth', name: 'Growth & Decay',               file: 'apps/growth-decay.html',                status: 'soon'  },
    { sec: 'exponential', id: 'exp.write',  name: 'Write y = a·bˣ from Tables',   file: 'apps/write-exponential.html',           status: 'soon'  },
    { sec: 'exponential', id: 'exp.vslin',  name: 'Linear vs. Exponential',       file: 'apps/linear-vs-exponential.html',       status: 'soon'  },

    /* --- Section 4 · Algebraic Methods --- */
    { sec: 'methods', id: 'meth.poly',    name: 'Polynomial Methods',             file: 'apps/polynomials.html',                 status: 'ready' },
    { sec: 'methods', id: 'meth.prop',    name: 'Proportions',                    file: 'apps/proportions.html',                 status: 'ready' },
    { sec: 'methods', id: 'meth.radical', name: 'Radicals',                       file: 'apps/radicals.html',                    status: 'soon'  },
    { sec: 'methods', id: 'meth.systems', name: 'Systems of Equations',           file: 'apps/systems.html',                     status: 'soon'  }
  ];

  /* ---------------- storage ---------------- */
  var mem = null;
  var HAS_LS = (function () {
    try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); return true; }
    catch (e) { return false; }
  })();

  function blank() { return { v: 1, student: { name: '' }, skills: {}, sessions: {} }; }

  function load() {
    if (!HAS_LS) return mem || (mem = blank());
    try {
      var d = JSON.parse(localStorage.getItem(KEY));
      return (d && d.v === 1) ? d : blank();
    } catch (e) { return blank(); }
  }

  function save(d) {
    if (!HAS_LS) { mem = d; return; }
    try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {}
  }

  function today() { return new Date().toISOString().slice(0, 10); }

  /* ---------------- core API ---------------- */

  /* Call once per graded answer. */
  function record(skillId, correct, opts) {
    opts = opts || {};
    var d = load();
    var s = d.skills[skillId] || (d.skills[skillId] = { a: 0, c: 0, h: [], lv: 1, t: 0, hints: 0 });
    s.a += 1;
    if (correct) s.c += 1;
    s.h.push(correct ? 1 : 0);
    if (s.h.length > 20) s.h.shift();          // keep last 20 only
    if (opts.level) s.lv = opts.level;
    s.t = Date.now();
    var day = d.sessions[today()] || (d.sessions[today()] = { a: 0, c: 0 });
    day.a += 1;
    if (correct) day.c += 1;
    save(d);
    return computeStats(s);
  }

  /* Call when a student opens a hint / step reveal (does NOT count as an attempt). */
  function hint(skillId) {
    var d = load();
    var s = d.skills[skillId] || (d.skills[skillId] = { a: 0, c: 0, h: [], lv: 1, t: 0, hints: 0 });
    s.hints = (s.hints || 0) + 1;
    save(d);
  }

  /* Mastery model (gentle, no penalties):
       recentAcc = accuracy over the last 10 answers
       mastered  = at least 15 total attempts AND recentAcc >= 80%
       progress  = (attempts capped at 15 / 15) x recentAcc  -> 0..1 */
  function computeStats(s) {
    if (!s || !s.a) {
      return { attempts: 0, correct: 0, recentAcc: 0, mastered: false, progress: 0, level: 1, last: 0, hints: 0 };
    }
    var last10 = s.h.slice(-10);
    var recentAcc = last10.length ? last10.reduce(function (x, y) { return x + y; }, 0) / last10.length : 0;
    var mastered = s.a >= 15 && last10.length >= 10 && recentAcc >= 0.8;
    var progress = Math.min(1, s.a / 15) * recentAcc;
    return {
      attempts: s.a, correct: s.c, recentAcc: recentAcc,
      mastered: mastered, progress: progress,
      level: s.lv || 1, last: s.t || 0, hints: s.hints || 0
    };
  }

  function skill(id) { return computeStats(load().skills[id]); }

  /* Per-section rollup for the hub. */
  function summary() {
    var d = load();
    var out = {};
    SECTIONS.forEach(function (sec) {
      var skills = REGISTRY.filter(function (r) { return r.sec === sec.id; });
      var ready = skills.filter(function (r) { return r.status === 'ready'; });
      var progSum = 0, mastered = 0, attempts = 0, correct = 0;
      ready.forEach(function (r) {
        var st = computeStats(d.skills[r.id]);
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
    Object.keys(d.skills).forEach(function (id) {
      var st = computeStats(d.skills[id]);
      a += st.attempts; c += st.correct;
      if (st.mastered) m += 1;
    });
    return { attempts: a, correct: c, mastered: m };
  }

  /* First not-yet-mastered ready skill, in registry order. */
  function nextOnPath() {
    var d = load();
    for (var i = 0; i < REGISTRY.length; i++) {
      var r = REGISTRY[i];
      if (r.status !== 'ready') continue;
      if (!computeStats(d.skills[r.id]).mastered) return r;
    }
    return null;
  }

  function studentName(name) {
    var d = load();
    if (name !== undefined) { d.student.name = name; save(d); }
    return d.student.name || '';
  }

  /* Compact code a student can copy into a Google Form / email.
     Format (before base64): name|date|id:attempts.correct.level|... */
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
    if (HAS_LS) { try { localStorage.removeItem(KEY); } catch (e) {} }
    mem = null;
  }

  /* ---------------- expose ---------------- */
  window.Portal = {
    KEY: KEY,
    SECTIONS: SECTIONS,
    REGISTRY: REGISTRY,
    load: load,
    record: record,
    hint: hint,
    skill: skill,
    summary: summary,
    totals: totals,
    nextOnPath: nextOnPath,
    studentName: studentName,
    reportCode: reportCode,
    decodeReport: decodeReport,
    resetAll: resetAll,
    storageAvailable: HAS_LS
  };
})();
