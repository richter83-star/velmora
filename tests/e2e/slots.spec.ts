import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { stubFonts, captureErrors, startCareer, dismissTutorial } from './helpers';

async function step(page: import('@playwright/test').Page, times = 2) {
  for (let i = 0; i < times; i++) {
    const cont = page.locator('#btn-continue-turn');
    if (await cont.count()) {
      await cont.first().click();
      continue;
    }
    const choice = page.locator('#stage .choice:not(.locked)').first();
    if (await choice.count()) await choice.click();
  }
}

test('save slots: two independent careers persist and resume to the right run', async ({
  page,
}) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  await page.goto('/');

  // Career 1 → slot 0 (ballot). Fresh active slot goes straight to path.
  await startCareer(page, 'ballot');
  await step(page, 2);
  expect(await page.evaluate(() => window.__VELMORA_STATE?.().path)).toBe('ballot');

  // Reload (save persists) → title → open Career Slots via Resume.
  await page.reload();
  await page.locator('#btn-continue').click();
  await expect(page.locator('#screen-slots.active')).toBeVisible();
  // Slot 0 is now occupied (a Resume action exists for it).
  await expect(page.locator('#slots-mount [data-act="resume"][data-slot="0"]')).toHaveCount(1);

  // axe: the slots picker (occupied + empty + active states) is clean.
  await page.addStyleTag({
    content: '*,*::before,*::after{animation:none!important;transition:none!important}',
  });
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const blocking = axe.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(
    blocking.map((v) => v.id),
    'slots picker axe',
  ).toEqual([]);

  // Start career 2 in the first EMPTY slot (vanguard).
  await page.locator('#slots-mount [data-act="start"]').first().click();
  await expect(page.locator('#screen-path.active')).toBeVisible();
  await page.locator('.path-card[data-path="vanguard"]').click();
  await page.locator('#btn-begin-career').click();
  await dismissTutorial(page);
  await step(page, 2);
  expect(await page.evaluate(() => window.__VELMORA_STATE?.().path)).toBe('vanguard');

  // Reload → resume SLOT 0 → must restore the ballot career, not the vanguard one.
  await page.reload();
  await page.locator('#btn-continue').click();
  await page.locator('#slots-mount [data-act="resume"][data-slot="0"]').click();
  await expect(page.locator('#screen-game.active')).toBeVisible();
  expect(await page.evaluate(() => window.__VELMORA_STATE?.().path)).toBe('ballot');

  expect(errors, `errors:\n${errors.join('\n')}`).toEqual([]);
});

test('deleting a slot clears it and updates the picker', async ({ page }) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  await page.goto('/');

  await startCareer(page, 'ballot');
  await step(page, 1);
  await page.reload();
  await page.locator('#btn-continue').click();
  await expect(page.locator('#slots-mount [data-act="resume"][data-slot="0"]')).toHaveCount(1);

  await page.locator('#slots-mount [data-act="del"][data-slot="0"]').click();
  // Slot 0 becomes empty (a Start action appears, Resume gone).
  await expect(page.locator('#slots-mount [data-act="resume"][data-slot="0"]')).toHaveCount(0);
  await expect(page.locator('#slots-mount [data-act="start"][data-slot="0"]')).toHaveCount(1);

  expect(errors, `errors:\n${errors.join('\n')}`).toEqual([]);
});
