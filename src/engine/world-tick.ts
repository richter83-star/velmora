/**
 * The per-turn world tick (Civ P3 + P4).
 *
 * Folded into `advanceTurnState`, so BOTH live play and the headless sim tick
 * identically (req 7). PURE — never touches the seeded event RNG, so the
 * event-draw stream is unchanged. Each turn:
 *   1. apply each province's set-once governor policy (realm-only mutation),
 *   2. feed a bounded delta into the six nation stats, measured as DEVIATION from
 *      the realm's generation baseline (delta-feed, D3). Because an untouched realm
 *      has now === baseline for EVERY seed, the delta is exactly 0 by construction
 *      — the sim (no governors, no actions) never perturbs the seed sweep — while
 *      real play that improves provinces past their bands makes the stats respond.
 *   3. P4 restive contagion: a province in open revolt bleeds unrest into neighbours.
 *   4. P4 crisis trigger: queue a revolt event when the worst province tips over.
 * Both P4 steps are DORMANT while the realm is calm (no province in revolt), so
 * they don't spontaneously perturb the sweep — the world only stirs once an event's
 * realmFx (see applyRealmFx) has ignited a province. Also refills the action budget.
 *
 * Exact thresholds are conservative on purpose (correctness over feel); tuning is P6.
 */
import type { GameState, Fx, RealmFx } from './types';
import type { Province } from './world';
import { applyFx, queueThen } from './mutate';

/** Imperial actions the player may spend on provinces each turn (D4). */
export const ACTIONS_PER_TURN = 2;
/** A province at or above this unrest is in open revolt (Civ P4): it spreads and triggers a crisis. */
export const REVOLT_UNREST = 60;
/** Queue this crisis event once a province tips into revolt. */
export const REVOLT_EVENT_ID = 'p4_provincial_revolt';

const clampP = (n: number): number => Math.max(0, Math.min(100, Math.round(n)));

/** The single worst province (highest unrest; deterministic tiebreak by id). */
export function worstProvince(ps: Province[]): Province | undefined {
  let worst: Province | undefined;
  for (const p of ps) {
    if (!worst || p.unrest > worst.unrest || (p.unrest === worst.unrest && p.id < worst.id)) worst = p;
  }
  return worst;
}

/** Resolve a RealmFx target to a concrete province (all deterministic). */
function pickTarget(S: GameState, target: RealmFx['target']): Province | undefined {
  const ps = S.realm?.provinces ?? [];
  if (!ps.length) return undefined;
  if (target === 'capital') return ps.find((p) => p.capital) ?? ps[0];
  if (target === 'trigger') {
    const pid = S.crisisProvince;
    return ps.find((p) => p.id === pid) ?? worstProvince(ps);
  }
  return worstProvince(ps);
}

/**
 * Apply a deterministic province mutation from an event outcome (Civ P4). Pure,
 * RNG-free, clamped. Optionally spreads unrest to the target's neighbors.
 */
export function applyRealmFx(S: GameState, fx: RealmFx | undefined): void {
  const realm = S.realm;
  if (!fx || !realm || !realm.provinces.length) return;
  const p = pickTarget(S, fx.target);
  if (!p) return;
  if (typeof fx.control === 'number') p.control = clampP(p.control + fx.control);
  if (typeof fx.unrest === 'number') p.unrest = clampP(p.unrest + fx.unrest);
  if (typeof fx.development === 'number') p.development = clampP(p.development + fx.development);
  if (fx.spread) {
    for (const nid of p.neighbors) {
      const n = realm.provinces.find((q) => q.id === nid);
      if (n) n.unrest = clampP(n.unrest + fx.spread);
    }
  }
}

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

  // 3) Civ P4 — restive contagion. A province in open revolt bleeds unrest into its
  //    neighbours. DORMANT when nothing is boiling (no province >= REVOLT_UNREST),
  //    so a calm/managed realm and the seed sweep stay untouched; the loop only
  //    runs once an event has ignited a province. RNG-free.
  const restive = new Set(ps.filter((p) => p.unrest >= REVOLT_UNREST).map((p) => p.id));
  if (restive.size) {
    for (const p of ps) {
      if (restive.has(p.id)) continue;
      let bump = 0;
      for (const nid of p.neighbors) if (restive.has(nid)) bump += 2;
      if (bump) p.unrest = clampP(p.unrest + Math.min(bump, 4));
    }
  }

  // 4) Civ P4 — crisis lifecycle. crisisProvince tracks the CURRENT worst province
  //    while any province is in open revolt, and exactly one revolt event stays
  //    queued (deduped). Re-arm keys on the QUEUE, not the unrest level, so a
  //    province left burning re-arms on a cooldown and keeps demanding decisions
  //    instead of jamming; and the crisis follows the realm's actual worst
  //    province (e.g. a neighbour that contagion escalates past it). Cleared the
  //    moment the realm calms below REVOLT_UNREST. Deterministic; no event RNG.
  const worst = worstProvince(ps);
  if (worst && worst.unrest >= REVOLT_UNREST) {
    S.crisisProvince = worst.id;
    if (!S.queue.some((q) => q.id === REVOLT_EVENT_ID)) {
      queueThen(S, [{ id: REVOLT_EVENT_ID, inTurns: 3 }]);
    }
  } else {
    S.crisisProvince = null;
  }

  // 5) new turn: refill the imperial-action budget
  S.actionsLeft = ACTIONS_PER_TURN;
}
