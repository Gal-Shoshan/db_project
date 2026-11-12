/**
 * @file Online-store catalog of a product list: search, filters, sorting, product cards and pages, shared by the Shopping and Products pages.
 */

import { useId, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import Button from "@/components/Button/Button.jsx";
import FilterSortBar from "@/components/FilterSortBar/FilterSortBar.jsx";
import PageTitle from "@/components/PageTitle/PageTitle.jsx";
import Pagination from "@/components/Pagination/Pagination.jsx";
import { PRODUCTS_PER_PAGE, SORT_OPTIONS } from "@/features/catalog/catalogConfig.js";
import { NO_FILTERS, countActiveFilters, parseCatalogQuery, toSearchParams } from "@/features/catalog/catalogQuery.js";
import CatalogFilterPanel from "@/features/catalog/components/CatalogFilterPanel/CatalogFilterPanel.jsx";
import ProductGrid from "@/features/catalog/components/ProductGrid/ProductGrid.jsx";
import SearchBar from "@/features/catalog/components/SearchBar/SearchBar.jsx";
import { searchCatalog } from "@/features/catalog/searchCatalog.js";
import { useScrollIntoViewOnChange } from "@/hooks/useScrollIntoViewOnChange.js";
import { formatCount } from "@/utils/formatters.js";
import styles from "./ProductCatalog.module.css";

/**
 * Renders the line above the products, for example `1–50 of 237 results for "lamp"`.
 *
 * @param {object} props - Summary props.
 * @param {{totalCount: number, firstItemNumber: number, lastItemNumber: number}} props.result - The search result.
 * @param {string} props.searchText - The search text; empty when there is no search.
 * @returns {JSX.Element} The results summary.
 */
function ResultsSummary({ result, searchText }) {
  const range =
    result.totalCount > 0
      ? `${result.firstItemNumber}–${result.lastItemNumber} of ${formatCount(result.totalCount)} results`
      : "No results";

  return (
    <p className={styles.summary} aria-live="polite">
      {range}
      {searchText && (
        <>
          {" for "}
          <span className={styles.searchText}>“{searchText}”</span>
        </>
      )}
    </p>
  );
}

/**
 * Renders the message shown when no product matches, with a button that clears the search and filters.
 *
 * @param {object} props - Message props.
 * @param {function(): void} props.onClear - Called when the clear button is pressed.
 * @returns {JSX.Element} The empty-results message.
 */
function EmptyResults({ onClear }) {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>No products match your search.</p>
      <p className={styles.emptyText}>Check the spelling, try other words, or clear the filters.</p>
      <Button variant="secondary" onClick={onClear}>
        Clear search and filters
      </Button>
    </div>
  );
}

/**
 * Renders the page title for screen readers, the search box, Filters and Sort by, up to PRODUCTS_PER_PAGE products, and the pager.
 *
 * The search text, filters, sort order and page live in the URL, so Back and
 * Forward step through them. Any change other than the page goes back to page 1.
 *
 * @param {object} props - Catalog props.
 * @param {string} props.title - Page title, for example "Shopping".
 * @param {ReadonlyArray<import("@/features/catalog/sampleProducts.js").Product>} props.products - Every product of the catalog.
 * @param {function(import("@/features/catalog/sampleProducts.js").Product, string): import("react").ReactNode} props.renderCardAction
 *   Returns the controls at the bottom of a product card, such as Add to cart, given the product and the element id of its title.
 * @param {import("react").ReactNode} [props.children] - Content shown between the search controls and the results, such as a notice.
 * @returns {JSX.Element} The catalog.
 */
export default function ProductCatalog({ title, products, renderCardAction, children }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const filterPanelId = useId();
  const pageTopRef = useRef(null);
  const query = parseCatalogQuery(searchParams);
  const result = searchCatalog(products, query, PRODUCTS_PER_PAGE);
  useScrollIntoViewOnChange(pageTopRef, result.page);

  /**
   * Applies changes to the search state and returns to the first page.
   *
   * @param {Partial<import("@/features/catalog/catalogQuery.js").CatalogQuery>} changes - Changed search values.
   */
  const updateQuery = (changes) => {
    setSearchParams(toSearchParams({ ...query, ...changes, page: 1 }));
  };

  /**
   * Returns the link target of a page of the current results.
   *
   * @param {number} page - Page number.
   * @returns {string} The query string of that page.
   */
  const pageHref = (page) => `?${toSearchParams({ ...query, page })}`;

  return (
    <div ref={pageTopRef} className={styles.catalog}>
      <PageTitle title={title} visuallyHidden />
      <SearchBar key={query.q} initialValue={query.q} onSearch={(searchText) => updateQuery({ q: searchText })} />
      <FilterSortBar
        activeFilterCount={countActiveFilters(query)}
        isFilterPanelOpen={isFilterPanelOpen}
        filterPanelId={filterPanelId}
        onToggleFilters={() => setIsFilterPanelOpen((isOpen) => !isOpen)}
        sortOptions={SORT_OPTIONS}
        sort={query.sort}
        onSortChange={(sort) => updateQuery({ sort })}
      />
      {isFilterPanelOpen && (
        <CatalogFilterPanel
          id={filterPanelId}
          filters={query}
          onChange={updateQuery}
          onClear={() => updateQuery(NO_FILTERS)}
        />
      )}
      {children}
      <ResultsSummary result={result} searchText={query.q} />
      {result.totalCount > 0 ? (
        <ProductGrid products={result.items} renderCardAction={renderCardAction} />
      ) : (
        <EmptyResults onClear={() => updateQuery({ q: "", ...NO_FILTERS })} />
      )}
      <Pagination page={result.page} pageCount={result.pageCount} getPageHref={pageHref} />
    </div>
  );
}
