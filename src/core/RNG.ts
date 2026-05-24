import seedrandom from 'seedrandom';

export class RNG {
  private readonly generator: seedrandom.PRNG;

  constructor(seed: string) {
    this.generator = seedrandom(seed);
  }

  float(): number {
    return this.generator();
  }

  int(min: number, max: number): number {
    return Math.floor(this.float() * (max - min + 1)) + min;
  }

  pick<T>(items: readonly T[]): T {
    if (items.length === 0) {
      throw new Error('Cannot pick from empty collection');
    }

    return items[this.int(0, items.length - 1)];
  }

  shuffle<T>(items: readonly T[]): T[] {
    const copy = [...items];

    for (let index = copy.length - 1; index > 0; index -= 1) {
      const otherIndex = this.int(0, index);
      [copy[index], copy[otherIndex]] = [copy[otherIndex], copy[index]];
    }

    return copy;
  }
}