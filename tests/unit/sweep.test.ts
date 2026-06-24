import { describe, it, expect } from 'vitest';
import { simulateRun, type RunTrace } from '../../src/engine/sim';
import type { PathKey } from '../../src/engine/types';

const RUNS = 120;
/** The sim aborts at a 600-draw safety guard; a healthy run ends far sooner, so
 * any run approaching it would signal a soft-lock / runaway loop. */
const SOFT_LOCK_BOUND = 300;

/**
 * Per-path sweep gates. The two base paths draw from the full 251-event bank
 * (≥18 distinct events expected); the three Dark Mirrors expansion paths draw
 * from their own ~12-event seed bank + 3 shared crises (~15 events), so their
 * distinct-event floor is lower. Every path must still reach ≥4 distinct ending
 * ranks across the sweep (EXPANSION_BRIEF.md Step 3).
 */
const PATH_CONFIG: Record<PathKey, { minDistinctEvents: number; minEndings: number }> = {
  ballot: { minDistinctEvents: 18, minEndings: 4 },
  vanguard: { minDistinctEvents: 18, minEndings: 4 },
  iron: { minDistinctEvents: 10, minEndings: 4 },
  gilded: { minDistinctEvents: 10, minEndings: 4 },
  anointed: { minDistinctEvents: 10, minEndings: 4 },
};

function sweep(path: PathKey, aiDirector: boolean): RunTrace[] {
  const runs: RunTrace[] = [];
  for (let i = 0; i < RUNS; i++) runs.push(simulateRun({ seed: `${path}-${i}`, path, aiDirector }));
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

// Run the full sweep with the AI Director OFF (regression: pre-director behavior
// stays healthy, the toggle-off fallback) AND ON (the shipped default). Both must
// clear every gate — the director re-weights/paces but must never break variety,
// reachability, or soft-lock bounds.
for (const aiDirector of [false, true] as const) {
  const mode = aiDirector ? 'director ON' : 'director off';
  for (const path of ['ballot', 'vanguard', 'iron', 'gilded', 'anointed'] as const) {
    describe(`seed sweep — ${path} · ${mode} (${RUNS} runs)`, () => {
      const cfg = PATH_CONFIG[path];
      const runs = sweep(path, aiDirector);
      const distinct = new Set(runs.flatMap((r) => r.drawn));
      const endings = new Set(runs.map((r) => r.endingId));
      const rate = repeatRate(runs);
      const avgDraws = runs.reduce((a, r) => a + r.drawn.length, 0) / runs.length;

      it('reports metrics', () => {
        // Logged for visibility / threshold calibration.
        console.log(
          `SWEEP ${path} [${mode}] >> repeatRate=${rate.toFixed(3)} distinctEvents=${distinct.size} ` +
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
        expect(distinct.size, `distinct events drawn = ${distinct.size}`).toBeGreaterThanOrEqual(
          cfg.minDistinctEvents,
        );
      });

      it('runs reach at least 4 distinct ending ranks', () => {
        expect(endings.size, `distinct endings = ${endings.size}`).toBeGreaterThanOrEqual(
          cfg.minEndings,
        );
      });
    });
  }
}
