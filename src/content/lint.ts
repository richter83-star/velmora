/**
 * Content linter — the authoring safety net. Runs the Zod structural schema
 * plus the semantic checks the brief requires:
 *   1. duplicate event ids
 *   2. unresolved `then` references
 *   3. invalid fx / roll stat keys
 *   4. unreachable events (queueOnly never referenced by a `then`)
 *   5. `${...}` inside a plain (non-function) body/result/roll-text
 *   6. unknown ending causes
 *
 * (Ending *reachability* — "every ending can be produced" — is asserted by the
 * seeded E2E sweep, since endings are computed in the engine, not data; this
 * moves to a data check when endings become data in Phase 3. See AD-4.)
 */
import type { GameEvent } from '../engine/types';
import { EventSchema, STAT_KEYS, VALID_PHASES, PATH_KEYS, ENDING_CAUSES } from './schema';

export interface LintResult {
  errors: string[];
  warnings: string[];
}

const STAT_SET = new Set<string>(STAT_KEYS);
const PATH_SET = new Set<string>(PATH_KEYS);
const PHASE_SET = new Set<number>(VALID_PHASES);
const CAUSE_SET = new Set<string>(ENDING_CAUSES);

export function validateContent(events: readonly GameEvent[]): LintResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const seenIds = new Set<string>();
  const allIds = new Set(events.map((e) => e.id));
  const referencedByThen = new Set<string>();

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

    if (typeof ev.body === 'string') checkText(ev.body, `${where} body`);

    for (const [ci, ch] of (ev.choices ?? []).entries()) {
      const cw = `${where} choice[${ci}]`;
      checkFx(ch.fx, cw);
      checkText(ch.result, `${cw} result`);
      if (ch.ending && !CAUSE_SET.has(ch.ending))
        errors.push(`${cw}: unknown ending cause "${ch.ending}"`);
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

  return { errors, warnings };
}
