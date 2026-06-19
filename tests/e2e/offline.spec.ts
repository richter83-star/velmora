import { test, expect } from '@playwright/test';
import { stubFonts, captureErrors, startCareer } from './helpers';

// This spec needs a real service worker, so override the default 'block'.
test.use({ serviceWorkers: 'allow' });

test('installs a service worker and runs fully offline', async ({ page, context }) => {
  const errors = captureErrors(page);
  await stubFonts(page);

  await page.goto('/');
  await expect(page.locator('#btn-new')).toBeVisible();

  // Wait for the SW to activate (its install step precaches the shell first).
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  await page.waitForTimeout(400);

  // Cut the network and reload — the app shell must be served from cache.
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#screen-title.active')).toBeVisible();
  await expect(page.locator('#btn-new')).toBeVisible();

  // A brand-new game must start with no network (engine + content from cache).
  await startCareer(page, 'ballot');
  await expect(page.locator('#stage .choice').first()).toBeVisible();

  await context.setOffline(false);

  // Tolerate offline resource hiccups (e.g. the non-precached sourcemap, fonts),
  // but fail on any real JS error.
  const jsErrors = errors.filter(
    (e) => !/Failed to load resource|net::ERR|fonts\.(googleapis|gstatic)/.test(e),
  );
  expect(jsErrors, `unexpected JS errors offline:\n${jsErrors.join('\n')}`).toEqual([]);
});
