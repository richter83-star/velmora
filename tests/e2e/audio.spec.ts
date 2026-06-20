import { test, expect } from '@playwright/test';
import { stubFonts, captureErrors, startCareer, dismissTutorial } from './helpers';

test('sound toggle persists and gameplay with sound on raises no errors', async ({ page }) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  await page.addInitScript(() => {
    window.__VELMORA_SEED = 'audio-run';
  });
  await page.goto('/');

  // Enable sound.
  await page.locator('#btn-settings').click();
  const snd = page.locator('#set-sound');
  await expect(snd).toHaveAttribute('aria-checked', 'false');
  await snd.click();
  await expect(snd).toHaveAttribute('aria-checked', 'true');
  await page.locator('#btn-settings-back').click();

  // Persists across reload.
  await page.reload();
  await page.locator('#btn-settings').click();
  await expect(page.locator('#set-sound')).toHaveAttribute('aria-checked', 'true');
  await page.locator('#btn-settings-back').click();

  // Play a few steps with sound on — SFX must fire without console/runtime errors.
  await startCareer(page, 'ballot');
  await dismissTutorial(page);
  for (let i = 0; i < 5; i++) {
    const cont = page.locator('#btn-continue-turn');
    if (await cont.count()) {
      await cont.first().click();
      continue;
    }
    const choice = page.locator('#stage .choice:not(.locked)').first();
    if (await choice.count()) await choice.click();
  }

  expect(errors, `errors:\n${errors.join('\n')}`).toEqual([]);
});
