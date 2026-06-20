import { describe, it, expect } from 'vitest';
import { deathCause, advanceTurnState } from '../../src/engine/turn';
import { promoPlayerStrength, contestOppStrength, promoWinChance } from '../../src/engine/contest';
import { createRng } from '../../src/engine/rng';
import type { GameState, Stats, PathKey } from '../../src/engine/types';

function makeState(opts: { path?: PathKey; phase?: number; stats?: Partial<Stats> } = {}): GameState {
  const stats: Stats = {
    support: 50,
    funds: 50,
    influence: 50,
    media: 50,
    base: 50,
    heat: 10,
    ...opts.stats,
  };
  return {
    version: 'test',
    seed: 1,
    rngState: 1,
    path: opts.path ?? 'ballot',
    phase: opts.phase ?? 1,
    phaseTurn: 0,
    totalTurns: 0,
    stats,
    player: { name: 'Test', title: 'Candidate', avatar: null, faction: 'reform', trait: 'orator' },
    world: {},
    rivals: [],
    usedOpp: [],
    opp: 'Rival',
    oppAvatar: '',
    flags: {},
    seen: [],
    queue: [],
    log: [],
    lastResult: null,
    lastDeltas: null,
    pendingDeath: null,
    pendingEndingCause: null,
    mode: 'event',
    over: false,
    ending: null,
    promo: null,
    current: null,
  };
}

describe('deathCause', () => {
  it('ballot: scandal at max heat, collapse at zero support', () => {
    expect(deathCause(makeState({ path: 'ballot', stats: { heat: 100 } }))).toBe('scandal');
    expect(deathCause(makeState({ path: 'ballot', stats: { support: 0 } }))).toBe('collapse');
  });
  it('vanguard: purge at max heat, revolution at zero support', () => {
    expect(deathCause(makeState({ path: 'vanguard', stats: { heat: 100 } }))).toBe('purge');
    expect(deathCause(makeState({ path: 'vanguard', stats: { support: 0 } }))).toBe('revolution');
  });
  it('returns null while vitals are in range', () => {
    expect(deathCause(makeState({ stats: { heat: 99, support: 1 } }))).toBeNull();
  });
});

describe('advanceTurnState', () => {
  it('advances counters, ticks the queue, and cools heat by 2 (clamped at 0)', () => {
    const S = makeState({ stats: { heat: 1 } });
    S.queue.push({ id: 'q1', inTurns: 3 });
    advanceTurnState(S);
    expect(S.totalTurns).toBe(1);
    expect(S.phaseTurn).toBe(1);
    expect(S.queue[0]!.inTurns).toBe(2);
    expect(S.stats.heat).toBe(0); // 1 - 2, clamped at 0
  });
});

describe('promoPlayerStrength', () => {
  it('weights election stats by the documented coefficients', () => {
    const S = makeState({ stats: { support: 100, media: 100, funds: 100, base: 100 } });
    expect(promoPlayerStrength(S, 'election')).toBeCloseTo(100, 6); // 100*(.50+.24+.14+.12)
  });
  it('clamps the power-play score to 0..100', () => {
    const hi = makeState({
      stats: { influence: 100, base: 100, media: 100, support: 100, heat: 0 },
    });
    expect(promoPlayerStrength(hi, 'powerplay')).toBe(100);
    const lo = makeState({ stats: { influence: 0, base: 0, media: 0, support: 0, heat: 100 } });
    expect(promoPlayerStrength(lo, 'powerplay')).toBe(0);
  });
});

describe('promoWinChance', () => {
  it('is 50 at parity and clamps to [4, 96]', () => {
    expect(promoWinChance(50, 50)).toBe(50);
    expect(promoWinChance(100, 0)).toBe(96);
    expect(promoWinChance(0, 100)).toBe(4);
  });
});

describe('contestOppStrength', () => {
  it('stays within the [20, 90] band and is seed-deterministic', () => {
    const a = contestOppStrength(makeState({ phase: 2 }), createRng('x'), 50, 0, 0);
    const b = contestOppStrength(makeState({ phase: 2 }), createRng('x'), 50, 0, 0);
    expect(a).toBe(b);
    expect(a).toBeGreaterThanOrEqual(20);
    expect(a).toBeLessThanOrEqual(90);
  });
  it('hostility and difficulty raise the opponent', () => {
    const base = contestOppStrength(makeState(), createRng('y'), 50, 0, 0);
    const tough = contestOppStrength(makeState(), createRng('y'), 50, 10, 10);
    expect(tough).toBeGreaterThan(base);
  });
});
