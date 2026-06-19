import { describe, it, expect } from 'vitest';
import {
  recordScandal,
  latentScandals,
  scandalResurfaceChance,
  pickResurfacing,
  activeScandalRecord,
  resolveActiveScandal,
} from '../../src/engine/scandals';
import type { GameState, Scandal } from '../../src/engine/types';

function makeState(over: Partial<GameState> = {}): GameState {
  return {
    phase: 1,
    totalTurns: 5,
    stats: { support: 50, funds: 50, influence: 50, media: 50, base: 50, heat: 10 },
    scandals: [],
    activeScandal: null,
    ...over,
  } as unknown as GameState;
}

const sc = (id: string, severity: number, turn: number, status: Scandal['status']): Scandal => ({
  id,
  label: id,
  severity,
  phase: 1,
  turn,
  status,
});

describe('scandals with memory', () => {
  it('recordScandal plants a latent scandal and is idempotent', () => {
    const s = makeState();
    recordScandal(s, { id: 'a', label: 'thing', severity: 3 });
    recordScandal(s, { id: 'a', label: 'thing', severity: 3 });
    expect(s.scandals).toHaveLength(1);
    expect(s.scandals[0]).toMatchObject({ id: 'a', status: 'latent', phase: 1, turn: 5 });
  });

  it('recordScandal ignores undefined', () => {
    const s = makeState();
    recordScandal(s, undefined);
    expect(s.scandals).toHaveLength(0);
  });

  it('latentScandals filters by status', () => {
    const s = makeState({ scandals: [sc('a', 2, 1, 'latent'), sc('b', 2, 1, 'resolved')] });
    expect(latentScandals(s).map((x) => x.id)).toEqual(['a']);
  });

  it('resurface chance is 0 without latent scandals and scales with severity + heat', () => {
    expect(scandalResurfaceChance(makeState())).toBe(0);
    const low = scandalResurfaceChance(makeState({ scandals: [sc('a', 1, 1, 'latent')] }));
    const high = scandalResurfaceChance(makeState({ scandals: [sc('b', 5, 1, 'latent')] }));
    expect(high).toBeGreaterThan(low);
    const hot = makeState({
      stats: { support: 50, funds: 50, influence: 50, media: 50, base: 50, heat: 80 },
      scandals: [sc('c', 3, 1, 'latent')],
    });
    expect(scandalResurfaceChance(hot)).toBeGreaterThan(0.2);
  });

  it('pickResurfacing returns the most severe scandal planted before now', () => {
    const s = makeState({
      totalTurns: 10,
      scandals: [
        sc('minor', 2, 2, 'latent'),
        sc('major', 5, 3, 'latent'),
        sc('fresh', 9, 10, 'latent'),
      ],
    });
    expect(pickResurfacing(s)?.id).toBe('major');
  });

  it('resolveActiveScandal sets the status and clears the active pointer', () => {
    const s = makeState({ activeScandal: 'a', scandals: [sc('a', 3, 1, 'latent')] });
    expect(activeScandalRecord(s)?.id).toBe('a');
    resolveActiveScandal(s, 'buried');
    expect(s.scandals[0]?.status).toBe('buried');
    expect(s.activeScandal).toBeNull();
    expect(latentScandals(s)).toHaveLength(0);
  });
});
