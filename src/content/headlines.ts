import type { GameState } from '../engine/types';

/**
 * Fake-news headline ticker (flavor) — a savage TV-MA news crawl beneath the HUD.
 * Headlines are fictional and non-partisan: they mock the press, polling, and the
 * theater of power in the abstract, never real people, parties, or events.
 *
 * Selection is PURE and deterministic from state (rotated by the turn counter) so
 * it never touches the gameplay RNG — the ticker is cosmetic and must not affect
 * run determinism.
 */
type Headline = string | ((name: string) => string);

const GENERIC: Headline[] = [
  `Pundits gather to discuss what other pundits are pretending to think`,
  `Poll finds majority of citizens "fed right up to here" with everything`,
  `Editorial demands bold action, declines to specify which, cashes cheque`,
  `Study: 6 in 10 statistics pulled straight out of someone's ass, study finds`,
  `Op-ed warns of slippery slope, cites a dumber op-ed from last Tuesday`,
  `Nation's pigeons remain magnificently unbothered by the political crisis`,
  `Local official cuts ribbon; entire ribbon lobby weeps with gratitude`,
  `Commentariat "cautiously apoplectic" over thing they'll forget by Friday`,
  `Survey: voters demand lower taxes, more spending, and a free pony`,
  `Weather expected to keep grimly happening, terrified meteorologists confirm`,
  `Breaking: something has happened; more screaming at the top of the hour`,
  `Analysts upgrade the outlook from "grim" to "grim, but with snacks"`,
  `Capital gridlock blamed on the capital, the traffic, and probably you`,
  `Think tank drops a report nobody reads but every coward will cite`,
  `Historic summit produces one historic photograph and exactly zero results`,
  `Experts reach consensus, then immediately brawl over what they agreed on`,
];

const BALLOT: Headline[] = [
  (n) => `Latest poll puts ${n} up — or down — honestly nobody has a damn clue`,
  `Attack-ad spending now dwarfs a small nation's entire annual war budget`,
  `Candidate filmed inhaling a local delicacy like an unhinged raccoon`,
  `Debate watched live by twelve people, screamed about forever by millions`,
  (n) => `${n} solemnly vows to fix absolutely everything by a date TBD, pinky-swear`,
  `Yard-sign shortage declared a five-alarm emergency by total lunatics`,
  `Focus group "felt a whole lot of big feelings" about the slogan, learned nothing`,
  `Same undecided voter interviewed for the 400th straight cycle, still undecided`,
];

const VANGUARD: Headline[] = [
  `Production figures exceed the plan, the forecast, and the laws of physics`,
  (n) => `Central organ slobbers over ${n}'s "tireless and visionary guidance"`,
  `Citizens reported to have gathered "spontaneously," entirely of their own free will`,
  `Anniversary parade to feature tanks, doves, and a frankly excessive number of tanks`,
  `Ministry of Statistics announces a glorious record harvest of records`,
  (n) => `${n} observed smiling; terrified analysts comb the footage for hidden orders`,
  `Loyal masses said to be "overflowing with quiet, orderly, mandatory enthusiasm"`,
  `Heroic new five-year plan vows to finally finish the last damn five-year plan`,
];

/** State-reactive headlines that comment on how the run is going. */
function reactive(S: GameState, name: string): string[] {
  const out: string[] = [];
  const s = S.stats;
  const f = S.flags ?? {};
  if (s.heat >= 70) out.push(`Investigators reportedly "dying to have a little chat" with ${name}`);
  else if (s.heat >= 50) out.push(`Ethics watchdogs spotted sharpening their pencils and their knives`);
  if (s.support <= 28) out.push(`${name}'s approval "just catching its breath," sweating aides insist`);
  else if (s.support >= 70) out.push(`${name} riding a fat wave of public goodwill, the lucky bastard`);
  if ((S.world?.economy?.mood ?? 0) < 0)
    out.push(`Markets described by traders as "having a full emotional meltdown" today`);
  if ((S.world?.tension?.d ?? 0) > 4)
    out.push(`Border situation "tense but mostly for the cameras," officials shrug`);
  if (S.activeScandal) out.push(`Old scandal claws its way back up; ${name}'s office "would rather not"`);
  if (f.corrupt_streak)
    out.push(`Questions mount over ${name}'s suspiciously, gloriously fat personal finances`);
  if (f.clean_streak || f.honest_rep)
    out.push(`${name} praised for raw honesty; veteran hacks deeply, professionally suspicious`);
  if (S.path === 'vanguard' && f.bloody_hands)
    out.push(`State media praises ${name}'s "firm, loving, and lightly stranglish hand"`);
  if (f.own_cult || f.cult_building)
    out.push(`${name}'s glorious mug reportedly nailed to a further 4,000 walls`);
  if (S.phase >= 3) out.push(`Foreign capitals "watching ${name} like a hawk," same as ever`);
  return out;
}

/**
 * STOP-PRESS lead (G1 — The Press Run): the paper narrates the consequence of your
 * LAST choice, so every turn prints what you actually just did. Pure function of
 * S.lastResult (event title + roll outcome + tone); never touches the gameplay RNG.
 * Returns null when there is nothing to report yet (a fresh event / turn one).
 */
export function stopPressLead(S: GameState): string | null {
  const r = (S as unknown as { lastResult?: { title?: string; rollLine?: { win: boolean } | null; tone?: string } | null })
    .lastResult;
  if (!r || !r.title) return null;
  const name = S.player?.name?.trim() || 'the leader';
  const t = String(r.title).replace(/["'“”]/g, '').trim();
  if (r.rollLine) {
    return r.rollLine.win
      ? `${name}'s gamble on "${t}" pays off — rivals reportedly livid but smiling for the cameras`
      : `${name}'s "${t}" play BACKFIRES; the vultures begin, as ever, to circle`;
  }
  const bad = r.tone === 'bad' || r.tone === 'grim' || r.tone === 'dark';
  return bad
    ? `Fallout from "${t}" spreads; ${name}'s office "not, at this time, taking questions"`
    : `${name} moves on "${t}"; the commentariat pretends to have called it all along`;
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

  const out = [...reactive(S, name), ...rotate(generic, turn * 3, 5), ...rotate(sided, turn * 2, 3)];
  // De-dupe while preserving order.
  return [...new Set(out)];
}
