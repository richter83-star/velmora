import { test, expect } from '@playwright/test';
import { stubFonts, captureErrors, startCareer, playToEnding, playToPhaseOrEnding } from './helpers';

const PATHS = ['ballot', 'vanguard'] as const;

for (const path of PATHS) {
  test(`plays the ${path} path to an ending with zero console/runtime errors`, async ({ page }) => {
    const errors = captureErrors(page);
    await stubFonts(page);
    await page.addInitScript(() => {
      window.__VELMORA_SEED = `velmora-smoke-${location.hash || 'x'}`;
    });

    await page.goto('/');
    await expect(page.locator('#screen-title.active')).toBeVisible();

    await startCareer(page, path);
    const rank = await playToEnding(page);

    expect(rank.length, 'ending should display a rank').toBeGreaterThan(0);
    expect(
      await page.locator('#over-mount .epi-beat').count(),
      'ending should show personalized epilogue beats',
    ).toBeGreaterThan(0);
    expect(
      await page.locator('#over-mount .ideo-row').count(),
      'ending should show the two ideology axes',
    ).toBe(2);
    expect(
      await page.locator('#over-mount .coal-row').count(),
      'ending should summarize the coalition (3 blocs, plus any cabinet)',
    ).toBeGreaterThanOrEqual(3);
    expect(errors, `errors during ${path} run:\n${errors.join('\n')}`).toEqual([]);
  });
}

test('renders the title screen with the emblem and both path choices', async ({ page }) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  await page.goto('/');
  await expect(page.locator('#btn-new')).toBeVisible();
  await page.locator('#btn-new').click();
  await expect(page.locator('.path-card[data-path="ballot"]')).toBeVisible();
  await expect(page.locator('.path-card[data-path="vanguard"]')).toBeVisible();
  expect(errors).toEqual([]);
});

test('the headline ticker renders fictional flavor news on the game screen', async ({ page }) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  await page.goto('/');
  await startCareer(page, 'ballot');
  const items = page.locator('#ticker .tk-item');
  await expect(items.first()).toBeVisible();
  expect(await items.count(), 'ticker should show several headlines').toBeGreaterThan(3);
  expect(await page.locator('#hud .bloc').count(), 'HUD shows the three faction blocs').toBe(3);
  expect(errors).toEqual([]);
});

test('a promotion offers an advisor who then appears in the HUD cabinet', async ({ page }) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  const seeds = ['cabinet1', 'cabinet2', 'tycoon', 'dynasty', 'ascend', 'summit', 'climber', 'reformer'];
  let appointed = false;
  for (const seed of seeds) {
    await page.goto(`/?seed=${encodeURIComponent(seed)}`);
    await startCareer(page, 'ballot');
    // Play until the run crosses into phase 2, which lands on the appointment screen.
    const s = await playToPhaseOrEnding(page, 2);
    if ((s?.phase ?? 1) < 2) continue;
    if ((await page.locator('#stage .advisor-card').count()) === 0) continue;
    await page.locator('#stage .advisor-card').first().click();
    await expect(page.locator('#hud .cab-chip')).toHaveCount(1);
    appointed = true;
    break;
  }
  expect(appointed, 'a promotion should offer an advisor who joins the HUD cabinet').toBe(true);
  expect(errors, `errors:\n${errors.join('\n')}`).toEqual([]);
});
