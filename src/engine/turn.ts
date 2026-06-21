/**
 * Per-turn bookkeeping + lethal-threshold check (pure) — shared by the live
 * engine (main.js) and the headless simulator (sim.ts). Callers own the
 * surrounding control flow (ending vs promotion vs next draw).
 */
import type { GameState, PathKey, StatKey } from './types';
import { clampStat } from './mutate';
import { traitHeatDecayBonus } from './perks';
import { cabinetPerk, processResignations } from './cabinet';

/** Scrutiny ("heat") cools by this much each turn the player survives. */
const HEAT_DECAY_PER_TURN = 2;
/** Above this approval level, the cost of incumbency starts to erode support. */
const APPROVAL_COMFORT = 55;

/** Per-path heat-death cause (Exposure/Scrutiny/Heresy crossing the lethal line). */
const HEAT_DEATH_CAUSE: Record<PathKey, string> = {
  ballot: 'scandal',
  vanguard: 'purge',
  iron: 'arrested',
  gilded: 'indicted',
  anointed: 'excommunicated',
};
/** Per-path support-death cause (the base / faithful / public abandoning you). */
const SUPPORT_DEATH_CAUSE: Record<PathKey, string> = {
  ballot: 'collapse',
  vanguard: 'revolution',
  iron: 'dissolved',
  gilded: 'hostile_takeover',
  anointed: 'schism',
};

/** Removal cause if a vital stat has crossed a lethal threshold this turn, else null. */
export function deathCause(S: GameState): string | null {
  if (S.stats.heat >= 100) return HEAT_DEATH_CAUSE[S.path];
  if (S.stats.support <= 0) return SUPPORT_DEATH_CAUSE[S.path];
  return null;
}

/** Advance the turn counters, tick down queued events, and cool scrutiny. */
export function advanceTurnState(S: GameState): void {
  S.totalTurns++;
  S.phaseTurn++;
  for (const q of S.queue) q.inTurns = (q.inTurns ?? 0) - 1;
  S.stats.heat = clampStat(S.stats.heat - HEAT_DECAY_PER_TURN - traitHeatDecayBonus(S.player?.trait));
  // Approval decay (term dynamics): riding high erodes support (the cost of
  // incumbency), and scandal or a sour economy accelerate it. There is no
  // baseline drain while you are already struggling, so this adds "you can't
  // coast at the top" pressure without dooming weak runs outright.
  let decay = 0;
  if (S.stats.support > APPROVAL_COMFORT) decay += 1;
  if (S.stats.support > 75) decay += 1;
  if (S.stats.heat >= 60) decay += 1;
  if ((S.world?.economy?.mood ?? 0) < 0) decay += 1;
  if (decay) S.stats.support = clampStat(S.stats.support - decay);
  // A cratered advisor resigns (and leaks) before the cabinet's perks apply.
  processResignations(S);
  // Serving advisors lend a small passive lift to their specialty each turn.
  const perk = cabinetPerk(S);
  for (const k of Object.keys(perk) as StatKey[]) {
    S.stats[k] = clampStat(S.stats[k] + (perk[k] ?? 0));
  }
}
