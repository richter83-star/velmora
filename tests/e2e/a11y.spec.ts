import { test, expect } from '@playwright/test';
import { stubFonts, captureErrors, startCareer } from './helpers';

test('accessibility: zoom allowed, landmarks present, keyboard-playable, live region announces', async ({
  page,
}) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  await page.goto('/');

  // WCAG 1.4.4 (Resize Text): the viewport must not disable zoom.
  const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
  expect(viewport).not.toContain('user-scalable=no');
  expect(viewport).not.toContain('maximum-scale');

  // Landmarks + a11y plumbing.
  await expect(page.locator('a.skip-link')).toHaveCount(1);
  await expect(page.locator('#a11y-live[aria-live="polite"]')).toHaveCount(1);
  await expect(page.locator('[role="main"]')).toHaveCount(1);

  await startCareer(page, 'ballot');

  // Keyboard-only: focus the first unlocked choice button and activate with Enter.
  const choice = page.locator('#stage .choice:not(.locked)').first();
  await choice.focus();
  await expect(choice).toBeFocused();
  await page.keyboard.press('Enter');

  // The result screen appears (proving the keyboard activated the choice)...
  await expect(page.locator('#btn-continue-turn')).toBeVisible();
  // ...and the live region announced the outcome to assistive tech.
  const announced = (await page.locator('#a11y-live').textContent()) ?? '';
  expect(announced.length, 'live region should announce the outcome').toBeGreaterThan(0);

  expect(errors, `errors:\n${errors.join('\n')}`).toEqual([]);
});
