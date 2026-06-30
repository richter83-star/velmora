/**
 * Vague decision hints (Civ pivot P0).
 *
 * The choice buttons used to spell out exact stat deltas (`▲ Cohesion +14`),
 * which turned a moral/strategic gut-call into arithmetic — pick the biggest
 * number. This replaces those with NO numbers: a risk marker plus at most the
 * two strongest directional pulls, rendered as thematic, color-coded signals
 * ("your grip tightens", "the heat rises"). You read the room, not a spreadsheet,
 * and learn the real cost in the aftermath.
 *
 * Pure: no game state, no DOM, no RNG. The caller passes `locked` (it needs the
 * live state to evaluate `req`). Author overrides (`choice.hint`) pass through.
 */

const STATS = ['support', 'funds', 'influence', 'media', 'base', 'heat'] as const;
type StatKey = (typeof STATS)[number];

/** Per-stat thematic phrasing. `goodUp` = a rise is good (heat is inverted). */
const SIGNAL: Record<StatKey, { up: string; down: string; goodUp: boolean }> = {
  support: { up: 'the crowd warms', down: 'the crowd sours', goodUp: true },
  funds: { up: 'coffers swell', down: 'coffers bleed', goodUp: true },
  influence: { up: 'your grip tightens', down: 'your grip slips', goodUp: true },
  media: { up: 'the press purrs', down: 'the press bares teeth', goodUp: true },
  base: { up: 'the faithful surge', down: 'the faithful waver', goodUp: true },
  heat: { up: 'the heat rises', down: 'the heat fades', goodUp: false },
};

/** How many directional signals to surface — kept low so the read stays vague. */
const MAX_SIGNALS = 2;

export type HintClass = 'lock' | 'risk' | 'up' | 'down' | 'note';

export interface Hint {
  cls: HintClass;
  text: string;
}

export interface ChoiceLike {
  fx?: Partial<Record<StatKey, number>>;
  roll?: { stat?: string } | null;
  reqText?: string;
  hint?: string;
}

export interface HintContext {
  /** True when the choice's `req` failed against the live state (caller computes it). */
  locked?: boolean;
}

/**
 * Build the vague hint chips for a choice: lock (if any) → risk (if a gamble) →
 * up to two dominant directional signals → an author note (if any). Never any
 * numbers, never the stat's mechanical name.
 */
export function deriveHints(choice: ChoiceLike, ctx: HintContext = {}): Hint[] {
  const hints: Hint[] = [];

  if (ctx.locked) {
    hints.push({ cls: 'lock', text: `🔒 ${choice.reqText || 'Locked'}` });
  }

  if (choice.roll) {
    hints.push({ cls: 'risk', text: '⚡ a gamble' });
  }

  if (choice.fx) {
    const pulls = STATS.map((k) => ({ k, d: choice.fx?.[k] ?? 0 }))
      .filter((p) => p.d !== 0)
      .sort((a, b) => Math.abs(b.d) - Math.abs(a.d))
      .slice(0, MAX_SIGNALS);

    for (const { k, d } of pulls) {
      const s = SIGNAL[k];
      const rising = d > 0;
      const good = s.goodUp ? rising : !rising;
      hints.push({ cls: good ? 'up' : 'down', text: rising ? s.up : s.down });
    }
  }

  if (choice.hint) {
    hints.push({ cls: 'note', text: choice.hint });
  }

  return hints;
}
