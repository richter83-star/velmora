import { test, expect } from '@playwright/test';
import { stubFonts, captureErrors, startCareer } from './helpers';

// A pre-Phase-8 install had a single bare `velmora_save_v1` key, no meta store,
// and no ngPlus field. It must adopt cleanly as slot 0 and migrate forward.
test('legacy bare save is adopted as slot 0 and migrates ngPlus to 0', async ({ page }) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  await page.goto('/');

  // Produce a real in-progress save, then rewrite it to look pre-Phase-8.
  await startCareer(page, 'ballot');
  const choice = page.locator('#stage .choice:not(.locked)').first();
  if (await choice.count()) await choice.click();

  await page.evaluate(() => {
    const slotKey = 'velmora_save_v1__0';
    const raw = localStorage.getItem(slotKey);
    if (!raw) throw new Error('expected a slot-0 save to exist');
    const o = JSON.parse(raw);
    delete o.ngPlus; // pre-Phase-8 runs had no ngPlus
    localStorage.setItem('velmora_save_v1', JSON.stringify(o)); // legacy bare key
    localStorage.removeItem(slotKey); // remove the new prefixed key
    localStorage.removeItem('velmora_meta_v1'); // pre-Phase-8: no meta store
  });

  await page.reload();

  // Continue is offered (the bare save is detected) and resumes via the picker.
  await expect(page.locator('#btn-continue')).toBeVisible();
  await page.locator('#btn-continue').click();
  await expect(page.locator('#slots-mount [data-act="resume"][data-slot="0"]')).toHaveCount(1);
  await page.locator('#slots-mount [data-act="resume"][data-slot="0"]').click();

  await expect(page.locator('#screen-game.active')).toBeVisible();
  const s = await page.evaluate(() => window.__VELMORA_STATE?.());
  expect(s.path).toBe('ballot');
  expect(s.ngPlus).toBe(0); // migrated

  // Advance a turn so the run autosaves, then it writes the prefixed slot key.
  for (let i = 0; i < 3; i++) {
    const cont = page.locator('#btn-continue-turn');
    if (await cont.count()) {
      await cont.first().click();
      continue;
    }
    const c = page.locator('#stage .choice:not(.locked)').first();
    if (await c.count()) await c.click();
  }
  const rewritten = await page.evaluate(() => localStorage.getItem('velmora_save_v1__0'));
  expect(rewritten, 'resumed run re-saves under the slot key').toBeTruthy();

  expect(errors, `errors:\n${errors.join('\n')}`).toEqual([]);
});
