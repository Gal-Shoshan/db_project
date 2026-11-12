/**
 * @file Full-width product search box with a search button.
 */

import { useId, useState } from "react";
import styles from "./SearchBar.module.css";

/**
 * Renders the search form; the search runs when the user presses Enter or the search button.
 *
 * To show a new search text from outside (for example after Back), remount
 * the component with a `key` that changes with that text.
 *
 * @param {object} props - Search props.
 * @param {string} props.initialValue - Search text shown when the box first renders.
 * @param {function(string): void} props.onSearch - Called with the trimmed search text; empty clears the search.
 * @returns {JSX.Element} The search form.
 */
export default function SearchBar({ initialValue, onSearch }) {
  const [value, setValue] = useState(initialValue);
  const inputId = useId();

  /**
   * Runs the search instead of letting the browser submit the form.
   *
   * @param {import("react").FormEvent<HTMLFormElement>} event - Submit event of the form.
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form role="search" className={styles.search} onSubmit={handleSubmit}>
      <label htmlFor={inputId} className="visually-hidden">
        Search products
      </label>
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search products"
        autoComplete="off"
        className={styles.input}
      />
      <button type="submit" className={styles.button} aria-label="Search">
        <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      </button>
    </form>
  );
}
