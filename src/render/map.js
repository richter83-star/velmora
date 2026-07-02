/**
 * Province map renderer + interaction (Civ P2 read-only + P3 rule phase).
 *
 * Draws the realm as a top-down Voronoi map in the riso language and builds a
 * parallel accessible province list. P3 adds interaction: tapping a province
 * (canvas OR list button) opens an action sheet — spend a per-turn imperial
 * action (develop/garrison/suppress/sway) or set a free set-once governor. All
 * game logic is pure engine (world-actions / world-tick); this file is the lazy
 * UI chunk, so it + d3-delaunay stay out of the 70 kB entry budget.
 *
 * Encoding: cell ink-density = control, red hatch = unrest, gold star = capital,
 * small stamp = a governor is set. Full redraw on each turn (no animation loop).
 */
import { computeRegions, regionAt } from '../engine/world-geometry';
import { PROVINCE_ACTIONS, applyProvinceAction, setGovernor, canAct, actionsLeft } from '../engine/world-actions';
import { GOVERNORS } from '../engine/world-tick';

let _ctx = null; // { S, onChange } for the current render, referenced by handlers
let _regions = []; // last computed regions, for canvas hit-testing
let _wired = false; // interaction handlers attached once
let _sheet = null; // the action-sheet dialog element
let _trigger = null; // element to return focus to on sheet close

/** Read a theme token off <body>, trimmed, with a fallback. */
function tok(cs, name, fallback) {
  const v = cs.getPropertyValue(name);
  return (v && v.trim()) || fallback;
}

/** Public entry: render the map + a11y list + ensure interaction is wired. */
export function render(S, { canvas, listEl, onChange } = {}) {
  _ctx = { S, onChange };
  const realm = S && S.realm;
  if (!realm || !realm.provinces || !realm.provinces.length) {
    if (listEl) listEl.innerHTML = '';
    return;
  }
  buildList(realm, listEl, S);
  _regions = computeRegions(realm);
  try {
    drawCanvas(realm, canvas, S, _regions);
    if (canvas) canvas.removeAttribute('data-fallback');
  } catch {
    if (canvas) canvas.setAttribute('data-fallback', '1');
  }
  wireInteraction(canvas, listEl);
  if (_sheet && _sheet.dataset.pid) refreshSheet(); // keep an open sheet's numbers fresh
}

/** The screen-reader / keyboard layer: one focusable button per province. */
function buildList(realm, listEl, S) {
  if (!listEl) return;
  const rows = realm.provinces.map((p) => {
    const parts = [esc(p.name), `control ${num(p.control)}`, `unrest ${num(p.unrest)}`, `development ${num(p.development)}`];
    if (p.capital) parts.push('capital');
    if (p.governor) parts.push(`governor: ${esc(p.governor)}`);
    return `<button type="button" class="civ-prov" data-pid="${esc(p.id)}">${parts.join(', ')}</button>`;
  });
  const left = actionsLeft(S);
  listEl.innerHTML =
    `<p class="civ-budget-sr">${left} imperial action${left === 1 ? '' : 's'} left this turn</p>` + rows.join('');
}

function drawCanvas(realm, canvas, S, regions) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no 2d context');
  const cssW = canvas.clientWidth || (canvas.parentElement && canvas.parentElement.clientWidth) || 0;
  if (!cssW) return;
  const cssH = canvas.clientHeight || Math.round(cssW * 0.75);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const cs = getComputedStyle(document.body);
  const paper = tok(cs, '--rp-paper-2', '#EEE');
  const ink = tok(cs, '--rp-ink-key', '#161320');
  const held = tok(cs, '--rp-ink-b', '#2E5A86');
  const hot = tok(cs, '--rp-ink-spot', '#C8324A');
  const foil = tok(cs, '--rp-foil', '#B8860B');

  ctx.clearRect(0, 0, cssW, cssH);
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, cssW, cssH);

  const byId = new Map(realm.provinces.map((p) => [p.id, p]));
  const sx = (x) => x * cssW;
  const sy = (y) => y * cssH;

  for (const r of regions) {
    const p = byId.get(r.id);
    if (!p) continue;
    tracePath(ctx, r.polygon, sx, sy);
    ctx.fillStyle = withAlpha(held, 0.12 + 0.5 * clampUnit(p.control / 100));
    ctx.fill();
    if (p.unrest > 15) drawHatch(ctx, r.polygon, sx, sy, hot, p.unrest);
    tracePath(ctx, r.polygon, sx, sy);
    ctx.lineWidth = p.capital ? 4 : 2.2;
    ctx.strokeStyle = ink;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const r of regions) {
    const p = byId.get(r.id);
    if (!p) continue;
    const cx = sx(r.centroid[0]);
    const cy = sy(r.centroid[1]);
    if (p.capital) {
      ctx.fillStyle = foil;
      ctx.font = '700 15px system-ui, sans-serif';
      ctx.fillText('★', cx, cy - 8);
    }
    if (p.governor) {
      // small stamp so self-running provinces read at a glance (design review)
      ctx.fillStyle = ink;
      ctx.font = '700 8px system-ui, sans-serif';
      ctx.fillText('⚙', cx + (cellWidthPx(r.polygon, cssW) > 46 ? 22 : 8), cy - 8);
    }
    if (cellWidthPx(r.polygon, cssW) > 46) {
      ctx.fillStyle = ink;
      ctx.font = "700 9px 'Space Mono', ui-monospace, monospace";
      ctx.fillText(p.name.toUpperCase().slice(0, 12), cx, cy + (p.capital ? 6 : 0));
    }
  }

  // Budget indicator (top-left), so the action count is visible without a tap.
  const left = actionsLeft(S);
  ctx.textAlign = 'left';
  ctx.fillStyle = withAlpha(ink, 0.9);
  ctx.fillRect(0, 0, 132, 18);
  ctx.fillStyle = paper;
  ctx.font = "700 9px 'Space Mono', ui-monospace, monospace";
  ctx.fillText(left > 0 ? `⚑ ${left} ACTION${left === 1 ? '' : 'S'} LEFT` : 'NO ACTIONS — END TURN', 6, 9);

  if (S && S.totalTurns === 0) {
    ctx.textAlign = 'center';
    ctx.fillStyle = withAlpha(ink, 0.85);
    ctx.fillRect(0, cssH - 20, cssW, 20);
    ctx.fillStyle = paper;
    ctx.font = "700 10px 'Space Mono', ui-monospace, monospace";
    ctx.fillText('TAP A PROVINCE TO RULE IT · ★ = CAPITAL · ⚙ = GOVERNED', cssW / 2, cssH - 10);
  }
}

