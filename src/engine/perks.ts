/**
 * Trait perks (pure) — Phase 4 systems depth. Each starting trait already grants
 * an opening stat bonus; this delivers the *ongoing* synergy its description
 * promises, as small, well-scoped modifiers hooked into the dice rolls, the
 * promotion contest, and per-turn heat decay:
 *
 *   orator    — public moves land: media/support rolls easier, election edge.
 *   operator  — schemes land: influence/base rolls easier, power-play edge.
 *   rainmaker — money smooths things: funds rolls easier, election edge.
 *   clean     — scandals stick less: scrutiny fades faster each turn.
 */
import type { StatKey } from './types';

/** Effective-stat bonus a trait lends to rolls on certain stats. */
const ROLL_BONUS = 8;
const ROLL_STATS: Record<string, StatKey[]> = {
  orator: ['media', 'support'],
  operator: ['influence', 'base'],
  rainmaker: ['funds'],
};

export function traitRollBonus(traitId: string | undefined, stat: StatKey): number {
  if (!traitId) return 0;
  return ROLL_STATS[traitId]?.includes(stat) ? ROLL_BONUS : 0;
}

/** Extra scrutiny shed per turn (clean records let scandals fade faster). */
export function traitHeatDecayBonus(traitId: string | undefined): number {
  return traitId === 'clean' ? 1 : 0;
}

/** Contest strength bonus a trait lends to the matching promotion type. */
export function traitContestBonus(traitId: string | undefined, promoType: string): number {
  const election = promoType === 'election';
  if (traitId === 'operator' && !election) return 4;
  if (traitId === 'rainmaker' && election) return 4;
  if (traitId === 'orator' && election) return 4;
  return 0;
}
