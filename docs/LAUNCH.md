# VELMORA — Launch Checklist (v1.0.0, core game)

The core game is feature-complete and CI-green. This is the gate before the
public web launch. (Per product direction, a **UX/UI redesign** and then the
**"Dark Mirrors" expansion** follow this release — see `EXPANSION_BRIEF.md`.)

## Pre-merge

- [x] All CI jobs green on `phase-1-foundation` (verify · E2E · Lighthouse-advisory).
- [x] Engine coverage gated ≥80%; 120-seed/path sweep with no-soft-lock bound.
- [x] Bundle-size budget enforced (`npm run size`): initial JS ~32.6 kB gzip.
- [x] axe clean on all key screens; keyboard-only playable; reduced-motion honored.
- [x] PWA installable + fully offline (offline E2E).
- [x] Content fictional / non-partisan; no real people, parties, or ideologies named.
- [ ] Merge PR #1 → `main` (squash or merge per preference).
- [ ] Tag `v1.0.0`.

## Deploy

- [ ] **Vercel:** `vercel --prod` (build `npm run build`, output `dist/`). Set the
      custom domain in the dashboard.
- [ ] **Traefik/nginx:** build, mount `dist/` read-only, route the host rule.
- [ ] After the domain is set, finalize absolute URLs: add `<link rel="canonical">`
      and `og:url`/`twitter` absolute image URLs (currently relative); optionally add
      a 1200×630 social card and a `sitemap.xml`.
- [ ] Verify the deployed URL: installs as a PWA, runs offline after first load,
      both paths reach an ending, saves persist across reloads.

## Post-deploy verification

- [ ] Run Lighthouse against the **production URL** (not the flaky CI static run):
      confirm Performance / Accessibility / Best-Practices / SEO / PWA all ≥90.
      (CI Lighthouse is advisory due to a headless `NO_FCP` flake; the deterministic
      perf guard is the bundle-size budget.)
- [ ] Spot-check social-card preview (OG) once absolute URLs are set.
- [ ] Confirm `robots.txt` served and privacy/terms links wired (UI link deferred
      to the redesign; drafts live in `docs/legal/`).

## Deferred to later stages (not launch blockers)

- Native store packaging (TWA / MS Store / itch) — web-only for this release.
- Real purchase flow for the paid expansion (entitlement scaffold is in place,
  default-unlocked in dev).
- i18n externalization — deferred to after the redesign (it reworks UI strings).
- Self-hosted/subset fonts (currently Google Fonts CDN).
