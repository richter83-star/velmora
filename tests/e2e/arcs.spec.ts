import { test, expect } from '@playwright/test';
import { stubFonts, captureErrors, startCareer, playToEnding } from './helpers';

// Seeded for determinism. The first-choice player drives the Harbor arc
// (0 -> 1 -> 2 -> 99) as it plays. Full terminal resolution is proven
// deterministically by the arc-engine unit test; here we assert the arc
// genuinely initiates and advances through multiple stages in a real run.
test('the Harbor Deal arc initiates and advances across a run', async ({ page }) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  await page.addInitScript(() => {
    window.__VELMORA_SEED = 'reformer';
  });

  await page.goto('/');
  await startCareer(page, 'ballot');
  await playToEnding(page);

  const harbor = await page.evaluate(() => window.__VELMORA_STATE?.().arcs?.harbor);
  expect(harbor, 'Harbor arc should advance through multiple stages').toBeGreaterThanOrEqual(2);
  expect(errors, `errors:\n${errors.join('\n')}`).toEqual([]);
});
