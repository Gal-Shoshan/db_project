/**
 * @file Page arithmetic for paged lists: how many pages there are and which page numbers to show.
 */

/** Marker in a page window for a run of pages that is not shown. */
export const PAGE_GAP = "gap";

const MAX_PAGES_WITHOUT_GAPS = 7;
const FIRST_PAGE = 1;

/**
 * Returns how many pages the items fill: the number of full pages, plus one more when items are left over.
 *
 * @param {number} itemCount - Total number of items.
 * @param {number} pageSize - Most items on one page.
 * @returns {number} The number of pages; 0 when there are no items.
 */
export function getPageCount(itemCount, pageSize) {
  return Math.ceil(itemCount / pageSize);
}

/**
 * Returns the page numbers to show in a pager, with PAGE_GAP where pages are skipped.
 *
 * All pages are shown when there are few. Otherwise the first page, the last
 * page and the pages next to the current one are shown.
 *
 * @param {number} currentPage - The page being shown, starting at 1.
 * @param {number} pageCount - Total number of pages.
 * @returns {Array<number | string>} Page numbers in order, with PAGE_GAP between non-adjacent ones.
 */
export function getPageWindow(currentPage, pageCount) {
  if (pageCount <= MAX_PAGES_WITHOUT_GAPS) {
    return Array.from({ length: pageCount }, (_, index) => index + FIRST_PAGE);
  }
  const shownPages = [...new Set([FIRST_PAGE, currentPage - 1, currentPage, currentPage + 1, pageCount])]
    .filter((page) => page >= FIRST_PAGE && page <= pageCount)
    .sort((left, right) => left - right);
  return shownPages.flatMap((page, index) => {
    const skipsPages = index > 0 && page - shownPages[index - 1] > 1;
    return skipsPages ? [PAGE_GAP, page] : [page];
  });
}
