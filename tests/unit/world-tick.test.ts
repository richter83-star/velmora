import { describe, it, expect } from 'vitest';
import { applyWorldTick, ACTIONS_PER_TURN, GOVERNORS, isGovernor, type RealmCounts } from '../../src/engine/world-tick';
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
  return { stats: stats(), realm, actionsLeft: 0 } as unknown as GameState;
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
