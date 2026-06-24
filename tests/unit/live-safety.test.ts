import { describe, it, expect } from 'vitest';
import { validateLiveEvent } from '../../src/live/safety';
import { LiveEventSchema } from '../../src/live/contract';
import type { GameState } from '../../src/engine/types';

function S(): GameState {
  return {
    version: 't',
    seed: 1,
    rngState: 1,
    path: 'ballot',
    phase: 2,
    phaseTurn: 1,
    totalTurns: 6,
    stats: { support: 50, funds: 50, influence: 50, media: 50, base: 50, heat: 20 },
    player: { name: 'P', title: 'Governor', avatar: null, faction: 'reform', trait: 'orator' },
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

const CLEAN = {
  title: 'The Harbor Vote',
  body: 'The dock workers want a guarantee you cannot fully give. The cameras are already gathering.',
  choices: [
    { label: 'Promise them everything', fx: { support: 8, funds: -6 }, tone: 'slick' },
    { label: 'Tell them the hard truth', fx: { support: -4, influence: 5 }, tone: 'bold' },
  ],
};

describe('live safety — accepts clean output', () => {
  it('validates and coerces a clean event with a live_ id', () => {
    const r = validateLiveEvent(CLEAN, S());
    expect(r.ok).toBe(true);
    expect(r.event?.id.startsWith('live_')).toBe(true);
    expect(r.event?.paths).toEqual(['ballot']);
    expect(r.event?.choices).toHaveLength(2);
  });
});

describe('live safety — rejects denylisted content (STRICT, incl. open-gen net)', () => {
  const bad: Record<string, unknown> = {
    'real ideology (core)': { ...CLEAN, body: 'The Politburo has summoned you.' },
    'real religion (core)': { ...CLEAN, title: 'A Question of Islam' },
    'real figure (core)': { ...CLEAN, body: 'They compare you to Stalin now.' },
    'real symbol (core)': { ...CLEAN, body: 'A banner with ☭ appears in the square.' },
    'real nation (strict)': { ...CLEAN, body: 'A delegation from Russia arrives at the harbor.' },
    'real party (strict)': {
      ...CLEAN,
      choices: [CLEAN.choices[0], { label: 'Court the Taliban', fx: { base: 4 } }],
    },
    'real institution (strict)': {
      ...CLEAN,
      body: 'NATO has issued a statement about your conduct.',
    },
    'living figure (strict)': { ...CLEAN, body: 'Your advisor says you remind him of Putin.' },
  };
  for (const [name, raw] of Object.entries(bad)) {
    it(`rejects ${name}`, () => {
      const r = validateLiveEvent(raw, S());
      expect(r.ok, JSON.stringify(r.reasons)).toBe(false);
    });
  }
});

describe('live safety — rejects malformed / unsafe structure', () => {
  it('rejects out-of-range fx', () => {
    expect(
      validateLiveEvent(
        { ...CLEAN, choices: [{ label: 'x', fx: { support: 99 } }, { label: 'y' }] },
        S(),
      ).ok,
    ).toBe(false);
  });
  it('rejects unknown fx keys (allowlist via strict schema)', () => {
    expect(
      validateLiveEvent(
        { ...CLEAN, choices: [{ label: 'x', fx: { wealth: 5 } }, { label: 'y' }] },
        S(),
      ).ok,
    ).toBe(false);
  });
  it('rejects engine-semantic fields an LLM must not author', () => {
    expect(
      validateLiveEvent(
        { ...CLEAN, choices: [{ label: 'x', ending: 'scandal' }, { label: 'y' }] },
        S(),
      ).ok,
    ).toBe(false);
    expect(
      validateLiveEvent(
        { ...CLEAN, choices: [{ label: 'x', roll: { stat: 'heat', dc: 50 } }, { label: 'y' }] },
        S(),
      ).ok,
    ).toBe(false);
  });
  it('rejects too many / too few choices', () => {
    expect(validateLiveEvent({ ...CLEAN, choices: [{ label: 'a' }] }, S()).ok).toBe(false);
    expect(
      validateLiveEvent(
        { ...CLEAN, choices: [{ label: 'a' }, { label: 'b' }, { label: 'c' }, { label: 'd' }] },
        S(),
      ).ok,
    ).toBe(false);
  });
  it('rejects junk / non-object', () => {
    expect(validateLiveEvent(null, S()).ok).toBe(false);
    expect(validateLiveEvent({ title: 'x' }, S()).ok).toBe(false); // missing body/choices
    expect(LiveEventSchema.safeParse({ title: '', body: 'b', choices: [] }).success).toBe(false);
  });
});
