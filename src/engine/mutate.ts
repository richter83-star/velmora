/**
 * Pure state-mutation helpers shared by the live engine (main.js) and the
 * headless simulator. Each operates on the run state `S` (and the seeded rng
 * for dice rolls).
 */
import type { GameState, Fx, StatKey, Roll } from './types';
import type { Rng } from './rng';

export const STAT_KEYS: StatKey[] = ['support', 'funds', 'influence', 'media', 'base', 'heat'];
export const clampStat = (n: number): number => Math.max(0, Math.min(100, n));

export function applyFx(S: GameState, fx: Fx | undefined): void {
  if (!fx) return;
  for (const k of STAT_KEYS) {
    const d = fx[k];
    if (typeof d === 'number') S.stats[k] = clampStat(S.stats[k] + d);
  }
}

export function setFlags(S: GameState, set: Record<string, boolean | number | string> | undefined): void {
  if (!set) return;
  for (const k of Object.keys(set)) S.flags[k] = set[k] as number | boolean;
}

export function incFlags(S: GameState, inc: Record<string, number> | undefined): void {
  if (!inc) return;
  for (const k of Object.keys(inc)) {
    const cur = S.flags[k];
    S.flags[k] = (typeof cur === 'number' ? cur : 0) + (inc[k] ?? 0);
  }
}

export function queueThen(S: GameState, arr: { id: string; inTurns?: number }[] | undefined): void {
  if (!arr) return;
  for (const t of arr) S.queue.push({ id: t.id, inTurns: Math.max(1, t.inTurns ?? 2) });
}

export function markSeen(S: GameState, ev: { id: string; recurring?: boolean }): void {
  if (!ev.recurring && !S.seen.includes(ev.id)) S.seen.push(ev.id);
}

export interface RollResult {
  win: boolean;
  stat: StatKey;
  chance: number;
}

export function doRoll(S: GameState, rng: Rng, roll: Roll, bonus = 0): RollResult {
  const sv = (S.stats[roll.stat] ?? 0) + bonus;
  const chance = Math.max(8, Math.min(93, 50 + (sv - roll.dc) * 1.5));
  return { win: rng.next() * 100 < chance, stat: roll.stat, chance: Math.round(chance) };
}
