/**
 * @file Page frame of the public pages: the public top bar above the current page.
 */

import { useEffect } from "react";
import { Outlet } from "react-router";
import { useAuth } from "@/auth/useAuth.js";
import NavBar from "@/components/NavBar/NavBar.jsx";
import styles from "./PublicLayout.module.css";

/**
 * Renders the public top bar and, below it, the public page that matches the current route.
 *
 * Opening any public page ends the session, for example after the browser's
 * Back button leaves the personal area, so the personal area can only be
 * entered again through the sign-in form.
 *
 * @returns {JSX.Element} The page frame.
 */
export default function PublicLayout() {
  const { signOut } = useAuth();

  useEffect(() => {
    signOut();
  }, [signOut]);

  return (
    <div className={styles.layout}>
      <NavBar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
