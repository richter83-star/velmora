/**
 * Promotion-contest math (pure) — player/opponent strength and win chance for
 * elections and power-plays. Shared by the live engine (main.js) and the
 * headless simulator (sim.ts) so the odds can never diverge. The surrounding
 * flow (boosts, rendering, phase advance) stays with each caller.
 */
import type { GameState } from './types';
import type { Rng } from './rng';
import { coalitionContestMod } from './factions';
import { traitContestBonus } from './perks';

const clamp = (n: number, a: number, b: number): number => Math.max(a, Math.min(b, n));

/**
 * The player's contest strength, weighted by promotion type, plus coalition
 * math: a happy bloc coalition lifts you, an alienated one drags you down.
 */
export function promoPlayerStrength(S: GameState, promoType: string): number {
  const s = S.stats;
  const edge = coalitionContestMod(S) + traitContestBonus(S.player?.trait, promoType);
  if (promoType === 'election') {
    return clamp(s.support * 0.5 + s.media * 0.24 + s.funds * 0.14 + s.base * 0.12 + edge, 0, 100);
  }
  if (promoType === 'purge') {
    // Iron Order: cohesion(influence) + vanguard(base) carry; exposure(heat) bleeds.
    return clamp(
      s.influence * 0.4 + s.base * 0.32 + s.media * 0.14 + s.support * 0.14 - s.heat * 0.2 + edge,
      0,
      100,
    );
  }
  if (promoType === 'acquisition') {
    // Gilded Republic: capital(funds) dominates, leverage(influence) seconds it.
    return clamp(s.funds * 0.55 + s.influence * 0.25 + s.media * 0.12 + s.base * 0.08 + edge, 0, 100);
  }
  if (promoType === 'council') {
    // Anointed Path: devotion(support) + authority(influence); heresy(heat) bleeds.
    return clamp(
      s.support * 0.35 + s.influence * 0.3 + s.base * 0.2 + s.media * 0.15 - s.heat * 0.18 + edge,
      0,
      100,
    );
  }
  // power-play / finale
  return clamp(
    s.influence * 0.42 + s.base * 0.3 + s.media * 0.14 + s.support * 0.14 - s.heat * 0.22 + edge,
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
