/**
 * @file Notice above an order list that reports what just happened to an order, such as a cancellation or an approval.
 */

import { useEffect, useRef } from "react";
import styles from "./OrderNotice.module.css";

/**
 * Renders the notice and moves keyboard focus to it each time its message changes.
 *
 * Note: the control that changed the order usually leaves the page with the
 * order's row, so focus moves here instead of being lost, and screen readers
 * read the notice.
 *
 * @param {object} props - Notice props.
 * @param {string | null} props.message - What happened, or null for no notice.
 * @returns {JSX.Element | null} The notice.
 */
export default function OrderNotice({ message }) {
  const noticeRef = useRef(null);

  useEffect(() => {
    noticeRef.current?.focus();
  }, [message]);

  if (message === null) {
    return null;
  }
  return (
    <p ref={noticeRef} tabIndex={-1} className={styles.notice}>
      {message}
    </p>
  );
}
