import { describe, it, expect } from 'vitest';
import { traitRollBonus, traitHeatDecayBonus, traitContestBonus } from '../../src/engine/perks';

describe('trait perks', () => {
  it('lends a roll bonus only on the trait’s signature stats', () => {
    expect(traitRollBonus('orator', 'media')).toBe(8);
    expect(traitRollBonus('orator', 'support')).toBe(8);
    expect(traitRollBonus('orator', 'funds')).toBe(0);
    expect(traitRollBonus('operator', 'influence')).toBe(8);
    expect(traitRollBonus('operator', 'base')).toBe(8);
    expect(traitRollBonus('rainmaker', 'funds')).toBe(8);
    expect(traitRollBonus('clean', 'media')).toBe(0);
    expect(traitRollBonus(undefined, 'media')).toBe(0);
    expect(traitRollBonus('unknown', 'media')).toBe(0);
  });

  it('gives the clean trait extra heat decay only', () => {
    expect(traitHeatDecayBonus('clean')).toBe(1);
    expect(traitHeatDecayBonus('orator')).toBe(0);
    expect(traitHeatDecayBonus(undefined)).toBe(0);
  });

  it('lends a contest edge to the matching promotion type', () => {
    expect(traitContestBonus('operator', 'powerplay')).toBe(4);
    expect(traitContestBonus('operator', 'election')).toBe(0);
    expect(traitContestBonus('rainmaker', 'election')).toBe(4);
    expect(traitContestBonus('orator', 'election')).toBe(4);
    expect(traitContestBonus('orator', 'powerplay')).toBe(0);
    expect(traitContestBonus('clean', 'election')).toBe(0);
    expect(traitContestBonus(undefined, 'election')).toBe(0);
  });
});
