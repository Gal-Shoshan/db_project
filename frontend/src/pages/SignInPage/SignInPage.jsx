/**
 * @file Sign-in page: email and password form that opens the personal area.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/auth/useAuth.js";
import AuthForm from "@/components/AuthForm/AuthForm.jsx";
import FormField from "@/components/FormField/FormField.jsx";
import { APP_NAME } from "@/constants/app.js";
import { useDocumentTitle } from "@/hooks/useDocumentTitle.js";
import { useFormFields } from "@/hooks/useFormFields.js";
import { ROUTES } from "@/routes/paths.js";
import { validateSignIn } from "./validateSignIn.js";

const INITIAL_VALUES = { email: "", password: "" };

/**
 * Renders the sign-in form and a link to the sign-up page.
 *
 * When both fields are filled in, submitting starts a local session and opens
 * the personal area. Nothing is sent to a server yet, so any email and
 * password are accepted.
 *
 * @returns {JSX.Element} The sign-in page.
 */
export default function SignInPage() {
  useDocumentTitle("Sign in");
  const [values, handleChange] = useFormFields(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const { signIn } = useAuth();
  const navigate = useNavigate();

  /**
   * Shows an error under each empty field, or signs in and opens the personal area.
   *
   * @param {import("react").FormEvent<HTMLFormElement>} event - Submit event of the form.
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    const formErrors = validateSignIn(values);
    setErrors(formErrors);
    const isValid = Object.keys(formErrors).length === 0;
    if (!isValid) {
      return;
    }
    signIn(values.email.trim());
    navigate(ROUTES.personalArea, { replace: true });
  };

  return (
    <AuthForm
      title="Sign in"
      subtitle={`Welcome back to ${APP_NAME}.`}
      submitLabel="Sign in"
      onSubmit={handleSubmit}
      noValidate
      footer={
        <>
          Don&apos;t have an account? <Link to={ROUTES.signUp}>Sign up</Link>
        </>
      }
    >
      <FormField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={errors.email}
        value={values.email}
        onChange={handleChange}
      />
      <FormField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={errors.password}
        value={values.password}
        onChange={handleChange}
      />
    </AuthForm>
  );
}
