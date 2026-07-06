import { describe, it, expect } from 'vitest';
import { pressSlant, organName, pickHeadlines } from '../../src/content/headlines';
import type { GameState } from '../../src/engine/types';

/** Minimal state for the pure, RNG-free press-slant logic (G4). */
function state(over: Record<string, unknown> = {}): GameState {
  return {
    player: { name: 'Dana Marlowe' },
    path: 'iron',
    totalTurns: 4,
    stats: { heat: 20, media: 20, support: 50, funds: 50, influence: 50, base: 50 },
    flags: {},
    ...over,
  } as unknown as GameState;
}

describe('G4 — the paper\'s slant', () => {
  it('is a free press by default', () => {
    expect(pressSlant(state())).toBe('free');
  });

  it('becomes your organ once you build a cult', () => {
    expect(pressSlant(state({ flags: { own_cult: true } }))).toBe('organ');
  });

  it('becomes your organ with captured media on an authoritarian path', () => {
    expect(pressSlant(state({ path: 'iron', stats: { heat: 20, media: 70 } }))).toBe('organ');
    // ...but not on the ballot path (a free press resists capture by media share alone)
    expect(pressSlant(state({ path: 'ballot', stats: { heat: 20, media: 70 } }))).toBe('free');
  });

  it('is censored when the press is captured AND dissent is being crushed', () => {
    expect(pressSlant(state({ flags: { own_cult: true }, stats: { heat: 82, media: 20 } }))).toBe(
      'censored',
    );
  });

  it('names the organ per path', () => {
    expect(organName(state({ path: 'iron' }))).toMatch(/IRON/);
    expect(organName(state({ path: 'vanguard' }))).toMatch(/VANGUARD/);
  });

  it('the organ prints only fawning praise', () => {
    const h = pickHeadlines(state({ flags: { own_cult: true } }));
    expect(h.some((x) => /praised|greatest|gratitude|magnificent|tireless/.test(x))).toBe(true);
  });

  it('the censored crawl comes back redacted', () => {
    const h = pickHeadlines(state({ flags: { own_cult: true }, stats: { heat: 82, media: 20 } }));
    expect(h.some((x) => x.includes('█'))).toBe(true);
  });

  it('is deterministic — same state, same crawl (no RNG)', () => {
    const s = state({ flags: { own_cult: true } });
    expect(pickHeadlines(s)).toEqual(pickHeadlines(s));
  });
});
