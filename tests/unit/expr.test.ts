import { describe, it, expect } from 'vitest';
import { speakerExpr } from '../../src/render/expr';

describe('speakerExpr', () => {
  it('maps each print-genre to a plausible expression', () => {
    expect(speakerExpr('crisis')).toEqual({ expr: 'worried', sweat: true });
    expect(speakerExpr('rival')).toEqual({ expr: 'smug', sweat: false });
    expect(speakerExpr('bulletin')).toEqual({ expr: 'neutral', sweat: false });
    expect(speakerExpr('scene')).toEqual({ expr: 'neutral', sweat: false });
  });

  it('falls back to neutral for an unknown or missing genre', () => {
    expect(speakerExpr(undefined)).toEqual({ expr: 'neutral', sweat: false });
    expect(speakerExpr('nonsense')).toEqual({ expr: 'neutral', sweat: false });
  });

  it('honors a valid author override over the genre', () => {
    expect(speakerExpr('crisis', 'angry')).toEqual({ expr: 'angry', sweat: false });
    expect(speakerExpr('scene', 'worried')).toEqual({ expr: 'worried', sweat: true });
  });

  it('ignores an invalid override and uses the genre', () => {
    expect(speakerExpr('rival', 'evil')).toEqual({ expr: 'smug', sweat: false });
    expect(speakerExpr('rival', 42)).toEqual({ expr: 'smug', sweat: false });
  });
});
