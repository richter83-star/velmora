/**
 * The AI Director (pure) — fuses the playstyle vector, the tension/pacing curve,
 * and the adaptive nemesis into one per-turn object the draw engine consumes. It
 * re-weights the EXISTING event bank (never authors text) so each run pressures
 * the player along the way they actually govern, paces tension like an L4D
 * director, and lets the rival press where you are weak. Built once per turn from
 * S (no rng, no I/O), so the seeded sweep stays fully reproducible.
 *
 * Hard bounds (verified by the sweep): the per-event multiplier is clamped to
 * [WEIGHT_LO, WEIGHT_HI] and never zero, and injection scaling is clamped to a
 * gentle band — so no event becomes undrawable and pacing can't soft-lock.
 */
import type { GameState, GameEvent } from '../types';
import { buildVector, type PlaystyleVec } from './playstyle';
import { eventTag, AXES, type Axis } from './tags';
import { tension as calcTension, targetCurve } from './tension';
import { planNemesis, type NemesisPlan } from './nemesis';

const WEIGHT_LO = 0.25;
const WEIGHT_HI = 4;
const BETA = 1.15; // resonance temperature
const INJ_LO = 0.55;
const INJ_HI = 1.8;

export interface InjectionScale {
  crisis: number;
  scandal: number;
  arc: number;
}

export interface Director {
  vec: PlaystyleVec;
  tension: number;
  target: number;
  plan: NemesisPlan;
  injection: InjectionScale;
  /** Multiplier applied to an event's base weight (clamped, never zero). */
  weightFor(ev: GameEvent): number;
}

const clamp = (n: number, a: number, b: number): number => Math.max(a, Math.min(b, n));

/** Build the director for the current turn (pure function of S). */
export function makeDirector(S: GameState): Director {
  const vec = buildVector(S);
  const tension = calcTension(S);
  const target = targetCurve(S.phaseTurn, S.phase);
  const plan = planNemesis(S);
  const below = target - tension; // >0 => the run needs more intensity

  const injection: InjectionScale = {
    crisis: clamp(1 + below * 1.4, INJ_LO, INJ_HI),
    scandal: clamp(1 + below * 1.0, INJ_LO, INJ_HI),
    arc: clamp(1 + below * 0.5, INJ_LO, INJ_HI),
  };

  function weightFor(ev: GameEvent): number {
    const tag = eventTag(ev);
    // 1) resonance: events in the player's wheelhouse surface more.
    let resonance = 0;
    for (const a of AXES as readonly Axis[]) resonance += (tag.axes[a] ?? 0) * vec[a];
    // 2) pacing: below target favors high-stakes events, above favors relief.
    const stakeBias = below * (tag.stake - 5) * 0.05;
    // 3) the nemesis presses its chosen axis.
    const nemBias = (tag.axes[plan.pressureAxis] ?? 0) * 0.45;
    const score = BETA * resonance + stakeBias + nemBias;
    return clamp(Math.exp(score), WEIGHT_LO, WEIGHT_HI);
  }

  return { vec, tension, target, plan, injection, weightFor };
}

/** The rival's adaptive contest pressure (drop-in for the flat hostility feed). */
export { planNemesis } from './nemesis';
export type { NemesisPlan, Doctrine } from './nemesis';

/** Convenience: the contest edge the nemesis applies this turn. */
export function nemesisContestEdge(S: GameState): number {
  return planNemesis(S).contestEdge;
}
