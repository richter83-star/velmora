/**
 * Run setup — difficulty modes and per-run modifiers applied at career start.
 * Pure helpers operating on the state object; the main engine wires them in.
 */
import type { GameState, DifficultyDef, ModifierDef, StatKey } from './types';
import type { Rng } from './rng';
import { recordScandal } from './scandals';

const STAT_KEYS: StatKey[] = ['support', 'funds', 'influence', 'media', 'base', 'heat'];
const clampStat = (n: number): number => Math.max(0, Math.min(100, n));

/** Resolve a difficulty by id, falling back to standard / the first entry. */
export function difficultyById(list: DifficultyDef[], id: string): DifficultyDef {
  return list.find((d) => d.id === id) ?? list.find((d) => d.id === 'standard') ?? list[0]!;
}

/** Apply a difficulty's flat starting-stat bonus/penalty. */
export function applyDifficultyStart(S: GameState, diff: DifficultyDef): void {
  if (!diff.startStat) return;
  for (const k of STAT_KEYS) S.stats[k] = clampStat(S.stats[k] + diff.startStat);
}

/** Pick `count` distinct modifiers using the seeded generator. */
export function rollModifiers(rng: Rng, all: ModifierDef[], count: number): ModifierDef[] {
  return rng.shuffle(all).slice(0, Math.max(0, count));
}

/** Apply one modifier's start effects to the state. */
export function applyModifier(S: GameState, mod: ModifierDef): void {
  if (mod.fx) {
    for (const k of STAT_KEYS) {
      const d = mod.fx[k];
      if (typeof d === 'number') S.stats[k] = clampStat(S.stats[k] + d);
    }
  }
  if (mod.flags) {
    for (const k of Object.keys(mod.flags)) S.flags[k] = mod.flags[k];
  }
  if (mod.scandalSeed) recordScandal(S, mod.scandalSeed);
  if (mod.antagonistRel && S.antagonistId) {
    const a = S.npcs?.[S.antagonistId];
    if (a) a.relationship = Math.max(-100, Math.min(100, a.relationship + mod.antagonistRel));
  }
}
