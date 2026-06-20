import { test, expect } from '@playwright/test';
import { stubFonts, captureErrors, dismissTutorial } from './helpers';

const WIDTHS = [320, 375, 768, 1024, 1440] as const;

async function noOverflow(page: import('@playwright/test').Page, label: string) {
  const overflow = await page.evaluate(() => {
    const el = document.documentElement;
    return el.scrollWidth - el.clientWidth;
  });
  // Allow 1px of sub-pixel rounding slack.
  expect(overflow, `${label} overflows horizontally by ${overflow}px`).toBeLessThanOrEqual(1);
}

for (const width of WIDTHS) {
  test(`no horizontal overflow at ${width}px across key screens`, async ({ page }) => {
    const errors = captureErrors(page);
    await stubFonts(page);
    await page.setViewportSize({ width, height: 800 });
    await page.addInitScript(() => {
      window.__VELMORA_SEED = 'resp-run';
    });
    await page.goto('/');
    await noOverflow(page, `title@${width}`);

    await page.locator('#btn-settings').click();
    await noOverflow(page, `settings@${width}`);
    await page.locator('#btn-settings-back').click();

    await page.locator('#btn-codex').click();
    await noOverflow(page, `codex@${width}`);
    await page.locator('#btn-codex-back').click();

    await page.locator('#btn-new').click();
    await noOverflow(page, `path@${width}`);

    await page.locator('.path-card[data-path="ballot"]').click();
    await noOverflow(page, `create@${width}`);

    await page.locator('#btn-begin-career').click();
    await dismissTutorial(page);
    await noOverflow(page, `game@${width}`);

    expect(errors, `errors:\n${errors.join('\n')}`).toEqual([]);
  });
}
