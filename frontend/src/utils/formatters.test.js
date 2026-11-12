/**
 * @file Tests for the shared number formatters.
 */

import { describe, expect, it } from "vitest";
import {
  formatCompactCurrency,
  formatCount,
  formatCurrency,
  formatSignedCompactCurrency,
  formatSignedPercent,
  formatSignedWholeCurrency,
  formatWholeCurrency,
} from "./formatters.js";

describe("formatters", () => {
  it("formats dollars with cents and in whole dollars", () => {
    expect(formatCurrency(1299.99)).toBe("$1,299.99");
    expect(formatWholeCurrency(48200)).toBe("$48,200");
  });

  it("signs whole-dollar amounts, except zero", () => {
    expect(formatSignedWholeCurrency(2800)).toBe("+$2,800");
    expect(formatSignedWholeCurrency(-1350)).toBe("-$1,350");
    expect(formatSignedWholeCurrency(0)).toBe("$0");
  });

  it("shortens large amounts to at most one decimal", () => {
    expect(formatCompactCurrency(513500)).toBe("$513.5K");
    expect(formatCompactCurrency(20000)).toBe("$20K");
    expect(formatSignedCompactCurrency(117200)).toBe("+$117.2K");
  });

  it("formats signed percentages and counts", () => {
    expect(formatSignedPercent(6500 / 45900)).toBe("+14.2%");
    expect(formatSignedPercent(-0.05)).toBe("-5%");
    expect(formatCount(12345)).toBe("12,345");
  });
});
