import { describe, it, expect } from 'vitest';
import {
  applyWorldTick,
  applyRealmFx,
  worstProvince,
  ACTIONS_PER_TURN,
  REVOLT_EVENT_ID,
  GOVERNORS,
  isGovernor,
  type RealmCounts,
} from '../../src/engine/world-tick';
import { generateWorld } from '../../src/engine/world';
import { PATHS } from '../../src/content/paths';
import type { GameState, PathKey, Stats } from '../../src/engine/types';
import type { Province } from '../../src/engine/world';

const stats = (): Stats => ({ support: 50, funds: 50, influence: 50, media: 50, base: 50, heat: 50 });
const ZERO_BASE: RealmCounts = { loyal: 0, restive: 0, calm: 0, rich: 0 };

function prov(over: Partial<Province> = {}): Province {
  return { id: 'p', name: 'P', x: 0.5, y: 0.5, neighbors: [], control: 50, unrest: 20, development: 40, faction: 'a', capital: false, ...over };
}

/** Build a run state; pass a baseline to simulate a realm the player has since improved past it. */
function state(provinces: Province[], baseline?: RealmCounts): GameState {
  const realm: { provinces: Province[]; capitalId: string; baseline?: RealmCounts } = {
    provinces,
    capitalId: provinces[0]?.id ?? '',
  };
  if (baseline) realm.baseline = baseline;
  return { stats: stats(), realm, actionsLeft: 0, queue: [] } as unknown as GameState;
}

function many(n: number, over: Partial<Province>): Province[] {
  return Array.from({ length: n }, (_, i) => prov({ id: `p${i}`, ...over }));
}

describe('governor policies', () => {
  it('exposes a stable set and isGovernor', () => {
    expect(GOVERNORS.map((g) => g.id)).toEqual(['develop', 'pacify', 'fortify', 'extract']);
    expect(isGovernor('pacify')).toBe(true);
    expect(isGovernor('nope')).toBe(false);
  });

  it('a set governor auto-runs each tick and clamps', () => {
    const S = state([prov({ governor: 'pacify', unrest: 20 })]);
    applyWorldTick(S);
    expect(S.realm?.provinces[0]?.unrest).toBe(17); // -3
    const calm = state([prov({ governor: 'pacify', unrest: 1 })]);
    applyWorldTick(calm);
    expect(calm.realm?.provinces[0]?.unrest).toBe(0); // clamped, not negative
  });

  it('each governor policy applies its own effect', () => {
    const dev = state([prov({ governor: 'develop', development: 40 })]);
    applyWorldTick(dev);
    expect(dev.realm?.provinces[0]?.development).toBe(42); // +2

    const fort = state([prov({ governor: 'fortify', control: 40 })]);
    applyWorldTick(fort);
    expect(fort.realm?.provinces[0]?.control).toBe(42); // +2

    const ext = state([prov({ governor: 'extract', development: 40, unrest: 20 })]);
    applyWorldTick(ext);
    expect(ext.realm?.provinces[0]?.development).toBe(42); // +2
    expect(ext.realm?.provinces[0]?.unrest).toBe(21); // +1 resentment

    const bogus = state([prov({ governor: 'not-a-policy' })]);
    expect(() => applyWorldTick(bogus)).not.toThrow(); // unknown id is ignored
  });
});

describe('applyWorldTick delta-feed', () => {
  it('is a no-op without a realm', () => {
    const S = { stats: stats() } as unknown as GameState;
    expect(() => applyWorldTick(S)).not.toThrow();
    expect(S.stats).toEqual(stats());
  });

  it('a freshly-generated realm produces ZERO stat delta across the WHOLE sweep domain (structural)', () => {
    const paths: PathKey[] = ['ballot', 'vanguard', 'iron', 'gilded', 'anointed'];
    for (const path of paths) {
      const factions = PATHS[path].factions.map((f) => f.id);
      for (let i = 0; i < 120; i++) {
        const realm = generateWorld(`${path}-${i}`, path, { factions });
        const S = { stats: stats(), realm, actionsLeft: 0 } as unknown as GameState;
        const before = { ...S.stats };
        applyWorldTick(S);
        expect(S.stats).toEqual(before); // deviation from baseline is 0 for an untouched realm
      }
    }
  });

  // Deltas fire on DEVIATION above the generation baseline (here: player pushed the realm past it).
  it('gaining loyal provinces above baseline lifts base and support', () => {
    const S = state(many(12, { control: 90 }), ZERO_BASE);
    applyWorldTick(S);
    expect(S.stats.base).toBe(51);
    expect(S.stats.support).toBe(51);
  });

  it('a rising-unrest realm heats the nation; a newly-pacified one cools it', () => {
    const hot = state(many(12, { unrest: 80 }), ZERO_BASE);
    applyWorldTick(hot);
    expect(hot.stats.heat).toBe(51);
    const cool = state(many(12, { unrest: 5 }), ZERO_BASE);
    applyWorldTick(cool);
    expect(cool.stats.heat).toBe(49);
  });

  it('newly-developed provinces pay out funds', () => {
    const S = state(many(12, { development: 80 }), ZERO_BASE);
    applyWorldTick(S);
    expect(S.stats.funds).toBe(51);
  });

  it('refills the imperial-action budget', () => {
    const S = state(many(12, {}));
    S.actionsLeft = 0;
    applyWorldTick(S);
    expect(S.actionsLeft).toBe(ACTIONS_PER_TURN);
  });

  it('is pure/deterministic (same realm + baseline, same result)', () => {
    const a = state(many(12, { control: 90 }), ZERO_BASE);
    const b = state(many(12, { control: 90 }), ZERO_BASE);
    applyWorldTick(a);
    applyWorldTick(b);
    expect(a.stats).toEqual(b.stats);
  });
});

