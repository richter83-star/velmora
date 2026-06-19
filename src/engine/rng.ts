/**
 * Deterministic, serializable PRNG for Velmora.
 *
 * Why this exists: the prototype used `Math.random()`, which is fine to play
 * but impossible to test or reproduce. A seeded PRNG gives us:
 *   - repeatable automated playthroughs (the seeded E2E sweep),
 *   - shareable run seeds,
 *   - a daily "scenario of the day",
 *   - and reproducible saves (we persist the generator's state, not just the seed).
 *
 * Algorithm: mulberry32 (32-bit state, fast, good distribution for a game).
 * Seeding a string goes through xmur3 to spread entropy across the 32 bits.
 */

/** Hash an arbitrary string into a 32-bit unsigned seed (xmur3). */
export function xmur3(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}

/** Coerce a seed of either form into a 32-bit unsigned integer. */
export function normalizeSeed(seed: number | string): number {
  if (typeof seed === 'number' && Number.isFinite(seed)) return seed >>> 0;
  return xmur3(String(seed));
}

export interface Rng {
  /** The 32-bit seed this generator was created from. */
  readonly seed: number;
  /** Next float in [0, 1). */
  next(): number;
  /** Integer in [min, max] inclusive. */
  int(min: number, max: number): number;
  /** Uniform element from a non-empty array. */
  pick<T>(arr: readonly T[]): T;
  /** True with probability p (clamped to [0, 1]). */
  chance(p: number): boolean;
  /** A new shuffled copy (Fisher–Yates); does not mutate the input. */
  shuffle<T>(arr: readonly T[]): T[];
  /** Current internal state — persist this for reproducible resume. */
  getState(): number;
  /** Restore a previously captured state. */
  setState(state: number): void;
}

/**
 * Create a seeded generator. Pass the same seed (and, for mid-run resume, the
 * same persisted state via setState) to reproduce a sequence exactly.
 */
export function createRng(seed: number | string): Rng {
  const normalized = normalizeSeed(seed);
  let a = normalized;

  const next = (): number => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    seed: normalized,
    next,
    int(min, max) {
      if (max < min) [min, max] = [max, min];
      return Math.floor(next() * (max - min + 1)) + min;
    },
    pick(arr) {
      // Caller guarantees non-empty (matches the prototype's `pick`).
      return arr[Math.floor(next() * arr.length)] as (typeof arr)[number];
    },
    chance(p) {
      return next() < p;
    },
    shuffle(arr) {
      const copy = arr.slice();
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [copy[i], copy[j]] = [copy[j] as (typeof copy)[number], copy[i] as (typeof copy)[number]];
      }
      return copy;
    },
    getState() {
      return a >>> 0;
    },
    setState(state) {
      a = state | 0;
    },
  };
}

/** A fresh, unpredictable 32-bit seed (for brand-new runs without a chosen seed). */
export function randomSeed(): number {
  return (Math.floor(Math.random() * 0xffffffff) ^ Date.now()) >>> 0;
}

/** Stable seed string for the day's shared scenario, e.g. "velmora-2026-06-18". */
export function dailySeed(date: Date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `velmora-${y}-${m}-${d}`;
}
