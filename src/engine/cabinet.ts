/**
 * Cabinet / advisors (pure) — Phase 4 systems depth. At each promotion the
 * player may appoint an advisor from a small slate. Each advisor grants a
 * passive per-turn effect while serving and carries a loyalty meter that rises
 * when your choices please them and falls when they don't — mistreat one badly
 * enough and they can turn on you (the defection event).
 *
 * Shared by the live engine and the simulator: appointment + per-turn perk +
 * loyalty drift all run through these pure helpers.
 */
import type { GameState, PathKey, StatKey } from './types';
import type { Rng } from './rng';

export interface AdvisorDef {
  id: string;
  name: string;
  title: string;
  emoji: string;
  desc: string;
  effect: { stat: StatKey; amount: number };
  likes: string[];
  dislikes: string[];
}

export const START_LOYALTY = 60;
/** Loyalty at or below this is the "will defect" danger zone. */
export const DEFECT_LOYALTY = 22;
const LIKE_STEP = 4;
const DISLIKE_STEP = 5;
const clamp = (n: number): number => Math.max(0, Math.min(100, n));

export const ADVISORS: Record<PathKey, AdvisorDef[]> = {
  ballot: [
    {
      id: 'spin',
      name: 'Vesna Kol',
      title: 'Communications Director',
      emoji: '📣',
      desc: 'Spins gold from straw. Lifts the Press a little every turn.',
      effect: { stat: 'media', amount: 1 },
      likes: ['press_friendly', 'has_biographer', 'went_negative'],
      dislikes: ['stonewaller'],
    },
    {
      id: 'fixer',
      name: 'Aldo Renn',
      title: 'Chief of Staff',
      emoji: '🗂️',
      desc: 'Counts the votes and collects the debts. Builds Capital each turn.',
      effect: { stat: 'influence', amount: 1 },
      likes: ['dealmaker', 'has_network'],
      dislikes: ['grassroots'],
    },
    {
      id: 'bagman',
      name: 'Cyrus Vane',
      title: 'Finance Chair',
      emoji: '💼',
      desc: 'Keeps the war chest full and the questions quiet. Tops up funds each turn.',
      effect: { stat: 'funds', amount: 1 },
      likes: ['corrupt_streak', 'dark_money', 'owes_donor'],
      dislikes: ['clean_streak'],
    },
    {
      id: 'organizer',
      name: 'Mara Tash',
      title: 'Field Director',
      emoji: '🪧',
      desc: 'Knocks every door twice. Grows the Base each turn.',
      effect: { stat: 'base', amount: 1 },
      likes: ['grassroots', 'pledged'],
      dislikes: ['dealmaker'],
    },
  ],
  vanguard: [
    {
      id: 'propagandist',
      name: 'Iosef Mau',
      title: 'Propaganda Chief',
      emoji: '📡',
      desc: 'Writes the morning broadcast. Lifts Propaganda each turn.',
      effect: { stat: 'media', amount: 1 },
      likes: ['own_cult', 'cult_building', 'zealot_rep'],
      dislikes: ['secret_reformer'],
    },
    {
      id: 'enforcer',
      name: 'Greta Vol',
      title: 'Security Chief',
      emoji: '🛡️',
      desc: 'Keeps the loyal loyal. Reinforces Loyalty each turn.',
      effect: { stat: 'base', amount: 1 },
      likes: ['bloody_hands', 'zealot_rep'],
      dislikes: ['peacemaker', 'secret_reformer'],
    },
    {
      id: 'planner',
      name: 'Dmitri Sah',
      title: 'State Planner',
      emoji: '📊',
      desc: 'Makes the quotas add up, mostly. Builds State Funds each turn.',
      effect: { stat: 'funds', amount: 1 },
      likes: ['honest_rep', 'dealmaker'],
      dislikes: ['potemkin'],
    },
    {
      id: 'liaison',
      name: 'Yelena Cosk',
      title: 'Organs Liaison',
      emoji: '🕸️',
      desc: 'Friends in every dark office. Builds Standing each turn.',
      effect: { stat: 'influence', amount: 1 },
      likes: ['has_network', 'blackmailer'],
      dislikes: ['clean_streak'],
    },
  ],
};

export function advisorDef(path: PathKey, id: string): AdvisorDef | undefined {
  return ADVISORS[path]?.find((a) => a.id === id);
}

/** A seeded slate of `n` not-yet-appointed advisors to choose from. */
export function advisorSlate(S: GameState, rng: Rng, n = 2): AdvisorDef[] {
  const have = new Set((S.cabinet ?? []).map((c) => c.id));
  const pool = (ADVISORS[S.path] ?? []).filter((a) => !have.has(a.id));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool.slice(0, n);
}

export function appointAdvisor(S: GameState, id: string): void {
  if (!S.cabinet) S.cabinet = [];
  if (S.cabinet.some((c) => c.id === id)) return;
  if (!advisorDef(S.path, id)) return;
  S.cabinet.push({ id, loyalty: START_LOYALTY });
}

/** Aggregate the per-turn stat effects of the serving cabinet. */
export function cabinetPerk(S: GameState): Partial<Record<StatKey, number>> {
  const out: Partial<Record<StatKey, number>> = {};
  for (const c of S.cabinet ?? []) {
    const def = advisorDef(S.path, c.id);
    if (!def) continue;
    out[def.effect.stat] = (out[def.effect.stat] ?? 0) + def.effect.amount;
  }
  return out;
}

/** Shift advisor loyalty from the flags a choice set this turn. */
export function tickCabinetLoyalty(S: GameState, flagsOn: readonly string[]): void {
  if (!S.cabinet?.length) return;
  const on = new Set(flagsOn);
  for (const c of S.cabinet) {
    const def = advisorDef(S.path, c.id);
    if (!def) continue;
    let shift = 0;
    for (const f of def.likes) if (on.has(f)) shift += LIKE_STEP;
    for (const f of def.dislikes) if (on.has(f)) shift -= DISLIKE_STEP;
    if (shift) c.loyalty = clamp(c.loyalty + shift);
  }
}

export interface ServingAdvisor {
  id: string;
  name: string;
  title: string;
  emoji: string;
  loyalty: number;
}

export function servingAdvisors(S: GameState): ServingAdvisor[] {
  return (S.cabinet ?? []).map((c) => {
    const d = advisorDef(S.path, c.id);
    return {
      id: c.id,
      name: d?.name ?? c.id,
      title: d?.title ?? '',
      emoji: d?.emoji ?? '👤',
      loyalty: Math.round(c.loyalty),
    };
  });
}

/** The serving advisor most likely to defect (loyalty in the danger zone), or null. */
export function defectingAdvisor(S: GameState): { id: string; loyalty: number } | null {
  let worst: { id: string; loyalty: number } | null = null;
  for (const c of S.cabinet ?? []) {
    if (c.loyalty <= DEFECT_LOYALTY && (!worst || c.loyalty < worst.loyalty)) {
      worst = { id: c.id, loyalty: c.loyalty };
    }
  }
  return worst;
}

/** Remove an advisor from the cabinet (used when one resigns or defects). */
export function removeAdvisor(S: GameState, id: string): void {
  if (!S.cabinet) return;
  S.cabinet = S.cabinet.filter((c) => c.id !== id);
}
