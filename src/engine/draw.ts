/**
 * The draw engine (pure) — event eligibility + the per-turn selection that the
 * UI (`main.js`) and the headless simulator both use, so the live game and the
 * seed sweep choose events by identical rules.
 */
import type { GameState, GameEvent } from './types';
import type { Rng } from './rng';
import { arcEventEligible } from './arcs';
import { scandalResurfaceChance, pickResurfacing } from './scandals';
import type { Director } from './director';

/** Per-turn chance the next step of an already-started arc is injected. */
const ARC_CONTINUE_CHANCE = 0.35;
/** Per-turn chance an unstarted arc's entry event is injected. */
const ARC_START_CHANCE = 0.16;

export function eligible(
  S: GameState,
  events: readonly GameEvent[],
  crisisFlag: boolean,
): GameEvent[] {
  return events.filter((e) => {
    if (!!e.crisis !== !!crisisFlag) return false;
    if (e.queueOnly) return false;
    if (!e.paths.includes(S.path)) return false;
    if (!e.phases.includes(S.phase)) return false;
    if (!arcEventEligible(S, e)) return false;
    if (e.req && !e.req(S)) return false;
    if (!e.recurring && S.seen.includes(e.id)) return false;
    return true;
  });
}

export function weightedPick(rng: Rng, list: readonly GameEvent[]): GameEvent {
  let tot = 0;
  for (const e of list) tot += e.weight ?? 10;
  let r = rng.next() * tot;
  for (const e of list) {
    r -= e.weight ?? 10;
    if (r <= 0) return e;
  }
  return list[list.length - 1]!;
}

/**
 * Director-aware weighted pick: each event's base weight is scaled by the
 * Director's per-event multiplier (clamped, never zero) so the SAME pool arrives
 * in a playstyle-specific order/emphasis. Identical to weightedPick when the
 * director is absent.
 */
export function weightedPickScored(
  rng: Rng,
  list: readonly GameEvent[],
  dir: Director | undefined,
): GameEvent {
  if (!dir) return weightedPick(rng, list);
  const w = (e: GameEvent): number => Math.max(0.0001, (e.weight ?? 10) * dir.weightFor(e));
  let tot = 0;
  for (const e of list) tot += w(e);
  let r = rng.next() * tot;
  for (const e of list) {
    r -= w(e);
    if (r <= 0) return e;
  }
  return list[list.length - 1]!;
}

export function crisisChance(S: GameState, crisisMult: number): number {
  if (S.totalTurns < 1) return 0;
  let c = 0.1;
  c += (S.world.tension?.d ?? 0) / 110;
  if ((S.world.economy?.mood ?? 0) < 0) c += 0.06;
  if (S.stats.heat > 60) c += 0.07;
  if (S.phase >= 3) c += 0.04;
  return Math.max(0, Math.min(0.5, c * crisisMult));
}

export type NextDecision = { type: 'event'; event: GameEvent } | { type: 'promotion' };

export interface DrawOpts {
  crisisMult: number;
  scandalMult: number;
  /** Optional AI Director (built once per turn). When absent, chooseNext is
   *  byte-identical to its pre-director behavior. */
  director?: Director;
}

/**
 * The core turn driver (pure). Decides the next event, or that the bank is dry
 * and it's contest time. Mutates `S.queue` (consumes a due item) and
 * `S.activeScandal` (when a scandal resurfaces) — the same side effects the
 * original engine had.
 */
export function chooseNext(
  S: GameState,
  events: readonly GameEvent[],
  rng: Rng,
  opts: DrawOpts,
): NextDecision {
  // 1) a delayed (queued) event that's now due
  const readyIdx = S.queue.findIndex((q) => (q.inTurns ?? 0) <= 0);
  if (readyIdx >= 0) {
    const q = S.queue.splice(readyIdx, 1)[0]!;
    const ev = events.find((e) => e.id === q.id);
    if (ev && (!ev.req || ev.req(S))) return { type: 'event', event: ev };
  }
  // 1.5) a buried scandal resurfaces (scandals with memory; director paces it)
  if (
    rng.chance(
      scandalResurfaceChance(S) * opts.scandalMult * (opts.director?.injection.scandal ?? 1),
    )
  ) {
    const sc = pickResurfacing(S);
    if (sc) {
      S.activeScandal = sc.id;
      const ev = events.find((e) => e.id === 'scandal_resurfaces');
      if (ev) return { type: 'event', event: ev };
    }
  }
  // 1.75) arc progression — authored multi-event storylines must keep surfacing
  // and advancing even as the ordinary bank grows large. An arc step's high
  // weight is still diluted toward invisibility in a 200+ event pool, so give
  // the live arc step a solid per-turn chance to fire on its own, higher once
  // the arc is already in motion (so a started thread reliably reaches its
  // reckoning rather than stalling for the rest of the run).
  const dir = opts.director;
  const arcSteps = eligible(S, events, false).filter((e) => e.arc);
  if (arcSteps.length) {
    const inProgress = arcSteps.some((e) => (e.arc?.stage ?? 0) > 0);
    const baseArc = inProgress ? ARC_CONTINUE_CHANCE : ARC_START_CHANCE;
    if (rng.chance(baseArc * (dir?.injection.arc ?? 1))) {
      return { type: 'event', event: weightedPickScored(rng, arcSteps, dir) };
    }
  }
  // 2) crisis injection on instability (director paces the rate to its curve)
  const crises = eligible(S, events, true);
  if (
    crises.length &&
    rng.chance(crisisChance(S, opts.crisisMult) * (dir?.injection.crisis ?? 1))
  ) {
    return { type: 'event', event: weightedPickScored(rng, crises, dir) };
  }
  // 3) ordinary weighted draw (director re-weights toward the player's playstyle)
  const pool = eligible(S, events, false);
  if (!pool.length) {
    const recur = events.filter(
      (e) =>
        !e.crisis &&
        !e.queueOnly &&
        e.recurring &&
        e.paths.includes(S.path) &&
        e.phases.includes(S.phase) &&
        (!e.req || e.req(S)),
    );
    if (recur.length) return { type: 'event', event: weightedPickScored(rng, recur, dir) };
    return { type: 'promotion' };
  }
  return { type: 'event', event: weightedPickScored(rng, pool, dir) };
}
