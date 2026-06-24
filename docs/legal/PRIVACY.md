# VELMORA — Privacy Policy

_Draft — review before public launch. Last updated: 2026-06-21._

VELMORA is a browser game that runs entirely on your device. It is **privacy-first by design**.

## What we collect

**Nothing leaves your device.** VELMORA has no backend server and no account system. We do not collect, transmit, sell, or share any personal data.

The game stores data **locally in your browser** (via `localStorage`, with an in-memory fallback) so your progress survives between sessions:

- **Saved careers** (`velmora_save_v1__*`) — your in-progress runs.
- **Settings** (`velmora_settings_v1`) — your accessibility, sound, and reporting preferences.
- **Profile** (`velmora_meta_v1`) — run history, lifetime stats, achievements, unlockables, and entitlements.

This data is readable only by your browser on your device. Clearing your browser storage (or using the in-game "Clear saved career" / deleting a slot) removes it.

## Third-party services

- **No analytics, trackers, or advertising.** VELMORA ships with no third-party analytics or ad SDKs.
- **Fonts are self-hosted** (subset and served from the game's own origin) — no font CDN, no third-party request to load type.
- **Hosting** (e.g. Vercel / nginx) may keep standard server access logs, as any website does.

## Optional error reporting

The Settings screen has an **off-by-default** "Error reporting" toggle. When enabled, runtime error messages are recorded **only in memory on your device** to aid debugging. Nothing is transmitted — there is no backend to receive it.

## Optional "Live Storyteller" (bring-your-own-key)

The default game — including the on-device **AI Director** and **Story Weaver** — runs **entirely on your device** and sends nothing.

If you turn the off-by-default **Live Storyteller** toggle **on** and supply **your own** Anthropic API key, then on some turns the game sends a **compact, non-identifying snapshot of your current run** (your path, office, stat levels, faction standings, and rival disposition — no personal data) directly from your browser to **Anthropic's API**, using your key, to generate a fresh dilemma. In that case:

- The request goes **to Anthropic**, governed by Anthropic's own terms, and **the API usage is billed to you**.
- Your API key is stored **only on your device** (a local `velmora_live_key` entry), is never sent anywhere except your own API requests, and is never included in saves, exports, or error reports.
- It falls back to on-device content whenever you are offline, keyless, or over the per-run limit. Turning the toggle off stops all such requests.

## Children

VELMORA is fictional political satire rated for Teen / PEGI 12. It collects no data from anyone, including children.

## Contact

Questions about this policy can be directed to the project maintainer via the project repository.
