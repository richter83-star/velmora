/**
 * Live Storyteller — the hard safety gate. EVERY string the model produces is
 * validated here BEFORE it can reach the player. The pipeline is:
 *   1. LiveEventSchema (strict subset; rejects engine-semantic fields, clamps fx,
 *      rejects unknown fx keys, caps choices),
 *   2. coerce to a full GameEvent,
 *   3. the PRODUCTION Zod EventSchema (defense in depth),
 *   4. the STRICT content-safety denylist over the candidate event ONLY — the
 *      broad open-generation net (real nations/parties/institutions/figures/
 *      faiths) on top of CORE.
 * Any failure returns null and the caller falls back to on-device content. The
 * model is the suggestion; this gate — not the prompt — is the guarantee.
 *
 * `validateLiveEvent` scans ONLY the candidate event (not the full static
 * PATHS/TRAITS sweep), so a live attempt is cheap.
 */
import type { GameEvent, GameState } from '../engine/types';
import { EventSchema } from '../content/schema';
import { scanRealizedText } from '../content/denylist';
import { LiveEventSchema, coerceLiveEvent } from './contract';

export interface LiveResult {
  ok: boolean;
  event?: GameEvent;
  reasons: string[];
}

/** Validate raw model output into a safe GameEvent, or reject with reasons. */
export function validateLiveEvent(raw: unknown, S: GameState): LiveResult {
  const reasons: string[] = [];

  const parsed = LiveEventSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      reasons: parsed.error.issues.map((i) => `contract: ${i.path.join('.')} ${i.message}`),
    };
  }

  const ev = coerceLiveEvent(parsed.data, S);

  const full = EventSchema.safeParse(ev);
  if (!full.success) {
    return { ok: false, reasons: full.error.issues.map((i) => `schema: ${i.message}`) };
  }

  // STRICT denylist over the candidate event's player-visible strings only.
  const hits = scanRealizedText(ev, { strict: true });
  if (hits.length) return { ok: false, reasons: hits };

  return { ok: true, event: ev, reasons };
}
