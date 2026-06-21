import { describe, it, expect } from 'vitest';
import { simulateRun, type RunTrace } from '../../src/engine/sim';
import type { PathKey } from '../../src/engine/types';

const RUNS = 120;
/** The sim aborts at a 600-draw safety guard; a healthy run ends far sooner, so
 * any run approaching it would signal a soft-lock / runaway loop. */
const SOFT_LOCK_BOUND = 300;

function sweep(path: PathKey): RunTrace[] {
  const runs: RunTrace[] = [];
  for (let i = 0; i < RUNS; i++) runs.push(simulateRun({ seed: `${path}-${i}`, path }));
  return runs;
}

/** Average within-run repeat rate: fraction of event draws that repeat an event
 * already drawn in the same run (lower = more variety). */
function repeatRate(runs: RunTrace[]): number {
  let totalDraws = 0;
  let repeats = 0;
  for (const r of runs) {
    const seen = new Set<string>();
    for (const id of r.drawn) {
      totalDraws++;
      if (seen.has(id)) repeats++;
      else seen.add(id);
    }
  }
  return totalDraws === 0 ? 0 : repeats / totalDraws;
}

for (const path of ['ballot', 'vanguard'] as const) {
  describe(`seed sweep — ${path} (${RUNS} runs)`, () => {
    const runs = sweep(path);
    const distinct = new Set(runs.flatMap((r) => r.drawn));
    const endings = new Set(runs.map((r) => r.endingId));
    const rate = repeatRate(runs);
    const avgDraws = runs.reduce((a, r) => a + r.drawn.length, 0) / runs.length;

    it('reports metrics', () => {
      // Logged for visibility / threshold calibration.
      console.log(
        `SWEEP ${path} >> repeatRate=${rate.toFixed(3)} distinctEvents=${distinct.size} ` +
          `endings=${endings.size} [${[...endings].sort().join(',')}] avgDraws=${avgDraws.toFixed(1)}`,
      );
      expect(runs).toHaveLength(RUNS);
    });

    it('every run reaches a tagged ending', () => {
      for (const r of runs) expect(r.endingId.length).toBeGreaterThan(0);
    });

    it('no run soft-locks (draws stay well under the safety guard)', () => {
      const maxDraws = Math.max(...runs.map((r) => r.drawn.length));
      expect(maxDraws, `max draws in a run = ${maxDraws}`).toBeLessThan(SOFT_LOCK_BOUND);
    });

    it('within-run repeat rate is below threshold', () => {
      expect(rate, `repeat rate ${rate.toFixed(3)}`).toBeLessThan(0.2);
    });

    it('the bank shows variety across runs', () => {
      expect(distinct.size, `distinct events drawn = ${distinct.size}`).toBeGreaterThanOrEqual(18);
    });

    it('runs reach a variety of endings', () => {
      expect(endings.size, `distinct endings = ${endings.size}`).toBeGreaterThanOrEqual(3);
    });
  });
}
