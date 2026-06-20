import { describe, it, expect } from 'vitest';
import {
  initBlocs,
  applyBlocShift,
  blocList,
  coalitionContestMod,
} from '../../src/engine/factions';
import type { GameState, Stats, PathKey } from '../../src/engine/types';

function makeState(path: PathKey = 'ballot', blocs?: Record<string, number>): GameState {
  const stats: Stats = { support: 50, funds: 50, influence: 50, media: 50, base: 50, heat: 10 };
  return {
    version: 'test',
    seed: 1,
    rngState: 1,
    path,
    phase: 1,
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
    arcs: {},
    npcs: {},
    antagonistId: '',
    scandals: [],
    activeScandal: null,
    difficulty: 'standard',
    modifiers: [],
    daily: false,
    blocs: blocs ?? initBlocs(path),
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

const get = (S: GameState, id: string) => blocList(S).find((b) => b.id === id)!.value;

describe('factions / bloc standings', () => {
  it('initializes three neutral blocs per path', () => {
    expect(blocList(makeState('ballot')).map((b) => b.id)).toEqual([
      'federalist',
      'populist',
      'reform',
    ]);
    expect(blocList(makeState('vanguard')).map((b) => b.id)).toEqual([
      'hardliner',
      'technocrat',
      'networker',
    ]);
    expect(blocList(makeState('ballot')).every((b) => b.value === 50)).toBe(true);
  });

  it('warms the populist bloc when you feed the base, cools the establishment', () => {
    const S = makeState('ballot');
    applyBlocShift(S, { base: 10 }, ['grassroots']);
    expect(get(S, 'populist'), 'populist warms (base weight + grassroots)').toBeGreaterThan(50);
    expect(get(S, 'federalist'), 'federalist cools to populism').toBeLessThan(50);
  });

  it('cools the reform bloc on a corruption flag', () => {
    const S = makeState('ballot');
    applyBlocShift(S, {}, ['corrupt_streak']);
    expect(get(S, 'reform')).toBeLessThan(50);
  });

  it('clamps standings to 0..100', () => {
    const S = makeState('vanguard');
    for (let i = 0; i < 40; i++) applyBlocShift(S, { base: 12 }, ['bloody_hands', 'zealot_rep']);
    expect(get(S, 'hardliner')).toBe(100);
    for (let i = 0; i < 40; i++) applyBlocShift(S, { support: 12 }, ['secret_reformer', 'peacemaker']);
    expect(get(S, 'hardliner')).toBe(0);
  });

  it('coalition contest mod tracks average standing deviation', () => {
    expect(coalitionContestMod(makeState('ballot'))).toBe(0);
    const happy = makeState('ballot', { federalist: 70, populist: 70, reform: 70 });
    expect(coalitionContestMod(happy)).toBeCloseTo(4, 5); // (20 avg dev) * 0.2
    const hostile = makeState('ballot', { federalist: 30, populist: 30, reform: 30 });
    expect(coalitionContestMod(hostile)).toBeCloseTo(-4, 5);
  });
});
