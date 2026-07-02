import type { GameEvent } from '../engine/types';
import { EVENTS } from './events';
import { ARC_EVENTS } from './arcs';
import { NPC_EVENTS } from './npc-events';
import { SCANDAL_EVENTS } from './scandals';
import { PACK_1 } from './events-pack-1';
import { PACK_2 } from './events-pack-2';
import { PACK_3 } from './events-pack-3';
import { PACK_4 } from './events-pack-4';
import { PACK_5 } from './events-pack-5';
import { PACK_6 } from './events-pack-6';
import { PACK_7 } from './events-pack-7';
import { PACK_8 } from './events-pack-8';
import { PACK_9 } from './events-pack-9';
import { CRISIS_SUB_EVENTS } from './crisis-subs';
import { IRON_EVENTS } from './events-iron';
import { GILDED_EVENTS } from './events-gilded';
import { ANOINTED_EVENTS } from './events-anointed';
import { SHARED_CRISES } from './events-shared';
import { WORLD_EVENTS } from './events-world';

/**
 * The full draw pool: the base bank plus every content pack. Single source of
 * truth used by both the live engine (main.js) and the headless simulator, so
 * the game and the seed sweep draw from an identical set.
 */
export const ALL_EVENTS: GameEvent[] = [
  ...EVENTS,
  ...ARC_EVENTS,
  ...NPC_EVENTS,
  ...SCANDAL_EVENTS,
  ...PACK_1,
  ...PACK_2,
  ...PACK_3,
  ...PACK_4,
  ...PACK_5,
  ...PACK_6,
  ...PACK_7,
  ...PACK_8,
  ...PACK_9,
  ...CRISIS_SUB_EVENTS,
  // Dark Mirrors expansion — per-path seed banks + shared crises.
  ...IRON_EVENTS,
  ...GILDED_EVENTS,
  ...ANOINTED_EVENTS,
  ...SHARED_CRISES,
  // Civ P4 — world-loop events (realmFx + realm-gated; the map and deck feed each other).
  ...WORLD_EVENTS,
];

// Loom generative-grammar templates ride the same lazy chunk, so loadBank()
// gets the bank + templates in ONE dynamic import (no extra round-trip).
export { TEMPLATES } from './templates';
