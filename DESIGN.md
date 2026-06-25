# VELMORA — Design tokens

Two surfaces share one riso-print identity:

- **The game** (`/`) — the in-app riso-propaganda system (see `src/styles.css`).
- **The Herald landing** (`/herald`) — a satirical newspaper front page, "Midnight Edition" palette (`herald.html` + `src/landing/`).

## The Velmora Herald — "Midnight Edition"

Noir broadsheet: dark page, cream "photo" cards (so cartoons always read), spot red + gold.

| Token                         | Value                                        | Use                                                          |
| ----------------------------- | -------------------------------------------- | ------------------------------------------------------------ |
| `--paper`                     | `#15121E`                                    | page background (ink-violet near-black)                      |
| `--paper-2` / `--paper-3`     | `#EADEBF` / `#DFD0AC`                        | cream cards behind caricatures (kept light in every variant) |
| `--ink`                       | `#F2E8CE`                                    | body + headlines (cream)                                     |
| `--ink-soft`                  | `#B8AECB`                                    | bylines, captions, meta                                      |
| `--red`                       | `#E5604F`                                    | spot accent, hero `em`, masthead shadow                      |
| `--gold` / `--gold-br`        | `#9A6B05` (AA text) / `#E0A82E` (decorative) | rules, jewels, emblem                                        |
| `--blue` `--green` `--violet` | `#2E5BC8` `#2E7D52` `#5B3FA6`                | per-road accents (Ballot / Gilded / Anointed)                |
| `--bw` / `--bw-hair`          | `3px` / `1.5px`                              | ink strokes                                                  |
| `--shadow`                    | `6px 6px 0 #000`                             | hard riso offset shadow                                      |

**Type:** `UnifrakturCook` (blackletter masthead) · `Anton` (headlines) · `Lora` (newsprint body, 400/600/700 + italic) · `Space Mono` (kickers, bylines, ticker). All **self-hosted** via `@fontsource` (no CDN — the production CSP blocks external fonts).

**Texture:** halftone dot field (`radial-gradient`, `7px` grid); double/hairline ink rules; misregister offset shadows.

**Variants** (token swaps only, in `~/.gstack/projects/.../designs/landing-20260624/`): A Cream Broadsheet (adaptive light/dark), B Midnight (shipped), C Sepia Antique.

## Component vocabulary (Herald)

Class/attribute driven, framework-portable: `.masthead`, `.hero`, `.ticker`, `.column[data-road]` (themeable op-ed card), `.dispatch`, `.editorial`, `.classifieds`, `.btn`/`.btn--primary`, `[data-pretext]` (computed resize/edit-aware text), and an SVG `<symbol>` caricature library reused via `<use>`. States handled: font-loading gate, no-JS, no-Pretext, reveal safety net, empty ticker, reduced-motion, responsive 375/768/1024/1440.

## Hard constraints (both surfaces)

Offline-capable, no-backend, CSP-clean (no inline scripts, self-hosted fonts), WCAG 2.1 AA, deterministic seeded core (game). The game is the app at `/`; the Herald is a static marketing page at `/herald` (network-first in the SW, so it isn't hijacked by the game shell).
