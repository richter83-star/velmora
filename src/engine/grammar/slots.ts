/**
 * Loom slot resolvers (pure) — the STATE-derived half of a woven event. These
 * read live game state (your rival and how they feel about you, the stat you're
 * weakest in, the bloc you've most alienated) so each fill is situationally
 * meaningful, not arbitrary mad-libs. They take NO rng and are a pure function of
 * S, so a woven event re-derives its state slots identically on reload — only the
 * lexicon picks (in lexicons.ts) need a signature to reproduce.
 */
import type { GameState, StatKey } from '../types';
import { antagonist, dispositionLabel } from '../npcs';
import { blocList } from '../factions';
import { PATHS } from '../../content/paths';

export interface StateSlots {
  /** The recurring rival's name. */
  rival: string;
  /** Prose label for how the rival currently regards you. */
  disposition: string;
  /** Display name (path vocabulary) of your weakest lever. */
  weakStat: string;
  /** Display name of your strongest lever. */
  strongStat: string;
  /** Name of the faction you've most alienated. */
  coolBloc: string;
  /** Name of the faction most behind you. */
  warmBloc: string;
  /** Your current office/title. */
  office: string;
}

const STATS: readonly StatKey[] = ['support', 'funds', 'influence', 'media', 'base'];

function factionName(S: GameState, blocId: string | undefined): string {
  const f = PATHS[S.path].factions.find((x) => x.id === blocId);
  return f?.name ?? 'your coalition';
}

/** Resolve every state-derived slot from S (deterministic, no rng). */
export function stateSlots(S: GameState): StateSlots {
  const a = antagonist(S);
  const rival = a?.name || S.opp || 'a rival';
  const disposition = a ? dispositionLabel(a.relationship) : 'a wary rival';

  const names = PATHS[S.path].statNames;
  let weak: StatKey = 'support';
  let strong: StatKey = 'support';
  for (const k of STATS) {
    if (S.stats[k] < S.stats[weak]) weak = k;
    if (S.stats[k] > S.stats[strong]) strong = k;
  }

  const blocs = blocList(S);
  const cool = blocs.length ? blocs.reduce((m, b) => (b.value < m.value ? b : m)) : undefined;
  const warm = blocs.length ? blocs.reduce((m, b) => (b.value > m.value ? b : m)) : undefined;

  return {
    rival,
    disposition,
    weakStat: names[weak] ?? weak,
    strongStat: names[strong] ?? strong,
    coolBloc: factionName(S, cool?.id),
    warmBloc: factionName(S, warm?.id),
    office: S.player.title || PATHS[S.path].phases[Math.max(0, S.phase - 1)]?.title || 'office',
  };
}
