import { test, expect } from '@playwright/test';
import { stubFonts, captureErrors, startCareer, playToEnding } from './helpers';

// Seeded so the run deterministically reaches the finale; the generic
// first-choice player drives the Harbor arc 0 -> 1 -> 2 -> 99 across phases.
test('the Harbor Deal arc initiates and resolves across phases', async ({ page }) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  await page.addInitScript(() => {
    window.__VELMORA_SEED = 'reformer';
  });

  await page.goto('/');
  await startCareer(page, 'ballot');
  await playToEnding(page);

  const state = await page.evaluate(() => window.__VELMORA_STATE?.());
  expect(state?.arcs?.harbor, 'harbor arc should reach its terminal stage').toBe(99);
  expect(state?.phase, 'the run should span to the final phase').toBe(3);
  expect(errors, `errors:\n${errors.join('\n')}`).toEqual([]);
});
