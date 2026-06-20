#!/usr/bin/env node
/**
 * Zero-dependency bundle-budget gate (Phase 9).
 *
 * Measures gzipped transfer sizes of the built assets and fails CI when the
 * INITIAL JS entry chunk (the one referenced by index.html), the total JS, or
 * the CSS exceed their budgets. gzip is the metric that matters for transfer;
 * source maps (*.map) are never counted (they are not loaded by clients).
 *
 * Run after `npm run build`:  node scripts/check-size.mjs
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

// --- Budgets (gzip bytes). FAIL is a hard CI gate; WARN is advisory. ---
const BUDGET = {
  initialJsFail: 70_000, // the eager entry chunk (engine+UI; bank is lazy-loaded)
  totalJsFail: 300_000, // all JS chunks combined (web/performance.md app budget)
  cssWarn: 15_000,
  cssFail: 30_000,
  chunkWarn: 90_000, // any single non-entry JS chunk (e.g. the content bank)
};

const DIST = 'dist';
const ASSETS = join(DIST, 'assets');

function gz(path) {
  return gzipSync(readFileSync(path), { level: 9 }).length;
}
function kb(n) {
  return (n / 1000).toFixed(1) + ' kB';
}

if (!existsSync(DIST) || !existsSync(ASSETS)) {
  console.error('check-size: no dist/assets — run `npm run build` first.');
  process.exit(1);
}

const html = readFileSync(join(DIST, 'index.html'), 'utf8');
const entryMatch = html.match(/src="([^"]*\/assets\/[^"]+\.js)"/);
const entryName = entryMatch ? entryMatch[1].split('/').pop() : null;

const jsFiles = readdirSync(ASSETS).filter((f) => f.endsWith('.js'));
const cssFiles = readdirSync(ASSETS).filter((f) => f.endsWith('.css'));

let failed = false;
const rows = [];

// Entry (initial) JS.
let totalJs = 0;
for (const f of jsFiles) {
  const size = gz(join(ASSETS, f));
  totalJs += size;
  const isEntry = f === entryName;
  let status = 'ok';
  if (isEntry && size > BUDGET.initialJsFail) {
    status = 'FAIL';
    failed = true;
  } else if (!isEntry && size > BUDGET.chunkWarn) {
    status = 'warn';
  }
  rows.push([isEntry ? `${f} (entry)` : f, kb(size), status]);
}

// CSS.
let totalCss = 0;
for (const f of cssFiles) {
  const size = gz(join(ASSETS, f));
  totalCss += size;
  let status = 'ok';
  if (size > BUDGET.cssFail) {
    status = 'FAIL';
    failed = true;
  } else if (size > BUDGET.cssWarn) {
    status = 'warn';
  }
  rows.push([f, kb(size), status]);
}

// Totals.
let totalStatus = 'ok';
if (totalJs > BUDGET.totalJsFail) {
  totalStatus = 'FAIL';
  failed = true;
}

console.log('\nBundle budget (gzip):');
for (const [name, size, status] of rows) {
  const mark = status === 'FAIL' ? ' ✗ FAIL' : status === 'warn' ? ' ⚠ warn' : '';
  console.log(`  ${size.padStart(9)}  ${name}${mark}`);
}
console.log(`  ${'—'.repeat(9)}`);
console.log(
  `  ${kb(totalJs).padStart(9)}  total JS${totalStatus === 'FAIL' ? ' ✗ FAIL' : ''}  (budget ${kb(BUDGET.totalJsFail)})`,
);
console.log(`  ${kb(totalCss).padStart(9)}  total CSS`);
console.log(
  `\n  initial JS budget: ${kb(BUDGET.initialJsFail)} (entry chunk) · ${entryName ?? '??'}\n`,
);

if (failed) {
  console.error('check-size: BUDGET EXCEEDED — see ✗ above.');
  process.exit(1);
}
console.log('check-size: all budgets OK.');
