/**
 * Player-directed province actions + governor assignment (Civ P3).
 *
 * Pure engine logic driving the interactive map. Reached from the lazy map UI
 * chunk, so it stays out of the entry bundle. Imperial ACTIONS cost one of the
 * per-turn budget (D4); setting a GOVERNOR is free (the province then auto-runs
 * that policy every world tick).
 */
import type { GameState } from './types';
import type { Province } from './world';
import { ACTIONS_PER_TURN, isGovernor } from './world-tick';

const clampP = (n: number): number => Math.max(0, Math.min(100, Math.round(n)));

export interface ProvinceAction {
  id: string;
  label: string;
  hint: string;
  apply: (p: Province) => void;
}

/** One imperial action each (spends 1 of the turn's budget). */
export const PROVINCE_ACTIONS: ProvinceAction[] = [
  { id: 'develop', label: 'Develop', hint: 'grow its economy', apply: (p) => { p.development = clampP(p.development + 8); } },
  { id: 'garrison', label: 'Garrison', hint: 'tighten your grip', apply: (p) => { p.control = clampP(p.control + 10); } },
  { id: 'suppress', label: 'Suppress', hint: 'crush the unrest', apply: (p) => { p.unrest = clampP(p.unrest - 14); } },
  { id: 'sway', label: 'Sway', hint: 'win hearts (grip + calm)', apply: (p) => { p.control = clampP(p.control + 6); p.unrest = clampP(p.unrest - 4); } },
];
const ACTION_BY_ID = new Map(PROVINCE_ACTIONS.map((a) => [a.id, a]));

function findProvince(S: GameState, pid: string): Province | undefined {
  return S.realm?.provinces.find((p) => p.id === pid);
}

/** Imperial actions remaining this turn (defaults to the full budget). */
export function actionsLeft(S: GameState): number {
  return typeof S.actionsLeft === 'number' ? S.actionsLeft : ACTIONS_PER_TURN;
}

export function canAct(S: GameState): boolean {
  return actionsLeft(S) > 0;
}

/** Spend one imperial action on a province. Returns true iff it was applied. */
export function applyProvinceAction(S: GameState, pid: string, actionId: string): boolean {
  if (!canAct(S)) return false;
  const p = findProvince(S, pid);
  const a = ACTION_BY_ID.get(actionId);
  if (!p || !a) return false;
  a.apply(p);
  S.actionsLeft = actionsLeft(S) - 1;
  return true;
}

/** Set (or clear with '' / null) a province's set-once governor. Free. */
export function setGovernor(S: GameState, pid: string, policyId: string | null): boolean {
  const p = findProvince(S, pid);
  if (!p) return false;
  if (!policyId) {
    p.governor = null;
    return true;
  }
  if (!isGovernor(policyId)) return false;
  p.governor = policyId;
  return true;
}
