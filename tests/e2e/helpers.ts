import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/** Make the page hermetic: stub Google Fonts so tests don't depend on the network. */
export async function stubFonts(page: Page): Promise<void> {
  await page.route(/fonts\.googleapis\.com/, (route) =>
    route.fulfill({ status: 200, contentType: 'text/css', body: '' }),
  );
  await page.route(/fonts\.gstatic\.com/, (route) =>
    route.fulfill({ status: 200, contentType: 'font/woff2', body: '' }),
  );
}

/** Collect console.error + uncaught page errors into a list for assertions. */
export function captureErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${String(e)}`));
  return errors;
}

/** Start a new career on the given path (defaults for name/faction/trait). */
export async function startCareer(page: Page, path: 'ballot' | 'vanguard'): Promise<void> {
  await page.locator('#btn-new').click();
  await page.locator(`.path-card[data-path="${path}"]`).click();
  await page.locator('#btn-begin-career').click();
  await expect(page.locator('#screen-game.active')).toBeVisible();
}

/**
 * Drive a run to its ending by always taking the first available action:
 * continue a result, advance a promotion, run a contest, or pick the first
 * unlocked choice. Returns the ending rank text.
 */
export async function playToEnding(page: Page, maxSteps = 800): Promise<string> {
  for (let i = 0; i < maxSteps; i++) {
    if (await page.locator('#screen-over.active').count()) {
      await expect(page.locator('#over-mount .over-card')).toBeVisible();
      return (await page.locator('#over-mount .orank').first().textContent())?.trim() ?? '';
    }
    const order = ['#btn-continue-turn', '#btn-finale', '#btn-promo-next', '#btn-run'];
    let acted = false;
    for (const sel of order) {
      const btn = page.locator(sel);
      if (await btn.count()) {
        await btn.first().click();
        acted = true;
        break;
      }
    }
    if (acted) continue;
    const choice = page.locator('#stage .choice:not(.locked)').first();
    if (await choice.count()) {
      await choice.click();
      continue;
    }
    await page.waitForTimeout(25);
  }
  throw new Error('Did not reach an ending within the step budget');
}
