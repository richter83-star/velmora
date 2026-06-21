import { describe, it, expect } from 'vitest';
import { EVENTS } from '../../src/content/events';
import { ARC_EVENTS, ARCS } from '../../src/content/arcs';
import { NPC_EVENTS } from '../../src/content/npc-events';
import { SCANDAL_EVENTS } from '../../src/content/scandals';
import { PACK_1 } from '../../src/content/events-pack-1';
import { PACK_2 } from '../../src/content/events-pack-2';
import { PACK_3 } from '../../src/content/events-pack-3';
import { PACK_4 } from '../../src/content/events-pack-4';
import { PACK_5 } from '../../src/content/events-pack-5';
import { PACK_6 } from '../../src/content/events-pack-6';
import { PACK_7 } from '../../src/content/events-pack-7';
import { PACK_8 } from '../../src/content/events-pack-8';
import { PACK_9 } from '../../src/content/events-pack-9';
import { CRISIS_SUB_EVENTS } from '../../src/content/crisis-subs';
import { validateContent } from '../../src/content/lint';
import type { GameEvent } from '../../src/engine/types';

// The engine plays the base bank plus arc-step, NPC-aware, scandal, and pack events.
const ALL = [
  ...EVENTS,
  ...ARC_EVENTS,
  ...NPC_EVENTS,
  ...SCANDAL_EVENTS,
  ...PACK_1,
  ...PACK_2,
  ...PACK_3,
  ...PACK_4,
  ...PACK_5,
  ...PACK_6,
  ...PACK_7,
  ...PACK_8,
  ...PACK_9,
  ...CRISIS_SUB_EVENTS,
];

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
