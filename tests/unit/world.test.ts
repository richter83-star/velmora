import { describe, it, expect } from 'vitest';
import { generateWorld, summarizeRealm, type Realm } from '../../src/engine/world';

const FACTIONS = ['officers', 'ultras', 'industrialists'];

function build(seed: string | number = 'seed-1'): Realm {
  return generateWorld(seed, 'iron', { factions: FACTIONS });
}

describe('generateWorld', () => {
  it('is deterministic for the same (seed, path)', () => {
    expect(generateWorld(42, 'iron')).toEqual(generateWorld(42, 'iron'));
  });

  it('differs across seeds and across paths', () => {
    expect(build('a')).not.toEqual(build('b'));
    expect(generateWorld(7, 'iron')).not.toEqual(generateWorld(7, 'ballot'));
  });

  it('produces 12-18 provinces', () => {
    for (const s of ['a', 'b', 'c', 'd', 'e']) {
      const n = build(s).provinces.length;
      expect(n).toBeGreaterThanOrEqual(12);
      expect(n).toBeLessThanOrEqual(18);
    }
  });

  it('has exactly one capital, and it matches capitalId', () => {
    const w = build();
    const capitals = w.provinces.filter((p) => p.capital);
    expect(capitals).toHaveLength(1);
    expect(capitals[0]?.id).toBe(w.capitalId);
  });

  it('keeps positions in [0,1] and meters in [0,100]', () => {
    for (const p of build().provinces) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(1);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(1);
      for (const v of [p.control, p.unrest, p.development]) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      }
    }
  });

  it('gives every province unique id + name and a known faction', () => {
    const w = build();
    expect(new Set(w.provinces.map((p) => p.id)).size).toBe(w.provinces.length);
    expect(new Set(w.provinces.map((p) => p.name)).size).toBe(w.provinces.length);
    for (const p of w.provinces) expect(FACTIONS).toContain(p.faction);
  });

  it('has symmetric adjacency referencing only real provinces', () => {
    const w = build();
    const ids = new Set(w.provinces.map((p) => p.id));
    const byId = new Map(w.provinces.map((p) => [p.id, p]));
    for (const p of w.provinces) {
      expect(new Set(p.neighbors).size).toBe(p.neighbors.length); // no dupes
      for (const nb of p.neighbors) {
        expect(ids.has(nb)).toBe(true); // real id
        expect(byId.get(nb)?.neighbors).toContain(p.id); // symmetric
        expect(nb).not.toBe(p.id); // no self-loop
      }
    }
  });

  it('is a fully connected board (every province reachable from the capital)', () => {
    const w = build();
    const byId = new Map(w.provinces.map((p) => [p.id, p]));
    const seen = new Set<string>([w.capitalId]);
    const stack = [w.capitalId];
    while (stack.length) {
      const cur = byId.get(stack.pop() as string);
      for (const nb of cur?.neighbors ?? []) if (!seen.has(nb)) { seen.add(nb); stack.push(nb); }
    }
    expect(seen.size).toBe(w.provinces.length);
  });
});

describe('summarizeRealm', () => {
  it('aggregates counts and averages within range', () => {
    const s = summarizeRealm(build());
    expect(s.count).toBe(build().provinces.length);
    expect(s.loyal).toBeLessThanOrEqual(s.count);
    expect(s.restive).toBeLessThanOrEqual(s.count);
    expect(s.avgControl).toBeGreaterThanOrEqual(0);
    expect(s.avgControl).toBeLessThanOrEqual(100);
    expect(s.output).toBeGreaterThan(0);
  });
});
