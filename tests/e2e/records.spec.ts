import { test, expect } from '@playwright/test';
import { stubFonts, captureErrors, startCareer, playToEnding } from './helpers';

test('records screen opens from title with empty state and returns focus', async ({ page }) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  await page.goto('/');

  await page.locator('#btn-records').click();
  await expect(page.locator('#screen-records.active')).toBeVisible();
  // Four sections (Lifetime, Achievements, Unlocks, Past Lives).
  expect(await page.locator('#records-mount .cdx-sec').count()).toBeGreaterThanOrEqual(4);
  // Fresh profile: empty history message and all achievements locked.
  await expect(page.locator('#records-mount')).toContainText('No careers yet');
  expect(await page.locator('#records-mount .cdx-card.rec-locked').count()).toBeGreaterThan(0);

  await page.locator('#btn-records-back').click();
  await expect(page.locator('#screen-title.active')).toBeVisible();
  await expect(page.locator('#btn-records')).toBeFocused();

  expect(errors, `errors:\n${errors.join('\n')}`).toEqual([]);
});

test('finishing a run is recorded: history entry, lifetime stats, an achievement', async ({
  page,
}) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  await page.addInitScript(() => {
    window.__VELMORA_SEED = 'records-run';
  });
  await page.goto('/');

  await startCareer(page, 'ballot');
  await playToEnding(page);
  await expect(page.locator('#screen-over.active')).toBeVisible();

  // The META store recorded the finished run.
  const meta = await page.evaluate(() => {
    try {
      return JSON.parse(localStorage.getItem('velmora_meta_v1') || 'null');
    } catch {
      return null;
    }
  });
  expect(meta, 'meta persisted').toBeTruthy();
  expect(meta.stats.runsFinished).toBeGreaterThanOrEqual(1);
  expect(meta.history.length).toBeGreaterThanOrEqual(1);
  // first_run achievement always unlocks on the first finished career.
  expect(meta.achievements.first_run).toBeTruthy();

  // Return to title and open Records → at least one Past Life row.
  await page.locator('#btn-again').click();
  await expect(page.locator('#screen-path.active')).toBeVisible();
  await page.locator('#btn-path-back').click();
  await page.locator('#btn-records').click();
  expect(await page.locator('#records-mount .rec-run').count()).toBeGreaterThanOrEqual(1);

  expect(errors, `errors:\n${errors.join('\n')}`).toEqual([]);
});
