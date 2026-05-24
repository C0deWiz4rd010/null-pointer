export interface HexPos {
  q: number;
  r: number;
}

const DIRECTIONS: HexPos[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

export class HexGrid {
  readonly cells: HexPos[];

  constructor(readonly radius = 2) {
    this.cells = [];

    for (let q = -radius; q <= radius; q += 1) {
      for (let r = -radius; r <= radius; r += 1) {
        const s = -q - r;
        if (Math.max(Math.abs(q), Math.abs(r), Math.abs(s)) <= radius) {
          this.cells.push({ q, r });
        }
      }
    }
  }

  key(pos: HexPos): string {
    return `${pos.q},${pos.r}`;
  }

  isInside(pos: HexPos): boolean {
    return this.cells.some((cell) => cell.q === pos.q && cell.r === pos.r);
  }

  neighbors(pos: HexPos): HexPos[] {
    return DIRECTIONS.map((direction) => ({ q: pos.q + direction.q, r: pos.r + direction.r })).filter((cell) => this.isInside(cell));
  }

  distance(a: HexPos, b: HexPos): number {
    return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
  }

  stepToward(from: HexPos, to: HexPos, blocked: HexPos[] = []): HexPos {
    const blockedKeys = new Set(blocked.map((cell) => this.key(cell)));

    const candidates = this.neighbors(from)
      .filter((candidate) => !blockedKeys.has(this.key(candidate)))
      .sort((left, right) => this.distance(left, to) - this.distance(right, to));

    return candidates[0] ?? from;
  }

  /**
   * Move `target` up to `steps` hexes directly away from `origin`.
   * Each step picks the neighbor that increases distance from origin the most.
   * Stops at grid boundary or if blocked.
   */
  pushFrom(origin: HexPos, target: HexPos, steps: number, blocked: HexPos[] = []): HexPos {
    const blockedKeys = new Set(blocked.map((cell) => this.key(cell)));
    let current = { ...target };

    for (let i = 0; i < steps; i += 1) {
      const currentDist = this.distance(origin, current);
      const candidates = this.neighbors(current)
        .filter((n) => !blockedKeys.has(this.key(n)) && this.distance(origin, n) > currentDist)
        .sort((a, b) => this.distance(origin, b) - this.distance(origin, a));

      if (candidates.length === 0) break;
      current = candidates[0];
    }

    return current;
  }

  /**
   * BFS: all hexes reachable from `from` within `maxSteps` steps, excluding start hex.
   * Cells in `blocked` are treated as impassable.
   */
  reachable(from: HexPos, maxSteps: number, blocked: HexPos[] = []): HexPos[] {
    const blockedKeys = new Set(blocked.map((cell) => this.key(cell)));
    const visited = new Set<string>();
    const queue: Array<{ pos: HexPos; steps: number }> = [{ pos: from, steps: 0 }];
    const result: HexPos[] = [];

    visited.add(this.key(from));

    while (queue.length > 0) {
      const { pos, steps } = queue.shift()!;

      if (!sameHex(pos, from)) {
        result.push(pos);
      }

      if (steps >= maxSteps) continue;

      for (const neighbor of this.neighbors(pos)) {
        const k = this.key(neighbor);
        if (!visited.has(k) && !blockedKeys.has(k)) {
          visited.add(k);
          queue.push({ pos: neighbor, steps: steps + 1 });
        }
      }
    }

    return result;
  }
}

export function sameHex(left: HexPos, right: HexPos): boolean {
  return left.q === right.q && left.r === right.r;
}