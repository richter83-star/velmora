import { test, expect } from '@playwright/test';
import { stubFonts, captureErrors, startCareer, playToEnding } from './helpers';

// Invariant: every store wraps localStorage in try/catch with an in-memory
// fallback. With localStorage fully blocked (a sandboxed/locked-down context),
// the game must still play start→finish with zero console errors, and the meta
// store must persist to its own fallback global.
test('localStorage blocked: game still plays and meta uses the in-memory fallback', async ({
  page,
}) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  await page.addInitScript(() => {
    const proto = Object.getPrototypeOf(window.localStorage);
    const boom = () => {
      throw new Error('sandbox: storage blocked');
    };
    proto.getItem = boom;
    proto.setItem = boom;
    proto.removeItem = boom;
    window.__VELMORA_SEED = 'sandbox-run';
  });
  await page.goto('/');

  await startCareer(page, 'ballot');
  await playToEnding(page);
  await expect(page.locator('#screen-over.active')).toBeVisible();

  const mem = await page.evaluate(() => {
    const raw = (window as unknown as { _velmoraMeta?: string })._velmoraMeta;
    let runsFinished = 0;
    try {
      const parsed = JSON.parse(raw || 'null') as { stats?: { runsFinished?: number } } | null;
      runsFinished = parsed?.stats?.runsFinished ?? 0;
    } catch {
      /* leave runsFinished at 0 */
    }
    return { metaType: typeof raw, runsFinished };
  });
  expect(mem.metaType, 'meta fell back to the in-memory global').toBe('string');
  expect(mem.runsFinished).toBeGreaterThanOrEqual(1);

  expect(errors, `errors:\n${errors.join('\n')}`).toEqual([]);
});
