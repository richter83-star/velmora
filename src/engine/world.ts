/**
 * The province world (Civ pivot P1).
 *
 * Velmora the nation becomes a board of provinces you rule from the top down.
 * This module is the DATA model + deterministic generation; it renders nothing
 * (P2) and does not yet feed the stats or events (P3/P4). The game plays exactly
 * as today with this present in state.
 *
 * Determinism: generation runs on its OWN seeded RNG (`realm:<seed>:<path>`), a
 * separate stream from the event-draw RNG, so adding a world NEVER perturbs the
 * seeded event sweep — same seed+path always yields an identical board.
 */
import { createRng } from './rng';
import type { PathKey } from './types';

export interface Province {
  id: string;
  name: string;
  /** Layout position in [0,1]^2 for the P2 top-down render. */
  x: number;
  y: number;
  /** Adjacent province ids (symmetric); unrest spreads along these in P4. */
  neighbors: string[];
  /** 0..100 how firmly you hold it. */
  control: number;
  /** 0..100 instability. */
  unrest: number;
  /** 0..100 economic/infrastructure level (P3 develop target). */
  development: number;
  /** Dominant faction/bloc id influencing the province. */
  faction: string;
  capital: boolean;
}

export interface Realm {
  provinces: Province[];
  capitalId: string;
}

export interface RealmSummary {
  count: number;
  loyal: number;
  restive: number;
  avgControl: number;
  avgUnrest: number;
  output: number;
}

const MIN_PROVINCES = 12;
const MAX_PROVINCES = 18;

/** Invented, non-real geography roots + qualifiers (kept fictional on purpose). */
const ROOTS = [
  'Kessen', 'Vorla', 'Drath', 'Myre', 'Calsa', 'Tarn', 'Brenn', 'Ostmar', 'Hald', 'Yvern',
  'Corveth', 'Skarn', 'Pell', 'Wend', 'Aldric', 'Threll', 'Mossgate', 'Varn', 'Locke', 'Greft',
];
const QUALIFIERS = ['North ', 'South ', 'East ', 'West ', 'Old ', 'New ', 'Upper ', 'Lower ', 'Greater ', ''];

const clamp = (n: number): number => Math.max(0, Math.min(100, Math.round(n)));
const dist = (a: Province, b: Province): number => Math.hypot(a.x - b.x, a.y - b.y);

/** Generate the province board for a run. Deterministic per (seed, path). */
export function generateWorld(
  seed: number | string,
  path: PathKey,
  opts: { factions?: readonly string[] } = {},
): Realm {
  const rng = createRng(`realm:${seed}:${path}`);
  const factions = opts.factions && opts.factions.length ? opts.factions : ['state'];
  const count = rng.int(MIN_PROVINCES, MAX_PROVINCES);

  // --- Layout: jittered grid so provinces read as a coherent map, not noise. ---
  const cols = Math.ceil(Math.sqrt(count * 1.4));
  const rows = Math.ceil(count / cols);
  const cells: { cx: number; cy: number }[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push({ cx: c, cy: r });
  const chosen = rng.shuffle(cells).slice(0, count);

  const names = pickNames(rng, count);
  const provinces: Province[] = chosen.map((cell, i) => ({
    id: `p${i}`,
    name: names[i] as string,
    x: (cell.cx + 0.25 + rng.next() * 0.5) / cols,
    y: (cell.cy + 0.25 + rng.next() * 0.5) / rows,
    neighbors: [],
    control: rng.int(35, 72),
    unrest: rng.int(4, 40),
    development: rng.int(20, 68),
    faction: rng.pick(factions),
    capital: false,
  }));

  // --- Capital: the most central province; firmly held, calm, developed. ---
  const cx = provinces.reduce((s, p) => s + p.x, 0) / count;
  const cy = provinces.reduce((s, p) => s + p.y, 0) / count;
  let capital = provinces[0] as Province;
  let best = Infinity;
  for (const p of provinces) {
    const d = Math.hypot(p.x - cx, p.y - cy);
    if (d < best) { best = d; capital = p; }
  }
  capital.capital = true;
  capital.control = clamp(capital.control + 25);
  capital.unrest = clamp(capital.unrest - 15);
  capital.development = clamp(capital.development + 20);

  connect(provinces, capital, rng);

  return { provinces, capitalId: capital.id };
}

/** Pick `count` unique, fictional province names. */
function pickNames(rng: ReturnType<typeof createRng>, count: number): string[] {
  const out: string[] = [];
  const used = new Set<string>();
  let guard = 0;
  while (out.length < count && guard++ < count * 20) {
    const name = `${rng.pick(QUALIFIERS)}${rng.pick(ROOTS)}`.trim();
    if (used.has(name)) continue;
    used.add(name);
    out.push(name);
  }
  // Fallback (tiny root pool vs large count): suffix to guarantee uniqueness.
  let n = 1;
  while (out.length < count) out.push(`${rng.pick(ROOTS)} ${n++}`);
  return out;
}

/** Build a connected adjacency graph: a spanning tree from the capital + extra
 *  nearest-neighbor edges for strategic richness. Symmetric, deterministic. */
function connect(provinces: Province[], capital: Province, rng: ReturnType<typeof createRng>): void {
  const link = (a: Province, b: Province): void => {
    if (a === b || a.neighbors.includes(b.id)) return;
    a.neighbors.push(b.id);
    b.neighbors.push(a.id);
  };

  // Spanning tree: attach each province (nearest-to-capital first) to the nearest
  // already-connected one — guarantees the whole board is reachable.
  const connected: Province[] = [capital];
  const remaining = provinces
    .filter((p) => p !== capital)
    .sort((a, b) => dist(a, capital) - dist(b, capital));
  for (const p of remaining) {
    let nearest = connected[0] as Province;
    let best = Infinity;
    for (const q of connected) {
      const d = dist(p, q);
      if (d < best) { best = d; nearest = q; }
    }
    link(p, nearest);
    connected.push(p);
  }

  // Extra edges: connect to the next-nearest non-neighbor for loops/borders.
  for (const p of provinces) {
    if (p.neighbors.length >= 4) continue;
    const candidates = provinces
      .filter((q) => q !== p && !p.neighbors.includes(q.id))
      .sort((a, b) => dist(p, a) - dist(p, b));
    if (candidates.length && rng.chance(0.6)) link(p, candidates[0] as Province);
  }
}

/** Aggregate the board into a nation-level read (feeds the P2 HUD / P3+ stats). */
export function summarizeRealm(realm: Realm): RealmSummary {
  const ps = realm.provinces;
  const n = ps.length || 1;
  return {
    count: ps.length,
    loyal: ps.filter((p) => p.control >= 60).length,
    restive: ps.filter((p) => p.unrest >= 50).length,
    avgControl: Math.round(ps.reduce((s, p) => s + p.control, 0) / n),
    avgUnrest: Math.round(ps.reduce((s, p) => s + p.unrest, 0) / n),
    output: ps.reduce((s, p) => s + p.development, 0),
  };
}
