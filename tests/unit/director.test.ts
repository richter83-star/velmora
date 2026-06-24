import { describe, it, expect } from 'vitest';
import { buildVector } from '../../src/engine/director/playstyle';
import { eventTag, AXES } from '../../src/engine/director/tags';
import { tension, targetCurve } from '../../src/engine/director/tension';
import { planNemesis } from '../../src/engine/director/nemesis';
import { makeDirector, nemesisContestEdge } from '../../src/engine/director';
import type { GameState, GameEvent, Stats, Flags } from '../../src/engine/types';

function makeState(
  opts: {
    stats?: Partial<Stats>;
    flags?: Flags;
    blocs?: Record<string, number>;
    scandals?: { id: string; severity: number; status: string }[];
    phase?: number;
    phaseTurn?: number;
    tensionD?: number;
    econMood?: number;
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
    path: 'iron',
    phase: opts.phase ?? 1,
    phaseTurn: opts.phaseTurn ?? 0,
    totalTurns: 5,
    stats,
    player: {
      name: 'T',
      title: 'Movement Leader',
      avatar: null,
      faction: 'ultras',
      trait: 'orator',
    },
    world: {
      tension: { k: 't', t: 'x', d: opts.tensionD ?? 0 },
      economy: { k: 'e', t: 'x', mood: opts.econMood ?? 0 },
    },
    rivals: [],
    usedOpp: [],
    opp: 'Dresner',
    oppAvatar: '',
    flags: opts.flags ?? {},
    arcs: {},
    npcs: {},
    antagonistId: '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    scandals: (opts.scandals ?? []) as any,
    activeScandal: null,
    difficulty: 'standard',
    modifiers: [],
    daily: false,
    blocs: opts.blocs,
    seen: [],
    queue: [],
    log: [],
    lastResult: null,
    lastDeltas: null,
    pendingDeath: null,
    pendingEndingCause: null,
    mode: 'play',
    over: false,
    ending: null,
    promo: null,
    current: null,
  };
}

function ev(id: string, choices: GameEvent['choices'], crisis = false): GameEvent {
  return {
    id,
    paths: ['iron'],
    phases: [1],
    weight: 10,
    art: 'scene',
    title: id,
    body: '',
    choices,
    crisis,
  };
}

describe('director/playstyle.buildVector', () => {
  it('returns a (roughly) unit vector', () => {
    const v = buildVector(makeState({ flags: { bloody_hands: true, went_negative: true } }));
    const mag = Math.hypot(...AXES.map((a) => v[a]));
    expect(mag).toBeGreaterThan(0.9);
    expect(mag).toBeLessThan(1.0001);
  });

  it('leans toward the axis of the flags set', () => {
    const v = buildVector(
      makeState({ flags: { bloody_hands: true, hardliner_cred: true, zealot_rep: true } }),
    );
    expect(v.aggression).toBeGreaterThan(v.integrity);
    expect(v.aggression).toBeGreaterThan(v.dealmaking);
  });

  it('reflects stat profile when no flags are set', () => {
    const v = buildVector(makeState({ stats: { funds: 90 } }));
    expect(v.dealmaking).toBeGreaterThan(0);
  });
});

describe('director/tags.eventTag', () => {
  it('derives axes from choice flags and fx', () => {
    const t = eventTag(
      ev('e', [
        { label: 'a', fx: { heat: 16, funds: 10 }, set: { dark_money: true } },
        { label: 'b', fx: { base: 12 }, set: { grassroots: true } },
      ]),
    );
    expect((t.axes.risk ?? 0) + (t.axes.dealmaking ?? 0)).toBeGreaterThan(0);
    expect(t.axes.populism ?? 0).toBeGreaterThan(0);
    expect(t.stake).toBeGreaterThan(0);
  });

  it('marks crisis events as high-stake', () => {
    const calm = eventTag(ev('calm', [{ label: 'x', fx: { support: 2 } }]));
    const crisis = eventTag(ev('crisis', [{ label: 'x', fx: { support: 2 } }], true));
    expect(crisis.stake).toBeGreaterThan(calm.stake);
  });
});

describe('director/tension', () => {
  it('is bounded to [0,1] and rises with heat', () => {
    const lo = tension(makeState({ stats: { heat: 5 } }));
    const hi = tension(makeState({ stats: { heat: 95 }, tensionD: 50, econMood: -1 }));
    expect(lo).toBeGreaterThanOrEqual(0);
    expect(hi).toBeLessThanOrEqual(1);
    expect(hi).toBeGreaterThan(lo);
  });

  it('targetCurve stays in [0,1]', () => {
    for (let turn = 0; turn < 12; turn++)
      for (let phase = 1; phase <= 3; phase++) {
        const c = targetCurve(turn, phase);
        expect(c).toBeGreaterThanOrEqual(0);
        expect(c).toBeLessThanOrEqual(1);
      }
  });
});

describe('director/nemesis.planNemesis', () => {
  it('targets the weakest lever as a saboteur', () => {
    const p = planNemesis(
      makeState({ stats: { influence: 4, support: 70, funds: 70, media: 70, base: 70 } }),
    );
    expect(p.doctrine).toBe('saboteur');
    expect(p.pressureAxis).toBe('network'); // influence -> network
  });

  it('weaponizes scandals + heat as a muckraker', () => {
    const p = planNemesis(
      makeState({ stats: { heat: 85 }, scandals: [{ id: 's', severity: 80, status: 'latent' }] }),
    );
    expect(p.doctrine).toBe('muckraker');
    expect(p.pressureAxis).toBe('risk');
  });

  it('keeps the contest edge within bounds', () => {
    for (const heat of [0, 50, 99])
      for (const inf of [2, 50, 95]) {
        const edge = nemesisContestEdge(makeState({ stats: { heat, influence: inf } }));
        expect(edge).toBeGreaterThanOrEqual(-15);
        expect(edge).toBeLessThanOrEqual(18);
      }
  });
});

describe('director.makeDirector', () => {
  it('produces clamped, never-zero event weights', () => {
    const dir = makeDirector(
      makeState({ flags: { dealmaker: true, dark_money: true }, phaseTurn: 3 }),
    );
    const events = [
      ev('money', [{ label: 'a', fx: { funds: 14 }, set: { dark_money: true } }]),
      ev('clean', [{ label: 'a', fx: { support: 8 }, set: { clean_streak: true } }]),
      ev('crisis', [{ label: 'a', fx: { heat: 18 } }], true),
    ];
    for (const e of events) {
      const w = dir.weightFor(e);
      expect(w).toBeGreaterThanOrEqual(0.25);
      expect(w).toBeLessThanOrEqual(4);
      expect(w).toBeGreaterThan(0);
    }
  });

  it('keeps injection scaling in a gentle band', () => {
    const dir = makeDirector(makeState({ stats: { heat: 90 }, phaseTurn: 0 }));
    for (const k of ['crisis', 'scandal', 'arc'] as const) {
      expect(dir.injection[k]).toBeGreaterThanOrEqual(0.55);
      expect(dir.injection[k]).toBeLessThanOrEqual(1.8);
    }
  });

  it('a dealmaker run weights a money dilemma above a populist one', () => {
    const dir = makeDirector(
      makeState({ flags: { dealmaker: true, dark_money: true, owes_donor: true } }),
    );
    const money = dir.weightFor(
      ev('m', [{ label: 'a', fx: { funds: 16 }, set: { dark_money: true } }]),
    );
    const crowd = dir.weightFor(
      ev('c', [{ label: 'a', fx: { base: 4 }, set: { grassroots: true } }]),
    );
    expect(money).toBeGreaterThan(crowd);
  });
});
