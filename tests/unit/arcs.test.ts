import { describe, it, expect } from 'vitest';
import { arcStage, arcEventEligible, applyArcSet } from '../../src/engine/arcs';
import { ARC_EVENTS } from '../../src/content/arcs';
import type { GameState, GameEvent } from '../../src/engine/types';

function withArcs(arcs: Record<string, number>): GameState {
  return { arcs } as unknown as GameState;
}

describe('arc engine', () => {
  it('arcStage defaults to 0 and reads set stages', () => {
    expect(arcStage(withArcs({}), 'harbor')).toBe(0);
    expect(arcStage(withArcs({ harbor: 2 }), 'harbor')).toBe(2);
  });

  it('arcStage tolerates a missing arcs map (old saves)', () => {
    expect(arcStage({} as GameState, 'harbor')).toBe(0);
  });

  it('non-arc events are always eligible', () => {
    expect(arcEventEligible(withArcs({}), { id: 'x' } as GameEvent)).toBe(true);
  });

  it('arc-step events are eligible only at their matching stage', () => {
    const step = { id: 's', arc: { id: 'harbor', stage: 1 } } as GameEvent;
    expect(arcEventEligible(withArcs({ harbor: 0 }), step)).toBe(false);
    expect(arcEventEligible(withArcs({ harbor: 1 }), step)).toBe(true);
    expect(arcEventEligible(withArcs({ harbor: 2 }), step)).toBe(false);
  });

  it('applyArcSet advances the arc and initializes a missing map', () => {
    const s = {} as GameState;
    applyArcSet(s, { id: 'harbor', stage: 1 });
    expect(s.arcs.harbor).toBe(1);
    applyArcSet(s, { id: 'harbor', stage: 99 });
    expect(s.arcs.harbor).toBe(99);
  });

  it('the harbor arc forms an ordered chain 0 -> 1 -> 2 -> terminal via first choices', () => {
    const s = withArcs({});
    const byStage = (stage: number): GameEvent | undefined =>
      ARC_EVENTS.find((e) => !!e.arc && e.arc.id === 'harbor' && e.arc.stage === stage);

    const visited: number[] = [];
    let guard = 0;
    while (guard++ < 10) {
      const stage = arcStage(s, 'harbor');
      if (stage === 99) break;
      const step = byStage(stage);
      expect(step, `expected a harbor step at stage ${stage}`).toBeTruthy();
      visited.push(stage);
      applyArcSet(s, step?.choices[0]?.arcSet);
    }

    expect(visited).toEqual([0, 1, 2]);
    expect(arcStage(s, 'harbor')).toBe(99);
  });
});
