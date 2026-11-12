/**
 * @file Main heading of a page, which also names the browser tab.
 */

import { useDocumentTitle } from "@/hooks/useDocumentTitle.js";
import styles from "./PageTitle.module.css";

/**
 * Renders the page's level-one heading and sets the browser tab title to match.
 *
 * @param {object} props - Title props.
 * @param {string} props.title - Text of the heading and of the tab title.
 * @param {boolean} [props.visuallyHidden=false] - Whether to keep the heading for screen readers only, for pages whose design shows no title.
 * @returns {JSX.Element} The heading.
 */
export default function PageTitle({ title, visuallyHidden = false }) {
  useDocumentTitle(title);
  return <h1 className={visuallyHidden ? "visually-hidden" : styles.title}>{title}</h1>;
}
