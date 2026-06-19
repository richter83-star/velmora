import { describe, it, expect } from 'vitest';
import { EVENTS } from '../../src/content/events';
import { validateContent } from '../../src/content/lint';

describe('content validation', () => {
  const result = validateContent(EVENTS);

  it('passes all content checks', () => {
    expect(result.errors, `content errors:\n${result.errors.join('\n')}`).toEqual([]);
  });

  it('has a non-trivial event bank', () => {
    expect(EVENTS.length).toBeGreaterThanOrEqual(20);
  });

  it('every event id is unique', () => {
    expect(new Set(EVENTS.map((e) => e.id)).size).toBe(EVENTS.length);
  });
});
