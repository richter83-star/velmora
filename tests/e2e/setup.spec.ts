import { test, expect } from '@playwright/test';
import { stubFonts, captureErrors } from './helpers';

test('difficulty selection and per-run modifiers apply at career start', async ({ page }) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  await page.addInitScript(() => {
    window.__VELMORA_SEED = 'setup-run';
  });

  await page.goto('/');
  await page.locator('#btn-new').click();
  await page.locator('.path-card[data-path="ballot"]').click();
  await page.locator('#difficulty-chips .chip[data-d="ironclad"]').click();
  await page.locator('#btn-begin-career').click();
  await expect(page.locator('#screen-game.active')).toBeVisible();

  const s = await page.evaluate(() => {
    const st = window.__VELMORA_STATE?.();
    return { difficulty: st?.difficulty, mods: st?.modifiers, daily: st?.daily };
  });
  expect(s.difficulty).toBe('ironclad');
  expect(Array.isArray(s.mods)).toBe(true);
  expect(s.mods?.length).toBe(1);
  expect(s.daily).toBe(false);
  expect(errors, `errors:\n${errors.join('\n')}`).toEqual([]);
});

test('scenario of the day seeds the run and flags it as daily', async ({ page }) => {
  const errors = captureErrors(page);
  await stubFonts(page);

  await page.goto('/');
  await page.locator('#btn-daily').click();
  await page.locator('.path-card[data-path="vanguard"]').click();
  await page.locator('#btn-begin-career').click();
  await expect(page.locator('#screen-game.active')).toBeVisible();

  const daily = await page.evaluate(() => window.__VELMORA_STATE?.().daily);
  expect(daily).toBe(true);
  expect(errors, `errors:\n${errors.join('\n')}`).toEqual([]);
});
