import { describe, it, expect } from 'vitest';
import { getNpc, antagonist, applyNpcFx } from '../../src/engine/npcs';
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
