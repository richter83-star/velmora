/**
 * Live Storyteller — orchestration (the one surface main.js calls). Decides
 * whether to attempt a live event this turn (opt-in flag ON + a key present +
 * online + per-run budget remaining + a seeded coin-flip), then runs the
 * client → safety pipeline and returns a validated GameEvent or null. ANY miss
 * falls back to on-device content, so play is never blocked.
 *
 * The BYOK key lives in its OWN localStorage entry, read only here, and is never
 * placed on the save/export/error-report payload.
 */
import type { GameState, GameEvent } from '../engine/types';
import type { Rng } from '../engine/rng';
import { requestLiveEvent } from './client';
import { validateLiveEvent } from './safety';

/** The serialized run state plus the live-layer's own persisted fields. */
export type LiveState = GameState & { liveBudget?: number; liveCache?: GameEvent[] };

export const LIVE_KEY_STORE = 'velmora_live_key';
export const DEFAULT_LIVE_MODEL = 'claude-haiku-4-5';
const LIVE_RATE = 0.5; // of eligible turns that attempt a live event
const MAX_PER_RUN = 12; // hard per-run budget cap (the player pays per call)

export function getLiveKey(): string {
  try {
    return localStorage.getItem(LIVE_KEY_STORE) ?? '';
  } catch {
    return '';
  }
}

export function setLiveKey(key: string): void {
  try {
    if (key) localStorage.setItem(LIVE_KEY_STORE, key);
    else localStorage.removeItem(LIVE_KEY_STORE);
  } catch {
    /* storage blocked — feature simply no-ops */
  }
}

export function hasLiveKey(): boolean {
  return getLiveKey().length > 10;
}

interface LiveSettings {
  liveStoryteller?: boolean;
  liveModel?: string;
}

function online(): boolean {
  try {
    return navigator.onLine !== false;
  } catch {
    return true;
  }
}

/** True if the live path may be attempted at all (no network performed here). */
export function liveEnabled(settings: LiveSettings): boolean {
  return !!settings.liveStoryteller && hasLiveKey() && online();
}

/**
 * Attempt one live event. Returns a fully-validated GameEvent or null (fall back).
 * Mutates S.liveBudget (remaining) and pushes accepted events to S.liveCache so a
 * resumed run can rehydrate them.
 */
export async function maybeLiveEvent(
  S: LiveState,
  settings: LiveSettings,
  rng: Rng,
): Promise<GameEvent | null> {
  if (!liveEnabled(settings)) return null;
  if (typeof S.liveBudget !== 'number') S.liveBudget = MAX_PER_RUN;
  if (S.liveBudget <= 0) return null;
  if (!rng.chance(LIVE_RATE)) return null;

  const raw = await requestLiveEvent(S, {
    apiKey: getLiveKey(),
    model: settings.liveModel || DEFAULT_LIVE_MODEL,
  });
  if (raw == null) return null;

  const result = validateLiveEvent(raw, S);
  if (!result.ok || !result.event) return null;

  S.liveBudget -= 1;
  return result.event;
}
