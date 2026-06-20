/**
 * Choice resolution (pure) — applies a chosen option's full effects to the run
 * state and reports the outcome. Shared by the live engine (which then renders
 * the result) and the headless simulator. Caller guarantees the choice is
 * unlocked (UI guards it; the sim's policy only picks unlocked choices).
 */
import type { GameState, GameEvent, StatKey } from './types';
import type { Rng } from './rng';
import { STAT_KEYS, applyFx, setFlags, incFlags, queueThen, markSeen, doRoll } from './mutate';
import { applyArcSet } from './arcs';
import { applyNpcFx } from './npcs';
import { recordScandal, resolveActiveScandal } from './scandals';
import { applyBlocShift } from './factions';
import { traitRollBonus } from './perks';
import { tickCabinetLoyalty } from './cabinet';

/** Collect the keys of a `set` map whose value is truthy (a flag turned on). */
function flagsTurnedOn(set: Record<string, boolean | number | string> | undefined): string[] {
  if (!set) return [];
  return Object.keys(set).filter((k) => !!set[k]);
}

export interface ChoiceOutcome {
  text: string;
  rollLine: { win: boolean; stat: StatKey; chance: number } | null;
  endingCause: string | null;
  deltas: Partial<Record<StatKey, number>>;
}

export function applyChoice(
  S: GameState,
  ev: GameEvent,
  ci: number,
  rng: Rng,
): ChoiceOutcome | null {
  const ch = ev.choices[ci];
  if (!ch) return null;
  const before = { ...S.stats };
  const flagsOn = flagsTurnedOn(ch.set);
  let text = ch.result ?? '';
  let rollLine: ChoiceOutcome['rollLine'] = null;
  let endingCause = ch.ending ?? null;

  applyFx(S, ch.fx);
  setFlags(S, ch.set);
  incFlags(S, ch.inc);
  applyArcSet(S, ch.arcSet);
  applyNpcFx(S, ch.npcFx);
  recordScandal(S, ch.scandal);
  resolveActiveScandal(S, ch.scandalResolve);

  if (ch.roll) {
    const r = doRoll(S, rng, ch.roll, traitRollBonus(S.player?.trait, ch.roll.stat));
    const br = r.win ? ch.roll.success : ch.roll.fail;
    applyFx(S, br.fx);
    setFlags(S, br.set);
    flagsOn.push(...flagsTurnedOn(br.set));
    incFlags(S, br.inc);
    applyArcSet(S, br.arcSet);
    applyNpcFx(S, br.npcFx);
    recordScandal(S, br.scandal);
    resolveActiveScandal(S, br.scandalResolve);
    if (br.text) text = br.text;
    if (br.then) queueThen(S, br.then);
    if (br.ending) endingCause = br.ending;
    rollLine = { win: r.win, stat: r.stat, chance: r.chance };
  }
  if (ch.then) queueThen(S, ch.then);

  const deltas: Partial<Record<StatKey, number>> = {};
  for (const k of STAT_KEYS) {
    const d = S.stats[k] - before[k];
    if (d) deltas[k] = d;
  }
  applyBlocShift(S, deltas, flagsOn);
  tickCabinetLoyalty(S, flagsOn);
  markSeen(S, ev);

  return { text, rollLine, endingCause, deltas };
}
