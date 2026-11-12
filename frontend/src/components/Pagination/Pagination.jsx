/**
 * @file Pager shown under a paged list: Previous, the page numbers and Next.
 */

import { Link } from "react-router";
import { PAGE_GAP, getPageWindow } from "./pagination.js";
import styles from "./Pagination.module.css";

/**
 * Renders the link to a neighbouring page, or a disabled label when there is no such page.
 *
 * @param {object} props - Step props.
 * @param {string | null} props.href - Link target, or null when the step is not possible.
 * @param {string} props.rel - Link relation, "prev" or "next".
 * @param {import("react").ReactNode} props.children - Step label.
 * @returns {JSX.Element} The step link or the disabled label.
 */
function PageStep({ href, rel, children }) {
  if (href === null) {
    return (
      <span className={`${styles.item} ${styles.disabled}`} aria-disabled="true">
        {children}
      </span>
    );
  }
  return (
    <Link to={href} rel={rel} className={styles.item}>
      {children}
    </Link>
  );
}

/**
 * Renders the pager; nothing is rendered when everything fits on one page.
 *
 * @param {object} props - Pager props.
 * @param {number} props.page - The page being shown, starting at 1.
 * @param {number} props.pageCount - Total number of pages.
 * @param {function(number): string} props.getPageHref - Returns the link target of a page number.
 * @returns {JSX.Element | null} The pager.
 */
export default function Pagination({ page, pageCount, getPageHref }) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <nav className={styles.pagination} aria-label="Pages">
      <ul className={styles.list}>
        <li>
          <PageStep href={page > 1 ? getPageHref(page - 1) : null} rel="prev">
            <span aria-hidden="true">‹</span> Previous
          </PageStep>
        </li>
        {getPageWindow(page, pageCount).map((entry, index) => (
          <li key={entry === PAGE_GAP ? `gap-${index}` : entry}>
            {entry === PAGE_GAP && (
              <span className={styles.gap} aria-hidden="true">
                …
              </span>
            )}
            {entry === page && (
              <span className={`${styles.item} ${styles.current}`} aria-current="page" aria-label={`Page ${entry}`}>
                {entry}
              </span>
            )}
            {entry !== PAGE_GAP && entry !== page && (
              <Link to={getPageHref(entry)} className={styles.item} aria-label={`Page ${entry}`}>
                {entry}
              </Link>
            )}
          </li>
        ))}
        <li>
          <PageStep href={page < pageCount ? getPageHref(page + 1) : null} rel="next">
            Next <span aria-hidden="true">›</span>
          </PageStep>
        </li>
      </ul>
    </nav>
  );
}
