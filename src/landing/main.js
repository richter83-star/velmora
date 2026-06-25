/**
 * The Velmora Herald landing — entry module (CSP-compliant: all page JS lives
 * here as a hashed, same-origin bundle, since the production CSP forbids inline
 * scripts). Self-hosts its fonts (CSP font-src 'self') and drives the Pretext
 * computed-layout text. Progressive enhancement throughout — if anything here
 * fails, the page stays fully readable.
 */
import '@fontsource/anton/latin-400.css';
import '@fontsource/space-mono/latin-400.css';
import '@fontsource/space-mono/latin-700.css';
import '@fontsource/lora/latin-400.css';
import '@fontsource/lora/latin-400-italic.css';
import '@fontsource/lora/latin-600.css';
import '@fontsource/lora/latin-700.css';
import '@fontsource/unifrakturcook/latin-700.css';

import { prepare, layout } from './pretext.js';

// If JS runs, drop the no-js guard (reveal defaults flip from always-visible to animated).
document.documentElement.classList.remove('no-js');

/* ---- Dateline (satirical, rotates by day) ---- */
(function () {
  const lines = [
    'A FINE DAY FOR A COUP',
    'MOSTLY CLOUDY, CHANCE OF PURGES',
    'MARKETS UP, MORALE DOWN',
    'A QUIET DAY FOR DEMOCRACY (SUSPICIOUS)',
    'HIGH PRESSURE, LOW APPROVAL',
  ];
  const d = new Date();
  const idx = (d.getFullYear() + d.getMonth() + d.getDate()) % lines.length;
  const el = document.getElementById('dateline');
  if (el) el.textContent = lines[idx];
})();

/* ---- Ticker: data-driven; duplicated for a seamless marquee. Empty → hidden. ---- */
(function () {
  const HEADLINES = [
    'CADRE PURGES OWN SHADOW, PROMOTES IT POSTHUMOUSLY',
    'MAGNATE ACQUIRES THE WEATHER; RAIN NOW BEHIND A PAYWALL',
    'STRONGMAN DECLARES VICTORY IN WAR HE ALSO DECLARED',
    'CLERIC RULES MONDAY OPTIONAL, THEN HOLY, THEN MANDATORY',
    'CANDIDATE PROMISES EVERYTHING; FACT-CHECKERS RESIGN EN MASSE',
    'MINISTRY OF TRUTH MISPLACES TRUTH; SEARCH PARTY ALSO MISSING',
  ];
  const run = document.getElementById('ticker-run');
  const ticker = document.querySelector('.ticker');
  if (!run || !ticker) return;
  if (!HEADLINES.length) {
    ticker.hidden = true;
    return;
  }
  const items = HEADLINES.map((h) => `<span>${h}</span>`).join('');
  run.innerHTML = items + items;
})();

/* ---- Scroll reveal (progressive enhancement, reduced-motion aware, with safety net) ---- */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const els = [...document.querySelectorAll('.reveal')];
  const revealAll = () => els.forEach((e) => e.classList.add('in'));
  if (reduce || !('IntersectionObserver' in window)) {
    revealAll();
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  );
  els.forEach((e) => io.observe(e));
  setTimeout(revealAll, 1600); // never let content stay hidden
})();

/* ---- Caricature hover wobble ---- */
(function () {
  document.querySelectorAll('.column').forEach((col) => {
    const portrait = col.querySelector('.column__portrait');
    if (!portrait) return;
    portrait.addEventListener('mouseenter', () => {
      portrait.animate?.(
        [
          { transform: 'rotate(0)' },
          { transform: 'rotate(-2deg)' },
          { transform: 'rotate(2deg)' },
          { transform: 'rotate(0)' },
        ],
        { duration: 380, easing: 'ease-in-out' },
      );
    });
  });
})();

/* ---- Pretext: computed, resize-aware, edit-aware text heights ---- */
(function () {
  const els = [...document.querySelectorAll('[data-pretext]')];
  const handles = new Map();

  const fontOf = (el) => {
    const s = getComputedStyle(el);
    return `${s.fontStyle} ${s.fontWeight} ${s.fontSize}/${s.lineHeight} ${s.fontFamily}`;
  };
  const lineHeightOf = (el) => {
    const lh = parseFloat(getComputedStyle(el).lineHeight);
    return Number.isFinite(lh) ? lh : parseFloat(getComputedStyle(el).fontSize) * 1.2;
  };
  const reprepare = (el) => {
    try {
      handles.set(el, prepare(el.textContent, fontOf(el)));
    } catch {
      handles.delete(el);
    }
  };
  const relayout = () => {
    for (const el of els) {
      const h = handles.get(el);
      if (!h) continue;
      try {
        const { height } = layout(h, el.clientWidth, lineHeightOf(el));
        if (height > 0) el.style.minHeight = `${Math.ceil(height)}px`;
      } catch {
        /* keep natural height */
      }
    }
  };

  const boot = () => {
    document.documentElement.classList.remove('fonts-loading');
    els.forEach(reprepare);
    relayout();
    if ('ResizeObserver' in window) new ResizeObserver(relayout).observe(document.body);
    for (const el of els) {
      if (el.isContentEditable) {
        new MutationObserver(() => {
          reprepare(el);
          relayout();
        }).observe(el, { characterData: true, subtree: true, childList: true });
      }
    }
  };

  const ready = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.race([ready, new Promise((r) => setTimeout(r, 2500))]).then(boot);
})();
