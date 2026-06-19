/**
 * Content linter — the authoring safety net. Runs the Zod structural schema
 * plus the semantic checks the brief requires:
 *   1. duplicate event ids
 *   2. unresolved `then` references
 *   3. invalid fx / roll stat keys
 *   4. unreachable events (queueOnly never referenced by a `then`)
 *   5. `${...}` inside a plain (non-function) body/result/roll-text
 *   6. unknown ending causes
 * and arc integrity:
 *   7. arc / arcSet ids must exist in the ARCS registry
 *   8. every registered arc must have a reachable entry event
 *
 * (Ending *reachability* is asserted by the seeded E2E sweep — endings are
 * computed in the engine, not data; moves to a data check in Phase 3. AD-4.)
 */
import type { GameEvent, ArcDef } from '../engine/types';
import { EventSchema, STAT_KEYS, VALID_PHASES, PATH_KEYS, ENDING_CAUSES } from './schema';
import { KNOWN_NPC_IDS } from './npcs';

export interface LintResult {
  errors: string[];
  warnings: string[];
}

const STAT_SET = new Set<string>(STAT_KEYS);
const PATH_SET = new Set<string>(PATH_KEYS);
const PHASE_SET = new Set<number>(VALID_PHASES);
const CAUSE_SET = new Set<string>(ENDING_CAUSES);
const NPC_ID_SET = new Set<string>(KNOWN_NPC_IDS);

export function validateContent(
  events: readonly GameEvent[],
  arcs: readonly ArcDef[] = [],
): LintResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const seenIds = new Set<string>();
  const allIds = new Set(events.map((e) => e.id));
  const referencedByThen = new Set<string>();
  const arcIds = new Set(arcs.map((a) => a.id));
  const arcEntrySeen = new Set<string>();

  const checkFx = (fx: Record<string, number> | undefined, where: string): void => {
    if (!fx) return;
    for (const k of Object.keys(fx)) {
      if (!STAT_SET.has(k)) errors.push(`${where}: invalid fx stat key "${k}"`);
    }
  };
  const checkText = (text: string | undefined, where: string): void => {
    if (typeof text === 'string' && text.includes('${')) {
      errors.push(
        `${where}: \${...} in a plain string (use a (S)=>\`...\` function for interpolation)`,
      );
    }
  };
  const noteThen = (refs: { id: string }[] | undefined): void => {
    refs?.forEach((t) => referencedByThen.add(t.id));
  };
  const checkArcId = (id: string | undefined, where: string): void => {
    if (id && !arcIds.has(id)) errors.push(`${where}: references unknown arc "${id}"`);
  };
  const checkNpc = (fx: { id: string } | undefined, where: string): void => {
    if (fx && !NPC_ID_SET.has(fx.id)) errors.push(`${where}: npcFx -> unknown npc "${fx.id}"`);
  };

  for (const ev of events) {
    const where = `event "${ev.id ?? '(missing id)'}"`;

    const parsed = EventSchema.safeParse(ev);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push(`${where}: schema [${issue.path.join('.')}] ${issue.message}`);
      }
    }

    if (seenIds.has(ev.id)) errors.push(`${where}: duplicate id`);
    seenIds.add(ev.id);

    for (const ph of ev.phases ?? []) {
      if (!PHASE_SET.has(ph)) errors.push(`${where}: invalid phase ${ph} (expected 1|2|3)`);
    }
    for (const p of ev.paths ?? []) {
      if (!PATH_SET.has(p)) errors.push(`${where}: invalid path "${p}"`);
    }

    const arc = ev.arc;
    if (arc) {
      checkArcId(arc.id, `${where} arc`);
      const def = arcs.find((a) => a.id === arc.id);
      if (arc.stage === (def?.entryStage ?? 0)) arcEntrySeen.add(arc.id);
    }

    if (typeof ev.body === 'string') checkText(ev.body, `${where} body`);

    for (const [ci, ch] of (ev.choices ?? []).entries()) {
      const cw = `${where} choice[${ci}]`;
      checkFx(ch.fx, cw);
      checkText(ch.result, `${cw} result`);
      if (ch.ending && !CAUSE_SET.has(ch.ending))
        errors.push(`${cw}: unknown ending cause "${ch.ending}"`);
      checkArcId(ch.arcSet?.id, `${cw} arcSet`);
      checkNpc(ch.npcFx, cw);
      noteThen(ch.then);

      if (ch.roll) {
        if (!STAT_SET.has(ch.roll.stat)) errors.push(`${cw}: invalid roll stat "${ch.roll.stat}"`);
        for (const side of ['success', 'fail'] as const) {
          const br = ch.roll[side];
          checkFx(br.fx, `${cw}.roll.${side}`);
          checkText(br.text, `${cw}.roll.${side} text`);
          if (br.ending && !CAUSE_SET.has(br.ending)) {
            errors.push(`${cw}.roll.${side}: unknown ending cause "${br.ending}"`);
          }
          checkArcId(br.arcSet?.id, `${cw}.roll.${side} arcSet`);
          checkNpc(br.npcFx, `${cw}.roll.${side}`);
          noteThen(br.then);
        }
      }
    }
  }

  for (const id of referencedByThen) {
    if (!allIds.has(id)) errors.push(`then reference -> "${id}" has no matching event`);
  }
  for (const ev of events) {
    if (ev.queueOnly && !referencedByThen.has(ev.id)) {
      errors.push(`event "${ev.id}": queueOnly but never referenced by a then[] (unreachable)`);
    }
  }
  for (const a of arcs) {
    if (!arcEntrySeen.has(a.id)) {
      errors.push(`arc "${a.id}": no entry event at stage ${a.entryStage ?? 0} (unreachable arc)`);
    }
  }

  return { errors, warnings };
}
