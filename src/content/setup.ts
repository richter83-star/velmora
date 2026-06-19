import type { DifficultyDef, ModifierDef } from '../engine/types';

export const DEFAULT_DIFFICULTY = 'standard';

export const DIFFICULTIES: DifficultyDef[] = [
  {
    id: 'storyteller',
    name: 'Storyteller',
    desc: 'A gentler climb — a stronger start and softer rivals.',
    startStat: 6,
    oppBonus: -8,
    crisisMult: 0.7,
    scandalMult: 0.7,
  },
  {
    id: 'standard',
    name: 'Standard',
    desc: 'The intended balance of ambition and risk.',
    startStat: 0,
    oppBonus: 0,
    crisisMult: 1,
    scandalMult: 1,
  },
  {
    id: 'ironclad',
    name: 'Ironclad',
    desc: 'A brutal ascent — a weaker start, ruthless rivals, and long memories.',
    startStat: -5,
    oppBonus: 8,
    crisisMult: 1.35,
    scandalMult: 1.4,
  },
];

/**
 * Per-run modifiers — rolled from the run seed at career start for roguelike
 * variety. A mix of boons and burdens so no two careers begin the same way.
 */
export const MODIFIERS: ModifierDef[] = [
  {
    id: 'inherited_debt',
    name: 'Inherited Debt',
    desc: 'Your predecessor left the books a smoking ruin.',
    fx: { funds: -16 },
  },
  {
    id: 'golden_start',
    name: 'Golden Start',
    desc: 'You arrive with the wind firmly at your back.',
    fx: { support: 12, media: 6 },
  },
  {
    id: 'charismatic_rival',
    name: 'A Charismatic Rival',
    desc: 'Your nemesis is dangerously, infuriatingly likeable.',
    antagonistRel: -25,
  },
  {
    id: 'old_skeleton',
    name: 'A Skeleton in the Closet',
    desc: 'Something from before is already buried — shallowly.',
    scandalSeed: { id: 'old_skeleton', label: 'a buried secret from your past', severity: 3 },
  },
  {
    id: 'clean_hands',
    name: 'Spotless Record',
    desc: 'You begin with nothing whatsoever to hide.',
    fx: { heat: -10 },
    flags: { clean_streak: true },
  },
  {
    id: 'machine_backing',
    name: 'The Machine Backs You',
    desc: 'The party apparatus is, for now, on your side.',
    fx: { influence: 10, base: 6 },
  },
  {
    id: 'media_target',
    name: 'In the Crosshairs',
    desc: 'The press has decided, early, that you are interesting.',
    fx: { heat: 8, media: 6 },
  },
];
