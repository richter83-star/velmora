/**
 * Faction / bloc standings (pure) — Phase 4 systems depth. Each path has three
 * political blocs (defined in content/paths as the selectable factions); this
 * tracks how each one feels about you on a 0–100 meter. Standings move
 * EMERGENTLY from the stat changes and flags the existing 251 events already
 * produce — no per-event authoring needed — so a populist bloc warms when you
 * feed the base and a reform bloc cools when you rack up scandals.
 *
 * Shared by the live engine and the simulator via resolve.ts, and fed back into
 * the promotion contest as "coalition math": a happy coalition lifts you, an
 * alienated one drags you down.
 */
import type { GameState, PathKey, StatKey } from './types';

export interface BlocDef {
  id: string;
  short: string;
  statWeights: Partial<Record<StatKey, number>>;
  warm: string[];
  cool: string[];
}

const WARM_STEP = 5;
const COOL_STEP = 6;
const BASE = 50;
const clamp = (n: number): number => Math.max(0, Math.min(100, n));

export const BLOCS: Record<PathKey, BlocDef[]> = {
  ballot: [
    {
      id: 'federalist',
      short: 'Fed',
      statWeights: { influence: 0.4, funds: 0.3, media: 0.2, base: -0.2, heat: -0.2 },
      warm: ['dealmaker', 'clean_streak', 'bailed_banks'],
      cool: ['grassroots', 'went_negative', 'tyrant_rep'],
    },
    {
      id: 'populist',
      short: 'Pop',
      statWeights: { base: 0.5, support: 0.25, influence: -0.3 },
      warm: ['grassroots', 'hardliner_cred', 'pledged'],
      cool: ['dealmaker', 'dark_money', 'owes_donor'],
    },
    {
      id: 'reform',
      short: 'Ref',
      statWeights: { support: 0.35, media: 0.15, heat: -0.4 },
      warm: ['honest_rep', 'clean_streak', 'secret_reformer'],
      cool: ['corrupt_streak', 'went_negative', 'stonewaller'],
    },
  ],
  vanguard: [
    {
      id: 'hardliner',
      short: 'Hard',
      statWeights: { base: 0.5, media: 0.2, support: -0.25 },
      warm: ['zealot_rep', 'hardliner_cred', 'bloody_hands'],
      cool: ['secret_reformer', 'peacemaker'],
    },
    {
      id: 'technocrat',
      short: 'Tech',
      statWeights: { influence: 0.4, funds: 0.3, heat: -0.3 },
      warm: ['honest_rep', 'dealmaker'],
      cool: ['bloody_hands', 'potemkin'],
    },
    {
      id: 'networker',
      short: 'Net',
      statWeights: { influence: 0.4, base: 0.2 },
      warm: ['has_network', 'blackmailer', 'corrupt_streak'],
      cool: ['clean_streak', 'honest_rep'],
    },
  ],
};

/** Fresh standings (all blocs neutral). */
export function initBlocs(path: PathKey): Record<string, number> {
  const out: Record<string, number> = {};
  for (const b of BLOCS[path] ?? []) out[b.id] = BASE;
  return out;
}

/**
 * Shift bloc standings in response to a resolved choice — the stat deltas it
 * produced plus the flags it set this turn. Pure; initializes S.blocs on demand.
 */
export function applyBlocShift(
  S: GameState,
  deltas: Partial<Record<StatKey, number>>,
  flagsOn: readonly string[],
): void {
  const defs = BLOCS[S.path];
  if (!defs) return;
  if (!S.blocs) S.blocs = initBlocs(S.path);
  const on = new Set(flagsOn);
  for (const b of defs) {
    let shift = 0;
    for (const key of Object.keys(b.statWeights) as StatKey[]) {
      const d = deltas[key];
      if (typeof d === 'number') shift += (b.statWeights[key] ?? 0) * d;
    }
    for (const f of b.warm) if (on.has(f)) shift += WARM_STEP;
    for (const f of b.cool) if (on.has(f)) shift -= COOL_STEP;
    S.blocs[b.id] = clamp((S.blocs[b.id] ?? BASE) + shift);
  }
}

export interface BlocStanding {
  id: string;
  short: string;
  value: number;
}

/** Current standings, in display order. */
export function blocList(S: GameState): BlocStanding[] {
  return (BLOCS[S.path] ?? []).map((b) => ({
    id: b.id,
    short: b.short,
    value: Math.round(S.blocs?.[b.id] ?? BASE),
  }));
}

/**
 * Coalition math: average deviation of bloc standings from neutral, scaled to a
 * gentle contest swing (roughly -10..+10). A coalition you have kept happy adds
 * to your strength at promotion time; one you have alienated subtracts.
 */
export function coalitionContestMod(S: GameState): number {
  const defs = BLOCS[S.path];
  if (!defs || !S.blocs) return 0;
  let sum = 0;
  let n = 0;
  for (const b of defs) {
    sum += (S.blocs[b.id] ?? BASE) - BASE;
    n++;
  }
  return n ? (sum / n) * 0.2 : 0;
}
