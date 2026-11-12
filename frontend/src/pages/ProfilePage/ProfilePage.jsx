/**
 * @file Profile page: shows what is known about the signed-in user.
 */

import { useAuth } from "@/auth/useAuth.js";
import Card from "@/components/Card/Card.jsx";
import { useDocumentTitle } from "@/hooks/useDocumentTitle.js";
import styles from "./ProfilePage.module.css";

/**
 * Renders the signed-in user's details.
 *
 * Only the email address is known until accounts are stored on a server.
 * The page has no back link; the mode selector in the top bar leads back.
 *
 * @returns {JSX.Element} The profile page.
 */
export default function ProfilePage() {
  useDocumentTitle("Profile");
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <h1 className={styles.title}>Profile</h1>
        <dl className={styles.details}>
          <div className={styles.row}>
            <dt className={styles.term}>Email</dt>
            <dd className={styles.value}>{user.email}</dd>
          </div>
        </dl>
        <p className={styles.note}>More details will appear here once accounts are stored on a server.</p>
      </Card>
    </div>
  );
}
