import { describe, it, expect } from 'vitest';
import { evaluateEnding, dominantTrait } from '../../src/engine/endings';
import type { GameState, Stats, Flags, PathKey } from '../../src/engine/types';

function makeState(
  opts: {
    path?: PathKey;
    phase?: number;
    stats?: Partial<Stats>;
    flags?: Flags;
    blocs?: Record<string, number>;
  } = {},
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
    blocs: opts.blocs,
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
  // Dark Mirrors expansion failure causes (Iron / Gilded / Anointed).
  'arrested',
  'dissolved',
  'indicted',
  'hostile_takeover',
  'excommunicated',
  'schism',
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

  it('every ending branch is reachable (all 20 endingIds producible)', () => {
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
        'arrested',
        'beloved',
        'collapse',
        'dissolved',
        'excommunicated',
        'great_leader',
        'hostile_takeover',
        'indicted',
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
        'schism',
        'tyrant',
      ].sort(),
    );
  });
});

/**
 * Dark Mirrors expansion — every path-specific finale rank (18 total: 6 each for
 * iron / gilded / anointed) must be producible from some end state. These are
 * the win-state ranks dispatched ahead of the generic ballot/vanguard chain;
 * the failure causes (dissolved/arrested/indicted/…) are covered by REMOVAL above.
 */
const EXPANSION_FINALES: Array<{
  id: string;
  path: PathKey;
  stats?: Partial<Stats>;
  flags?: Flags;
  blocs?: Record<string, number>;
}> = [
  // Iron Order
  { id: 'iron_architect', path: 'iron', stats: { influence: 70, base: 60, heat: 20 } },
  { id: 'iron_despot', path: 'iron', flags: { bloody_hands: true } },
  {
    id: 'iron_puppet',
    path: 'iron',
    stats: { influence: 40, heat: 20 },
    blocs: { industrialists: 75 },
  },
  {
    id: 'iron_strongman',
    path: 'iron',
    stats: { support: 60, base: 60, influence: 55, media: 50, heat: 10 },
  },
  {
    id: 'iron_wreckage',
    path: 'iron',
    stats: { support: 20, base: 20, influence: 20, media: 10, heat: 10 },
  },
  {
    id: 'iron_default',
    path: 'iron',
    stats: { support: 40, base: 40, influence: 40, media: 30, heat: 30 },
  },
  // Gilded Republic
  { id: 'gilded_dynasty', path: 'gilded', stats: { base: 65, funds: 70, heat: 20 } },
  {
    id: 'gilded_monopolist',
    path: 'gilded',
    stats: { funds: 80, influence: 65, base: 40, heat: 20 },
  },
  {
    id: 'gilded_philanthropist',
    path: 'gilded',
    flags: { secret_reformer: true },
    stats: { support: 60, funds: 40 },
  },
  {
    id: 'gilded_figurehead',
    path: 'gilded',
    stats: { influence: 30, funds: 40, support: 40 },
    blocs: { old_money: 75 },
  },
  {
    id: 'gilded_wreckage',
    path: 'gilded',
    stats: { support: 20, base: 20, influence: 20, media: 10, heat: 10, funds: 50 },
  },
  {
    id: 'gilded_default',
    path: 'gilded',
    stats: { support: 50, base: 50, influence: 50, media: 50, heat: 30, funds: 50 },
  },
  // Anointed Path
  {
    id: 'anointed_saint',
    path: 'anointed',
    flags: { secret_reformer: true },
    stats: { support: 70, heat: 10 },
  },
  { id: 'anointed_inquisitor', path: 'anointed', flags: { bloody_hands: true } },
  {
    id: 'anointed_oracle',
    path: 'anointed',
    flags: { own_cult: true },
    stats: { support: 62, heat: 10 },
  },
  {
    id: 'anointed_reformer',
    path: 'anointed',
    stats: { media: 60, support: 50, heat: 10 },
    blocs: { reformists: 75 },
  },
  {
    id: 'anointed_caretaker',
    path: 'anointed',
    stats: { support: 50, base: 50, influence: 50, media: 50, heat: 50 },
  },
  {
    id: 'anointed_default_reign',
    path: 'anointed',
    stats: { support: 80, base: 80, influence: 80, media: 80, heat: 10 },
  },
];

describe('expansion finale endings (Dark Mirrors)', () => {
  it('produces each of the 18 path-specific finale ranks from a matching end state', () => {
    for (const c of EXPANSION_FINALES) {
      const e = evaluateEnding(
        makeState({ path: c.path, stats: c.stats, flags: c.flags, blocs: c.blocs }),
        'finale',
      );
      expect(e.endingId, `expected ${c.id}`).toBe(c.id);
      expect(e.win).toBe(true);
      expect(e.text.length).toBeGreaterThan(0);
      expect(e.legacy?.length).toBe(4);
    }
  });

  it('all 18 expansion finale ranks are distinct', () => {
    const ids = new Set<string>();
    for (const c of EXPANSION_FINALES) {
      ids.add(
        evaluateEnding(
          makeState({ path: c.path, stats: c.stats, flags: c.flags, blocs: c.blocs }),
          'finale',
        ).endingId,
      );
    }
    expect(ids.size).toBe(18);
  });
});

describe('dominantTrait', () => {
  it('reads the defining flag, else falls back', () => {
    expect(dominantTrait(makeState({ flags: { bloody_hands: true } }))).toBe('Iron Fist');
    expect(dominantTrait(makeState({ flags: {} }))).toBe('Pragmatic Survivor');
  });
});
