/**
 * @file Page shown for any URL that does not match a route.
 */

import ButtonLink from "@/components/Button/ButtonLink.jsx";
import { useDocumentTitle } from "@/hooks/useDocumentTitle.js";
import { ROUTES } from "@/routes/paths.js";
import styles from "./NotFoundPage.module.css";

/**
 * Renders the not-found message and a link back to the home page.
 *
 * @returns {JSX.Element} The not-found page.
 */
export default function NotFoundPage() {
  useDocumentTitle("Page not found");

  return (
    <section className={styles.notFound}>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.text}>The page you are looking for does not exist.</p>
      <ButtonLink to={ROUTES.home}>Go to the home page</ButtonLink>
    </section>
  );
}
