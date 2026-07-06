import { describe, it, expect } from 'vitest';
import { arcStage, applyArcSet } from '../../src/engine/arcs';
import { ARCS, ARC_EVENTS } from '../../src/content/arcs';
import type { GameState, GameEvent, ArcAdvance } from '../../src/engine/types';

function withArcs(arcs: Record<string, number>): GameState {
  return { arcs } as unknown as GameState;
}

/** Advancement of choice[0]: a direct arcSet, or (at a roll finale) the success branch. */
function firstAdvance(step: GameEvent): ArcAdvance | undefined {
  const c0 = step.choices[0];
  return c0?.arcSet ?? c0?.roll?.success.arcSet;
}

describe('arc registry coverage (every arc, present + future)', () => {
  it('lists all expected arc ids', () => {
    const ids = ARCS.map((a) => a.id).sort();
    expect(ids).toEqual(
      ['cult', 'defector', 'harbor', 'leverage', 'marshal', 'miracle', 'nemesis', 'patron', 'tape'].sort(),
    );
  });

  it('every arc has a reachable entry event at its entryStage', () => {
    for (const arc of ARCS) {
      const entry = ARC_EVENTS.find((e) => e.arc?.id === arc.id && e.arc?.stage === arc.entryStage);
      expect(entry, `arc "${arc.id}" needs an entry event at stage ${arc.entryStage}`).toBeTruthy();
    }
  });

  it('every arc-tagged event references a registered arc id', () => {
    const known = new Set(ARCS.map((a) => a.id));
    for (const ev of ARC_EVENTS) {
      if (ev.arc) expect(known.has(ev.arc.id), `event ${ev.id} -> unknown arc ${ev.arc.id}`).toBe(true);
    }
  });

  it('every arc terminates by following first choices from its entry stage', () => {
    for (const arc of ARCS) {
      const s = withArcs({});
      s.arcs[arc.id] = arc.entryStage;
      let guard = 0;
      while (guard++ < 12) {
        const stage = arcStage(s, arc.id);
        if (arc.terminalStages.includes(stage)) break;
        const step = ARC_EVENTS.find((e) => e.arc?.id === arc.id && e.arc?.stage === stage);
        expect(step, `arc "${arc.id}" missing a step at stage ${stage}`).toBeTruthy();
        const next = step ? firstAdvance(step) : undefined;
        expect(next, `arc "${arc.id}" step at stage ${stage} must advance`).toBeTruthy();
        applyArcSet(s, next);
      }
      expect(
        arc.terminalStages.includes(arcStage(s, arc.id)),
        `arc "${arc.id}" never reached a terminal stage`,
      ).toBe(true);
    }
  });

  it('every arc step offers a clean alternative that also resolves the arc', () => {
    const nonEntry = ARC_EVENTS.filter((e) => e.arc && e.arc.stage !== 0);
    for (const step of nonEntry) {
      const alt = step.choices[1];
      const resolves =
        alt?.arcSet != null ||
        (alt?.roll?.success.arcSet != null && alt?.roll?.fail.arcSet != null);
      expect(resolves, `step ${step.id} second choice must resolve the arc`).toBe(true);
    }
  });
});
