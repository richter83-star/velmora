import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { scanCore } from '../../src/content/denylist';

/**
 * Boundary gate for the NON-event prose surfaces (Overhaul P7). The event banks
 * are already CORE-scanned by validate.test, and the Loom realizations by
 * weave-safety.test — but the endings, the ticker headlines, and the raw Loom
 * template/lexicon prose are authored outside those nets. This pins them to the
 * same CORE red lines (real ideologies/regimes/figures/religions/symbols + explicit
 * pornography) so the savage TV-MA wording can never drift into a banned token.
 *
 * It scans the SOURCE text (not just runtime output): authored strings AND the
 * surrounding comments must stay clean, which is the strictest, simplest gate.
 */
const SURFACES = [
  '../../src/engine/endings.ts',
  '../../src/engine/endings-traits.ts',
  '../../src/content/headlines.ts',
  '../../src/content/templates.ts',
  '../../src/engine/grammar/lexicons.ts',
];

describe('content boundary — non-event prose surfaces stay inside the CORE red lines', () => {
  for (const rel of SURFACES) {
    it(`${rel.split('/').pop()} trips no real-name / porn token`, () => {
      const text = readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');
      const hits = scanCore(text);
      expect(hits, JSON.stringify(hits)).toEqual([]);
    });
  }
});
