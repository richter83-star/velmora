/**
 * Epilogue beats (pure) — a few short "where are they now" lines appended to the
 * ending screen, chosen from the run's defining flags so the close reflects the
 * specific choices a player made (the purges, the mercies, the fortune, the
 * cult, the rival). Fictional and non-partisan, like all VELMORA content.
 */
import type { GameState } from './types';

interface Beat {
  when: (S: GameState) => boolean;
  text: string;
}

const flag = (S: GameState, k: string): boolean => !!S.flags?.[k];
const num = (S: GameState, k: string): number => {
  const v = S.flags?.[k];
  return typeof v === 'number' ? v : 0;
};

/** Flag-driven beats, in priority order; the first few that apply are taken. */
const BEATS: Beat[] = [
  {
    when: (S) => num(S, 'purge_count') >= 5,
    text: 'Historians would tally the careers you ended. The number did not fit comfortably on a plaque.',
  },
  {
    when: (S) => flag(S, 'bloody_hands'),
    text: 'The tribunals you set in motion outlived you; the lists were never fully reopened.',
  },
  {
    when: (S) => flag(S, 'secret_reformer'),
    text: 'Quietly, the small mercies you risked everything for took root after you were gone.',
  },
  {
    when: (S) => flag(S, 'corrupt_streak'),
    text: 'The fortune you gathered proved remarkably difficult for auditors to trace.',
  },
  {
    when: (S) => flag(S, 'own_cult') || flag(S, 'cult_building'),
    text: 'Your portrait hung in the classrooms for a generation, then came down in a single afternoon.',
  },
  {
    when: (S) => flag(S, 'blackmailer'),
    text: 'The files you kept ensured that, even in retirement, the powerful returned your calls.',
  },
  {
    when: (S) => flag(S, 'has_network'),
    text: 'The web of favors you wove kept your name useful long after you left the stage.',
  },
  {
    when: (S) => flag(S, 'peacemaker'),
    text: 'The compromises you brokered held — fragile, unglamorous, and quietly saving lives.',
  },
  {
    when: (S) => flag(S, 'honest_rep') || flag(S, 'clean_streak'),
    text: 'Years on, even your opponents conceded you had been, improbably, honest.',
  },
  {
    when: (S) => flag(S, 'grassroots'),
    text: 'The volunteers you first inspired went on to careers of their own, and cited you in them.',
  },
  {
    when: (S) => flag(S, 'nepotism'),
    text: 'Your relatives, launched on your name, became a story of their own — rarely a flattering one.',
  },
  {
    when: (S) => flag(S, 'foreign_friends') || flag(S, 'compromised'),
    text: 'The foreign debts you took on shaped your successors’ choices for decades.',
  },
  {
    when: (S) => S.stats.heat >= 70,
    text: 'The scandals never quite faded; they trailed your name through every retrospective.',
  },
];

/**
 * Build the epilogue: up to three flag beats, an optional note on where things
 * stood with the recurring rival, and a path-flavored closing line. Always
 * returns at least one line.
 */
export function buildEpilogue(S: GameState): string[] {
  const out: string[] = [];
  for (const b of BEATS) {
    if (b.when(S)) out.push(b.text);
    if (out.length >= 3) break;
  }

  // Curtain call for the rival — the G6 nemesis arc's outcome wins (specific, named),
  // falling back to the relationship the run happened to end on.
  const a = S.antagonistId ? S.npcs?.[S.antagonistId] : undefined;
  if (a) {
    const n = a.name;
    if (flag(S, 'nemesis_destroyed'))
      out.push(`${n}, the rival who climbed beside you the whole way, ended with nothing — and everyone knew, to the inch, that you had arranged the fall.`);
    else if (flag(S, 'nemesis_spared'))
      out.push(`You beat ${n} and then, unbearably, let them live; the mercy became the most-quoted thing about you.`);
    else if (flag(S, 'nemesis_pact'))
      out.push(`${n}, the enemy you turned into a partner, outlasted the alliance itself — and told the story differently every year.`);
    else if (flag(S, 'nemesis_truce_early'))
      out.push(`The rivalry with ${n} that might have defined you fizzled early; the missing feud quietly disappointed the historians.`);
    else if (a.relationship >= 30) out.push(`Your old rival, ${n}, spoke warmly of you in the end.`);
    else if (a.relationship <= -40)
      out.push(`${n}, your nemesis to the last, spent their remaining years working to erase you.`);
  }
  // Curtain call for the deputy (the G6 defector arc).
  if (flag(S, 'defector_crushed'))
    out.push('Wren Osei, the deputy who turned on you, was made a lesson — thorough, public, and studied carefully by everyone who came after.');
  else if (flag(S, 'defector_reconciled'))
    out.push('Wren Osei, who once stood with the opposition holding a folder of your sins, closed it, came home, and outlived every enemy you had left.');

  out.push(
    S.path === 'vanguard'
      ? 'In the Union, to speak your name remained, for years, a careful and political act.'
      : 'In the Republic, your name slid into the language as shorthand for its era.',
  );
  return out;
}
