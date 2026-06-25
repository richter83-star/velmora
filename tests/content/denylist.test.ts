import { describe, it, expect } from 'vitest';
import { scanCore, scanStrict } from '../../src/content/denylist';

/**
 * The Mature (TV-MA) boundary, as an executable spec (Overhaul P3). The gate
 * blocks TOKENS for four red-line families and otherwise lets the savage adult
 * voice through. This suite is what the P4 prose rewrite is validated against.
 */
describe('content boundary — TV-MA is ALLOWED (gate must NOT fire)', () => {
  const allowed = [
    'This fucking shitshow of a regime can eat my entire ass.',
    'The minister is a spineless, bootlicking piece of garbage and everyone knows it.',
    'A crude, innuendo-laced smear campaign — naked ambition, no actual nudity.',
    'You bribe the bastard, gut the budget, and let the rats fight over the scraps.',
    'A grotesque, gross-out scandal about the Provost vomiting on live television.',
  ];
  for (const text of allowed) {
    it(`passes profanity/crude satire: "${text.slice(0, 32)}…"`, () => {
      // Arrange / Act
      const core = scanCore(text);
      const strict = scanStrict(text);
      // Assert — allowed content trips NEITHER tier
      expect(core, JSON.stringify(core)).toEqual([]);
      expect(strict, JSON.stringify(strict)).toEqual([]);
    });
  }
});

describe('content boundary — explicit porn FIRES in BOTH tiers', () => {
  const porn = [
    'an explicit blowjob scene',
    'graphic creampie pornography',
    'he was masturbating furiously',
    'a hardcore sex tape with a cumshot',
  ];
  for (const text of porn) {
    it(`blocks "${text}" in CORE and STRICT`, () => {
      expect(scanCore(text).length).toBeGreaterThan(0);
      expect(scanStrict(text).length).toBeGreaterThan(0);
    });
  }
});

describe('content boundary — real-religion mockery FIRES in CORE', () => {
  for (const text of [
    'A cheap joke mocking Islam',
    'a sneer at Christianity',
    'a jab at Buddhism',
  ]) {
    it(`blocks "${text}"`, () => {
      expect(scanCore(text).length).toBeGreaterThan(0);
    });
  }
});

describe('content boundary — sexualising a real public figure FIRES in STRICT only', () => {
  it('blocks "the pope, naked and aroused" in STRICT', () => {
    const text = 'the pope, naked and aroused on the balcony';
    expect(scanStrict(text).length).toBeGreaterThan(0);
  });
  it('does NOT block a fictional Velmora office in mild-sexual crude satire (CORE clean)', () => {
    // "governor"/"president" are fictional game offices — not real-world honorifics.
    const text = 'the sexy Governor of Velmora flirts shamelessly with the press';
    expect(scanCore(text)).toEqual([]);
  });
});

describe('content boundary — STRICT is a strict superset of CORE', () => {
  it('every CORE hit is also a STRICT hit', () => {
    for (const text of ['Praise Stalin', 'a blowjob', 'the swastika ☭', 'mocking Islam']) {
      expect(scanStrict(text).length).toBeGreaterThanOrEqual(scanCore(text).length);
    }
  });
});
