/**
 * Province map geometry (Civ P2).
 *
 * Turns the realm's province POINTS (x,y in [0,1], set deterministically at P1
 * generation and saved) into tiled Voronoi REGIONS with shared borders — a real
 * top-down nation map. Pure and deterministic: same realm in, same regions out,
 * so nothing needs storing in the save (the determining data — the points — is
 * already in the model, satisfying the "geometry before saves lock" requirement
 * without bloating saves or pulling d3-delaunay into the entry bundle).
 *
 * This module is reached ONLY via the lazy `render/map` chunk, so d3-delaunay
 * lives outside the 70 kB entry budget.
 */
import { Delaunay } from 'd3-delaunay';
import type { Realm } from './world';

export type Point = [number, number];

export interface Region {
  id: string;
  /** Closed-ish ring of [x,y] vertices in [0,1]^2 (clamped to the unit box). */
  polygon: Point[];
  /** A point guaranteed inside the (convex Voronoi) cell — for labels/markers. */
  centroid: Point;
}

const BOUNDS: [number, number, number, number] = [0, 0, 1, 1];

export const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * Vertex average — inside any convex polygon (Voronoi cells are convex).
 * d3-delaunay returns a CLOSED ring (first vertex repeated as last), so the
 * duplicate is dropped before averaging or the anchor skews off-center.
 */
export function centroid(poly: Point[]): Point {
  const n = poly.length;
  if (!n) return [0.5, 0.5];
  const first = poly[0] as Point;
  const last = poly[n - 1] as Point;
  const closed = n > 1 && first[0] === last[0] && first[1] === last[1];
  const count = closed ? n - 1 : n;
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < count; i++) {
    const [x, y] = poly[i] as Point;
    sx += x;
    sy += y;
  }
  return [sx / count, sy / count];
}

/** Small diamond around a point — defensive fallback if a Voronoi cell is empty. */
export function fallbackDiamond(p: Point, r = 0.04): Point[] {
  const [x, y] = p;
  return [
    [clamp01(x), clamp01(y - r)],
    [clamp01(x + r), clamp01(y)],
    [clamp01(x), clamp01(y + r)],
    [clamp01(x - r), clamp01(y)],
  ];
}

/** Ray-casting point-in-polygon test (ring of [x,y] in the same space as pt). */
export function pointInPolygon(pt: Point, poly: Point[]): boolean {
  const [x, y] = pt;
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i] as Point;
    const [xj, yj] = poly[j] as Point;
    const hit = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (hit) inside = !inside;
  }
  return inside;
}

/** The region containing the [0,1] point, or null (for canvas tap hit-testing). */
export function regionAt(regions: Region[], x: number, y: number): Region | null {
  for (const r of regions) if (pointInPolygon([x, y], r.polygon)) return r;
  return null;
}

/**
 * Compute the Voronoi region for every province, clipped to the unit box.
 * Deterministic pure function of the realm's points.
 */
export function computeRegions(realm: Realm): Region[] {
  const ps = realm.provinces;
  if (!ps.length) return [];
  const pts: Point[] = ps.map((p) => [p.x, p.y]);
  const voronoi = Delaunay.from(pts).voronoi(BOUNDS);
  return ps.map((p, i) => {
    const cell = voronoi.cellPolygon(i) as Point[] | null;
    const ring = cell && cell.length ? cell : fallbackDiamond(pts[i] as Point);
    const polygon = ring.map(([x, y]) => [clamp01(x), clamp01(y)] as Point);
    return { id: p.id, polygon, centroid: centroid(polygon) };
  });
}
