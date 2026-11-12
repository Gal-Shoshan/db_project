/**
 * @file Tests for the value-axis scale with round ticks.
 */

import { describe, expect, it } from "vitest";
import { niceScale } from "./niceScale.js";

describe("niceScale", () => {
  it("rounds the axis up to a round maximum with evenly spaced ticks", () => {
    expect(niceScale(61750)).toEqual({ max: 80000, ticks: [0, 20000, 40000, 60000, 80000] });
  });

  it("uses steps of 1, 2, 2.5 or 5 times a power of ten", () => {
    expect(niceScale(100)).toEqual({ max: 100, ticks: [0, 25, 50, 75, 100] });
    expect(niceScale(7)).toEqual({ max: 8, ticks: [0, 2, 4, 6, 8] });
    expect(niceScale(0.9).ticks).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  it("follows the requested number of intervals, rounding the step up to a round value", () => {
    expect(niceScale(61750, 8).ticks).toEqual([0, 10000, 20000, 30000, 40000, 50000, 60000, 70000]);
    expect(niceScale(61750, 6).ticks).toEqual([0, 20000, 40000, 60000, 80000]);
  });

  it("rejects a maximum that is not above zero", () => {
    expect(() => niceScale(0)).toThrow(RangeError);
    expect(() => niceScale(Number.NaN)).toThrow(RangeError);
  });
});
