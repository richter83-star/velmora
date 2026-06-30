import { describe, it, expect } from 'vitest';
import { deriveHints } from '../../src/render/hints';

describe('deriveHints (vague decision hints)', () => {
  it('emits NO numbers and NO stat names — only thematic signals', () => {
    const hints = deriveHints({ fx: { influence: 14, base: 8, heat: 6 } });
    const joined = hints.map((h) => h.text).join(' ');
    expect(joined).not.toMatch(/\d/); // no digits
    expect(joined.toLowerCase()).not.toMatch(/cohesion|influence|exposure|heat|funds|support|media|base/);
  });

  it('surfaces at most the two strongest pulls, strongest first', () => {
    const hints = deriveHints({ fx: { influence: 14, base: 8, heat: 6 } }).filter((h) => h.cls === 'up' || h.cls === 'down');
    expect(hints).toHaveLength(2);
    expect(hints[0].text).toBe('your grip tightens'); // influence +14 dominant
    expect(hints[1].text).toBe('the faithful surge'); // base +8 next
  });

  it('colors a rise good or bad by the stat, and inverts heat', () => {
    expect(deriveHints({ fx: { support: 5 } })[0]).toEqual({ cls: 'up', text: 'the crowd warms' });
    expect(deriveHints({ fx: { support: -5 } })[0]).toEqual({ cls: 'down', text: 'the crowd sours' });
    // heat rising is BAD (down/red), heat falling is GOOD (up/green)
    expect(deriveHints({ fx: { heat: 9 } })[0]).toEqual({ cls: 'down', text: 'the heat rises' });
    expect(deriveHints({ fx: { heat: -9 } })[0]).toEqual({ cls: 'up', text: 'the heat fades' });
  });

  it('adds a risk marker for a gamble, before the signals', () => {
    const hints = deriveHints({ roll: { stat: 'media' }, fx: { support: 10 } });
    expect(hints[0]).toEqual({ cls: 'risk', text: '⚡ a gamble' });
    expect(hints.some((h) => h.text === 'the crowd warms')).toBe(true);
  });

  it('shows a lock with its reqText when locked, ahead of everything', () => {
    const hints = deriveHints({ reqText: 'Needs the Officer Corps', fx: { base: 5 } }, { locked: true });
    expect(hints[0]).toEqual({ cls: 'lock', text: '🔒 Needs the Officer Corps' });
  });

  it('passes an author hint through as a note', () => {
    const hints = deriveHints({ hint: 'irreversible' });
    expect(hints).toContainEqual({ cls: 'note', text: 'irreversible' });
  });

  it('returns nothing for a choice with no fx, roll, lock, or hint', () => {
    expect(deriveHints({})).toEqual([]);
  });
});
