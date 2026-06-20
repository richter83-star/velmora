import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { stubFonts, captureErrors, startCareer, dismissTutorial, playToEnding } from './helpers';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

// Neutralize the entrance fade so axe scans the settled state, not dark text
// rendered at partial opacity mid-animation (which yields false contrast hits).
const NO_ANIM = '*,*::before,*::after{animation:none!important;transition:none!important}';

/** Run axe on the current page and return only serious/critical violations. */
async function scan(page: import('@playwright/test').Page, label: string) {
  await page.addStyleTag({ content: NO_ANIM });
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const blocking = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );
  const summary = blocking
    .map((v) => `  [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s))`)
    .join('\n');
  expect(blocking, `axe serious/critical violations on ${label}:\n${summary}`).toEqual([]);
}

test('axe: key static screens have no serious/critical violations', async ({ page }) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  await page.goto('/');

  await scan(page, 'title');

  await page.locator('#btn-settings').click();
  await scan(page, 'settings');
  await page.locator('#btn-settings-back').click();

  await page.locator('#btn-codex').click();
  await scan(page, 'codex');
  await page.locator('#btn-codex-back').click();

  await page.locator('#btn-new').click();
  await scan(page, 'path-select');

  await page.locator('.path-card[data-path="ballot"]').click();
  await scan(page, 'create');

  expect(errors, `errors:\n${errors.join('\n')}`).toEqual([]);
});

test('axe: in-game and ending screens have no serious/critical violations', async ({ page }) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  await page.addInitScript(() => {
    window.__VELMORA_SEED = 'axe-run';
  });
  await page.goto('/');

  await startCareer(page, 'ballot'); // also dismisses the tutorial
  await dismissTutorial(page);
  await scan(page, 'game (first decision)');

  await playToEnding(page);
  await expect(page.locator('#screen-over.active')).toBeVisible();
  await scan(page, 'ending');

  expect(errors, `errors:\n${errors.join('\n')}`).toEqual([]);
});
