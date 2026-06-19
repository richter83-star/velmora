/**
 * Scandals with memory — choices plant latent scandals (`S.scandals`) that can
 * resurface turns or phases later. The engine injects a reckoning event when a
 * latent scandal comes due; resolving it (bury / get ahead / deny) updates its
 * status so it can't resurface again.
 */
import type { GameState, Scandal, ScandalSeed } from './types';

const clamp = (n: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, n));

/** Record a latent scandal (idempotent on id). */
export function recordScandal(S: GameState, seed: ScandalSeed | undefined): void {
  if (!seed) return;
  if (!S.scandals) S.scandals = [];
  if (S.scandals.some((s) => s.id === seed.id)) return;
  S.scandals.push({ ...seed, phase: S.phase, turn: S.totalTurns, status: 'latent' });
}

export function latentScandals(S: GameState): Scandal[] {
  return (S.scandals ?? []).filter((s) => s.status === 'latent');
}

/** Probability a latent scandal resurfaces this turn (scales with severity, heat, phase). */
export function scandalResurfaceChance(S: GameState): number {
  const latent = latentScandals(S);
  if (!latent.length) return 0;
  const sev = Math.max(...latent.map((s) => s.severity));
  let c = 0.05 + sev * 0.04;
  if (S.stats.heat > 50) c += 0.06;
  c += (S.phase - 1) * 0.02;
  return clamp(c, 0, 0.4);
}

/** The latent scandal most due to resurface (most severe; planted before this turn). */
export function pickResurfacing(S: GameState): Scandal | undefined {
  return latentScandals(S)
    .filter((s) => s.turn < S.totalTurns)
    .sort((a, b) => b.severity - a.severity)[0];
}

export function activeScandalRecord(S: GameState): Scandal | undefined {
  return S.activeScandal ? S.scandals?.find((s) => s.id === S.activeScandal) : undefined;
}

/** Apply a resolution to the currently-resurfacing scandal, then clear it. */
export function resolveActiveScandal(
  S: GameState,
  status: 'buried' | 'resolved' | 'exposed' | undefined,
): void {
  if (!status || !S.activeScandal) return;
  const sc = S.scandals?.find((s) => s.id === S.activeScandal);
  if (sc) sc.status = status;
  S.activeScandal = null;
}