const find = (S: GameState, id: string) => S.realm!.provinces.find((p) => p.id === id)!;
function realmState(provinces: Province[], extra: Partial<GameState> = {}): GameState {
  return {
    stats: stats(),
    realm: { provinces, capitalId: provinces.find((p) => p.capital)?.id ?? provinces[0]?.id ?? '', baseline: ZERO_BASE },
    queue: [],
    actionsLeft: 0,
    ...extra,
  } as unknown as GameState;
}

describe('applyRealmFx (P4 event -> province)', () => {
  it('mutates the worst province by default and clamps', () => {
    const S = realmState([prov({ id: 'a', unrest: 50 }), prov({ id: 'b', unrest: 20 })]);
    applyRealmFx(S, { unrest: 100, control: 5 });
    expect(find(S, 'a').unrest).toBe(100); // clamped to 100
    expect(find(S, 'b').unrest).toBe(20); // untouched
  });

  it('targets the capital and the crisis trigger', () => {
    const S = realmState([prov({ id: 'cap', capital: true, control: 50 }), prov({ id: 'x', unrest: 70 })], { crisisProvince: 'x' });
    applyRealmFx(S, { target: 'capital', control: 10 });
    expect(find(S, 'cap').control).toBe(60);
    applyRealmFx(S, { target: 'trigger', unrest: -30 });
    expect(find(S, 'x').unrest).toBe(40);
  });

  it('spreads unrest to the target neighbours', () => {
    const S = realmState([prov({ id: 'a', unrest: 50, neighbors: ['b', 'c'] }), prov({ id: 'b', unrest: 10 }), prov({ id: 'c', unrest: 10 })]);
    applyRealmFx(S, { target: 'worst', spread: 5 });
    expect(find(S, 'b').unrest).toBe(15);
    expect(find(S, 'c').unrest).toBe(15);
  });

  it('is a no-op without a realm or without fx', () => {
    expect(() => applyRealmFx({ stats: stats() } as unknown as GameState, { unrest: 10 })).not.toThrow();
    const S = realmState([prov({ id: 'a', control: 40 })]);
    applyRealmFx(S, undefined);
    expect(find(S, 'a').control).toBe(40);
  });

  it('worstProvince picks highest unrest, tiebreak by id', () => {
    expect(worstProvince([prov({ id: 'b', unrest: 40 }), prov({ id: 'a', unrest: 40 }), prov({ id: 'c', unrest: 10 })])!.id).toBe('a');
  });
});

describe('P4 contagion + crisis trigger', () => {
  it('a revolting province bleeds unrest into neighbours (capped)', () => {
    const S = realmState([prov({ id: 'a', unrest: 80, neighbors: ['b'] }), prov({ id: 'b', unrest: 20, neighbors: ['a'] })]);
    applyWorldTick(S);
    expect(find(S, 'b').unrest).toBe(22); // +2 from one restive neighbour
  });

  it('contagion is dormant when the realm is calm (sweep-safe)', () => {
    const S = realmState([prov({ id: 'a', unrest: 30, neighbors: ['b'] }), prov({ id: 'b', unrest: 20, neighbors: ['a'] })]);
    applyWorldTick(S);
    expect(find(S, 'b').unrest).toBe(20);
  });

  it('queues the revolt event and flags the province when one is in open revolt', () => {
    const S = realmState([prov({ id: 'a', unrest: 80 }), prov({ id: 'b', unrest: 20 })]);
    applyWorldTick(S);
    expect(S.crisisProvince).toBe('a');
    expect((S.queue as { id: string }[]).some((q) => q.id === REVOLT_EVENT_ID)).toBe(true);
  });

  it('keeps exactly one revolt queued while a province burns, and clears once quelled', () => {
    const q = (S: GameState) => (S.queue as { id: string }[]).filter((x) => x.id === REVOLT_EVENT_ID).length;
    const S = realmState([prov({ id: 'a', unrest: 80 }), prov({ id: 'b', unrest: 20 })], { crisisProvince: 'a' });
    applyWorldTick(S); // burning + nothing pending -> queues exactly one
    expect(q(S)).toBe(1);
    applyWorldTick(S); // burning + one already pending -> no double-queue
    expect(q(S)).toBe(1);
    find(S, 'a').unrest = 30; // player quelled it below REVOLT_UNREST
    applyWorldTick(S);
    expect(S.crisisProvince).toBeNull(); // crisis cleared
  });

  it('re-arms a still-burning province after its revolt was drawn (no jam)', () => {
    const S = realmState([prov({ id: 'a', unrest: 68 }), prov({ id: 'b', unrest: 20 })], { crisisProvince: 'a' });
    applyWorldTick(S); // queues one
    (S.queue as unknown[]).length = 0; // simulate the revolt event being drawn (popped) while a stays >= 60
    applyWorldTick(S); // still burning, nothing pending -> re-queues instead of jamming
    expect((S.queue as { id: string }[]).some((x) => x.id === REVOLT_EVENT_ID)).toBe(true);
  });

  it('migrates the crisis to a strictly-worse province', () => {
    const S = realmState([prov({ id: 'a', unrest: 65 }), prov({ id: 'b', unrest: 90 })], { crisisProvince: 'a' });
    applyWorldTick(S);
    expect(S.crisisProvince).toBe('b'); // the crisis tracks the actual worst
  });
});
