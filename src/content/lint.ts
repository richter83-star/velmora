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
import { ENGINE_INJECTED_EVENT_IDS } from './scandals';
import { PATHS } from './paths';
import { TRAITS } from './traits';
import { ADVISORS } from '../engine/cabinet';

/**
 * Content-safety denylist (the fictional / non-partisan invariant). Player-visible
 * strings must NOT name real ideologies, regimes, institutions, leaders, religions,
 * or their emblems — the game models the *mechanism* of power in the abstract.
 * (The expansion brief requires this gate; it also caught a real ☭ + "Politburo" leak.)
 */
const FORBIDDEN: { re: RegExp; label: string }[] = [
  { re: /[☭卐卍]/, label: 'real ideological symbol (hammer-and-sickle / swastika)' },
  {
    re: /\b(fascis[mt]|communis[mt]|nazism|nazis?|marxis[mt]|leninis[mt]|stalinis[mt]|maois[mt]|bolshevik|politburo|gestapo|kgb|stasi|soviet|ussr|reich|swastika)\b/i,
    label: 'real ideology / regime / institution name',
  },
  { re: /\b(hitler|stalin|lenin|mussolini)\b/i, label: 'real public figure name' },
  {
    re: /\b(islam|muslim|christian(?:ity)?|catholic|protestant|judaism|jewish|hindu(?:ism)?|buddhis[mt])\b/i,
    label: 'real religion name',
  },
];

export interface LintResult {
  errors: string[];
  warnings: string[];
}

const STAT_SET = new Set<string>(STAT_KEYS);
const PATH_SET = new Set<string>(PATH_KEYS);
const PHASE_SET = new Set<number>(VALID_PHASES);
const CAUSE_SET = new Set<string>(ENDING_CAUSES);
const NPC_ID_SET = new Set<string>(KNOWN_NPC_IDS);
const INJECTED_IDS = new Set<string>(ENGINE_INJECTED_EVENT_IDS);

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
  const scanForbidden = (text: unknown, where: string): void => {
    if (typeof text !== 'string') return;
    for (const f of FORBIDDEN) {
      const m = f.re.exec(text);
      if (m)
        errors.push(
          `${where}: forbidden ${f.label} — "${m[0]}" (content must stay fictional/non-partisan)`,
        );
    }
  };

  // Static content data (paths, traits, advisors) — player-visible strings.
  for (const p of Object.values(PATHS)) {
    const pw = `path "${p.key}"`;
    scanForbidden(p.land, `${pw} land`);
    for (const v of Object.values(p.statNames)) scanForbidden(v, `${pw} statName`);
    for (const fac of p.factions) {
      scanForbidden(fac.name, `${pw} faction "${fac.id}" name`);
      scanForbidden(fac.desc, `${pw} faction "${fac.id}" desc`);
    }
    for (const ph of p.phases) {
      scanForbidden(ph.title, `${pw} phase ${ph.n} title`);
      scanForbidden(ph.kicker, `${pw} phase ${ph.n} kicker`);
      scanForbidden(ph.emoji, `${pw} phase ${ph.n} emoji`);
      scanForbidden(ph.promo?.label, `${pw} phase ${ph.n} promo label`);
      scanForbidden(ph.promo?.oppTitle, `${pw} phase ${ph.n} promo oppTitle`);
    }
    for (const n of p.oppNames) scanForbidden(n, `${pw} oppName`);
  }
  for (const t of TRAITS) {
    scanForbidden(t.name, `trait "${t.id}" name`);
    scanForbidden(t.desc, `trait "${t.id}" desc`);
  }
  for (const list of Object.values(ADVISORS)) {
    for (const a of list) {
      scanForbidden(a.name, `advisor "${a.id}" name`);
      scanForbidden(a.title, `advisor "${a.id}" title`);
      scanForbidden(a.desc, `advisor "${a.id}" desc`);
    }
  }

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
    scanForbidden(ev.title, `${where} title`);
    scanForbidden(ev.kicker, `${where} kicker`);
    scanForbidden(ev.body, `${where} body`);

    for (const [ci, ch] of (ev.choices ?? []).entries()) {
      const cw = `${where} choice[${ci}]`;
      checkFx(ch.fx, cw);
      checkText(ch.result, `${cw} result`);
      scanForbidden(ch.label, `${cw} label`);
      scanForbidden(ch.hint, `${cw} hint`);
      scanForbidden(ch.result, `${cw} result`);
      if (ch.ending && !CAUSE_SET.has(ch.ending))
        errors.push(`${cw}: unknown ending cause "${ch.ending}"`);
      checkArcId(ch.arcSet?.id, `${cw} arcSet`);
      checkNpc(ch.npcFx, cw);
      noteThen(ch.then);
      if (ch.sub) referencedByThen.add(ch.sub);

      if (ch.roll) {
        if (!STAT_SET.has(ch.roll.stat)) errors.push(`${cw}: invalid roll stat "${ch.roll.stat}"`);
        for (const side of ['success', 'fail'] as const) {
          const br = ch.roll[side];
          checkFx(br.fx, `${cw}.roll.${side}`);
          checkText(br.text, `${cw}.roll.${side} text`);
          scanForbidden(br.text, `${cw}.roll.${side} text`);
          if (br.ending && !CAUSE_SET.has(br.ending)) {
            errors.push(`${cw}.roll.${side}: unknown ending cause "${br.ending}"`);
          }
          checkArcId(br.arcSet?.id, `${cw}.roll.${side} arcSet`);
          checkNpc(br.npcFx, `${cw}.roll.${side}`);
          noteThen(br.then);
          if (br.sub) referencedByThen.add(br.sub);
        }
      }
    }
  }

  for (const id of referencedByThen) {
    if (!allIds.has(id)) errors.push(`then reference -> "${id}" has no matching event`);
  }
  for (const ev of events) {
    if (ev.queueOnly && !referencedByThen.has(ev.id) && !INJECTED_IDS.has(ev.id)) {
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
