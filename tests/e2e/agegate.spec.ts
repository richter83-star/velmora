import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { stubFonts, captureErrors } from './helpers';

// Exercise the gate itself: start from a CLEAN device (no age flag), unlike the
// rest of the suite which pre-seeds acceptance via the shared storageState.
test.use({ storageState: { cookies: [], origins: [] } });

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const NO_ANIM = '*,*::before,*::after{animation:none!important;transition:none!important}';

test('age gate: shows on first run, locks the app, and is axe-clean', async ({ page }) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  await page.goto('/');

  const gate = page.locator('#age-gate');
  await expect(gate).toBeVisible();
  await expect(page.locator('#age-title')).toHaveText(/17 or older/i);
  // Background app is inert while the gate is up.
  await expect(page.locator('#main')).toHaveAttribute('inert', '');

  await page.addStyleTag({ content: NO_ANIM });
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const blocking = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );
  expect(blocking, blocking.map((v) => `[${v.impact}] ${v.id}: ${v.help}`).join('\n')).toEqual([]);

  expect(errors, errors.join('\n')).toEqual([]);
});

test('age gate: keyboard — focus starts on accept, Tab traps, Enter enters', async ({ page }) => {
  await stubFonts(page);
  await page.goto('/');
  await expect(page.locator('#age-gate')).toBeVisible();

  // Focus starts on the affirmative action.
  await expect(page.locator('#age-yes')).toBeFocused();
  // Tab cycles only between the two gate buttons (trap).
  await page.keyboard.press('Tab');
  await expect(page.locator('#age-no')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#age-yes')).toBeFocused();
  // Shift+Tab goes back.
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('#age-no')).toBeFocused();

  // Enter on the accept button enters the app.
  await page.locator('#age-yes').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#age-gate')).toBeHidden();
  await expect(page.locator('#main')).not.toHaveAttribute('inert', '');
  // App is now usable.
  await page.locator('#btn-new').click();
  await expect(page.locator('#screen-path.active')).toBeVisible();
});

test('age gate: under-17 shows a soft denial with a way back', async ({ page }) => {
  await stubFonts(page);
  await page.goto('/');
  await expect(page.locator('#age-gate')).toBeVisible();

  await page.locator('#age-no').click();
  await expect(page.locator('#age-denied')).toBeVisible();
  await expect(page.locator('#age-ask')).toBeHidden();
  // Still locked — not accepted.
  await expect(page.locator('#main')).toHaveAttribute('inert', '');

  await page.locator('#age-back').click();
  await expect(page.locator('#age-ask')).toBeVisible();
  await expect(page.locator('#age-yes')).toBeFocused();
});

test('age gate: acceptance persists across reloads (remembered on-device)', async ({ page }) => {
  await stubFonts(page);
  await page.goto('/');
  await page.locator('#age-yes').click();
  await expect(page.locator('#age-gate')).toBeHidden();

  await page.reload();
  // Second visit: the gate must not reappear.
  await expect(page.locator('#age-gate')).toBeHidden();
  await expect(page.locator('#btn-new')).toBeVisible();
});

test('age gate: works with no network (pure client / offline)', async ({ page }) => {
  await stubFonts(page);
  // Block every non-document request to prove the gate needs no network.
  await page.route('**/art/**', (route) => route.abort());
  await page.route('**/*.png', (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('#age-gate')).toBeVisible();
  await page.locator('#age-yes').click();
  await expect(page.locator('#age-gate')).toBeHidden();
});
