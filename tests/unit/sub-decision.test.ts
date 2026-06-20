import { describe, it, expect } from 'vitest';
import { applyChoice } from '../../src/engine/resolve';
import { createRng } from '../../src/engine/rng';
import type { GameState, GameEvent, Stats } from '../../src/engine/types';

function makeState(): GameState {
  const stats: Stats = { support: 50, funds: 50, influence: 50, media: 50, base: 50, heat: 10 };
  return {
    version: 'test',
    seed: 1,
    rngState: 1,
    path: 'ballot',
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
    blocs: {},
    cabinet: [],
    cabinetOffer: null,
    pendingSub: null,
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

const event = (): GameEvent => ({
  id: 'crisis_x',
  paths: ['ballot'],
  phases: [1],
  title: 'A Crisis',
  body: 'Pick.',
  choices: [
    { label: 'Branch immediately', fx: { base: 4 }, sub: 'follow_up', result: 'ok' },
    { label: 'Plain choice', fx: { support: 2 }, result: 'ok' },
  ],
});

describe('crisis sub-decisions', () => {
  it('reports the sub-event id when the chosen option has one', () => {
    const out = applyChoice(makeState(), event(), 0, createRng('s'));
    expect(out?.sub).toBe('follow_up');
  });

  it('reports no sub for an ordinary choice', () => {
    const out = applyChoice(makeState(), event(), 1, createRng('s'));
    expect(out?.sub).toBeNull();
  });
});
