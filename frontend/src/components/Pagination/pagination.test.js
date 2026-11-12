/**
 * @file Tests for the page arithmetic: page count and the page numbers shown in the pager.
 */

import { describe, expect, it } from "vitest";
import { PAGE_GAP, getPageCount, getPageWindow } from "./pagination.js";

const PAGE_SIZE = 50;

describe("getPageCount", () => {
  it("counts the full pages plus one more for any remainder", () => {
    expect(getPageCount(237, PAGE_SIZE)).toBe(5);
    expect(getPageCount(51, PAGE_SIZE)).toBe(2);
    expect(getPageCount(49, PAGE_SIZE)).toBe(1);
  });

  it("adds no extra page when the items divide evenly", () => {
    expect(getPageCount(250, PAGE_SIZE)).toBe(5);
    expect(getPageCount(50, PAGE_SIZE)).toBe(1);
  });

  it("returns 0 pages for no items", () => {
    expect(getPageCount(0, PAGE_SIZE)).toBe(0);
  });
});

describe("getPageWindow", () => {
  it("shows every page when there are few", () => {
    expect(getPageWindow(3, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPageWindow(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("shows the first, last and neighbouring pages, with gaps, when there are many", () => {
    expect(getPageWindow(1, 20)).toEqual([1, 2, PAGE_GAP, 20]);
    expect(getPageWindow(10, 20)).toEqual([1, PAGE_GAP, 9, 10, 11, PAGE_GAP, 20]);
    expect(getPageWindow(20, 20)).toEqual([1, PAGE_GAP, 19, 20]);
  });

  it("adds no gap between pages that are next to each other", () => {
    expect(getPageWindow(3, 20)).toEqual([1, 2, 3, 4, PAGE_GAP, 20]);
  });
});
