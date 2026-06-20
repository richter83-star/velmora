import { describe, it, expect } from 'vitest';
import { blankRun } from '../../src/engine/state';
import type { GameState, PathKey, Stats, Ending } from '../../src/engine/types';
import {
  defaultMeta,
  mergeMeta,
  recordRun,
  recordStart,
  runRecord,
  unlockAchievements,
  refreshUnlockables,
  HISTORY_CAP,
  WIN_ENDING_IDS,
} from '../../src/engine/meta';

function makeRun(
  opts: {
    path?: PathKey;
    stats?: Partial<Stats>;
    ending?: Partial<Ending>;
    flags?: Record<string, number | boolean>;
    difficulty?: string;
    daily?: boolean;
    totalTurns?: number;
    scandals?: number;
    ngPlus?: number;
  } = {},
): GameState {
  const stats: Stats = {
    support: 60,
    funds: 50,
    influence: 50,
    media: 50,
    base: 50,
    heat: 10,
    ...opts.stats,
  };
  const S = blankRun({
    version: 'test',
    seed: 7,
    rngState: 1,
    path: opts.path ?? 'ballot',
    stats,
    player: { name: 'Test', title: 'President', avatar: null, faction: 'reform', trait: 'orator' },
    difficulty: opts.difficulty ?? 'standard',
    daily: opts.daily ?? false,
  }) as GameState & { ngPlus?: number };
  S.totalTurns = opts.totalTurns ?? 12;
  S.flags = opts.flags ?? {};
  S.scandals = Array.from({ length: opts.scandals ?? 0 }, (_, i) => ({ id: 's' + i })) as unknown[];
  if (opts.ngPlus) S.ngPlus = opts.ngPlus;
  S.ending = {
    endingId: 'operator',
    win: true,
    rank: 'THE OPERATOR',
    title: 'A Secure Reign',
    emoji: '🎖️',
    verdict: 'A Capable Hand',
    text: '',
    ...opts.ending,
  } as Ending;
  return S;
}

describe('meta — defaults & merge', () => {
  it('defaultMeta has zeroed stats and empty collections', () => {
    const m = defaultMeta();
    expect(m.stats.runsFinished).toBe(0);
    expect(m.history).toEqual([]);
    expect(m.achievements).toEqual({});
    expect(m.ngPlus.maxCleared).toBe(0);
  });

  it('mergeMeta normalizes partial/garbage stored data', () => {
    expect(mergeMeta(null)).toEqual(defaultMeta());
    expect(mergeMeta('nonsense')).toEqual(defaultMeta());
    const merged = mergeMeta({ stats: { wins: 3 }, activeSlot: 99, history: 'bad' });
    expect(merged.stats.wins).toBe(3);
    expect(merged.stats.losses).toBe(0); // filled from defaults
    expect(merged.activeSlot).toBe(2); // clamped into [0, SLOT_COUNT-1]
    expect(merged.history).toEqual([]); // bad history dropped
  });
});

describe('meta — run history & stats', () => {
  it('runRecord captures the finished run shape', () => {
    const S = makeRun({ path: 'vanguard', totalTurns: 9, scandals: 2, flags: { purge_count: 3 } });
    const r = runRecord(S, 1000);
    expect(r.path).toBe('vanguard');
    expect(r.endingId).toBe('operator');
    expect(r.win).toBe(true);
    expect(r.totalTurns).toBe(9);
    expect(r.scandals).toBe(2);
    expect(r.purges).toBe(3);
    expect(r.composite).toBe(60 + 50 + 50 + 50 - 10);
  });

  it('recordRun appends history and rolls up lifetime stats', () => {
    let m = defaultMeta();
    m = recordRun(m, makeRun({ path: 'ballot' }), 1);
    m = recordRun(m, makeRun({ path: 'vanguard', ending: { win: false, endingId: 'purge' } }), 2);
    expect(m.history).toHaveLength(2);
    expect(m.stats.runsFinished).toBe(2);
    expect(m.stats.wins).toBe(1);
    expect(m.stats.losses).toBe(1);
    expect(m.stats.byPath).toEqual({ ballot: 1, vanguard: 1 });
  });

  it('history is capped at HISTORY_CAP (ring buffer keeps most recent)', () => {
    let m = defaultMeta();
    for (let i = 0; i < HISTORY_CAP + 10; i++) {
      m = recordRun(m, makeRun({ totalTurns: i }), i);
    }
    expect(m.history).toHaveLength(HISTORY_CAP);
    expect(m.history[m.history.length - 1].totalTurns).toBe(HISTORY_CAP + 9);
    expect(m.stats.runsFinished).toBe(HISTORY_CAP + 10);
  });

  it('recordStart only increments runsStarted', () => {
    const m = recordStart(defaultMeta());
    expect(m.stats.runsStarted).toBe(1);
    expect(m.stats.runsFinished).toBe(0);
  });

  it('does not mutate the input meta (immutability)', () => {
    const m0 = defaultMeta();
    const m1 = recordRun(m0, makeRun(), 1);
    expect(m0.history).toHaveLength(0);
    expect(m1).not.toBe(m0);
  });
});

describe('meta — achievements', () => {
  it('unlocks per-run achievements from the finished state', () => {
    const S = makeRun({ flags: { purge_count: 6 }, ending: { endingId: 'tyrant', win: true } });
    let m = recordRun(defaultMeta(), S, 1);
    const res = unlockAchievements(m, S, 1);
    m = res.meta;
    expect(m.achievements.iron_fist).toBeTruthy();
    expect(m.achievements.first_run).toBeTruthy();
    expect(res.newly).toContain('iron_fist');
  });

  it('is set-once and idempotent on replay', () => {
    const S = makeRun({ ending: { endingId: 'reformer', win: true } });
    let m = recordRun(defaultMeta(), S, 1);
    m = unlockAchievements(m, S, 1).meta;
    const ts0 = m.achievements.kept_their_soul.ts;
    const replay = unlockAchievements(m, S, 999);
    expect(replay.newly).not.toContain('kept_their_soul');
    expect(replay.meta.achievements.kept_their_soul.ts).toBe(ts0); // unchanged
  });

  it('unlocks cross-run achievements (both aisles) after the qualifying run', () => {
    let m = defaultMeta();
    const a = makeRun({ path: 'ballot' });
    m = unlockAchievements(recordRun(m, a, 1), a, 1).meta;
    expect(m.achievements.both_aisles).toBeFalsy();
    const b = makeRun({ path: 'vanguard' });
    m = unlockAchievements(recordRun(m, b, 2), b, 2).meta;
    expect(m.achievements.both_aisles).toBeTruthy();
  });

  it('complete_almanac requires all seven win endings', () => {
    let m = defaultMeta();
    let ts = 0;
    for (const id of WIN_ENDING_IDS) {
      const S = makeRun({ ending: { endingId: id, win: true } });
      m = unlockAchievements(recordRun(m, S, ts), S, ts).meta;
      ts++;
    }
    expect(m.achievements.complete_almanac).toBeTruthy();
  });
});

describe('meta — unlockables', () => {
  it('refreshUnlockables flips on preconditions', () => {
    let m = defaultMeta();
    expect(refreshUnlockables(m).unlockables.ng_plus_access).toBeFalsy();
    m = { ...m, ngPlus: { maxCleared: 1, lastSeed: null } };
    expect(refreshUnlockables(m).unlockables.ng_plus_access).toBe(true);
  });
});
