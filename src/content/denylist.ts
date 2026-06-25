/**
 * Content-safety denylist (shared) — the single source of truth for the
 * fictional / non-partisan invariant (AD-15) AND the Mature (TV-MA) red lines
 * (Overhaul P3). Player-visible strings must NOT name real ideologies, regimes,
 * institutions, leaders, religions, nations, or their emblems; the game models
 * the *mechanism* of power in the abstract, satirised through invented Velmora
 * stand-ins.
 *
 * WHAT THE GATE DOES *NOT* TOUCH: profanity, crude/sexual innuendo, gross-out,
 * cartoon violence, and savage dark satire are ALLOWED (TV-MA) — they were never
 * code-gated, only an authoring convention. The gate enforces TOKENS, not spirit;
 * the real control for tone is the voice bible + per-path human spot-read.
 *
 * THE RED LINES (the only things the gate hard-blocks), by family:
 *   - real names/symbols (ideology/regime/figure/religion)  → FORBIDDEN_CORE
 *   - explicit pornography (depiction, not mere reference)   → FORBIDDEN_PORN   (BOTH tiers)
 *   - broad real-world net (nations/parties/institutions/…)  → FORBIDDEN_STRICT (open-gen only)
 *   - sexualising a real public figure                       → REAL_PERSON_SEXUAL (open-gen only)
 *
 * Two tiers, by content provenance:
 *   - CORE   — the hand-authored-content gate. Runs over static events,
 *              path/trait/advisor data (via lint.ts), and Loom-woven events.
 *              = FORBIDDEN_CORE + FORBIDDEN_PORN.
 *   - STRICT — CORE plus a much broader net (real nations, parties, institutions,
 *              public figures, named faiths, real-person sexualisation). Runs ONLY
 *              over OPEN LLM generation (the Live Storyteller layer), where a false
 *              positive is harmless — the candidate event is simply rejected and the
 *              game falls back to on-device content. A backstop, not a classifier.
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

/**
 * PORN — explicit pornographic DEPICTION (not a crude reference or a sex-scandal
 * mention, which stay allowed). Applied to BOTH tiers, so even hand-authored
 * content can never ship hardcore prose. Token-gated and deliberately narrow:
 * tokens that are almost exclusively explicit-sex register, chosen to avoid
 * firing on allowed TV-MA profanity/innuendo ("fuck", "dick", "ass" are fine).
 */
export const FORBIDDEN_PORN: DenyRule[] = [
  { re: /\b(porn(?:o|ography|ographic)?|x-?rated|hardcore sex)\b/i, label: 'explicit pornography' },
  {
    re: /\b(blow ?job|hand ?job|rim ?job|deep ?throat|gang ?bang|bukkake|cum ?shot|creampie|fellatio|cunnilingus|felching)\b/i,
    label: 'explicit sexual act (pornographic)',
  },
  {
    re: /\b(cumming|cummed|cumshot|jizz|jerking off|jacking off|jerk off|jack off|masturbat\w+|ejaculat\w+)\b/i,
    label: 'explicit sexual content',
  },
  { re: /\b(dildo|butt ?plug|fleshlight|strap[- ]?on)\b/i, label: 'explicit sexual paraphernalia' },
];

/**
 * REAL_PERSON_SEXUAL — sexualising a REAL public figure (STRICT / open-gen only).
 * The figure NAMES are already hard-blocked above; this is a labelled belt that
 * fires when mild-sexual content co-occurs with an unambiguously real-world
 * honorific. Generic fictional offices (a Velmora governor/president) are left to
 * the name/nation nets so in-fiction crude satire still passes; a STRICT false
 * positive only triggers the harmless on-device fallback.
 */
export const REAL_PERSON_SEXUAL: DenyRule[] = [
  {
    re: /(?=.*\b(first lady|his holiness|her majesty|the pope|ayatollah|the prophet|royal highness|head of state)\b)(?=.*\b(naked|nude|aroused|horny|sexual\w*|sexy|in bed|sleeping with|having sex|orgasm\w*|genital\w*)\b)/i,
    label: 'sexualising a real public figure',
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

/** Scan a string against the CORE gate (real-names + explicit-porn bar). */
export function scanCore(text: unknown): DenyHit[] {
  return scan(text, [...FORBIDDEN_CORE, ...FORBIDDEN_PORN]);
}

/** Scan a string against the STRICT gate (CORE + the open-generation net). */
export function scanStrict(text: unknown): DenyHit[] {
  return scan(text, [
    ...FORBIDDEN_CORE,
    ...FORBIDDEN_PORN,
    ...FORBIDDEN_STRICT,
    ...REAL_PERSON_SEXUAL,
  ]);
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
