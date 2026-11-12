/**
 * @file Provider that holds the signed-in user for the whole application.
 *
 * The session lives in memory only, so the sign-in form is the one way into
 * the personal area: a reload or a typed URL starts signed out. Signing in is
 * local for now; no server checks the credentials, and only the email address
 * is kept.
 */

import { useCallback, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext.js";

/**
 * Provides the signed-in user and the signIn and signOut actions to everything inside it.
 *
 * @param {object} props - Provider props.
 * @param {import("react").ReactNode} props.children - The part of the app that can use the session.
 * @returns {JSX.Element} The provider.
 */
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  /**
   * Starts a session for the given email address.
   *
   * @param {string} email - Email address the user signed in with.
   */
  const signIn = useCallback((email) => {
    setUser({ email });
  }, []);

  /**
   * Ends the current session; does nothing when no one is signed in.
   */
  const signOut = useCallback(() => {
    setUser(null);
  }, []);

  const session = useMemo(() => ({ user, signIn, signOut }), [user, signIn, signOut]);

  return <AuthContext value={session}>{children}</AuthContext>;
}
