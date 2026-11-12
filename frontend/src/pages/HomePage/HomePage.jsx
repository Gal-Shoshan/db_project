/**
 * @file Home page: introduces the application and links to the sign-up and sign-in pages.
 */

import ButtonLink from "@/components/Button/ButtonLink.jsx";
import { APP_NAME } from "@/constants/app.js";
import { useDocumentTitle } from "@/hooks/useDocumentTitle.js";
import { ROUTES } from "@/routes/paths.js";
import styles from "./HomePage.module.css";

/**
 * Renders the welcome message and the buttons that open the sign-up and sign-in pages.
 *
 * @returns {JSX.Element} The home page.
 */
export default function HomePage() {
  useDocumentTitle();

  return (
    <section className={styles.hero}>
      <h1 className={styles.title}>Welcome to {APP_NAME}</h1>
      <p className={styles.lead}>Sign in to your account, or create one to get started.</p>
      <div className={styles.actions}>
        <ButtonLink to={ROUTES.signUp}>Create an account</ButtonLink>
        <ButtonLink to={ROUTES.signIn} variant="secondary">
          Sign in
        </ButtonLink>
      </div>
    </section>
  );
}
