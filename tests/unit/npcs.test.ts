import { describe, it, expect } from 'vitest';
import {
  getNpc,
  antagonist,
  applyNpcFx,
  antagonistContestModifier,
  dispositionLabel,
} from '../../src/engine/npcs';
import type { GameState, NPC } from '../../src/engine/types';

function makeNpc(over: Partial<NPC> = {}): NPC {
  return {
    id: 'antagonist',
    name: 'Kron',
    role: 'rival',
    kind: 'antagonist',
    avatar: '',
    relationship: -35,
    loyalty: 0,
    met: false,
    firstPhase: 1,
    ...over,
  };
}

function stateWith(npcs: Record<string, NPC>, antagonistId = 'antagonist'): GameState {
  return { npcs, antagonistId } as unknown as GameState;
}

describe('npc roster', () => {
  it('getNpc returns the NPC or undefined', () => {
    const s = stateWith({ antagonist: makeNpc() });
    expect(getNpc(s, 'antagonist')?.name).toBe('Kron');
    expect(getNpc(s, 'nobody')).toBeUndefined();
  });

  it('antagonist() resolves the recurring antagonist', () => {
    const s = stateWith({ antagonist: makeNpc({ name: 'Vasiliev' }) });
    expect(antagonist(s)?.name).toBe('Vasiliev');
  });

  it('applyNpcFx adjusts and clamps relationship, marks met', () => {
    const npc = makeNpc({ relationship: -35, met: false });
    const s = stateWith({ antagonist: npc });
    applyNpcFx(s, { id: 'antagonist', relationship: 20 });
    expect(npc.relationship).toBe(-15);
    expect(npc.met).toBe(true);
    applyNpcFx(s, { id: 'antagonist', relationship: -200 });
    expect(npc.relationship).toBe(-100);
    applyNpcFx(s, { id: 'antagonist', relationship: 1000 });
    expect(npc.relationship).toBe(100);
  });

  it('applyNpcFx clamps loyalty to 0..100', () => {
    const npc = makeNpc({ loyalty: 50 });
    const s = stateWith({ antagonist: npc });
    applyNpcFx(s, { id: 'antagonist', loyalty: 80 });
    expect(npc.loyalty).toBe(100);
    applyNpcFx(s, { id: 'antagonist', loyalty: -200 });
    expect(npc.loyalty).toBe(0);
  });

  it('applyNpcFx is a safe no-op for undefined fx or unknown npcs', () => {
    const s = stateWith({ antagonist: makeNpc() });
    expect(() => applyNpcFx(s, undefined)).not.toThrow();
    expect(() => applyNpcFx(s, { id: 'ghost', relationship: 5 })).not.toThrow();
  });
});

describe('antagonist contest mechanic', () => {
  it('hostile rivals raise difficulty, thawed rivals lower it', () => {
    expect(antagonistContestModifier(-100)).toBe(15);
    expect(antagonistContestModifier(0)).toBe(0);
    expect(antagonistContestModifier(100)).toBe(-15);
    expect(antagonistContestModifier(-35)).toBe(5);
  });

  it('is monotonic: more hostile means at least as hard', () => {
    expect(antagonistContestModifier(-50)).toBeGreaterThan(antagonistContestModifier(-10));
    expect(antagonistContestModifier(10)).toBeLessThan(antagonistContestModifier(-10));
  });

  it('disposition label reflects relationship bands', () => {
    expect(dispositionLabel(-80)).toBe('a bitter enemy');
    expect(dispositionLabel(-35)).toBe('a hostile rival');
    expect(dispositionLabel(0)).toBe('a wary rival');
    expect(dispositionLabel(40)).toBe('a grudging peer');
    expect(dispositionLabel(80)).toBe('an unlikely ally');
  });
});
