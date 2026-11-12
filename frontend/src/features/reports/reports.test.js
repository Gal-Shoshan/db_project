/**
 * @file Tests for the report data: month formatting and the headline figures.
 */

import { describe, expect, it } from "vitest";
import { MONTHLY_VOLUMES } from "./monthlyVolumes.js";
import {
  formatLongMonthYear,
  formatMonthName,
  formatShortMonth,
  formatShortMonthYear,
  isJanuary,
  monthYear,
} from "./months.js";
import { peakMonth, relativeChange, summarizeVolumes } from "./summarizeVolumes.js";

describe("months", () => {
  it("formats a month key in every display form", () => {
    expect(formatShortMonth("2026-10")).toBe("Oct");
    expect(formatMonthName("2026-10")).toBe("October");
    expect(formatShortMonthYear("2026-10")).toBe("Oct 2026");
    expect(formatLongMonthYear("2026-01")).toBe("January 2026");
    expect(monthYear("2025-11")).toBe("2025");
  });

  it("recognizes January", () => {
    expect(isJanuary("2026-01")).toBe(true);
    expect(isJanuary("2025-11")).toBe(false);
  });
});

describe("MONTHLY_VOLUMES", () => {
  it("holds twelve consecutive months, oldest first", () => {
    expect(MONTHLY_VOLUMES).toHaveLength(12);
    expect(MONTHLY_VOLUMES[0].month).toBe("2025-11");
    expect(MONTHLY_VOLUMES[11].month).toBe("2026-10");
  });
});

describe("summarizeVolumes", () => {
  it("adds up the period and compares the latest month with the one before", () => {
    const summary = summarizeVolumes(MONTHLY_VOLUMES);
    expect(summary).toMatchObject({
      firstMonth: "2025-11",
      lastMonth: "2026-10",
      totalSales: 513500,
      totalPurchases: 396300,
      net: 117200,
    });
    expect(summary.latest.month).toBe("2026-10");
    expect(summary.previous.month).toBe("2026-09");
    expect(summary.latestSalesChange).toBeCloseTo(6500 / 45900);
  });

  it("has no change for a single month", () => {
    const summary = summarizeVolumes([{ month: "2026-01", sales: 10, purchases: 4 }]);
    expect(summary.previous).toBeNull();
    expect(summary.latestSalesChange).toBeNull();
    expect(summary.net).toBe(6);
  });

  it("rejects an empty list", () => {
    expect(() => summarizeVolumes([])).toThrow(RangeError);
  });
});

describe("peakMonth and relativeChange", () => {
  it("finds the highest month, keeping the earliest on a tie", () => {
    expect(peakMonth(MONTHLY_VOLUMES, "sales").month).toBe("2025-12");
    expect(peakMonth(MONTHLY_VOLUMES, "purchases").month).toBe("2026-10");
    const tied = [
      { month: "2026-01", sales: 5, purchases: 0 },
      { month: "2026-02", sales: 5, purchases: 0 },
    ];
    expect(peakMonth(tied, "sales").month).toBe("2026-01");
  });

  it("returns the relative change, or null from zero", () => {
    expect(relativeChange(200, 250)).toBeCloseTo(0.25);
    expect(relativeChange(0, 5)).toBeNull();
  });
});
