import type { GameState } from '../engine/types';

/**
 * Fake-news headline ticker (flavor) — a satirical news crawl beneath the HUD.
 * Headlines are fictional and non-partisan: they mock the press, polling, and
 * the theater of power in the abstract, never real people, parties, or events.
 *
 * Selection is PURE and deterministic from state (rotated by the turn counter)
 * so it never touches the gameplay RNG — the ticker is cosmetic and must not
 * affect run determinism.
 */
type Headline = string | ((name: string) => string);

const GENERIC: Headline[] = [
  'Pundits convene to discuss what other pundits are thinking',
  'Poll finds majority of citizens have "had it up to here"',
  'Editorial demands action; declines to specify which',
  'Study: 6 in 10 statistics invented on the spot, study finds',
  'Op-ed warns of slippery slope, cites earlier op-ed',
  "Nation's pigeons reportedly unbothered by political crisis",
  'Local official cuts ribbon; ribbon industry cautiously optimistic',
  'Commentariat "cautiously apoplectic" over latest development',
  'Survey: voters want lower taxes, more spending, and free parking',
  'Weather expected to continue, meteorologists confirm',
  'Breaking: something has happened; more at the top of the hour',
  'Analysts upgrade outlook from "grim" to "grimly hopeful"',
  'Capital traffic blamed on capital, and on traffic',
  'Think tank releases report no one will read but everyone will cite',
  'Historic summit produces historic photograph',
  'Experts agree, then immediately disagree about what they agreed on',
];

const BALLOT: Headline[] = [
  (n) => `Latest poll puts ${n} up — or down — within the margin of error`,
  'Attack-ad spending now exceeds a small nation’s entire budget',
  'Candidate filmed eating local delicacy in deeply unflattering manner',
  'Debate watched live by dozens, re-litigated forever by millions',
  (n) => `${n} vows to fix everything by a date to be announced later`,
  'Yard-sign shortage declared an emergency in three swing districts',
  'Focus group reportedly "felt a lot of feelings" about the new slogan',
  'Undecided voter interviewed for 400th consecutive news cycle',
];

const VANGUARD: Headline[] = [
  'Production figures exceed the plan, the forecast, and all credulity',
  (n) => `Central organ praises ${n}’s "tireless and visionary guidance"`,
  'Citizens reported to have gathered spontaneously, entirely of own accord',
  'Anniversary parade to feature tanks, doves, and considerably more tanks',
  'Ministry of Statistics announces record harvest of records',
  (n) => `${n} observed smiling; analysts parse the footage for hidden meaning`,
  'Loyal masses said to be "overflowing with quiet, orderly enthusiasm"',
  'New five-year plan promises to complete the last five-year plan',
];

/** State-reactive headlines that comment on how the run is going. */
function reactive(S: GameState, name: string): string[] {
  const out: string[] = [];
  const s = S.stats;
  const f = S.flags ?? {};
  if (s.heat >= 70) out.push(`Investigators reportedly "very keen to chat" with ${name}`);
  else if (s.heat >= 50) out.push('Ethics watchdogs seen sharpening their pencils');
  if (s.support <= 28) out.push(`${name}’s approval "merely taking a breather," aides insist`);
  else if (s.support >= 70) out.push(`${name} riding a wave of public goodwill, for now`);
  if ((S.world?.economy?.mood ?? 0) < 0)
    out.push('Markets described by traders as "a bit emotional" today');
  if ((S.world?.tension?.d ?? 0) > 4)
    out.push('Border situation described as "tense but largely theatrical"');
  if (S.activeScandal) out.push(`Old scandal resurfaces; ${name}’s office "declines to relive it"`);
  if (f.corrupt_streak)
    out.push(`Questions mount over ${name}’s mysteriously robust personal finances`);
  if (f.clean_streak || f.honest_rep)
    out.push(`${name} praised for candor; veteran pundits deeply suspicious`);
  if (S.path === 'vanguard' && f.bloody_hands)
    out.push(`State media lauds ${name}’s "firm and loving hand"`);
  if (f.own_cult || f.cult_building)
    out.push(`${name}’s official portrait reported on a further 4,000 walls`);
  if (S.phase >= 3) out.push(`Foreign capitals "watching ${name} closely," as ever`);
  return out;
}

/** Take `count` items from `pool` starting at `offset` (wrapping). */
function rotate(pool: string[], offset: number, count: number): string[] {
  if (!pool.length) return [];
  const out: string[] = [];
  for (let i = 0; i < count && i < pool.length; i++) out.push(pool[(offset + i) % pool.length]!);
  return out;
}

/**
 * Build the ticker's headline list for the current state. Deterministic: the
 * same state always yields the same crawl, rotated forward each turn so it feels
 * alive without consuming the gameplay RNG.
 */
export function pickHeadlines(S: GameState): string[] {
  const name = S.player?.name?.trim() || 'the leader';
  const resolve = (h: Headline): string => (typeof h === 'function' ? h(name) : h);
  const turn = S.totalTurns ?? 0;

  const generic = GENERIC.map(resolve);
  const sided = (S.path === 'vanguard' ? VANGUARD : BALLOT).map(resolve);

  const out = [
    ...reactive(S, name),
    ...rotate(generic, turn * 3, 5),
    ...rotate(sided, turn * 2, 3),
  ];
  // De-dupe while preserving order.
  return [...new Set(out)];
}
