import { test, expect } from '@playwright/test';
import { dismissTutorial, stubFonts, captureErrors } from './helpers';

const META_WITH_NGPLUS = JSON.stringify({
  metaVersion: 1,
  activeSlot: 0,
  stats: {},
  history: [],
  achievements: {},
  unlockables: {},
  ngPlus: { maxCleared: 2, lastSeed: null },
});

test('New Game+ tier selector appears once unlocked and sets the run tier', async ({ page }) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  await page.addInitScript((meta) => {
    window.__VELMORA_SEED = 'ng-run';
    localStorage.setItem('velmora_meta_v1', meta);
  }, META_WITH_NGPLUS);
  await page.goto('/');

  await page.locator('#btn-new').click(); // free slot → straight to path
  await page.locator('.path-card[data-path="ballot"]').click();

  // Tiers 0..maxCleared (Standard, NG+1, NG+2).
  await expect(page.locator('#ngplus-field')).toBeVisible();
  expect(await page.locator('#ngplus-chips .chip').count()).toBe(3);

  await page.locator('#ngplus-chips .chip[data-ng="1"]').click();
  await page.locator('#btn-begin-career').click();
  await expect(page.locator('#screen-game.active')).toBeVisible(); // startCareer is async (lazy bank)
  await dismissTutorial(page);

  expect(await page.evaluate(() => window.__VELMORA_STATE?.().ngPlus)).toBe(1);
  expect(errors, `errors:\n${errors.join('\n')}`).toEqual([]);
});

test('the daily scenario ignores New Game+ (always tier 0)', async ({ page }) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  await page.addInitScript((meta) => {
    localStorage.setItem('velmora_meta_v1', meta);
  }, META_WITH_NGPLUS);
  await page.goto('/');

  await page.locator('#btn-daily').click(); // free slot → straight to path (daily)
  await page.locator('.path-card[data-path="vanguard"]').click();

  // NG+ selector hidden for daily runs.
  await expect(page.locator('#ngplus-field')).toBeHidden();

  await page.locator('#btn-begin-career').click();
  await expect(page.locator('#screen-game.active')).toBeVisible(); // startCareer is async (lazy bank)
  await dismissTutorial(page);

  const s = await page.evaluate(() => window.__VELMORA_STATE?.());
  expect(s.ngPlus).toBe(0);
  expect(s.daily).toBe(true);
  expect(errors, `errors:\n${errors.join('\n')}`).toEqual([]);
});
