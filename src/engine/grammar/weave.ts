/**
 * Loom weave engine (pure) — turns a token-bearing Template into a fully-realized
 * GameEvent by resolving its state slots (from S) and lexicon slots (from rng),
 * substituting tokens, then gating the result through the production Zod schema
 * AND the CORE content-safety denylist. If either gate fails it returns null and
 * the caller falls through to an ordinary draw — generated text NEVER reaches the
 * player unvalidated, and a failed weave can never soft-lock.
 *
 * Reproducibility: the rng picks are encoded into the realized event's id
 * (`tpl.id#i.j.k`); reweave() rebuilds the identical event from that id + S with
 * no rng, so a run that saves mid-woven-event re-renders byte-identically.
 */
import type { GameState, GameEvent, PathKey, Fx, SetFlags, IncFlags } from '../types';
import type { Rng } from '../rng';
import { EventSchema } from '../../content/schema';
import { scanRealizedText } from '../../content/denylist';
import { stateSlots } from './slots';
import { LEXICONS, lexValue, type LexKey } from './lexicons';

export interface TemplateChoice {
  label: string;
  hint?: string;
  result?: string;
  fx?: Fx;
  set?: SetFlags;
  inc?: IncFlags;
  tone?: string;
}

export interface Template {
  id: string;
  paths: PathKey[];
  phases: number[];
  weight?: number;
  art?: string;
  kicker?: string;
  title: string;
  body: string;
  /** Lexicon slots the template's tokens reference, in fixed order. */
  lex?: LexKey[];
  choices: TemplateChoice[];
}

/** The marker that distinguishes a woven event id from an authored one. */
export const WOVEN_MARK = '#';

/** Per-turn weave probability by the `weaveDensity` setting. */
export const WEAVE_CHANCE: Record<string, number> = { off: 0, low: 0.12, high: 0.22 };

/** Strip the woven signature to recover the base template/event id (for metrics). */
export function baseEventId(id: string): string {
  const i = id.indexOf(WOVEN_MARK);
  return i < 0 ? id : id.slice(0, i);
}

export function isWovenId(id: string): boolean {
  return id.includes(WOVEN_MARK);
}

function tokenMap(tpl: Template, S: GameState, picks: number[]): Record<string, string> {
  const ss = stateSlots(S);
  const map: Record<string, string> = { ...ss };
  (tpl.lex ?? []).forEach((k, i) => {
    map[k] = lexValue(k, picks[i] ?? 0);
  });
  return map;
}

function sub(text: string, map: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (_m, k: string) => map[k] ?? `{${k}}`);
}

/** Realize a template into a GameEvent from explicit picks (pure, no rng). */
export function realize(tpl: Template, S: GameState, picks: number[]): GameEvent | null {
  const map = tokenMap(tpl, S, picks);
  const ev: GameEvent = {
    id: `${tpl.id}${WOVEN_MARK}${picks.join('.')}`,
    paths: [S.path],
    phases: [S.phase],
    weight: tpl.weight ?? 10,
    art: tpl.art ?? 'scene',
    kicker: tpl.kicker ? sub(tpl.kicker, map) : undefined,
    title: sub(tpl.title, map),
    body: sub(tpl.body, map),
    choices: tpl.choices.map((c) => ({
      label: sub(c.label, map),
      hint: c.hint ? sub(c.hint, map) : undefined,
      result: c.result ? sub(c.result, map) : undefined,
      fx: c.fx,
      set: c.set,
      inc: c.inc,
      tone: c.tone,
    })),
  };
  if (!EventSchema.safeParse(ev).success) return null;
  if (scanRealizedText(ev).length) return null;
  return ev;
}

/** Weave a fresh event (picks chosen from rng). */
export function weaveTemplate(tpl: Template, S: GameState, rng: Rng): GameEvent | null {
  const picks = (tpl.lex ?? []).map((k) => rng.int(0, LEXICONS[k].length - 1));
  return realize(tpl, S, picks);
}

/** Rebuild a woven event from its composite id + S (for reload; no rng). */
export function reweave(
  id: string,
  S: GameState,
  templates: readonly Template[],
): GameEvent | null {
  const hash = id.indexOf(WOVEN_MARK);
  if (hash < 0) return null;
  const tplId = id.slice(0, hash);
  const sig = id.slice(hash + 1);
  const tpl = templates.find((t) => t.id === tplId);
  if (!tpl) return null;
  const picks = sig === '' ? [] : sig.split('.').map((n) => Number(n));
  if (picks.some((n) => !Number.isFinite(n))) return null;
  return realize(tpl, S, picks);
}

/** Eligible templates for the current path/phase (same filter shape as events). */
export function eligibleTemplates(S: GameState, templates: readonly Template[]): Template[] {
  return templates.filter((t) => t.paths.includes(S.path) && t.phases.includes(S.phase));
}
