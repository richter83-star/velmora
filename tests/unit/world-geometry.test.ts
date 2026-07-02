import { describe, it, expect } from 'vitest';
import { computeRegions, centroid, clamp01, fallbackDiamond, type Point } from '../../src/engine/world-geometry';
import { generateWorld, type Realm } from '../../src/engine/world';

const realm = (seed: string | number = 'geo-1'): Realm => generateWorld(seed, 'iron', { factions: ['a', 'b'] });

describe('clamp01', () => {
  it('clamps to [0,1]', () => {
    expect(clamp01(-0.3)).toBe(0);
    expect(clamp01(1.7)).toBe(1);
    expect(clamp01(0.4)).toBe(0.4);
  });
});

describe('centroid', () => {
  it('averages the vertices', () => {
    expect(centroid([[0, 0], [1, 0], [1, 1], [0, 1]])).toEqual([0.5, 0.5]);
  });
  it('defaults to center for an empty ring', () => {
    expect(centroid([])).toEqual([0.5, 0.5]);
  });
  it('ignores the duplicated closing vertex of a closed ring (d3-delaunay shape)', () => {
    // A closed unit square (first === last) must still center at [0.5,0.5], not skew.
    expect(centroid([[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]])).toEqual([0.5, 0.5]);
  });
});

describe('fallbackDiamond', () => {
  it('builds a clamped diamond around the point', () => {
    const d = fallbackDiamond([0, 0.5], 0.04);
    expect(d).toHaveLength(4);
    for (const [x, y] of d) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(1);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(1);
    }
  });
});

describe('computeRegions', () => {
  it('returns [] for an empty realm', () => {
    expect(computeRegions({ provinces: [], capitalId: '' } as Realm)).toEqual([]);
  });

  it('produces one region per province, ids aligned', () => {
    const w = realm();
    const regions = computeRegions(w);
    expect(regions).toHaveLength(w.provinces.length);
    expect(regions.map((r) => r.id)).toEqual(w.provinces.map((p) => p.id));
  });

  it('is deterministic for the same realm', () => {
    expect(computeRegions(realm(7))).toEqual(computeRegions(realm(7)));
  });

  it('keeps every vertex inside the unit box and centroid inside it', () => {
    for (const r of computeRegions(realm())) {
      expect(r.polygon.length).toBeGreaterThanOrEqual(3);
      for (const [x, y] of r.polygon) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(1);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(1);
      }
      expect(r.centroid[0]).toBeGreaterThanOrEqual(0);
      expect(r.centroid[0]).toBeLessThanOrEqual(1);
    }
  });

  it('centers a single-province (full-box) region at ~[0.5,0.5], not skewed to the point', () => {
    const one = { provinces: [{ id: 'p0', x: 0.6, y: 0.4 }], capitalId: 'p0' } as unknown as Realm;
    const [r] = computeRegions(one);
    expect(r?.centroid[0]).toBeCloseTo(0.5, 5);
    expect(r?.centroid[1]).toBeCloseTo(0.5, 5);
  });

  it('tiles the board (cell areas sum to ~1)', () => {
    const total = computeRegions(realm()).reduce((a, r) => a + Math.abs(polyArea(r.polygon)), 0);
    expect(total).toBeGreaterThan(0.9);
    expect(total).toBeLessThan(1.1);
  });
});

/** Shoelace area of a ring. */
function polyArea(poly: Point[]): number {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i] as Point;
    const [x2, y2] = poly[(i + 1) % poly.length] as Point;
    s += x1 * y2 - x2 * y1;
  }
  return s / 2;
}
