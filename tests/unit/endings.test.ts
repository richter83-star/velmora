import { describe, it, expect } from 'vitest';
import { evaluateEnding, dominantTrait } from '../../src/engine/endings';
import type { GameState, Stats, Flags, PathKey } from '../../src/engine/types';

function makeState(
  opts: { path?: PathKey; phase?: number; stats?: Partial<Stats>; flags?: Flags } = {},
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
  return {
    version: 'test',
    seed: 1,
    rngState: 1,
    path: opts.path ?? 'ballot',
    phase: opts.phase ?? 3,
    phaseTurn: 0,
    totalTurns: 22,
    stats,
    player: { name: 'Test', title: 'President', avatar: null, faction: 'reform', trait: 'orator' },
    world: {},
    rivals: [],
    usedOpp: [],
    opp: 'Rival',
    oppAvatar: '',
    flags: opts.flags ?? {},
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

const REMOVAL = [
  'scandal',
  'purge',
  'collapse',
  'revolution',
  'lost_election',
  'lost_powerplay',
  'resign',
] as const;

describe('evaluateEnding', () => {
  it('returns the matching removal ending for each failure cause', () => {
    for (const c of REMOVAL) {
      const e = evaluateEnding(makeState(), c);
      expect(e.endingId).toBe(c);
      expect(e.win).toBe(false);
      expect(e.text.length).toBeGreaterThan(0);
      expect(e.legacy?.length).toBeGreaterThan(0);
    }
  });

  it('awards the reformer ending on a principled finale', () => {
    const e = evaluateEnding(
      makeState({ flags: { secret_reformer: true }, stats: { support: 60 } }),
      'finale',
    );
    expect(e.endingId).toBe('reformer');
    expect(e.win).toBe(true);
  });

  it('awards the tyrant ending on bloody hands', () => {
    expect(evaluateEnding(makeState({ flags: { bloody_hands: true } }), 'finale').endingId).toBe(
      'tyrant',
    );
  });

  it('awards the kleptocrat ending on corruption + funds', () => {
    const e = evaluateEnding(
      makeState({ flags: { corrupt_streak: true }, stats: { funds: 70 } }),
      'finale',
    );
    expect(e.endingId).toBe('kleptocrat');
  });

  it('awards the great-leader ending on a strong, popular finale', () => {
    const e = evaluateEnding(
      makeState({ stats: { support: 70, base: 70, influence: 70, media: 60, heat: 5 } }),
      'finale',
    );
    expect(e.endingId).toBe('great_leader');
  });

  it('falls back to placeholder on a weak finale', () => {
    const e = evaluateEnding(
      makeState({ stats: { support: 30, base: 20, influence: 20, media: 20, heat: 20 } }),
      'finale',
    );
    expect(e.endingId).toBe('placeholder');
  });

  it('always produces a tagged ending with a scorecard', () => {
    const e = evaluateEnding(makeState(), 'finale');
    expect(typeof e.endingId).toBe('string');
    expect(e.win).toBe(true);
    expect(e.legacy).toHaveLength(4);
  });

  it('every ending branch is reachable (all 14 endingIds producible)', () => {
    const produced = new Set<string>();
    for (const c of REMOVAL) produced.add(evaluateEnding(makeState(), c).endingId);
    produced.add(
      evaluateEnding(
        makeState({ flags: { secret_reformer: true }, stats: { support: 60 } }),
        'finale',
      ).endingId,
    ); // reformer
    produced.add(evaluateEnding(makeState({ flags: { bloody_hands: true } }), 'finale').endingId); // tyrant
    produced.add(evaluateEnding(makeState({ flags: { own_cult: true } }), 'finale').endingId); // beloved
    produced.add(
      evaluateEnding(makeState({ flags: { corrupt_streak: true }, stats: { funds: 70 } }), 'finale')
        .endingId,
    ); // kleptocrat
    produced.add(
      evaluateEnding(
        makeState({ stats: { support: 70, base: 70, influence: 70, media: 60, heat: 5 } }),
        'finale',
      ).endingId,
    ); // great_leader
    produced.add(
      evaluateEnding(
        makeState({ stats: { support: 30, base: 20, influence: 20, media: 20, heat: 20 } }),
        'finale',
      ).endingId,
    ); // placeholder
    produced.add(evaluateEnding(makeState(), 'finale').endingId); // operator (default)

    expect([...produced].sort()).toEqual(
      [
        'beloved',
        'collapse',
        'great_leader',
        'kleptocrat',
        'lost_election',
        'lost_powerplay',
        'operator',
        'placeholder',
        'purge',
        'reformer',
        'resign',
        'revolution',
        'scandal',
        'tyrant',
      ].sort(),
    );
  });
});

describe('dominantTrait', () => {
  it('reads the defining flag, else falls back', () => {
    expect(dominantTrait(makeState({ flags: { bloody_hands: true } }))).toBe('Iron Fist');
    expect(dominantTrait(makeState({ flags: {} }))).toBe('Pragmatic Survivor');
  });
});
