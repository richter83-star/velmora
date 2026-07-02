/**
 * The per-turn world tick (Civ P3).
 *
 * Folded into `advanceTurnState`, so BOTH live play and the headless sim tick
 * identically (req 7). PURE — never touches the seeded event RNG, so the
 * event-draw stream is unchanged. Two steps each turn:
 *   1. apply each province's set-once governor policy (realm-only mutation),
 *   2. feed a bounded delta into the six nation stats, measured as DEVIATION from
 *      the realm's generation baseline (delta-feed, D3). Because an untouched realm
 *      has now === baseline for EVERY seed, the delta is exactly 0 by construction
 *      — the sim (no governors, no actions) never perturbs the seed sweep — while
 *      real play that improves provinces past their bands makes the stats respond.
 * Also resets the per-turn imperial-action budget (D4).
 *
 * Exact reward thresholds are conservative on purpose (correctness over feel);
 * balance tuning is P6.
 */
import type { GameState, Fx } from './types';
import type { Province } from './world';
import { applyFx } from './mutate';

/** Imperial actions the player may spend on provinces each turn (D4). */
export const ACTIONS_PER_TURN = 2;

const clampP = (n: number): number => Math.max(0, Math.min(100, Math.round(n)));

/** Aggregate province counts the delta-feed watches. */
export interface RealmCounts {
  loyal: number;
  restive: number;
  calm: number;
  rich: number;
}

/** Count provinces in each band — used for BOTH the generation baseline and the live tick. */
export function realmCounts(ps: Province[]): RealmCounts {
  let loyal = 0;
  let restive = 0;
  let calm = 0;
  let rich = 0;
  for (const p of ps) {
    if (p.control >= 65) loyal++;
    if (p.unrest >= 60) restive++;
    if (p.unrest <= 12) calm++;
    if (p.development >= 62) rich++;
  }
  return { loyal, restive, calm, rich };
}

export interface GovernorPolicy {
  id: string;
  label: string;
  hint: string;
  /** Per-turn effect on a governed province (mutates in place, clamped). */
  apply: (p: Province) => void;
}

/** Set-once province policies that auto-run each turn (the anti-burnout half of D4). */
export const GOVERNORS: GovernorPolicy[] = [
  { id: 'develop', label: 'Develop', hint: 'grows the economy', apply: (p) => { p.development = clampP(p.development + 2); } },
  { id: 'pacify', label: 'Pacify', hint: 'calms unrest', apply: (p) => { p.unrest = clampP(p.unrest - 3); } },
  { id: 'fortify', label: 'Fortify', hint: 'tightens your grip', apply: (p) => { p.control = clampP(p.control + 2); } },
  { id: 'extract', label: 'Extract', hint: 'grows fast, breeds resentment', apply: (p) => { p.development = clampP(p.development + 2); p.unrest = clampP(p.unrest + 1); } },
];
const GOV_BY_ID = new Map(GOVERNORS.map((g) => [g.id, g]));

export function isGovernor(id: string): boolean {
  return GOV_BY_ID.has(id);
}

export function applyWorldTick(S: GameState): void {
  const realm = S.realm;
  if (!realm || !realm.provinces.length) return;
  const ps = realm.provinces;

  // 1) governors (realm-only)
  for (const p of ps) {
    if (!p.governor) continue;
    const g = GOV_BY_ID.get(p.governor);
    if (g) g.apply(p);
  }

  // 2) delta-feed by DEVIATION from the realm's generation baseline. A static or
  //    freshly-generated realm has now === baseline for EVERY seed, so the delta
  //    is exactly 0 by construction (structural, not a lucky threshold gap) — the
  //    sim (no governors/actions) never perturbs the seed sweep. Real play that
  //    improves provinces past the bands moves the gains and the stats respond.
  const base = realm.baseline ?? realmCounts(ps); // fallback: no gains for a baseline-less legacy realm
  const now = realmCounts(ps);
  const loyalGain = now.loyal - base.loyal;
  const calmGain = now.calm - base.calm;
  const richGain = now.rich - base.rich;
  const restiveRise = now.restive - base.restive;

  const delta: Fx = {};
  if (restiveRise >= 2) delta.heat = 1;
  else if (calmGain >= 3) delta.heat = -1;
  if (richGain >= 3) delta.funds = 1;
  if (loyalGain >= 3) delta.base = 1;
  if (loyalGain >= 5) delta.support = 1;
  applyFx(S, delta);

  // 3) new turn: refill the imperial-action budget
  S.actionsLeft = ACTIONS_PER_TURN;
}
