import { test, expect } from '@playwright/test';
import { stubFonts, captureErrors } from './helpers';

test('tutorial shows on first career, is skippable, and does not reappear', async ({ page }) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  await page.addInitScript(() => {
    window.__VELMORA_SEED = 'tut-run';
  });
  await page.goto('/');

  // Start a career; the tutorial modal appears over the game.
  await page.locator('#btn-new').click();
  await page.locator('.path-card[data-path="ballot"]').click();
  await page.locator('#btn-begin-career').click();
  const tut = page.locator('#tutorial');
  await expect(tut).toBeVisible();
  await expect(page.locator('#tut-title')).toBeFocused();

  // Step through it, then it closes.
  await page.locator('#tut-next').click(); // step 2
  await page.locator('#tut-next').click(); // step 3
  await page.locator('#tut-next').click(); // step 4
  await page.locator('#tut-next').click(); // "Got it" -> close
  await expect(tut).toBeHidden();

  // The game is interactive (a choice can be clicked).
  await page.locator('#stage .choice:not(.locked)').first().click();

  // Resign and start a second career — tutorial must NOT reappear.
  await page.locator('#tb-quit').click();
  await page.locator('#btn-again').click();
  await page.locator('.path-card[data-path="vanguard"]').click();
  await page.locator('#btn-begin-career').click();
  await expect(page.locator('#screen-game.active')).toBeVisible();
  await expect(tut).toBeHidden();

  expect(errors, `errors:\n${errors.join('\n')}`).toEqual([]);
});

test('tutorial can be replayed from Settings', async ({ page }) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  // Pretend the tutorial was already seen.
  await page.addInitScript(() => {
    localStorage.setItem('velmora_settings_v1', JSON.stringify({ tutorialSeen: true }));
  });
  await page.goto('/');

  await page.locator('#btn-settings').click();
  await page.locator('#set-replay-tut').click();
  await expect(page.locator('#tutorial')).toBeVisible();
  await page.locator('#tut-skip').click();
  await expect(page.locator('#tutorial')).toBeHidden();

  expect(errors, `errors:\n${errors.join('\n')}`).toEqual([]);
});
