import { describe, it, expect } from 'vitest';
import {
  ADVISORS,
  advisorSlate,
  appointAdvisor,
  cabinetPerk,
  tickCabinetLoyalty,
  servingAdvisors,
  defectingAdvisor,
  removeAdvisor,
  processResignations,
  START_LOYALTY,
} from '../../src/engine/cabinet';
import { createRng } from '../../src/engine/rng';
import type { GameState, Stats, PathKey } from '../../src/engine/types';

function makeState(path: PathKey = 'ballot'): GameState {
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
    blocs: {},
    cabinet: [],
    cabinetOffer: null,
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

describe('cabinet / advisors', () => {
  it('offers a seeded slate of not-yet-appointed advisors', () => {
    const S = makeState('ballot');
    const slate = advisorSlate(S, createRng('x'), 2);
    expect(slate).toHaveLength(2);
    appointAdvisor(S, slate[0]!.id);
    const next = advisorSlate(S, createRng('x'), 2);
    expect(next.some((a) => a.id === slate[0]!.id), 'appointed advisor is excluded').toBe(false);
  });

  it('appoints with starting loyalty; ignores duplicates and unknown ids', () => {
    const S = makeState('ballot');
    appointAdvisor(S, 'spin');
    appointAdvisor(S, 'spin'); // dup
    appointAdvisor(S, 'nope'); // unknown
    expect(S.cabinet).toHaveLength(1);
    expect(S.cabinet![0]!.loyalty).toBe(START_LOYALTY);
    expect(servingAdvisors(S)[0]!.title).toBe('Communications Director');
  });

  it('aggregates per-turn perks from serving advisors', () => {
    const S = makeState('ballot');
    appointAdvisor(S, 'spin'); // media +1
    appointAdvisor(S, 'bagman'); // funds +1
    const perk = cabinetPerk(S);
    expect(perk.media).toBe(1);
    expect(perk.funds).toBe(1);
  });

  it('shifts loyalty from liked and disliked flags, clamped', () => {
    const S = makeState('ballot');
    appointAdvisor(S, 'bagman'); // likes corrupt_streak, dislikes clean_streak
    tickCabinetLoyalty(S, ['corrupt_streak']);
    expect(S.cabinet![0]!.loyalty).toBe(START_LOYALTY + 4);
    tickCabinetLoyalty(S, ['clean_streak']);
    expect(S.cabinet![0]!.loyalty).toBe(START_LOYALTY + 4 - 5);
    for (let i = 0; i < 30; i++) tickCabinetLoyalty(S, ['clean_streak']);
    expect(S.cabinet![0]!.loyalty).toBe(0);
  });

  it('flags a defector once loyalty hits the danger zone, and can be removed', () => {
    const S = makeState('ballot');
    appointAdvisor(S, 'bagman');
    expect(defectingAdvisor(S)).toBeNull();
    S.cabinet![0]!.loyalty = 10;
    expect(defectingAdvisor(S)?.id).toBe('bagman');
    removeAdvisor(S, 'bagman');
    expect(S.cabinet).toHaveLength(0);
    expect(defectingAdvisor(S)).toBeNull();
  });

  it('a cratered advisor resigns and leaks (heat hit); loyal ones stay', () => {
    const S = makeState('ballot');
    appointAdvisor(S, 'spin');
    appointAdvisor(S, 'bagman');
    S.cabinet![0]!.loyalty = 10; // spin craters
    S.cabinet![1]!.loyalty = 60; // bagman stays
    const heatBefore = S.stats.heat;
    const left = processResignations(S);
    expect(left.map((l) => l.id)).toEqual(['spin']);
    expect(S.cabinet).toHaveLength(1);
    expect(S.cabinet![0]!.id).toBe('bagman');
    expect(S.stats.heat).toBe(heatBefore + 6);
    expect(processResignations(S)).toEqual([]); // nothing left to resign
  });

  it('defines four advisors per path', () => {
    expect(ADVISORS.ballot).toHaveLength(4);
    expect(ADVISORS.vanguard).toHaveLength(4);
  });
});
