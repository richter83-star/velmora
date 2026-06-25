/**
 * Structural "skeleton" of the content banks — the basis of the prose-only
 * diff-guard (Overhaul P4). It strips every player-visible PROSE string (so the
 * TV-MA rewrite is free to change them) and keeps EVERYTHING else verbatim —
 * ids, paths, phases, fx, rolls (stat/dc), flags, then-refs, endings, arcs, npc
 * fx, scandals, tone tags, reqText, emoji, AND the normalized source of every
 * function (req/speaker/computed body). So a rewrite that only changes wording
 * yields an identical skeleton; any change to mechanics, ids, or logic does not.
 *
 * Prose keys (blanked): title, kicker, body(string), choice.label/hint/result,
 * roll.success.text, roll.fail.text, scandal.label. A FUNCTION body is locked by
 * source instead (its computed prose is left to a careful manual pass, not the
 * automated sweep — neither this guard nor the denylist can scan inside it).
 */

const PROSE_KEYS = new Set(['title', 'kicker', 'body', 'label', 'hint', 'result', 'text']);

/**
 * For a computed `body` function, the BACKTICK-template TEXT is prose; its `${…}`
 * interpolations and all surrounding code (ternaries, quoted logic literals like
 * "ballot", operators, numbers) are logic. This strips only the template text —
 * keeping `${…}` spans and every non-template character — so a prose rewrite
 * inside body literals leaves the skeleton identical, while any change to an
 * interpolation, a branch, a quoted literal, or a number still trips the guard.
 * Single/double-quoted strings are CODE here and are copied verbatim.
 */
export function stripTemplateText(src: string): string {
  let out = '';
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === '`') {
      out += '`';
      i++;
      // inside a template literal: drop text, keep ${...} expressions verbatim
      while (i < n && src[i] !== '`') {
        if (src[i] === '\\') {
          i += 2; // escaped char is prose — skip it
          continue;
        }
        if (src[i] === '$' && src[i + 1] === '{') {
          out += '${';
          i += 2;
          let depth = 1;
          while (i < n && depth > 0) {
            const d = src[i];
            if (d === '{') depth++;
            else if (d === '}') depth--;
            if (depth > 0) out += d;
            i++;
          }
          out += '}';
          continue;
        }
        i++; // ordinary prose char — drop
      }
      if (i < n) {
        out += '`';
        i++;
      }
      continue;
    }
    if (c === '"' || c === "'") {
      // a quoted string is CODE here (e.g. S.path === "ballot") — copy verbatim
      const q = c;
      out += c;
      i++;
      while (i < n && src[i] !== q) {
        if (src[i] === '\\') {
          out += src[i] + (src[i + 1] ?? '');
          i += 2;
          continue;
        }
        out += src[i];
        i++;
      }
      if (i < n) {
        out += q;
        i++;
      }
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

export function skeletonize(value: unknown, key?: string): unknown {
  if (typeof value === 'function') {
    const src = (value as (...a: unknown[]) => unknown).toString();
    // A computed `body` is display prose → ignore its template text; every other
    // function (req/speaker) is pure logic → lock its full source.
    const norm = key === 'body' ? stripTemplateText(src) : src;
    return `__fn__:${norm.replace(/\s+/g, ' ').trim()}`;
  }
  if (typeof value === 'string') {
    return key && PROSE_KEYS.has(key) ? '' : value;
  }
  if (Array.isArray(value)) return value.map((v) => skeletonize(v));
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(value as Record<string, unknown>).sort()) {
      out[k] = skeletonize((value as Record<string, unknown>)[k], k);
    }
    return out;
  }
  return value;
}

export function buildSkeletons(events: { id: string }[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const ev of events) out[ev.id] = skeletonize(ev);
  return out;
}
