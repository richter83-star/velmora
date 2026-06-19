import { test, expect } from '@playwright/test';
import { stubFonts, captureErrors, maxArcStage } from './helpers';

// The arc CHAIN (0 -> 1 -> 2 -> 99) is proven deterministically by the
// arc-engine unit test. These E2E specs prove the arc is wired into real play —
// it surfaces and advances across a run. To stay robust as the content pool
// grows, each tries several seeds and asserts the arc advances in at least one.

test('the Harbor Deal arc initiates and advances on the ballot path', async ({ page }) => {
  test.setTimeout(180_000);
  const errors = captureErrors(page);
  await stubFonts(page);

  const best = await maxArcStage(page, 'ballot', 'harbor', [
    'dynasty',
    'ascend',
    'nemesis',
    'tycoon',
  ]);
  expect(best, 'Harbor arc should advance through multiple stages').toBeGreaterThanOrEqual(2);
  expect(errors, `errors:\n${errors.join('\n')}`).toEqual([]);
});

test("the Patron's Shadow arc initiates and advances on the vanguard path", async ({ page }) => {
  test.setTimeout(180_000);
  const errors = captureErrors(page);
  await stubFonts(page);

  const best = await maxArcStage(page, 'vanguard', 'patron', [
    'dynasty',
    'ascend',
    'vanguard1',
    'secretary',
  ]);
  expect(best, 'Patron arc should advance through multiple stages').toBeGreaterThanOrEqual(2);
  expect(errors, `errors:\n${errors.join('\n')}`).toEqual([]);
});
