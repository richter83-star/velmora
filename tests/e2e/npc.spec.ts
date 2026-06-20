import { test, expect } from '@playwright/test';
import { stubFonts, captureErrors, startCareer, playToPhaseOrEnding } from './helpers';

// The antagonist is created once at career start and reused as the opponent at
// every office (`assignOpponent` sets opp = antagonist.name), so
// `opp === antagonist` holds by construction throughout a run. To show this
// *across phases* we need a run that survives at least one promotion. Whether a
// given seed does depends on the draw pool, so — robust to content growth — we
// try several seeds, assert the per-start + persistence invariants on every
// run, and require at least one run to carry across a phase transition.
test('the recurring antagonist is the same nemesis across phases', async ({ page }) => {
  const errors = captureErrors(page);
  await stubFonts(page);

  const seeds = [
    'reformer',
    'tyrant',
    'velmora',
    'nemesis',
    'climber',
    'summit',
    'ballot-3',
    'ballot-9',
    'phase-two',
    'rival-x',
  ];
  let crossedPhases = false;

  for (const seed of seeds) {
    await page.goto(`/?seed=${encodeURIComponent(seed)}`);
    await startCareer(page, 'ballot');

    const early = await page.evaluate(() => {
      const s = window.__VELMORA_STATE?.();
      return { opp: s?.opp, antagonist: s?.npcs?.antagonist?.name, id: s?.antagonistId };
    });
    // Per-start invariant: holds for every seed.
    expect(early.id, 'antagonist id is set at career start').toBe('antagonist');
    expect(early.antagonist, 'antagonist has a name').toBeTruthy();
    expect(early.opp, 'the opponent is the antagonist').toBe(early.antagonist);

    const late = await playToPhaseOrEnding(page, 2);

    // Persistence invariant: the same antagonist is still the opponent.
    expect(late?.npcs?.antagonist?.name, 'same antagonist persists through the run').toBe(
      early.antagonist,
    );
    expect(late?.opp, 'still facing the antagonist').toBe(early.antagonist);

    if ((late?.phase ?? 1) >= 2) {
      crossedPhases = true;
      break;
    }
  }

  expect(
    crossedPhases,
    'at least one seeded run carried the antagonist across a phase transition',
  ).toBe(true);
  expect(errors, `errors:\n${errors.join('\n')}`).toEqual([]);
});
