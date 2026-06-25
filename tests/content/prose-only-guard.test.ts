import { describe, it, expect } from 'vitest';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL_EVENTS } from '../../src/content/all-events';
import { buildSkeletons } from './skeleton';

/**
 * Prose-only diff-guard (Overhaul P4). Pins the STRUCTURAL skeleton of all 357
 * events to a committed baseline so the TV-MA prose rewrite can change wording
 * freely while any change to ids/fx/rolls/flags/logic fails loudly — which keeps
 * saves loadable and the seeded sweep byte-identical.
 *
 * The baseline was captured from the PRE-rewrite content. Regenerate ONLY for an
 * intentional structural change:  UPDATE_SKELETONS=1 npx vitest run prose-only-guard
 */
const fixturePath = fileURLToPath(new URL('./__fixtures__/event-skeletons.json', import.meta.url));
const live = buildSkeletons(ALL_EVENTS);

if (process.env.UPDATE_SKELETONS === '1' || !existsSync(fixturePath)) {
  mkdirSync(dirname(fixturePath), { recursive: true });
  writeFileSync(fixturePath, JSON.stringify(live, null, 2) + '\n');
}

const baseline = JSON.parse(readFileSync(fixturePath, 'utf8')) as Record<string, unknown>;

describe('prose-only diff-guard', () => {
  it('preserves the exact set of event ids (no adds, removes, or renames)', () => {
    expect(Object.keys(live).sort()).toEqual(Object.keys(baseline).sort());
  });

  it('keeps every non-prose field byte-identical to the baseline skeleton', () => {
    // A failure here means a rewrite touched mechanics/structure, not just words.
    expect(live).toEqual(baseline);
  });
});
