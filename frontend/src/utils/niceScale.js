/**
 * @file Value-axis scale with round tick values, for charts.
 */

const NICE_STEP_FACTORS = [1, 2, 2.5, 5, 10];
const DEFAULT_TICK_COUNT = 4;

/**
 * Returns a scale from zero to a round maximum at or above the given value, with evenly spaced round ticks.
 *
 * The step is 1, 2, 2.5 or 5 times a power of ten, chosen so the axis has
 * about the requested number of intervals.
 *
 * @param {number} maxValue - Largest value the axis must show; must be greater than 0.
 * @param {number} [targetTickCount=4] - About how many intervals the axis should have.
 * @returns {{max: number, ticks: number[]}} The axis maximum and the tick values, starting at 0.
 * @throws {RangeError} If maxValue is not greater than 0.
 */
export function niceScale(maxValue, targetTickCount = DEFAULT_TICK_COUNT) {
  if (!(maxValue > 0)) {
    throw new RangeError(`niceScale needs a maximum greater than 0, got ${maxValue}.`);
  }
  const roughStep = maxValue / targetTickCount;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const factor = NICE_STEP_FACTORS.find((candidate) => roughStep / magnitude <= candidate);
  const step = factor * magnitude;
  const intervalCount = Math.ceil(maxValue / step);
  return {
    max: intervalCount * step,
    ticks: Array.from({ length: intervalCount + 1 }, (_, index) => index * step),
  };
}
