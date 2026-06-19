import { describe, it, expect } from 'vitest';
import { createRng, normalizeSeed, xmur3, dailySeed, randomSeed } from '../../src/engine/rng';

describe('createRng', () => {
  it('is deterministic for the same seed', () => {
    const a = createRng('velmora');
    const b = createRng('velmora');
    const seqA = Array.from({ length: 32 }, () => a.next());
    const seqB = Array.from({ length: 32 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it('produces different sequences for different seeds', () => {
    const a = Array.from({ length: 32 }, () => createRng(1).next());
    const b = Array.from({ length: 32 }, () => createRng(2).next());
    expect(a).not.toEqual(b);
  });

  it('next() stays in [0, 1)', () => {
    const r = createRng(42);
    for (let i = 0; i < 5000; i++) {
      const v = r.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('int() is inclusive on both ends and covers the full range', () => {
    const r = createRng(7);
    const seen = new Set<number>();
    for (let i = 0; i < 3000; i++) {
      const v = r.int(1, 6);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(6);
      seen.add(v);
    }
    expect(seen).toEqual(new Set([1, 2, 3, 4, 5, 6]));
  });

  it('getState/setState reproduces the tail of a sequence (reproducible resume)', () => {
    const r = createRng('resume');
    for (let i = 0; i < 17; i++) r.next();
    const state = r.getState();
    const tailA = Array.from({ length: 12 }, () => r.next());

    const restored = createRng('resume');
    restored.setState(state);
    const tailB = Array.from({ length: 12 }, () => restored.next());

    expect(tailB).toEqual(tailA);
  });

  it('shuffle() returns a permutation without mutating the input', () => {
    const r = createRng(99);
    const src = [1, 2, 3, 4, 5, 6, 7, 8];
    const out = r.shuffle(src);
    expect(src).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect([...out].sort((x, y) => x - y)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('pick() always returns an element of the array', () => {
    const r = createRng(3);
    const arr = ['a', 'b', 'c'] as const;
    for (let i = 0; i < 200; i++) expect(arr).toContain(r.pick(arr));
  });
});

describe('seed helpers', () => {
  it('normalizeSeed matches xmur3 for strings and passes through numbers', () => {
    expect(normalizeSeed('abc')).toBe(xmur3('abc'));
    expect(normalizeSeed(5)).toBe(5);
  });

  it('xmur3 yields a 32-bit unsigned integer', () => {
    const h = xmur3('velmora');
    expect(Number.isInteger(h)).toBe(true);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xffffffff);
  });

  it('dailySeed is stable across times within the same UTC day', () => {
    const morning = new Date(Date.UTC(2026, 5, 18, 1, 0, 0));
    const evening = new Date(Date.UTC(2026, 5, 18, 23, 59, 0));
    expect(dailySeed(morning)).toBe('velmora-2026-06-18');
    expect(dailySeed(evening)).toBe('velmora-2026-06-18');
  });

  it('randomSeed returns a 32-bit unsigned integer', () => {
    const s = randomSeed();
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(0xffffffff);
  });
});
