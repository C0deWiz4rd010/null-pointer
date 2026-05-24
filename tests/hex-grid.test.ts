import { describe, expect, test } from 'vitest';
import { HexGrid } from '../src/game/grid/HexGrid';

describe('HexGrid', () => {
  test('calculates axial distance correctly', () => {
    const grid = new HexGrid(2);
    expect(grid.distance({ q: 0, r: 0 }, { q: 0, r: 0 })).toBe(0);
    expect(grid.distance({ q: 0, r: 0 }, { q: 1, r: -1 })).toBe(1);
    expect(grid.distance({ q: 0, r: 2 }, { q: 0, r: -2 })).toBe(4);
  });

  test('steps toward a target through valid neighbors', () => {
    const grid = new HexGrid(2);
    const next = grid.stepToward({ q: 0, r: 2 }, { q: 0, r: -2 });
    expect(grid.isInside(next)).toBe(true);
    expect(grid.distance(next, { q: 0, r: -2 })).toBeLessThan(4);
  });

  test('pushFrom moves a target away from origin', () => {
    const grid = new HexGrid(2);
    const origin = { q: 0, r: 2 };
    const target = { q: 0, r: 0 };
    const pushed = grid.pushFrom(origin, target, 1);
    expect(grid.distance(origin, pushed)).toBeGreaterThan(grid.distance(origin, target));
  });

  test('reachable returns all cells within step budget', () => {
    const grid = new HexGrid(2);
    const reachable = grid.reachable({ q: 0, r: 0 }, 1);
    // All 6 neighbors of center should be reachable in 1 step
    expect(reachable).toHaveLength(6);
    for (const cell of reachable) {
      expect(grid.isInside(cell)).toBe(true);
    }
  });

  test('reachable excludes blocked hexes', () => {
    const grid = new HexGrid(2);
    const blocked = [{ q: 1, r: 0 }];
    const reachable = grid.reachable({ q: 0, r: 0 }, 1, blocked);
    expect(reachable).not.toContainEqual({ q: 1, r: 0 });
    expect(reachable).toHaveLength(5);
  });
});