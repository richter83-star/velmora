import { describe, it, expect } from 'vitest';
import { deriveIdeology } from '../../src/engine/ideology';
import type { GameState, Stats, Flags } from '../../src/engine/types';

function makeState(flags: Flags = {}): GameState {
  const stats: Stats = { support: 50, funds: 50, influence: 50, media: 50, base: 50, heat: 10 };
  return {
    version: 'test',
    seed: 1,
    rngState: 1,
    path: 'vanguard',
    phase: 3,
    phaseTurn: 0,
    totalTurns: 30,
    stats,
    player: { name: 'Test', title: 'Leader', avatar: null, faction: 'reform', trait: 'orator' },
    world: {},
    rivals: [],
    usedOpp: [],
    opp: 'Rival',
    oppAvatar: '',
    flags,
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
}

const axis = (S: GameState, id: string) => deriveIdeology(S).find((a) => a.id === id)!;

describe('deriveIdeology', () => {
  it('returns both axes, balanced at 50 with no flags', () => {
    const ideo = deriveIdeology(makeState());
    expect(ideo.map((a) => a.id)).toEqual(['rule', 'hands']);
    expect(axis(makeState(), 'rule').value).toBe(50);
    expect(axis(makeState(), 'rule').read).toBe('Balanced');
  });

  it('reads hard Iron for a brutal run and hard Velvet for a gentle one', () => {
    const brutal = axis(makeState({ bloody_hands: true, tyrant_rep: true, purge_count: 5 }), 'rule');
    expect(brutal.value).toBeGreaterThanOrEqual(82);
    expect(brutal.read).toBe('Hard Iron');
    const gentle = axis(makeState({ peacemaker: true, secret_reformer: true, grassroots: true }), 'rule');
    expect(gentle.value).toBeLessThanOrEqual(18);
    expect(gentle.read).toBe('Hard Velvet');
  });

  it('reads hard Dirty for graft and hard Clean for integrity', () => {
    const dirty = axis(makeState({ corrupt_streak: true, blackmailer: true, nepotism: true }), 'hands');
    expect(dirty.value).toBeGreaterThanOrEqual(82);
    expect(dirty.read).toBe('Hard Dirty');
    const clean = axis(makeState({ honest_rep: true, clean_streak: true, ascetic_rep: true }), 'hands');
    expect(clean.value).toBeLessThanOrEqual(18);
    expect(clean.read).toBe('Hard Clean');
  });

  it('clamps to 0..100 under extreme flag stacks', () => {
    const extreme = deriveIdeology(
      makeState({ bloody_hands: true, tyrant_rep: true, zealot_rep: true, own_cult: true, purge_count: 20 }),
    );
    for (const a of extreme) {
      expect(a.value).toBeGreaterThanOrEqual(0);
      expect(a.value).toBeLessThanOrEqual(100);
    }
  });
});
