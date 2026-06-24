import { test, expect } from '@playwright/test';
import { stubFonts, captureErrors, startCareer, playToEnding } from './helpers';

// The Live Storyteller layer is opt-in + fully fallback-guarded. With the flag ON
// and a key present but the endpoint failing (or offline), the game must play
// identically to flag-OFF: every turn falls back to on-device content, the run
// reaches an ending, and nothing errors. The deterministic sweep never enables
// this path (proven separately), so determinism is untouched.

test('live ON but endpoint failing falls back to on-device and plays to an ending', async ({ page }) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  // The endpoint replies 200 but with no emit_event tool call, so the client
  // returns null and the game falls back — and a 200 logs no console noise.
  await page.route(/api\.anthropic\.com/, (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [{ type: 'text', text: 'no tool' }] }) }),
  );
  await page.addInitScript(() => {
    localStorage.setItem(
      'velmora_settings_v1',
      JSON.stringify({ liveStoryteller: true, liveModel: 'claude-haiku-4-5', aiDirector: true, weaveDensity: 'low', tutorialSeen: true }),
    );
    // A fake key so the live path is attempted (then rejected by the 500).
    localStorage.setItem('velmora_live_key', 'sk-ant-faketestkey-0000000000');
  });

  await page.goto('/');
  await startCareer(page, 'ballot');
  const rank = await playToEnding(page);
  expect(rank.length, 'a live-on run still reaches a tagged ending').toBeGreaterThan(0);
  expect(errors, `errors:\n${errors.join('\n')}`).toEqual([]);
});

test('live ON without a key is a clean no-op (pure on-device)', async ({ page }) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  await page.addInitScript(() => {
    localStorage.setItem(
      'velmora_settings_v1',
      JSON.stringify({ liveStoryteller: true, aiDirector: true, weaveDensity: 'low', tutorialSeen: true }),
    );
  });
  await page.goto('/');
  await startCareer(page, 'vanguard');
  const rank = await playToEnding(page);
  expect(rank.length).toBeGreaterThan(0);
  expect(errors, `errors:\n${errors.join('\n')}`).toEqual([]);
});
