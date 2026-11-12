/**
 * @file Hook that reads the session from AuthProvider.
 */

import { useContext } from "react";
import { AuthContext } from "./AuthContext.js";

/**
 * Returns the signed-in user and the signIn and signOut actions.
 *
 * @returns {{user: {email: string} | null, signIn: function(string): void, signOut: function(): void}} The session.
 * @throws {Error} If called outside AuthProvider.
 */
export function useAuth() {
  const session = useContext(AuthContext);
  if (session === null) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return session;
}