// ---- interaction (P3) ----

function wireInteraction(canvas, listEl) {
  if (_wired) return;
  _wired = true;
  if (canvas) {
    canvas.style.cursor = 'pointer';
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const r = regionAt(_regions, x, y);
      if (r) openSheet(r.id, canvas);
    });
  }
  if (listEl) {
    listEl.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-pid]');
      if (b) openSheet(b.getAttribute('data-pid'), b);
    });
  }
  buildSheet();
}

function buildSheet() {
  if (_sheet) return;
  _sheet = document.createElement('div');
  _sheet.className = 'civ-sheet';
  _sheet.setAttribute('role', 'dialog');
  _sheet.setAttribute('aria-modal', 'true');
  _sheet.setAttribute('aria-labelledby', 'civ-sheet-title');
  _sheet.hidden = true;
  // Append to the game screen so a screen transition (promotion / endgame) tears
  // the sheet down with the screen instead of leaving it floating over the next.
  (document.getElementById('screen-game') || document.body).appendChild(_sheet);
  _sheet.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSheet();
      return;
    }
    if (e.key !== 'Tab') return;
    // Focus trap: an aria-modal dialog must not leak Tab focus to the background.
    const f = [..._sheet.querySelectorAll('button, select, [href], input, [tabindex]:not([tabindex="-1"])')].filter(
      (el) => !el.disabled && el.offsetParent !== null,
    );
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}

function province(pid) {
  return _ctx && _ctx.S && _ctx.S.realm ? _ctx.S.realm.provinces.find((p) => p.id === pid) : undefined;
}

function openSheet(pid, trigger) {
  const p = province(pid);
  if (!p) return;
  _trigger = trigger || null;
  _sheet.dataset.pid = pid;
  _sheet.hidden = false;
  renderSheet(p);
  // Focus the first actionable control (not the close button), falling back sensibly.
  const first =
    _sheet.querySelector('.civ-act:not([disabled])') || _sheet.querySelector('.civ-gov-sel') || _sheet.querySelector('button');
  if (first) first.focus();
}

/** Which control holds focus, so an innerHTML rebuild can restore it (not drop to <body>). */
function focusedControl() {
  const a = document.activeElement;
  if (!a || !_sheet.contains(a)) return null;
  if (a.classList.contains('civ-act')) return { type: 'act', id: a.getAttribute('data-act') };
  if (a.classList.contains('civ-gov-sel')) return { type: 'gov' };
  if (a.classList.contains('civ-sheet-x')) return { type: 'x' };
  return null;
}

function restoreFocus(key) {
  if (!key) return;
  let el =
    key.type === 'act'
      ? _sheet.querySelector(`.civ-act[data-act="${key.id}"]`)
      : key.type === 'gov'
        ? _sheet.querySelector('.civ-gov-sel')
        : _sheet.querySelector('.civ-sheet-x');
  // If the action the user just spent is now disabled, land somewhere sensible.
  if (el && el.disabled) el = _sheet.querySelector('.civ-gov-sel') || _sheet.querySelector('.civ-sheet-x');
  if (el) el.focus();
}

function refreshSheet() {
  const p = province(_sheet.dataset.pid);
  if (!p) {
    closeSheet();
    return;
  }
  const keep = focusedControl();
  renderSheet(p);
  restoreFocus(keep);
}

