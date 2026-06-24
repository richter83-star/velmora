/**
 * Tension controller (pure) — a Left-4-Dead-style dynamic pacing model. `tension`
 * estimates how much pressure the run is under right now (heat, world tension, a
 * sour economy, looming scandals); `targetCurve` is the sawtooth the Director
 * steers toward (build → spike → relief → build) so pacing emerges per run rather
 * than firing on flat constant odds. Pure functions of S / turn counters.
 */
import type { GameState } from '../types';
import { latentScandals } from '../scandals';

const clamp01 = (n: number): number => Math.max(0, Math.min(1, n));

/** Current run pressure in [0,1]. */
export function tension(S: GameState): number {
  let t = S.stats.heat / 100; // scrutiny/exposure is the dominant driver
  t += Math.max(0, S.world.tension?.d ?? 0) / 140; // world tension axis
  if ((S.world.economy?.mood ?? 0) < 0) t += 0.08; // a sour economy raises stakes
  const worst = latentScandals(S).reduce((m, s) => Math.max(m, s.severity ?? 0), 0);
  if (worst) t += Math.min(0.2, worst / 100); // a buried scandal looms
  if (S.phase >= 3) t += 0.05; // the endgame runs hotter
  return clamp01(t);
}

const PERIOD = 4;

/** The intensity the Director wants at this point: a rising sawtooth within each
 *  short cycle, biased a little higher in later phases. */
export function targetCurve(phaseTurn: number, phase: number): number {
  const saw = (phaseTurn % PERIOD) / PERIOD; // 0..~0.75 rising, resets each cycle
  const base = 0.32 + 0.05 * Math.min(2, Math.max(0, phase - 1));
  return clamp01(base + 0.45 * saw);
}
