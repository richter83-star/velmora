import { test, expect } from '@playwright/test';
import { stubFonts, captureErrors, startCareer, dismissTutorial } from './helpers';

// Civ P2: the province map is a lazy chunk behind the civMap flag (?civ=1). With it
// ON, a game shows the canvas map plus the accessible province list, redraws each
// turn, and never throws. OFF (the production default), the container stays hidden.

test('province map renders behind ?civ=1 with an accessible province list', async ({ page }) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  await page.addInitScript(() => {
    (window as unknown as { __VELMORA_SEED?: string }).__VELMORA_SEED = 'civ-map-e2e';
  });
  await page.goto('/?civ=1');

  await startCareer(page, 'iron');
  await dismissTutorial(page);

  const map = page.locator('#civ-map');
  await expect(map).toBeVisible();

  // The canvas got real device-pixel dimensions (it actually drew).
  const canvas = page.locator('#civ-canvas');
  await expect(canvas).toBeVisible();
  const dims = await canvas.evaluate((c) => ({
    w: (c as HTMLCanvasElement).width,
    h: (c as HTMLCanvasElement).height,
  }));
  expect(dims.w).toBeGreaterThan(0);
  expect(dims.h).toBeGreaterThan(0);

  // Accessible layer: one focusable button per province (12–18), labeled for SR.
  const provBtns = page.locator('#civ-provinces button');
  const n = await provBtns.count();
  expect(n).toBeGreaterThanOrEqual(12);
  expect(n).toBeLessThanOrEqual(18);
  await expect(provBtns.first()).toContainText(/control \d+, unrest \d+/);

  // Play a few turns — the map redraws at each state change and never throws.
  for (let i = 0; i < 5; i++) {
    const cont = page.locator('#btn-continue-turn');
    if (await cont.count()) {
      await cont.first().click();
      continue;
    }
    const choice = page.locator('#stage .choice:not(.locked)').first();
    if (await choice.count()) await choice.click();
  }
  await expect(map).toBeVisible();
  expect(errors).toEqual([]);
});

test('rule phase: tapping a province opens the action sheet and spends the budget', async ({ page }) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  await page.addInitScript(() => {
    (window as unknown as { __VELMORA_SEED?: string }).__VELMORA_SEED = 'civ-p3-e2e';
  });
  await page.goto('/?civ=1');
  await startCareer(page, 'iron');
  await dismissTutorial(page);

  // Open the sheet via the first accessible province button.
  await page.locator('#civ-provinces button').first().click();
  const sheet = page.locator('.civ-sheet');
  await expect(sheet).toBeVisible();
  await expect(sheet.locator('.civ-act')).toHaveCount(4);
  await expect(sheet.locator('.civ-sheet-budget')).toContainText('2 imperial actions');

  // Spend both imperial actions — the budget counts down and then locks.
  await sheet.locator('.civ-act:not([disabled])').first().click();
  await expect(sheet.locator('.civ-sheet-budget')).toContainText('1 imperial action');
  await sheet.locator('.civ-act:not([disabled])').first().click();
  await expect(sheet.locator('.civ-sheet-budget')).toContainText('0 imperial actions');
  await expect(sheet.locator('.civ-act[disabled]')).toHaveCount(4);

  // A governor is free (set-once) and shows up in the accessible label.
  await sheet.locator('.civ-gov-sel').selectOption('pacify');
  await expect(page.locator('#civ-provinces button').first()).toContainText('governor');

  // Esc closes the dialog.
  await page.keyboard.press('Escape');
  await expect(sheet).toBeHidden();
  expect(errors).toEqual([]);
});

test('province map stays hidden by default (flag off)', async ({ page }) => {
  await stubFonts(page);
  await page.goto('/');
  await startCareer(page, 'ballot');
  await dismissTutorial(page);
  await expect(page.locator('#civ-map')).toBeHidden();
});
