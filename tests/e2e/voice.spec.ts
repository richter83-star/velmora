import { test, expect } from '@playwright/test';
import { stubFonts, captureErrors, startCareer, dismissTutorial } from './helpers';

// The voice layer (Overhaul P6) is opt-in, lazy-loaded, and best-effort: with it
// ON, the game must keep playing with zero console/runtime errors even where the
// headless SpeechSynthesis is a no-op, and the captioned text must always be shown.
test('narration toggle persists and gameplay with narration on raises no errors', async ({
  page,
}) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  await page.addInitScript(() => {
    window.__VELMORA_SEED = 'voice-run';
  });
  await page.goto('/');

  // Enable narration.
  await page.locator('#btn-settings').click();
  const voice = page.locator('#set-voice');
  await expect(voice).toHaveAttribute('aria-checked', 'false');
  await voice.click();
  await expect(voice).toHaveAttribute('aria-checked', 'true');
  await page.locator('#btn-settings-back').click();

  // Persists across reload.
  await page.reload();
  await page.locator('#btn-settings').click();
  await expect(page.locator('#set-voice')).toHaveAttribute('aria-checked', 'true');
  await page.locator('#btn-settings-back').click();

  // Play a few steps with narration on — say()/hush() must never throw.
  await startCareer(page, 'ballot');
  await dismissTutorial(page);
  // Captions are always rendered, regardless of audio.
  await expect(page.locator('#stage .ev-text, #stage .result p').first()).toBeVisible();
  for (let i = 0; i < 6; i++) {
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
