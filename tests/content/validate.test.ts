import { describe, it, expect } from 'vitest';
import { EVENTS } from '../../src/content/events';
import { ARC_EVENTS, ARCS } from '../../src/content/arcs';
import { NPC_EVENTS } from '../../src/content/npc-events';
import { SCANDAL_EVENTS } from '../../src/content/scandals';
import { validateContent } from '../../src/content/lint';

// The engine plays the base bank plus arc-step, NPC-aware, and scandal events.
const ALL = [...EVENTS, ...ARC_EVENTS, ...NPC_EVENTS, ...SCANDAL_EVENTS];

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