function renderSheet(p) {
  const S = _ctx.S;
  const left = actionsLeft(S);
  const disabled = !canAct(S) ? 'disabled aria-disabled="true"' : '';
  const acts = PROVINCE_ACTIONS.map(
    (a) => `<button type="button" class="civ-act" data-act="${a.id}" ${disabled}>
      <b>${esc(a.label)}</b><span>${esc(a.hint)}</span></button>`,
  ).join('');
  const govOpts = ['<option value="">No governor</option>']
    .concat(GOVERNORS.map((g) => `<option value="${g.id}"${p.governor === g.id ? ' selected' : ''}>${esc(g.label)} — ${esc(g.hint)}</option>`))
    .join('');
  _sheet.innerHTML = `
    <div class="civ-sheet-card">
      <div class="civ-sheet-head">
        <h3 id="civ-sheet-title">${esc(p.name)}${p.capital ? ' ★' : ''}</h3>
        <button type="button" class="civ-sheet-x" aria-label="Close">✕</button>
      </div>
      <div class="civ-sheet-meters">
        <span>Control <b>${num(p.control)}</b></span><span>Unrest <b>${num(p.unrest)}</b></span><span>Dev <b>${num(p.development)}</b></span>
      </div>
      <div class="civ-sheet-budget">${left} imperial action${left === 1 ? '' : 's'} left this turn</div>
      <div class="civ-acts">${acts}</div>
      <label class="civ-gov"><span>Governor (free, auto-runs each turn)</span>
        <select class="civ-gov-sel">${govOpts}</select></label>
    </div>`;
  _sheet.querySelector('.civ-sheet-x').addEventListener('click', closeSheet);
  _sheet.querySelectorAll('.civ-act').forEach((btn) =>
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-act');
      if (applyProvinceAction(S, p.id, id)) {
        if (_ctx.onChange) _ctx.onChange();
        const label = (PROVINCE_ACTIONS.find((a) => a.id === id) || {}).label || 'Action';
        const n = actionsLeft(S);
        announce(`${label} on ${p.name}. ${n} imperial action${n === 1 ? '' : 's'} left.`);
        refreshSheet();
      }
    }),
  );
  _sheet.querySelector('.civ-gov-sel').addEventListener('change', (e) => {
    setGovernor(S, p.id, e.target.value || null);
    if (_ctx.onChange) _ctx.onChange();
    const g = GOVERNORS.find((x) => x.id === e.target.value);
    announce(g ? `${p.name} governor set to ${g.label}.` : `${p.name} governor cleared.`);
    refreshSheet();
  });
}

function closeSheet() {
  if (!_sheet) return;
  _sheet.hidden = true;
  const pid = _sheet.dataset.pid;
  delete _sheet.dataset.pid;
  // Return focus to the trigger; if it was a list button rebuilt on re-render, re-query the live node by pid.
  let target = _trigger;
  if ((!target || !target.isConnected) && pid) {
    const list = document.getElementById('civ-provinces');
    target = list ? list.querySelector(`[data-pid="${pid}"]`) : null;
  }
  if (target && typeof target.focus === 'function') target.focus();
  _trigger = null;
}

// ---- drawing helpers ----

function tracePath(ctx, poly, sx, sy) {
  ctx.beginPath();
  poly.forEach(([x, y], i) => {
    const px = sx(x);
    const py = sy(y);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
}

function drawHatch(ctx, poly, sx, sy, color, unrest) {
  ctx.save();
  tracePath(ctx, poly, sx, sy);
  ctx.clip();
  const xs = poly.map(([x]) => sx(x));
  const ys = poly.map(([, y]) => sy(y));
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const gap = Math.max(4, 14 - unrest / 9);
  ctx.strokeStyle = withAlpha(color, 0.55);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let d = minX - (maxY - minY); d < maxX; d += gap) {
    ctx.moveTo(d, maxY);
    ctx.lineTo(d + (maxY - minY), minY);
  }
  ctx.stroke();
  ctx.restore();
}

function cellWidthPx(poly, cssW) {
  const xs = poly.map(([x]) => x * cssW);
  return Math.max(...xs) - Math.min(...xs);
}

const clampUnit = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);

function withAlpha(color, a) {
  const c = color.trim();
  if (c.startsWith('#')) {
    const h = c.slice(1);
    const full = h.length === 3 ? h.split('').map((ch) => ch + ch).join('') : h;
    const n = parseInt(full, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  if (c.startsWith('rgb(')) return c.replace('rgb(', 'rgba(').replace(')', `,${a})`);
  return c;
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (ch) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch],
  );
}

/** Coerce an engine stat to a safe integer for display. */
function num(v) {
  return Number(v) || 0;
}

/** Announce to the page's live region so screen-reader users hear action results. */
function announce(msg) {
  const live = document.getElementById('a11y-live');
  if (live) live.textContent = msg;
}
