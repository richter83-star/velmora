import { test, expect } from '@playwright/test';
import { stubFonts, captureErrors, startCareer, playToEnding } from './helpers';

// The first-choice player takes the corrupt options (e.g. the Harbor cover-up,
// the slush fund), which plant scandals; the engine tracks them with a valid
// lifecycle and may resurface them.
test('scandals are recorded and tracked with a valid lifecycle', async ({ page }) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  await page.addInitScript(() => {
    window.__VELMORA_SEED = 'nemesis';
  });

  await page.goto('/');
  await startCareer(page, 'ballot');
  await playToEnding(page);

  const scandals = await page.evaluate(() => window.__VELMORA_STATE?.().scandals ?? []);
  expect(Array.isArray(scandals)).toBe(true);
  expect(
    scandals.length,
    'at least one scandal planted during a corrupt run',
  ).toBeGreaterThanOrEqual(1);
  for (const sc of scandals) {
    expect(['latent', 'buried', 'resolved', 'exposed']).toContain(sc.status);
  }
  expect(errors, `errors:\n${errors.join('\n')}`).toEqual([]);
});
