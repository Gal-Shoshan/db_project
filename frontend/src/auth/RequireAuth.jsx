/**
 * @file Route guard that only lets signed-in users reach the pages nested under it.
 */

import { Navigate, Outlet } from "react-router";
import { ROUTES } from "@/routes/paths.js";
import { useAuth } from "./useAuth.js";

/**
 * Renders the nested page for a signed-in user and sends anyone else to the sign-in page.
 *
 * @returns {JSX.Element} The nested page, or a redirect to the sign-in page.
 */
export default function RequireAuth() {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to={ROUTES.signIn} replace />;
}
