import { describe, it, expect } from 'vitest';
import {
  PROVINCE_ACTIONS,
  applyProvinceAction,
  setGovernor,
  canAct,
  actionsLeft,
} from '../../src/engine/world-actions';
import { ACTIONS_PER_TURN } from '../../src/engine/world-tick';
import type { GameState } from '../../src/engine/types';
import type { Province } from '../../src/engine/world';

function prov(over: Partial<Province> = {}): Province {
  return { id: 'p0', name: 'P', x: 0.5, y: 0.5, neighbors: [], control: 50, unrest: 40, development: 40, faction: 'a', capital: false, ...over };
}
function state(actions = ACTIONS_PER_TURN): GameState {
  return { realm: { provinces: [prov()], capitalId: 'p0' }, actionsLeft: actions } as unknown as GameState;
}

describe('province actions', () => {
  it('exposes the four imperial actions', () => {
    expect(PROVINCE_ACTIONS.map((a) => a.id)).toEqual(['develop', 'garrison', 'suppress', 'sway']);
  });

  it('actionsLeft defaults to the full budget when unset', () => {
    expect(actionsLeft({ realm: { provinces: [] } } as unknown as GameState)).toBe(ACTIONS_PER_TURN);
  });

  it('garrison raises control and spends one action', () => {
    const S = state(2);
    expect(applyProvinceAction(S, 'p0', 'garrison')).toBe(true);
    expect(S.realm?.provinces[0]?.control).toBe(60); // +10
    expect(S.actionsLeft).toBe(1);
  });

  it('develop, suppress, and sway each apply their effect', () => {
    const dev = state(2);
    applyProvinceAction(dev, 'p0', 'develop');
    expect(dev.realm?.provinces[0]?.development).toBe(48); // +8

    const sup = state(2);
    applyProvinceAction(sup, 'p0', 'suppress');
    expect(sup.realm?.provinces[0]?.unrest).toBe(26); // 40 - 14

    const sway = state(2);
    applyProvinceAction(sway, 'p0', 'sway');
    expect(sway.realm?.provinces[0]?.control).toBe(56); // +6
    expect(sway.realm?.provinces[0]?.unrest).toBe(36); // -4
  });

  it('refuses when the budget is spent', () => {
    const S = state(0);
    expect(canAct(S)).toBe(false);
    expect(applyProvinceAction(S, 'p0', 'garrison')).toBe(false);
    expect(S.realm?.provinces[0]?.control).toBe(50); // unchanged
  });

  it('refuses unknown province or action id', () => {
    const S = state(2);
    expect(applyProvinceAction(S, 'nope', 'garrison')).toBe(false);
    expect(applyProvinceAction(S, 'p0', 'nuke')).toBe(false);
    expect(S.actionsLeft).toBe(2); // no action spent on a rejected op
  });
});

describe('setGovernor', () => {
  it('sets a valid policy and clears with null (free — no action cost)', () => {
    const S = state(2);
    expect(setGovernor(S, 'p0', 'fortify')).toBe(true);
    expect(S.realm?.provinces[0]?.governor).toBe('fortify');
    expect(S.actionsLeft).toBe(2);
    expect(setGovernor(S, 'p0', null)).toBe(true);
    expect(S.realm?.provinces[0]?.governor).toBeNull();
  });

  it('rejects an unknown policy or province', () => {
    const S = state(2);
    expect(setGovernor(S, 'p0', 'tyranny')).toBe(false);
    expect(setGovernor(S, 'ghost', 'fortify')).toBe(false);
  });
});
