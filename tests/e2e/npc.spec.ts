import { test, expect } from '@playwright/test';
import { stubFonts, captureErrors, startCareer, playToEnding } from './helpers';

// The antagonist is created once and reused as the opponent every phase, so
// `opp === antagonist` always holds (by construction); the seed only needs to
// carry the run across at least one phase transition to show "across phases".
test('the recurring antagonist is the same nemesis across phases', async ({ page }) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  await page.addInitScript(() => {
    window.__VELMORA_SEED = 'nemesis';
  });

  await page.goto('/');
  await startCareer(page, 'ballot');

  const early = await page.evaluate(() => {
    const s = window.__VELMORA_STATE?.();
    return { opp: s?.opp, antagonist: s?.npcs?.antagonist?.name, id: s?.antagonistId };
  });
  expect(early.id, 'antagonist id is set at career start').toBe('antagonist');
  expect(early.antagonist, 'antagonist has a name').toBeTruthy();
  expect(early.opp, 'the opponent is the antagonist').toBe(early.antagonist);

  await playToEnding(page);

  const late = await page.evaluate(() => {
    const s = window.__VELMORA_STATE?.();
    return { opp: s?.opp, antagonist: s?.npcs?.antagonist?.name, phase: s?.phase };
  });
  expect(
    late.phase,
    'antagonist carried across at least one phase transition',
  ).toBeGreaterThanOrEqual(2);
  expect(late.antagonist, 'same antagonist persists across phases').toBe(early.antagonist);
  expect(late.opp, 'still facing the antagonist at the finale').toBe(early.antagonist);
  expect(errors, `errors:\n${errors.join('\n')}`).toEqual([]);
});
