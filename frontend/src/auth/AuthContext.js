/**
 * @file React context that carries the signed-in user and the sign-in and sign-out actions.
 */

import { createContext } from "react";

/**
 * Context value: `{user, signIn, signOut}`, or null outside AuthProvider.
 *
 * @type {import("react").Context<{user: {email: string} | null, signIn: function(string): void, signOut: function(): void} | null>}
 */
export const AuthContext = createContext(null);
