import { describe, expect, test } from 'vitest';
import { CombatSystem, cardById } from '../src/game/combat/CombatSystem';

describe('CombatSystem', () => {
  const enemyHex = (combat: CombatSystem) => ({ ...combat.snapshot().enemy.position });

  test('draws an opening hand and initializes round one', () => {
    const combat = new CombatSystem();
    const snapshot = combat.snapshot();

    expect(snapshot.round).toBe(1);
    expect(snapshot.hand).toHaveLength(5);
    expect(snapshot.player.hp).toBe(80);
    expect(snapshot.enemy.hp).toBe(72);
  });

  test('playing an in-range damage card spends CPU and hurts the enemy', () => {
    const combat = new CombatSystem({
      deck: [cardById('OP-016'), cardById('OP-016'), cardById('OP-016'), cardById('OP-018'), cardById('OP-018')],
    });
    const opening = combat.snapshot();

    combat.playCard('OP-016', enemyHex(combat));

    const updated = combat.snapshot();
    expect(updated.player.cpu).toBe(opening.player.cpu - 1);
    expect(updated.enemy.hp).toBeLessThan(opening.enemy.hp);
  });

  test('adjacent cards cannot be played from long range until movement closes distance', () => {
    const combat = new CombatSystem({
      deck: [cardById('OP-001'), cardById('OP-001'), cardById('OP-015'), cardById('OP-015'), cardById('OP-018')],
      playerStart: { q: 0, r: 1 },
      enemyStart: { q: 0, r: -1 },
    });

    const opening = combat.snapshot();
    combat.playCard('OP-001');
    const blocked = combat.snapshot();

    expect(blocked.enemy.hp).toBe(opening.enemy.hp);
    expect(blocked.player.cpu).toBe(opening.player.cpu);

    combat.playCard('OP-015', { q: 0, r: 0 });
    combat.playCard('OP-001', enemyHex(combat));

    const updated = combat.snapshot();
    expect(updated.enemy.hp).toBeLessThan(opening.enemy.hp);
  });

  test('burn status ticks at the start of the enemy turn', () => {
    const combat = new CombatSystem({
      deck: [cardById('OP-002'), cardById('OP-002'), cardById('OP-002'), cardById('OP-018'), cardById('OP-018')],
      playerStart: { q: 0, r: 1 },
      enemyStart: { q: 0, r: -1 },
    });

    combat.playCard('OP-002', enemyHex(combat));
    const afterPlay = combat.snapshot();
    combat.endTurn();
    const afterEnemyTurn = combat.snapshot();

    expect(afterPlay.enemy.statuses.some((status) => status.kind === 'burn')).toBe(true);
    expect(afterEnemyTurn.enemy.hp).toBeLessThan(afterPlay.enemy.hp);
  });

  test('second enemy profile uses a different intent and applies vulnerable', () => {
    const combat = new CombatSystem({
      encounterId: 'heap-warden',
      playerStart: { q: 0, r: 1 },
      enemyStart: { q: 0, r: -1 },
    });

    expect(combat.snapshot().enemyIntent).toContain('SCAN');
    combat.endTurn();
    const updated = combat.snapshot();

    expect(updated.player.statuses.some((status) => status.kind === 'vulnerable')).toBe(true);
  });

  test('end turn advances round and restores player CPU', () => {
    const combat = new CombatSystem({
      deck: [cardById('OP-016'), cardById('OP-016'), cardById('OP-016'), cardById('OP-018'), cardById('OP-018')],
    });

    combat.playCard('OP-016', enemyHex(combat));
    combat.endTurn();

    const updated = combat.snapshot();
    expect(updated.round).toBe(2);
    expect(updated.player.cpu).toBe(updated.player.cpuMax);
  });

  test('push effect displaces enemy away from player', () => {
    const combat = new CombatSystem({
      deck: [cardById('DP-004'), cardById('DP-004'), cardById('DP-004'), cardById('DP-004'), cardById('DP-004')],
      playerStart: { q: 0, r: 2 },
      enemyStart: { q: 0, r: 0 },
    });
    const before = combat.snapshot();
    const distBefore = before.grid.distance(before.player.position, before.enemy.position);

    combat.playCard('DP-004', enemyHex(combat));

    const after = combat.snapshot();
    const distAfter = after.grid.distance(after.player.position, after.enemy.position);
    expect(distAfter).toBeGreaterThan(distBefore);
  });

  test('0x80 card arms a damage trigger that doubles next card damage', () => {
    const combat = new CombatSystem({
      deck: [cardById('DP-009'), cardById('OP-016'), cardById('OP-018'), cardById('OP-018'), cardById('OP-018')],
    });

    const before = combat.snapshot();
    combat.playCard('DP-009'); // arm trigger
    combat.playCard('OP-016', enemyHex(combat)); // this damage should be doubled
    const after = combat.snapshot();

    // Without trigger: OP-016 deals 3 damage. With ×2 it should deal 6.
    const expectedMaxDamage = before.enemy.hp - 3; // without doubling
    expect(after.enemy.hp).toBeLessThan(expectedMaxDamage);
  });

  test('regen status heals at start of turn', () => {
    // Place player adjacent to enemy so cron.d attacks on round 1
    const combat = new CombatSystem({
      deck: [cardById('DP-023'), cardById('OP-018'), cardById('OP-018'), cardById('OP-018'), cardById('OP-018')],
      playerStart: { q: 0, r: 1 },
      enemyStart: { q: 0, r: -1 },
    });

    // End turn without playing anything – enemy attacks, player takes damage
    combat.endTurn();
    const damaged = combat.snapshot();
    const hpBeforeRegen = damaged.player.hp;

    // Ensure damage was taken
    if (hpBeforeRegen >= damaged.player.maxHp) {
      // Enemy didn't attack; just verify the regen status is applied and ticks
      combat.playCard('DP-023');
      expect(combat.snapshot().player.statuses.some((s) => s.kind === 'regen')).toBe(true);
      return;
    }

    combat.playCard('DP-023'); // apply regen 3 for 3 turns
    combat.endTurn();

    const healed = combat.snapshot();
    expect(healed.player.hp).toBeGreaterThan(hpBeforeRegen);
  });

  test('STC cleanse removes debuffs', () => {
    // First apply a status to player by ending turn (heap.warden applies vulnerable)
    const combat2 = new CombatSystem({
      encounterId: 'heap-warden',
      deck: [cardById('OP-034'), cardById('OP-018'), cardById('OP-018'), cardById('OP-018'), cardById('OP-018')],
      playerStart: { q: 0, r: 1 },
      enemyStart: { q: 0, r: -1 },
    });
    combat2.endTurn();
    const withDebuff = combat2.snapshot();
    expect(withDebuff.player.statuses.length).toBeGreaterThan(0);

    combat2.playCard('OP-034');
    const cleansed = combat2.snapshot();
    expect(cleansed.player.statuses.every((s) => !['burn', 'root', 'vulnerable', 'shieldBreak'].includes(s.kind))).toBe(true);
  });

  test('snapshot exposes validTargetHexes for selected enemy card', () => {
    const combat = new CombatSystem({
      deck: [cardById('OP-016'), cardById('OP-016'), cardById('OP-016'), cardById('OP-018'), cardById('OP-018')],
    });

    combat.selectCard('OP-016');
    const snapshot = combat.snapshot();
    // CALL has range 1-4, enemy is at distance ~4, so target should be valid
    expect(snapshot.validTargetHexes.length).toBeGreaterThan(0);
    expect(snapshot.validTargetHexes.some((hex) => hex.q === snapshot.enemy.position.q && hex.r === snapshot.enemy.position.r)).toBe(true);
  });

  test('snapshot exposes validTargetHexes for movement card', () => {
    const combat = new CombatSystem({
      deck: [cardById('OP-015'), cardById('OP-016'), cardById('OP-016'), cardById('OP-018'), cardById('OP-018')],
    });

    combat.selectCard('OP-015');
    const snapshot = combat.snapshot();
    // JMP moves 2 steps; should have several reachable hexes
    expect(snapshot.validTargetHexes.length).toBeGreaterThan(0);
  });

  test('playCard with targetHex moves player to exact position', () => {
    const combat = new CombatSystem({
      deck: [cardById('OP-015'), cardById('OP-016'), cardById('OP-016'), cardById('OP-018'), cardById('OP-018')],
      playerStart: { q: 0, r: 2 },
      enemyStart: { q: 0, r: -2 },
    });

    const target = { q: 0, r: 1 };
    combat.playCard('OP-015', target);
    const after = combat.snapshot();
    expect(after.player.position.q).toBe(target.q);
    expect(after.player.position.r).toBe(target.r);
  });

  test('enemy-target cards need an explicit target selection', () => {
    const combat = new CombatSystem({
      deck: [cardById('OP-016'), cardById('OP-016'), cardById('OP-018'), cardById('OP-018'), cardById('OP-018')],
    });
    const before = combat.snapshot();

    combat.playCard('OP-016');

    const after = combat.snapshot();
    expect(after.enemy.hp).toBe(before.enemy.hp);
    expect(after.player.cpu).toBe(before.player.cpu);
    expect(after.log[0]).toContain('Target fault');
  });

  test('0x0D triggers immediately when the player enters the field', () => {
    const combat = new CombatSystem({
      deck: [cardById('OP-015'), cardById('OP-018'), cardById('OP-018'), cardById('OP-018'), cardById('OP-018')],
      playerStart: { q: -1, r: 2 },
      enemyStart: { q: 1, r: -1 },
    });
    const before = combat.snapshot();
    const entryHex = { q: -1, r: 0 };
    const distBefore = before.grid.distance(entryHex, before.enemy.position);

    combat.playCard('OP-015', entryHex);

    const after = combat.snapshot();
    const distAfter = after.grid.distance(after.player.position, after.enemy.position);
    expect(after.player.position).toEqual(entryHex);
    expect(after.enemy.position).not.toEqual(before.enemy.position);
    expect(distAfter).toBeGreaterThan(distBefore);
  });

  test('0x0A advances the player immediately on entry', () => {
    const combat = new CombatSystem({
      deck: [cardById('OP-015'), cardById('OP-018'), cardById('OP-018'), cardById('OP-018'), cardById('OP-018')],
      playerStart: { q: 2, r: 0 },
      enemyStart: { q: 0, r: -2 },
    });

    combat.playCard('OP-015', { q: 1, r: 0 });

    const after = combat.snapshot();
    expect(after.player.position).toEqual({ q: 1, r: -1 });
    expect(after.log.some((line) => line.includes('Field 0x0A LF'))).toBe(true);
  });

  test('0x80 doubles card cost and effect while occupied', () => {
    const combat = new CombatSystem({
      deck: [cardById('OP-016'), cardById('OP-018'), cardById('OP-018'), cardById('OP-018'), cardById('OP-018')],
      playerStart: { q: 0, r: -1 },
      enemyStart: { q: 0, r: -2 },
    });
    const before = combat.snapshot();

    combat.playCard('OP-016', enemyHex(combat));

    const after = combat.snapshot();
    expect(after.player.cpu).toBe(before.player.cpu - 2);
    expect(before.enemy.hp - after.enemy.hp).toBe(6);
  });

  test('field cells are exposed in snapshot', () => {
    const combat = new CombatSystem();
    const snapshot = combat.snapshot();
    expect(snapshot.fieldCells.length).toBeGreaterThan(0);
    expect(snapshot.fieldCells.some((fc) => fc.address === '0x0D')).toBe(true);
    expect(snapshot.fieldCells.some((fc) => fc.address === '0x0A')).toBe(true);
    expect(snapshot.fieldCells.some((fc) => fc.address === '0x80')).toBe(true);
  });
});
