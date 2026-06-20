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
import { validateContent } from '../../src/content/lint';

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
];

describe('content validation', () => {
  const result = validateContent(ALL, ARCS);

  it('passes all content checks', () => {
    expect(result.errors, `content errors:\n${result.errors.join('\n')}`).toEqual([]);
  });

  it('has a non-trivial event bank', () => {
    expect(ALL.length).toBeGreaterThanOrEqual(20);
  });

  it('every event id is unique', () => {
    expect(new Set(ALL.map((e) => e.id)).size).toBe(ALL.length);
  });

  it('every registered arc has a reachable entry event', () => {
    expect(result.errors.filter((e) => e.includes('unreachable arc'))).toEqual([]);
  });
});
