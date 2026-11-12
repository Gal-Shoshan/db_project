/**
 * @file Modal window over the page, built on the native dialog element.
 */

import { useId, useLayoutEffect, useRef } from "react";
import styles from "./Dialog.module.css";

/**
 * Opens or closes the native dialog to match the requested state.
 *
 * @param {HTMLDialogElement} dialog - The dialog element.
 * @param {boolean} isOpen - Whether the dialog should be open.
 */
function syncDialogOpenState(dialog, isOpen) {
  if (isOpen && !dialog.open) {
    dialog.showModal();
  } else if (!isOpen && dialog.open) {
    dialog.close();
  }
}

/**
 * Closes the dialog when the click landed on its backdrop rather than on its content.
 *
 * @param {import("react").MouseEvent<HTMLDialogElement>} event - The click on the dialog.
 */
function closeOnBackdropClick(event) {
  const isBackdropClick = event.target === event.currentTarget;
  if (isBackdropClick) {
    event.currentTarget.close();
  }
}

/**
 * Renders a modal dialog with a title, a close button, its content and optional action buttons.
 *
 * The native dialog keeps keyboard focus inside while it is open and closes
 * on Escape. Every way of closing goes through the dialog's close event, so
 * the browser returns focus to the control that opened it, and onClose is
 * called once.
 *
 * @param {object} props - Dialog props.
 * @param {boolean} props.isOpen - Whether the dialog is shown.
 * @param {string} props.title - Heading of the dialog, which is also its accessible name.
 * @param {function(): void} props.onClose - Called after the dialog closes, by any means.
 * @param {import("react").ReactNode} props.children - Dialog content.
 * @param {import("react").ReactNode} [props.actions] - Buttons shown at the bottom of the dialog.
 * @returns {JSX.Element} The dialog.
 */
export default function Dialog({ isOpen, title, onClose, children, actions }) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useLayoutEffect(() => {
    syncDialogOpenState(dialogRef.current, isOpen);
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={closeOnBackdropClick}
    >
      <div className={styles.frame}>
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Close"
            onClick={() => dialogRef.current.close()}
          >
            <svg viewBox="0 0 24 24" className={styles.closeIcon} aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>
        <div className={styles.body}>{children}</div>
        {actions && <footer className={styles.actions}>{actions}</footer>}
      </div>
    </dialog>
  );
}
