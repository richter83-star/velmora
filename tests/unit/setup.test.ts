import { describe, it, expect } from 'vitest';
import {
  difficultyById,
  applyDifficultyStart,
  rollModifiers,
  applyModifier,
} from '../../src/engine/setup';
import { DIFFICULTIES, DEFAULT_DIFFICULTY, MODIFIERS } from '../../src/content/setup';
import { createRng } from '../../src/engine/rng';
import type { GameState } from '../../src/engine/types';

function makeState(over: Partial<GameState> = {}): GameState {
  return {
    phase: 1,
    totalTurns: 0,
    stats: { support: 50, funds: 50, influence: 50, media: 50, base: 50, heat: 10 },
    flags: {},
    scandals: [],
    activeScandal: null,
    npcs: {
      antagonist: {
        id: 'antagonist',
        name: 'Foe',
        role: 'rival',
        kind: 'antagonist',
        avatar: '',
        relationship: -35,
        loyalty: 0,
        met: false,
        firstPhase: 1,
      },
    },
    antagonistId: 'antagonist',
    ...over,
  } as unknown as GameState;
}

describe('difficulty', () => {
  it('difficultyById falls back to standard for an unknown id', () => {
    expect(difficultyById(DIFFICULTIES, 'ironclad').id).toBe('ironclad');
    expect(difficultyById(DIFFICULTIES, 'nonsense').id).toBe(DEFAULT_DIFFICULTY);
  });

  it('applyDifficultyStart shifts every stat by startStat', () => {
    const easy = makeState();
    applyDifficultyStart(easy, difficultyById(DIFFICULTIES, 'storyteller'));
    expect(easy.stats.support).toBe(56);
    const hard = makeState();
    applyDifficultyStart(hard, difficultyById(DIFFICULTIES, 'ironclad'));
    expect(hard.stats.support).toBe(45);
  });

  it('standard difficulty leaves stats untouched', () => {
    const s = makeState();
    applyDifficultyStart(s, difficultyById(DIFFICULTIES, 'standard'));
    expect(s.stats.support).toBe(50);
  });

  it('the difficulty table is well-formed', () => {
    expect(DIFFICULTIES.some((d) => d.id === DEFAULT_DIFFICULTY)).toBe(true);
    expect(new Set(DIFFICULTIES.map((d) => d.id)).size).toBe(DIFFICULTIES.length);
  });
});

describe('per-run modifiers', () => {
  it('rollModifiers is deterministic per seed and respects count', () => {
    const a = rollModifiers(createRng('run-1'), MODIFIERS, 2).map((m) => m.id);
    const b = rollModifiers(createRng('run-1'), MODIFIERS, 2).map((m) => m.id);
    expect(a).toEqual(b);
    expect(a).toHaveLength(2);
  });

  it('modifier ids are unique and fx keys are valid stats', () => {
    expect(new Set(MODIFIERS.map((m) => m.id)).size).toBe(MODIFIERS.length);
    const stats = new Set(['support', 'funds', 'influence', 'media', 'base', 'heat']);
    for (const m of MODIFIERS) {
      for (const k of Object.keys(m.fx ?? {})) expect(stats.has(k)).toBe(true);
    }
  });

  it('applyModifier applies fx, flags, scandal seed, and antagonist shift', () => {
    const s = makeState();
    applyModifier(s, {
      id: 'x',
      name: 'x',
      desc: '',
      fx: { funds: -16 },
      flags: { clean_streak: true },
    });
    expect(s.stats.funds).toBe(34);
    expect(s.flags.clean_streak).toBe(true);

    applyModifier(s, {
      id: 'sk',
      name: 'sk',
      desc: '',
      scandalSeed: { id: 'sk', label: 'l', severity: 3 },
    });
    expect(s.scandals.map((x) => x.id)).toContain('sk');

    applyModifier(s, { id: 'cr', name: 'cr', desc: '', antagonistRel: -25 });
    expect(s.npcs.antagonist?.relationship).toBe(-60);
  });
});
