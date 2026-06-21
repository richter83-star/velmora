import { describe, it, expect } from 'vitest';
import { ALL_EVENTS } from '../../src/content/all-events';
import { ARCS } from '../../src/content/arcs';
import { validateContent } from '../../src/content/lint';
import type { GameEvent } from '../../src/engine/types';

// Validate exactly the pool the engine plays (base + arcs + NPC + scandal +
// packs + the Dark Mirrors expansion banks). Imported from the single source of
// truth so new banks are always covered without editing this list.
const ALL = ALL_EVENTS;

describe('content validation', () => {
  const result = validateContent(ALL, ARCS);

  it('passes all content checks', () => {
    expect(result.errors, `content errors:\n${result.errors.join('\n')}`).toEqual([]);
  });

  it('meets the Phase 3 commercial-volume target (250+ events)', () => {
    expect(ALL.length).toBeGreaterThanOrEqual(250);
  });

  it('every event id is unique', () => {
    expect(new Set(ALL.map((e) => e.id)).size).toBe(ALL.length);
  });

  it('every registered arc has a reachable entry event', () => {
    expect(result.errors.filter((e) => e.includes('unreachable arc'))).toEqual([]);
  });

  it('real content has no forbidden ideology/religion/symbol terms', () => {
    expect(result.errors.filter((e) => e.includes('forbidden'))).toEqual([]);
  });

  it('the content-safety denylist actually fires on a violation (regression guard)', () => {
    const fake = (title: string): GameEvent =>
      ({ id: 'x', paths: ['ballot'], phases: [1], title, choices: [] }) as unknown as GameEvent;
    for (const title of ['The ☭ Rally', 'A meeting of the Politburo', 'On Islam and the state']) {
      const r = validateContent([fake(title)]);
      expect(
        r.errors.some((e) => e.includes('forbidden')),
        `should flag: ${title}`,
      ).toBe(true);
    }
  });
});
