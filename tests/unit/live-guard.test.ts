import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Architectural quarantine for the online layer. The deterministic core
 * (src/engine) and the content data (src/content) must NEVER import src/live —
 * that is what keeps the seeded sweep + offline play wholly insulated from the
 * network path. Also enforces the secrets posture: no real Anthropic key literal
 * may ship in source.
 */
function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(ts|js)$/.test(name)) out.push(p);
  }
  return out;
}

const ROOT = join(__dirname, '..', '..', 'src');

describe('live layer is quarantined from the deterministic core', () => {
  it('src/engine never imports src/live', () => {
    for (const f of walk(join(ROOT, 'engine'))) {
      const src = readFileSync(f, 'utf8');
      expect(/from ['"][^'"]*\/live(['"/])/.test(src), `${f} imports src/live`).toBe(false);
    }
  });

  it('src/content never imports src/live', () => {
    for (const f of walk(join(ROOT, 'content'))) {
      const src = readFileSync(f, 'utf8');
      expect(/from ['"][^'"]*\/live(['"/])/.test(src), `${f} imports src/live`).toBe(false);
    }
  });
});

describe('secrets posture', () => {
  it('no real Anthropic API key literal ships in src', () => {
    for (const f of walk(ROOT)) {
      const src = readFileSync(f, 'utf8');
      // A real key is sk-ant-<long suffix>; the placeholder "sk-ant-..." is fine.
      expect(/sk-ant-[A-Za-z0-9_-]{8,}/.test(src), `${f} contains a real key literal`).toBe(false);
    }
  });
});
