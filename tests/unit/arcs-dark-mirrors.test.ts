import { describe, it, expect } from 'vitest';
import { arcStage, applyArcSet } from '../../src/engine/arcs';
import { ARCS, ARC_EVENTS } from '../../src/content/arcs';
import { DARK_MIRROR_ARCS } from '../../src/content/arcs-dark-mirrors';
import type { GameState, GameEvent } from '../../src/engine/types';

function withArcs(arcs: Record<string, number>): GameState {
  return { arcs } as unknown as GameState;
}

const NEW_ARC_IDS = ['marshal', 'leverage', 'miracle'] as const;

describe('Dark Mirror arcs', () => {
  it('registers all three new arcs (iron/gilded/anointed) in ARCS', () => {
    for (const id of NEW_ARC_IDS) {
      const def = ARCS.find((a) => a.id === id);
      expect(def, `arc "${id}" must be registered`).toBeTruthy();
      expect(def?.entryStage).toBe(0);
      expect(def?.terminalStages).toContain(99);
      expect(def?.paths.length).toBeGreaterThan(0);
    }
  });

  it('each new arc targets exactly one expansion path', () => {
    const byArc = Object.fromEntries(DARK_MIRROR_ARCS.map((a) => [a.id, a.paths]));
    expect(byArc.marshal).toEqual(['iron']);
    expect(byArc.leverage).toEqual(['gilded']);
    expect(byArc.miracle).toEqual(['anointed']);
  });

  it('each new arc has a reachable entry event at its entryStage', () => {
    for (const id of NEW_ARC_IDS) {
      const entry = ARC_EVENTS.find((e) => e.arc?.id === id && e.arc?.stage === 0);
      expect(entry, `arc "${id}" needs an entry event at stage 0`).toBeTruthy();
    }
  });

  it.each(NEW_ARC_IDS)(
    'arc "%s" forms an ordered chain 0 -> 1 -> 2 -> terminal via first choices',
    (arcId) => {
      const s = withArcs({});
      const byStage = (stage: number): GameEvent | undefined =>
        ARC_EVENTS.find((e) => e.arc?.id === arcId && e.arc?.stage === stage);

      const visited: number[] = [];
      let guard = 0;
      while (guard++ < 10) {
        const stage = arcStage(s, arcId);
        if (stage === 99) break;
        const step = byStage(stage);
        expect(step, `expected a "${arcId}" step at stage ${stage}`).toBeTruthy();
        visited.push(stage);
        applyArcSet(s, step?.choices[0]?.arcSet);
      }

      expect(visited).toEqual([0, 1, 2]);
      expect(arcStage(s, arcId)).toBe(99);
    },
  );

  it('each terminal stage offers a clean alternative that also resolves the arc', () => {
    for (const id of NEW_ARC_IDS) {
      const finale = ARC_EVENTS.find((e) => e.arc?.id === id && e.arc?.stage === 2);
      expect(finale, `arc "${id}" needs a stage-2 reckoning`).toBeTruthy();
      // The second choice is the "clean" route: either a direct arcSet to terminal
      // or a roll whose success/fail both resolve the arc.
      const clean = finale?.choices[1];
      const resolves =
        clean?.arcSet?.stage === 99 ||
        (clean?.roll?.success.arcSet?.stage === 99 && clean?.roll?.fail.arcSet?.stage === 99);
      expect(resolves, `arc "${id}" clean route must resolve to terminal`).toBe(true);
    }
  });
});
