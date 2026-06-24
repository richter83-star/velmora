/**
 * Director tags (pure) — derives, with zero authoring, a thematic fingerprint
 * for each event from what its choices actually DO: the flags they set and the
 * stats their `fx` move. The AI Director uses these to surface dilemmas that
 * resonate with how the player is governing. Tags are computed lazily and cached
 * per-event object (the static bank is stable), so this never touches the
 * content-safety surface — it only re-weights already-linted events.
 */
import type { GameEvent, StatKey } from '../types';

export type Axis =
  | 'aggression'
  | 'integrity'
  | 'dealmaking'
  | 'populism'
  | 'cult'
  | 'network'
  | 'risk';

export const AXES: readonly Axis[] = [
  'aggression',
  'integrity',
  'dealmaking',
  'populism',
  'cult',
  'network',
  'risk',
] as const;

/** Maps the flags the existing events already set to a playstyle axis. These are
 *  the same flag names the faction warm/cool lists use — no new vocabulary. */
export const FLAG_AXIS: Readonly<Record<string, Axis>> = {
  went_negative: 'aggression',
  bloody_hands: 'aggression',
  hardliner_cred: 'aggression',
  zealot_rep: 'aggression',
  struck_first: 'aggression',
  tyrant_rep: 'aggression',
  hawk: 'aggression',
  purge_count: 'aggression',
  clean_streak: 'integrity',
  honest_rep: 'integrity',
  secret_reformer: 'integrity',
  peacemaker: 'integrity',
  secret_decent: 'integrity',
  progressive: 'integrity',
  dealmaker: 'dealmaking',
  dark_money: 'dealmaking',
  owes_donor: 'dealmaking',
  corrupt_streak: 'dealmaking',
  cooked_books: 'dealmaking',
  bailed_banks: 'dealmaking',
  blackmailer: 'dealmaking',
  foreign_ties: 'dealmaking',
  grassroots: 'populism',
  pledged: 'populism',
  media_friend: 'populism',
  press_friendly: 'populism',
  own_cult: 'cult',
  cult_building: 'cult',
  has_network: 'network',
};

export interface EventTag {
  /** Axis affinities (unnormalized weights). */
  axes: Partial<Record<Axis, number>>;
  /** Rough stakes of the dilemma (stat magnitude + roll difficulty + crisis). */
  stake: number;
}

function buildTag(ev: GameEvent): EventTag {
  const axes: Partial<Record<Axis, number>> = {};
  const add = (a: Axis, w: number): void => {
    axes[a] = (axes[a] ?? 0) + w;
  };
  let stake = 0;
  let n = 0;
  for (const c of ev.choices) {
    if (c.set) for (const k of Object.keys(c.set)) if (FLAG_AXIS[k]) add(FLAG_AXIS[k]!, 1);
    if (c.inc) for (const k of Object.keys(c.inc)) if (FLAG_AXIS[k]) add(FLAG_AXIS[k]!, 1);
    if (c.fx) {
      for (const [k, v] of Object.entries(c.fx) as [StatKey, number][]) {
        const mag = Math.abs(v ?? 0);
        if (!mag) continue;
        stake += mag;
        n++;
        if (k === 'heat') add('risk', mag / 8);
        else if (k === 'funds') add('dealmaking', mag / 16);
        else if (k === 'base') add('populism', mag / 16);
        else if (k === 'support') add('populism', mag / 24);
        else if (k === 'influence') add('network', mag / 16);
        else if (k === 'media') add('network', mag / 24);
      }
    }
    if (c.roll) stake += (c.roll.dc ?? 0) / 10;
  }
  if (ev.crisis) stake += 8;
  return { axes, stake: n ? stake / n : ev.crisis ? 8 : 3 };
}

const CACHE = new WeakMap<GameEvent, EventTag>();

/** The thematic tag for an event (cached per-object). */
export function eventTag(ev: GameEvent): EventTag {
  let t = CACHE.get(ev);
  if (!t) {
    t = buildTag(ev);
    CACHE.set(ev, t);
  }
  return t;
}
