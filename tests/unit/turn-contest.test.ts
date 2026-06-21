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
  it('expansion paths: per-path heat-death and support-death causes', () => {
    expect(deathCause(makeState({ path: 'iron', stats: { heat: 100 } }))).toBe('arrested');
    expect(deathCause(makeState({ path: 'iron', stats: { support: 0 } }))).toBe('dissolved');
    expect(deathCause(makeState({ path: 'gilded', stats: { heat: 100 } }))).toBe('indicted');
    expect(deathCause(makeState({ path: 'gilded', stats: { support: 0 } }))).toBe('hostile_takeover');
    expect(deathCause(makeState({ path: 'anointed', stats: { heat: 100 } }))).toBe('excommunicated');
    expect(deathCause(makeState({ path: 'anointed', stats: { support: 0 } }))).toBe('schism');
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

  it('does not erode approval at or below the comfort level', () => {
    const S = makeState({ stats: { support: 50, heat: 10 } });
    advanceTurnState(S);
    expect(S.stats.support).toBe(50);
  });

  it('erodes approval faster the higher you ride, and under scandal pressure', () => {
    const high = makeState({ stats: { support: 80, heat: 10 } });
    advanceTurnState(high);
    expect(high.stats.support).toBe(78); // > 55 and > 75 → -2

    const besieged = makeState({ stats: { support: 80, heat: 70 } });
    advanceTurnState(besieged);
    expect(besieged.stats.support).toBe(77); // -2 incumbency, -1 scandal (heat still >= 60)
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
  it('weights the expansion promo types by their documented coefficients', () => {
    const full = makeState({
      stats: { support: 100, funds: 100, influence: 100, media: 100, base: 100, heat: 0 },
    });
    expect(promoPlayerStrength(full, 'purge')).toBeCloseTo(100, 6); // .40+.32+.14+.14
    expect(promoPlayerStrength(full, 'acquisition')).toBeCloseTo(100, 6); // .55+.25+.12+.08
    expect(promoPlayerStrength(full, 'council')).toBeCloseTo(100, 6); // .35+.30+.20+.15
  });
  it('exposure/heresy penalties drag purge and council strength down', () => {
    const calm = makeState({ stats: { influence: 60, base: 60, support: 60, media: 40, heat: 0 } });
    const exposed = makeState({
      stats: { influence: 60, base: 60, support: 60, media: 40, heat: 100 },
    });
    expect(promoPlayerStrength(exposed, 'purge')).toBeLessThan(promoPlayerStrength(calm, 'purge'));
    expect(promoPlayerStrength(exposed, 'council')).toBeLessThan(
      promoPlayerStrength(calm, 'council'),
    );
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
