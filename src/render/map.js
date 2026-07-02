/**
 * Province map renderer (Civ P2) — read-only.
 *
 * Draws the realm as a top-down Voronoi map in the riso/cartoon language, and
 * builds a parallel accessible province list (the a11y interaction layer — a
 * canvas is invisible to screen readers). Lazy chunk: this file + its
 * d3-delaunay geometry dependency load only when the civ map is enabled, so the
 * 70 kB entry budget is untouched.
 *
 * Encoding: cell ink-density = how firmly you hold it (control); red diagonal
 * hatch = unrest (denser = hotter); gold star = capital. Full redraw on each
 * call (cheap for <=18 provinces) — no animation loop (P5 adds motion).
 */
import { computeRegions } from '../engine/world-geometry';

/** Read a theme token off <body>, trimmed, with a fallback. */
function tok(cs, name, fallback) {
  const v = cs.getPropertyValue(name);
  return (v && v.trim()) || fallback;
}

/** Public entry: render the map + build the accessible list. Defensive. */
export function render(S, { canvas, listEl } = {}) {
  const realm = S && S.realm;
  if (!realm || !realm.provinces || !realm.provinces.length) {
    if (listEl) listEl.innerHTML = '';
    return;
  }
  // Build the a11y list first so it exists even if canvas drawing throws.
  buildList(realm, listEl);
  try {
    drawCanvas(realm, canvas, S);
    if (canvas) canvas.removeAttribute('data-fallback');
  } catch {
    // No 2d context / old device: the province list is the fallback (never break the turn).
    if (canvas) canvas.setAttribute('data-fallback', '1');
  }
}

/** The screen-reader / keyboard layer: one focusable button per province. */
function buildList(realm, listEl) {
  if (!listEl) return;
  const rows = realm.provinces.map((p) => {
    const parts = [
      esc(p.name),
      `control ${p.control}`,
      `unrest ${p.unrest}`,
      `development ${p.development}`,
    ];
    if (p.capital) parts.push('capital');
    return `<button type="button" class="civ-prov" data-pid="${esc(p.id)}">${parts.join(', ')}</button>`;
  });
  listEl.innerHTML = rows.join('');
}

function drawCanvas(realm, canvas, S) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no 2d context');
  const cssW = canvas.clientWidth || (canvas.parentElement && canvas.parentElement.clientWidth) || 0;
  if (!cssW) return; // not laid out yet; the next state-change render will draw it
  // Match the backing store to the RESOLVED box: aspect-ratio 4/3 + max-height:44vh
  // can make the box shorter than 4:3, so use clientHeight (the clamped box) or the
  // map would render vertically squished on laptop/landscape viewports.
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

  const regions = computeRegions(realm);
  const byId = new Map(realm.provinces.map((p) => [p.id, p]));
  const sx = (x) => x * cssW;
  const sy = (y) => y * cssH;

  for (const r of regions) {
    const p = byId.get(r.id);
    if (!p) continue;
    tracePath(ctx, r.polygon, sx, sy);
    // control -> ink density (firmly held reads solid/"yours")
    ctx.fillStyle = withAlpha(held, 0.12 + 0.5 * clampUnit(p.control / 100));
    ctx.fill();
    // unrest -> red diagonal hatch clipped to the cell
    if (p.unrest > 15) drawHatch(ctx, r.polygon, sx, sy, hot, p.unrest);
    // border
    tracePath(ctx, r.polygon, sx, sy);
    ctx.lineWidth = p.capital ? 4 : 2.2;
    ctx.strokeStyle = ink;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  // Markers + labels on top so borders don't cut them.
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
      ctx.fillText('★', cx, cy - 8); // gold star
    }
    if (cellWidthPx(r.polygon, cssW) > 46) {
      ctx.fillStyle = ink;
      ctx.font = "700 9px 'Space Mono', ui-monospace, monospace";
      ctx.fillText(p.name.toUpperCase().slice(0, 12), cx, cy + (p.capital ? 6 : 0));
    }
  }

  // First-turn coach mark.
  if (S && S.totalTurns === 0) {
    ctx.fillStyle = withAlpha(ink, 0.85);
    ctx.fillRect(0, cssH - 20, cssW, 20);
    ctx.fillStyle = paper;
    ctx.font = "700 10px 'Space Mono', ui-monospace, monospace";
    ctx.textAlign = 'center';
    ctx.fillText('YOUR NATION · GOLD STAR = CAPITAL', cssW / 2, cssH - 10);
  }
}

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

/** Diagonal hatch inside a cell; line spacing tightens with unrest. */
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
  const gap = Math.max(4, 14 - unrest / 9); // denser = hotter
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

/** Apply alpha to a hex/rgb color, returning an rgba() string. */
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
