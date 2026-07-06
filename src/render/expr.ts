/**
 * Speaker facial expression resolver.
 *
 * The player's own HUD avatar emotes from live stats (`moodExpr` in main.js).
 * Event SPEAKERS (rivals, the antagonist, advisors) previously rendered a flat
 * `neutral` face regardless of the moment. This maps an event's print-genre
 * (`art`) to one of the legacy avatar's five drawn expressions so the NPC across
 * the desk reacts to the scene — a rival smirks, a crisis messenger sweats —
 * for free, offline, and for every character (it drives the parametric SVG, not
 * any art file). Pure: no RNG, no state, so it never perturbs the seeded sweep.
 *
 * Content authors can override per-beat by returning `expr` from an event's
 * `speaker(S)` (e.g. a betrayed patron → 'angry').
 */
export type Expression =
  | 'happy'
  | 'smug'
  | 'neutral'
  | 'worried'
  | 'angry'
  | 'betrayed'
  | 'shocked'
  | 'determined';

export interface SpeakerExpr {
  expr: Expression;
  sweat: boolean;
}

const EXPRESSIONS: readonly Expression[] = [
  'happy',
  'smug',
  'neutral',
  'worried',
  'angry',
  'betrayed',
  'shocked',
  'determined',
];

/**
 * G3.5 — relationship-driven reaction. A recurring rival's face reads the
 * -100..+100 relationship meter you have moved all game: the more you have wronged
 * them, the harder they glare; win them over and they preen. Also returns a subtle
 * frame accent. Pure (no RNG); the caller decides when a speaker is the rival.
 */
export function reactionExpr(rel: number): { expr: Expression; accent: 'hostile' | 'warm' | '' } {
  if (rel <= -55) return { expr: 'betrayed', accent: 'hostile' };
  if (rel <= -20) return { expr: 'angry', accent: 'hostile' };
  if (rel >= 55) return { expr: 'happy', accent: 'warm' };
  if (rel >= 20) return { expr: 'smug', accent: 'warm' };
  return { expr: 'neutral', accent: '' };
}

/** Print-genre → the emotion the speaker most plausibly wears in that frame. */
const GENRE_EXPR: Record<string, SpeakerExpr> = {
  crisis: { expr: 'worried', sweat: true },
  rival: { expr: 'smug', sweat: false },
  bulletin: { expr: 'neutral', sweat: false },
  scene: { expr: 'neutral', sweat: false },
  newspaper: { expr: 'neutral', sweat: false },
};

const isExpression = (v: unknown): v is Expression =>
  typeof v === 'string' && (EXPRESSIONS as readonly string[]).includes(v);

/**
 * Resolve a speaker's expression. An explicit author `override` wins; otherwise
 * the event's `art` genre decides; anything unknown falls back to neutral.
 */
export function speakerExpr(art?: string, override?: unknown): SpeakerExpr {
  if (isExpression(override)) return { expr: override, sweat: override === 'worried' };
  return (art && GENRE_EXPR[art]) || { expr: 'neutral', sweat: false };
}
