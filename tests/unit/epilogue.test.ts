import { describe, it, expect } from 'vitest';
import { buildEpilogue } from '../../src/engine/epilogue';
import type { GameState, Stats, PathKey, Flags } from '../../src/engine/types';

function makeState(
  opts: { path?: PathKey; stats?: Partial<Stats>; flags?: Flags; antagonistRel?: number } = {},
): GameState {
  const stats: Stats = {
    support: 50,
    funds: 50,
    influence: 50,
    media: 50,
    base: 50,
    heat: 10,
    ...opts.stats,
  };
  const S: GameState = {
    version: 'test',
    seed: 1,
    rngState: 1,
    path: opts.path ?? 'ballot',
    phase: 3,
    phaseTurn: 0,
    totalTurns: 30,
    stats,
    player: { name: 'Test', title: 'President', avatar: null, faction: 'reform', trait: 'orator' },
    world: {},
    rivals: [],
    usedOpp: [],
    opp: 'Rival X',
    oppAvatar: '',
    flags: opts.flags ?? {},
    arcs: {},
    npcs: {},
    antagonistId: '',
    scandals: [],
    activeScandal: null,
    difficulty: 'standard',
    modifiers: [],
    daily: false,
    seen: [],
    queue: [],
    log: [],
    lastResult: null,
    lastDeltas: null,
    pendingDeath: null,
    pendingEndingCause: null,
    mode: 'over',
    over: true,
    ending: null,
    promo: null,
    current: null,
  };
  if (opts.antagonistRel !== undefined) {
    S.antagonistId = 'antagonist';
    S.npcs = {
      antagonist: {
        id: 'antagonist',
        name: 'Rival X',
        role: 'rival',
        kind: 'antagonist',
        avatar: '',
        relationship: opts.antagonistRel,
        loyalty: 0,
        met: true,
        firstPhase: 1,
      },
    };
  }
  return S;
}

describe('buildEpilogue', () => {
  it('always returns at least one line, ending with a path-flavored closer', () => {
    const ballot = buildEpilogue(makeState({ path: 'ballot' }));
    const vanguard = buildEpilogue(makeState({ path: 'vanguard' }));
    expect(ballot.length).toBeGreaterThanOrEqual(1);
    expect(ballot.at(-1)).toContain('Republic');
    expect(vanguard.at(-1)).toContain('Union');
  });

  it('surfaces a beat for a defining flag', () => {
    const e = buildEpilogue(makeState({ flags: { bloody_hands: true } }));
    expect(e.some((l) => l.includes('tribunals'))).toBe(true);
  });

  it('caps flag beats at three (plus the closer)', () => {
    const e = buildEpilogue(
      makeState({
        flags: {
          bloody_hands: true,
          corrupt_streak: true,
          own_cult: true,
          has_network: true,
          blackmailer: true,
        },
        stats: { heat: 90 },
      }),
    );
    // 3 flag beats + 1 closer = 4 (no antagonist set here).
    expect(e.length).toBe(4);
  });

  it('notes a warm or hostile parting with the recurring rival', () => {
    const warm = buildEpilogue(makeState({ antagonistRel: 40 }));
    expect(warm.some((l) => l.includes('warmly'))).toBe(true);
    const cold = buildEpilogue(makeState({ antagonistRel: -50 }));
    expect(cold.some((l) => l.includes('erase you'))).toBe(true);
  });
});
