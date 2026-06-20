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
];
