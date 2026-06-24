/**
 * Content-safety denylist (shared) — the single source of truth for the
 * fictional / non-partisan invariant (AD-15). Player-visible strings must NOT
 * name real ideologies, regimes, institutions, leaders, religions, nations, or
 * their emblems; the game models the *mechanism* of power in the abstract.
 *
 * Two tiers, by content provenance:
 *   - CORE   — the original hand-authored-content gate. Runs over static events,
 *              path/trait/advisor data (via lint.ts), and Loom-woven events.
 *              Authored content is held to exactly this bar (no regression risk).
 *   - STRICT — CORE plus a much broader net (real nations, parties, institutions,
 *              public figures, named faiths). Runs ONLY over OPEN LLM generation
 *              (the Live Storyteller layer), where a false positive is harmless —
 *              the candidate event is simply rejected and the game falls back to
 *              on-device content. This is a backstop, not a classifier.
 *
 * lint.ts re-imports CORE so the build gate and the runtime gates use one list.
 */
import type { GameEvent } from '../engine/types';

export interface DenyRule {
  re: RegExp;
  label: string;
}

export interface DenyHit {
  label: string;
  match: string;
}

/** CORE — the original gate (static content is held to exactly this list). */
export const FORBIDDEN_CORE: DenyRule[] = [
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

/**
 * STRICT — additional rules layered on top of CORE for OPEN generation only.
 * Deliberately broad; false positives just trigger the on-device fallback.
 */
export const FORBIDDEN_STRICT: DenyRule[] = [
  { re: /[✡☪✝☦﷽]/, label: 'real religious emblem' },
  {
    re: /\b(russia|russian|china|chinese|japan|japanese|german[y]?|france|french|britain|british|england|english|america|american|u\.?s\.?a\.?|united states|mexico|mexican|canada|canadian|brazil|brazilian|india|indian|pakistan|iran|iranian|iraq|iraqi|syria|syrian|israel|israeli|palestin\w+|ukrain\w+|poland|polish|italy|italian|spain|spanish|greece|greek|egypt|egyptian|saudi|korea|korean|vietnam|afghan\w*|cuba|cuban|venezuela\w*)\b/i,
    label: 'real nation / demonym',
  },
  {
    re: /\b(moscow|beijing|washington|jerusalem|tehran|baghdad|kyiv|kiev|brussels|pyongyang|gaza|crimea|donbas|taiwan|hong kong|tibet)\b/i,
    label: 'real place name',
  },
  {
    re: /\b(united nations|nato|european union|white house|kremlin|pentagon|capitol hill|downing street|interpol|cia|fbi|nsa|mossad|mi5|mi6|opec|wehrmacht|luftwaffe)\b/i,
    label: 'real institution / agency',
  },
  {
    re: /\b(republican party|democratic party|labour party|tor(?:y|ies)|antifa|ku ?klux|taliban|isis|isil|daesh|al[- ]?qaeda|hamas|hezbollah|boko haram|ba'?athis?t?|falangist|apartheid)\b/i,
    label: 'real party / movement',
  },
  {
    re: /\b(mao|zedong|franco|pol pot|hirohito|tojo|castro|guevara|gaddafi|qaddafi|saddam|bin laden|putin|zelensky|trump|biden|obama|reagan|churchill|roosevelt|thatcher|merkel|macron|xi jinping|modi|netanyahu|erdogan|gandhi|mandela|khomeini|ayatollah)\b/i,
    label: 'real public figure',
  },
  {
    re: /\b(allah|jesus|christ|muhammad|mohammed|mohammad|qur'?an|koran|bible|biblical|torah|talmud|gospel|vatican|mecca|medina|jihad|sharia|caliph\w*|rabbi|imam|the pope|sunni|shia|shiite|sikh\w*|taois[mt]|shinto|zionis[mt]|evangelical|mormon|baptist|methodist|pentecostal)\b/i,
    label: 'real religious term',
  },
];

function scan(text: unknown, rules: readonly DenyRule[]): DenyHit[] {
  if (typeof text !== 'string') return [];
  const hits: DenyHit[] = [];
  for (const r of rules) {
    const m = r.re.exec(text);
    if (m) hits.push({ label: r.label, match: m[0] });
  }
  return hits;
}

/** Scan a string against the CORE gate (the static-content bar). */
export function scanCore(text: unknown): DenyHit[] {
  return scan(text, FORBIDDEN_CORE);
}

/** Scan a string against the STRICT gate (CORE + the open-generation net). */
export function scanStrict(text: unknown): DenyHit[] {
  return scan(text, [...FORBIDDEN_CORE, ...FORBIDDEN_STRICT]);
}

/** Every player-visible string in a realized event, in scan order. */
function visibleStrings(ev: GameEvent): { text: unknown; where: string }[] {
  const out: { text: unknown; where: string }[] = [
    { text: ev.title, where: 'title' },
    { text: ev.kicker, where: 'kicker' },
    { text: typeof ev.body === 'string' ? ev.body : undefined, where: 'body' },
  ];
  (ev.choices ?? []).forEach((c, i) => {
    out.push({ text: c.label, where: `choice[${i}].label` });
    out.push({ text: c.hint, where: `choice[${i}].hint` });
    out.push({ text: c.result, where: `choice[${i}].result` });
    if (c.roll) {
      out.push({ text: c.roll.success?.text, where: `choice[${i}].roll.success` });
      out.push({ text: c.roll.fail?.text, where: `choice[${i}].roll.fail` });
    }
  });
  return out;
}

/**
 * Scan a fully-realized event's player-visible strings for denylisted content.
 * Returns labelled error strings (empty = clean). `strict` adds the open-
 * generation net (use for LLM output; Loom/static use the default CORE bar).
 */
export function scanRealizedText(ev: GameEvent, opts: { strict?: boolean } = {}): string[] {
  const scanner = opts.strict ? scanStrict : scanCore;
  const errors: string[] = [];
  for (const { text, where } of visibleStrings(ev)) {
    for (const hit of scanner(text)) {
      errors.push(`${where}: forbidden ${hit.label} — "${hit.match}"`);
    }
  }
  return errors;
}
