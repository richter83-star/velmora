import { test, expect } from '@playwright/test';
import { stubFonts, captureErrors, startCareer, playToEnding } from './helpers';

const EXPANSION = ['iron', 'gilded', 'anointed'] as const;

test('the path screen shows all five roads plus the Dark Mirrors separator', async ({ page }) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  await page.goto('/');
  await page.locator('#btn-new').click();
  for (const p of ['ballot', 'vanguard', 'iron', 'gilded', 'anointed']) {
    await expect(page.locator(`.path-card[data-path="${p}"]`)).toBeVisible();
  }
  await expect(page.locator('#screen-path .path-sep')).toBeVisible();
  expect(errors, `errors:\n${errors.join('\n')}`).toEqual([]);
});

for (const path of EXPANSION) {
  test(`starts and resolves a ${path} career with zero console/runtime errors`, async ({ page }) => {
    const errors = captureErrors(page);
    await stubFonts(page);
    await page.addInitScript(() => {
      window.__VELMORA_SEED = `velmora-expansion-${location.hash || 'x'}`;
    });

    await page.goto('/');
    await expect(page.locator('#screen-title.active')).toBeVisible();

    // Reaches path-select -> create -> career start (Phase 1 gate). The seed
    // banks land in Phase 2; until then a run resolves through its promotions.
    await startCareer(page, path);
    await expect(page.locator('#screen-game.active')).toBeVisible();

    const rank = await playToEnding(page);
    expect(rank.length, 'a new path should reach a tagged ending').toBeGreaterThan(0);
    expect(errors, `errors during ${path} run:\n${errors.join('\n')}`).toEqual([]);
  });
}
