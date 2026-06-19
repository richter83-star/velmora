/**
 * Story arcs — multi-event sequences with persistent, cross-phase arc-state.
 *
 * An arc step is an ordinary event tagged `arc: { id, stage }`; it is only
 * drawable when the run's arc is at that stage. Choices advance/branch the arc
 * via `arcSet: { id, stage }`. Arc state lives in `S.arcs` (arcId -> stage),
 * which is never reset between phases, so an arc can span Senator → President.
 */
import type { GameState, GameEvent, ArcAdvance } from './types';

/** Current stage of an arc (0 / absent = not started). */
export function arcStage(S: GameState, id: string): number {
  return S.arcs?.[id] ?? 0;
}

/** An arc-step event is drawable only when its arc is at the matching stage. */
export function arcEventEligible(S: GameState, ev: GameEvent): boolean {
  if (!ev.arc) return true;
  return arcStage(S, ev.arc.id) === ev.arc.stage;
}

/** Advance/branch an arc to a new stage (idempotent; initializes the map). */
export function applyArcSet(S: GameState, set: ArcAdvance | undefined): void {
  if (!set) return;
  if (!S.arcs) S.arcs = {};
  S.arcs[set.id] = set.stage;
}
