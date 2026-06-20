/**
 * Promotion-contest math (pure) — player/opponent strength and win chance for
 * elections and power-plays. Shared by the live engine (main.js) and the
 * headless simulator (sim.ts) so the odds can never diverge. The surrounding
 * flow (boosts, rendering, phase advance) stays with each caller.
 */
import type { GameState } from './types';
import type { Rng } from './rng';

const clamp = (n: number, a: number, b: number): number => Math.max(a, Math.min(b, n));

/** The player's contest strength, weighted by promotion type. */
export function promoPlayerStrength(S: GameState, promoType: string): number {
  const s = S.stats;
  if (promoType === 'election') {
    return s.support * 0.5 + s.media * 0.24 + s.funds * 0.14 + s.base * 0.12;
  }
  // power-play
  return clamp(
    s.influence * 0.42 + s.base * 0.3 + s.media * 0.14 + s.support * 0.14 - s.heat * 0.22,
    0,
    100,
  );
}

/**
 * The opponent's contest strength: a phase-scaled base plus seeded jitter,
 * antagonist hostility, and the difficulty bonus, clamped to a fair band.
 */
export function contestOppStrength(
  S: GameState,
  rng: Rng,
  baseOpp: number,
  hostility: number,
  oppBonus: number,
): number {
  return clamp(baseOpp + rng.int(-5, 9) + (S.phase - 1) * 3 + hostility + oppBonus, 20, 90);
}

/** Win chance (percent) for a contest from player vs opponent strength. */
export function promoWinChance(player: number, opp: number): number {
  return clamp(50 + (player - opp) * 1.4, 4, 96);
}
