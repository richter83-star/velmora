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

function normFn(fn: (...a: unknown[]) => unknown): string {
  return fn.toString().replace(/\s+/g, ' ').trim();
}

export function skeletonize(value: unknown, key?: string): unknown {
  if (typeof value === 'function') {
    return `__fn__:${normFn(value as (...a: unknown[]) => unknown)}`;
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
