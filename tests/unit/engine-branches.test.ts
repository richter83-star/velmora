import { describe, it, expect } from 'vitest';
import { blankRun } from '../../src/engine/state';
import { createRng } from '../../src/engine/rng';
import type { GameState, PathKey, Stats } from '../../src/engine/types';
import {
  initBlocs,
  applyBlocShift,
  blocList,
  coalitionContestMod,
} from '../../src/engine/factions';
import {
  advisorSlate,
  appointAdvisor,
  advisorDef,
  servingAdvisors,
  defectingAdvisor,
  removeAdvisor,
  processResignations,
  ADVISORS,
  DEFECT_LOYALTY,
} from '../../src/engine/cabinet';

function mk(path: PathKey = 'ballot', stats?: Partial<Stats>): GameState {
  return blankRun({
    version: 't',
    seed: 1,
    rngState: 1,
    path,
    stats: { support: 50, funds: 50, influence: 50, media: 50, base: 50, heat: 10, ...stats },
    player: { name: 'T', title: 'X', avatar: null, faction: 'reform', trait: 'orator' },
    difficulty: 'standard',
    daily: false,
  }) as GameState;
}

describe('factions — fallback & shift branches', () => {
  it('initBlocs returns three neutral blocs per real path and {} for an unknown path', () => {
    expect(Object.keys(initBlocs('ballot'))).toHaveLength(3);
    expect(Object.values(initBlocs('vanguard')).every((v) => v === 50)).toBe(true);
    expect(initBlocs('nope' as PathKey)).toEqual({});
  });

  it('applyBlocShift initializes on demand and moves on stat deltas + warm/cool flags', () => {
    const S = mk('ballot');
    S.blocs = undefined as unknown as Record<string, number>;
    applyBlocShift(S, { base: 10 }, ['grassroots']); // populist warms (weight + flag)
    expect(S.blocs.populist).toBeGreaterThan(50);
    applyBlocShift(S, {}, ['corrupt_streak']); // reform cools (cool flag)
    expect(S.blocs.reform).toBeLessThan(50);
  });

  it('applyBlocShift is a no-op for an unknown path (no throw)', () => {
    const S = mk('ballot');
    S.path = 'nope' as PathKey;
    expect(() => applyBlocShift(S, { base: 10 }, [])).not.toThrow();
  });

  it('blocList falls back to neutral when standings are absent', () => {
    const S = mk('ballot');
    S.blocs = undefined as unknown as Record<string, number>;
    expect(blocList(S).every((b) => b.value === 50)).toBe(true);
  });

  it('coalitionContestMod is 0 without standings, positive when happy, negative when alienated', () => {
    const S = mk('ballot');
    S.blocs = undefined as unknown as Record<string, number>;
    expect(coalitionContestMod(S)).toBe(0);
    S.blocs = { federalist: 80, populist: 80, reform: 80 };
    expect(coalitionContestMod(S)).toBeGreaterThan(0);
    S.blocs = { federalist: 20, populist: 20, reform: 20 };
    expect(coalitionContestMod(S)).toBeLessThan(0);
  });
});

describe('cabinet — slate, appointment, loyalty, resignation', () => {
  it('advisorDef returns undefined for unknown path/id', () => {
    expect(advisorDef('nope' as PathKey, 'spin')).toBeUndefined();
    expect(advisorDef('ballot', 'nope')).toBeUndefined();
  });

  it('advisorSlate excludes already-appointed advisors', () => {
    const S = mk('ballot');
    const rng = createRng('slate');
    const first = advisorSlate(S, rng, 2);
    expect(first.length).toBe(2);
    appointAdvisor(S, first[0].id);
    const next = advisorSlate(S, rng, 5);
    expect(next.some((a) => a.id === first[0].id)).toBe(false);
  });

  it('appointAdvisor ignores duplicates and unknown ids', () => {
    const S = mk('ballot');
    const id = ADVISORS.ballot[0].id;
    appointAdvisor(S, id);
    appointAdvisor(S, id); // dup
    appointAdvisor(S, 'ghost'); // unknown
    expect(S.cabinet.filter((c) => c.id === id)).toHaveLength(1);
    expect(S.cabinet.some((c) => c.id === 'ghost')).toBe(false);
  });

  it('servingAdvisors maps appointed advisors with display fields', () => {
    const S = mk('ballot');
    const id = ADVISORS.ballot[0].id;
    appointAdvisor(S, id);
    const serving = servingAdvisors(S);
    expect(serving[0].id).toBe(id);
    expect(serving[0].name.length).toBeGreaterThan(0);
  });

  it('defectingAdvisor returns the worst cratered advisor, else null', () => {
    const S = mk('ballot');
    const id = ADVISORS.ballot[0].id;
    appointAdvisor(S, id);
    expect(defectingAdvisor(S)).toBeNull(); // starts loyal
    S.cabinet[0].loyalty = DEFECT_LOYALTY - 1;
    expect(defectingAdvisor(S)?.id).toBe(id);
  });

  it('processResignations removes cratered advisors and leaks scrutiny', () => {
    const S = mk('ballot', { heat: 10 });
    const id = ADVISORS.ballot[0].id;
    appointAdvisor(S, id);
    expect(processResignations(S)).toEqual([]); // loyal → nobody leaves
    S.cabinet[0].loyalty = DEFECT_LOYALTY - 5;
    const left = processResignations(S);
    expect(left.map((l) => l.id)).toContain(id);
    expect(S.stats.heat).toBeGreaterThan(10); // leaked on the way out
    expect(S.cabinet).toHaveLength(0);
  });

  it('removeAdvisor is a no-op without a cabinet', () => {
    const S = mk('ballot');
    S.cabinet = undefined as unknown as { id: string; loyalty: number }[];
    expect(() => removeAdvisor(S, 'spin')).not.toThrow();
  });
});
