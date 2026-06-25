/**
 * Live Storyteller — prompt assembly. The system prompt fixes the fiction and
 * restates the content rules (defense in depth — the linter is the hard gate,
 * the prompt just reduces rejections); the user message carries a compact,
 * non-identifying state vector. The model is asked for a single `emit_event`
 * tool call, so it returns structured JSON, never prose.
 */
import type { GameState } from '../engine/types';
import { PATHS } from '../content/paths';
import { blocList } from '../engine/factions';
import { antagonist, dispositionLabel } from '../engine/npcs';

const SYSTEM = `You are the Storyteller for VELMORA, a savage adult-cartoon political satire (think South Park / Veep) set entirely in the wholly fictional land of Velmora. You write tense, character-driven political dilemmas about the MECHANISM of power, with a foul-mouthed TV-MA voice.

TONE (TV-MA — encouraged): strong profanity, crude and sexual innuendo, gross-out gags, cartoon violence, and savage dark satire are all welcome. Be funny and merciless about power, ideology, and institutional hypocrisy — aimed at INVENTED Velmora factions and figures.

ABSOLUTE RED LINES (non-negotiable — output is auto-rejected if violated):
- Velmora and everything in it is FICTIONAL. Invent fictional factions, places, and figures.
- NEVER name, reference, or allude to any real-world ideology, religion, faith, deity, scripture, nation, city, government, political party, movement, institution, agency, or living or historical public figure. No real-world symbols. Satirise the MECHANISM ("your inner circle is fracturing"), never a real movement, era, or person.
- NO explicit pornography (depiction of sex acts). Crude innuendo is fine; hardcore prose is not.
- NEVER sexualise or defame a real public figure (covered by the no-real-people rule — keep everyone fictional).
- No mockery of real, named religions — invent Velmora's faiths instead.

OUTPUT: Call the emit_event tool exactly once with one self-contained dilemma. The body is 2-4 sentences. Provide 2 or 3 distinct choices, each with a short label and small stat effects (fx) within -25..25 on these levers only: support, funds, influence, media, base, heat. Make the dilemma specific to the player's situation below.`;

/** A compact, non-identifying snapshot of the run for the user message. */
export function stateVector(S: GameState): Record<string, unknown> {
  const P = PATHS[S.path];
  const names = P.statNames;
  const a = antagonist(S);
  const blocs = blocList(S)
    .slice()
    .sort((x, y) => y.value - x.value);
  return {
    system: P.land,
    office: S.player.title,
    phase: S.phase,
    levers: Object.fromEntries(
      (Object.keys(names) as (keyof typeof names)[]).map((k) => [names[k], S.stats[k]]),
    ),
    rival: a ? { name: a.name, disposition: dispositionLabel(a.relationship) } : null,
    factions: blocs.map((b) => {
      const f = P.factions.find((x) => x.id === b.id);
      return { name: f?.name ?? b.short, standing: b.value };
    }),
    activeScandal: S.activeScandal ? 'a buried matter is resurfacing' : null,
  };
}

export function buildPrompt(S: GameState): { system: string; user: string } {
  return {
    system: SYSTEM,
    user: `The player's situation:\n${JSON.stringify(stateVector(S), null, 2)}\n\nWrite one dilemma that pressures this exact situation. Call emit_event.`,
  };
}
