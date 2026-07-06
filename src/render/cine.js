/**
 * G3 — Special Edition broadsheet takeover (grand redesign phase 3).
 *
 * A LAZY chunk (kept out of the 70kB entry budget, loaded on the first act break)
 * that seizes the full frame as a printed page-one at each promotion and at the
 * finale — the "grand" of the Paper of Record. Reuses the precached cinematic stills;
 * ships no new art. UI-only: never touches the seeded RNG, so determinism/replays are
 * untouched. Reduced-motion is handled entirely in CSS (the global reduce-motion rule
 * neutralises the entry animations); this module always resolves via tap / Read-on /
 * Esc / Enter, plus an auto-advance safety so it can never wedge the game loop.
 */

let _open = false;

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Show a full-frame Special Edition. Resolves (calls opts.onDone once) on any
 * dismissal. If one is already open, it resolves immediately (never stack).
 * @param {{eyebrow?:string, headline:string, sub?:string, edition?:string,
 *          still?:string, caption?:string, kind?:'act'|'finale', onDone?:Function}} opts
 */
export function showSpecialEdition(opts) {
  const o = opts || {};
  const finish = typeof o.onDone === 'function' ? o.onDone : () => {};
  if (_open) {
    finish();
    return;
  }
  _open = true;

  const el = document.createElement('div');
  el.className = 'special-edition' + (o.kind ? ' se-' + o.kind : '');
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-label', o.headline || 'Special Edition');

  const still = o.still
    ? `<figure class="se-still"><img src="${esc(o.still)}" alt="" decoding="async">` +
      (o.caption ? `<figcaption>${esc(o.caption)}</figcaption>` : '') +
      `</figure>`
    : '';

  el.innerHTML =
    `<div class="se-sheet">` +
    `<div class="se-masthead">THE VELMORA HERALD${o.edition ? ' · ' + esc(o.edition) : ''}</div>` +
    `<div class="se-eyebrow">${esc(o.eyebrow || 'SPECIAL EDITION')}</div>` +
    `<h2 class="se-headline">${esc(o.headline || '')}</h2>` +
    (o.sub ? `<p class="se-sub">${esc(o.sub)}</p>` : '') +
    still +
    `<button type="button" class="se-continue">Read on &rarr;</button>` +
    `</div>`;

  document.body.appendChild(el);

  let timer = 0;
  const done = () => {
    if (!_open) return;
    _open = false;
    if (timer) clearTimeout(timer);
    document.removeEventListener('keydown', onKey, true);
    el.classList.add('se-out');
    // let the exit transition play, then remove + resolve
    setTimeout(() => {
      try {
        el.remove();
      } catch {
        /* already gone */
      }
      finish();
    }, 200);
  };

  const onKey = (e) => {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      done();
    }
  };

  const btn = el.querySelector('.se-continue');
  if (btn) {
    btn.addEventListener('click', done);
    setTimeout(() => {
      try {
        btn.focus();
      } catch {
        /* ignore */
      }
    }, 40);
  }
  // Tap the backdrop (outside the sheet) to dismiss.
  el.addEventListener('click', (e) => {
    if (e.target === el) done();
  });
  document.addEventListener('keydown', onKey, true);
  // Safety auto-advance so the loop never wedges if the player walks away.
  timer = setTimeout(done, 8000);
}
