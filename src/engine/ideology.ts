/**
 * Ideology axes (pure) — Phase 4 systems depth. Reads the run's accumulated
 * flags into two orthogonal political axes that summarize *how* the player held
 * power, shown as a "Political Profile" on the ending screen. Derivation only
 * (no gameplay-balance effect yet); coalition math can build on these later.
 */
import type { GameState } from './types';

const flag = (S: GameState, k: string): boolean => !!S.flags?.[k];
const num = (S: GameState, k: string): number => {
  const v = S.flags?.[k];
  return typeof v === 'number' ? v : 0;
};
const clamp = (n: number): number => Math.max(0, Math.min(100, n));

export interface IdeologyAxis {
  id: string;
  left: string;
  right: string;
  /** 0 = fully left, 100 = fully right. */
  value: number;
  read: string;
}

function readPos(v: number, left: string, right: string): string {
  if (v <= 18) return `Hard ${left}`;
  if (v <= 42) return `Leans ${left}`;
  if (v < 58) return 'Balanced';
  if (v < 82) return `Leans ${right}`;
  return `Hard ${right}`;
}

/**
 * Two axes:
 *   Rule  — Velvet (consent, reform) ←→ Iron (force, fear)
 *   Hands — Clean (integrity) ←→ Dirty (graft, leverage)
 * Higher value = the right-hand pole.
 */
export function deriveIdeology(S: GameState): IdeologyAxis[] {
  let iron = 50;
  iron += num(S, 'purge_count') * 5;
  if (flag(S, 'bloody_hands')) iron += 16;
  if (flag(S, 'tyrant_rep')) iron += 14;
  if (flag(S, 'zealot_rep')) iron += 8;
  if (flag(S, 'own_cult') || flag(S, 'cult_building')) iron += 8;
  if (flag(S, 'peacemaker')) iron -= 16;
  if (flag(S, 'secret_reformer')) iron -= 14;
  if (flag(S, 'grassroots')) iron -= 8;
  if (flag(S, 'dealmaker')) iron -= 6;

  let dirty = 50;
  if (flag(S, 'corrupt_streak')) dirty += 18;
  if (flag(S, 'blackmailer')) dirty += 12;
  if (flag(S, 'nepotism')) dirty += 10;
  if (flag(S, 'compromised') || flag(S, 'foreign_friends')) dirty += 8;
  if (flag(S, 'stonewaller')) dirty += 6;
  if (flag(S, 'honest_rep')) dirty -= 16;
  if (flag(S, 'clean_streak')) dirty -= 16;
  if (flag(S, 'ascetic_rep')) dirty -= 8;
  if (flag(S, 'martyr_rep')) dirty -= 8;

  iron = clamp(iron);
  dirty = clamp(dirty);
  return [
    { id: 'rule', left: 'Velvet', right: 'Iron', value: iron, read: readPos(iron, 'Velvet', 'Iron') },
    { id: 'hands', left: 'Clean', right: 'Dirty', value: dirty, read: readPos(dirty, 'Clean', 'Dirty') },
  ];
}
