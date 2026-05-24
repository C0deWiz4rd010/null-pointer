import { describe, expect, test } from 'vitest';
import { RNG } from '../src/core/RNG';

describe('RNG', () => {
  test('produces deterministic sequences for a fixed seed', () => {
    const left = new RNG('same-seed');
    const right = new RNG('same-seed');

    const leftValues = [left.int(1, 10), left.int(1, 10), left.int(1, 10)];
    const rightValues = [right.int(1, 10), right.int(1, 10), right.int(1, 10)];

    expect(leftValues).toEqual(rightValues);
  });
});