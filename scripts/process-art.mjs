#!/usr/bin/env node
/**
 * Art-processing pipeline (Overhaul P2).
 *
 * Resizes a raw generated portrait (any format sharp reads) into the two web
 * formats the portrait resolver serves — avif (the <img> src) and webp (the
 * <picture><source> fallback) — tuning quality DOWN until each file lands under
 * the per-file asset budget. This is the reproducible counterpart to the manual
 * step that produced public/art/iron/provost.{webp,avif}; reuse it for the rest
 * of the cast (P5) so every shipped portrait passes `npm run size` by construction.
 *
 * Usage:
 *   node scripts/process-art.mjs <src> <outDir> <name> [size=416] [targetBytes=23000]
 * Example:
 *   node scripts/process-art.mjs ./raw/provost.png public/art/iron provost
 *
 * Requires the `sharp` devDependency. The art files themselves never enter the
 * JS bundle — they ship under public/art/ and are runtime-cached by the SW.
 */
import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'node:fs';

const [, , SRC, OUTDIR, NAME = 'portrait', SIZE = '416', TARGET = '23000'] = process.argv;

if (!SRC || !OUTDIR) {
  console.error('usage: node scripts/process-art.mjs <src> <outDir> <name> [size] [targetBytes]');
  process.exit(1);
}

const size = Number(SIZE);
const target = Number(TARGET); // headroom under the 25kB/file gate in check-size.mjs
const HARD_FAIL = 25_000;

mkdirSync(OUTDIR, { recursive: true });

// Top-anchored square cover keeps the head-and-shoulders framing of a portrait.
const base = sharp(SRC).resize(size, size, { fit: 'cover', position: 'top' });

async function encode(fmt, make) {
  let q = 80;
  let buf = await make(q);
  while (buf.length > target && q > 30) {
    q -= 5;
    buf = await make(q);
  }
  const file = `${OUTDIR}/${NAME}.${fmt}`;
  writeFileSync(file, buf);
  const tag = buf.length <= HARD_FAIL ? 'OK' : 'OVER-BUDGET';
  console.log(`${fmt}: ${buf.length} bytes @ q${q}  ${tag}  -> ${file}`);
  return buf.length <= HARD_FAIL;
}

const okWebp = await encode('webp', (q) => base.clone().webp({ quality: q, effort: 6 }).toBuffer());
const okAvif = await encode('avif', (q) => base.clone().avif({ quality: q, effort: 6 }).toBuffer());

if (!okWebp || !okAvif) {
  console.error('process-art: a file exceeded the 25kB per-file budget — lower --size or --target.');
  process.exit(1);
}
