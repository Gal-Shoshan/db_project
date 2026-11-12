/**
 * @file Seeded pseudo-random numbers for sample data that must be the same on every load and in every test.
 */

/**
 * Returns a seeded pseudo-random number generator that yields numbers from 0 up to, but not including, 1.
 *
 * Note: this is the published mulberry32 algorithm; its numeric constants
 * are part of the algorithm.
 *
 * @param {number} seed - Starting state; the same seed always yields the same sequence.
 * @returns {function(): number} The generator.
 */
export function createSeededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), state | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 2 ** 32;
  };
}

/**
 * Returns a random element of a list.
 *
 * @template T
 * @param {function(): number} random - Random number generator.
 * @param {ReadonlyArray<T>} list - List to pick from.
 * @returns {T} The picked element.
 */
export function pickFrom(random, list) {
  return list[Math.floor(random() * list.length)];
}

/**
 * Returns a random whole number from min to max, both included.
 *
 * @param {function(): number} random - Random number generator.
 * @param {number} min - Smallest possible value.
 * @param {number} max - Largest possible value.
 * @returns {number} The picked number.
 */
export function randomInteger(random, min, max) {
  return min + Math.floor(random() * (max - min + 1));
}
