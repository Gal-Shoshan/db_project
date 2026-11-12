/**
 * @file Sign-up page: account creation form, not connected to a server yet.
 */

import { useState } from "react";
import { Link } from "react-router";
import AuthForm from "@/components/AuthForm/AuthForm.jsx";
import FormField from "@/components/FormField/FormField.jsx";
import { APP_NAME } from "@/constants/app.js";
import { useDocumentTitle } from "@/hooks/useDocumentTitle.js";
import { useFormFields } from "@/hooks/useFormFields.js";
import { ROUTES } from "@/routes/paths.js";
import { validateSignUp } from "./validateSignUp.js";

const INITIAL_VALUES = { name: "", email: "", password: "", confirmPassword: "" };
const MIN_PASSWORD_LENGTH = 8;

const NOT_CONNECTED_MESSAGE =
  "Sign-up is not connected to a server yet, so your details were not sent anywhere.";

/**
 * Renders the sign-up form and a link to the sign-in page.
 *
 * Submitting checks that the two passwords match, keeps the entered values on
 * this page and only shows a notice, because there is no account service yet.
 *
 * @returns {JSX.Element} The sign-up page.
 */
export default function SignUpPage() {
  useDocumentTitle("Sign up");
  const [values, handleChange] = useFormFields(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState("");

  /**
   * Stops the browser from submitting the form, shows any errors, and shows the not-connected notice when valid.
   *
   * @param {import("react").FormEvent<HTMLFormElement>} event - Submit event of the form.
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    const formErrors = validateSignUp(values);
    const isValid = Object.keys(formErrors).length === 0;
    setErrors(formErrors);
    setStatusMessage(isValid ? NOT_CONNECTED_MESSAGE : "");
  };

  return (
    <AuthForm
      title="Create an account"
      subtitle={`Join ${APP_NAME} in a few seconds.`}
      submitLabel="Sign up"
      onSubmit={handleSubmit}
      statusMessage={statusMessage}
      footer={
        <>
          Already have an account? <Link to={ROUTES.signIn}>Sign in</Link>
        </>
      }
    >
      <FormField
        label="Full name"
        name="name"
        autoComplete="name"
        required
        value={values.name}
        onChange={handleChange}
      />
      <FormField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={values.email}
        onChange={handleChange}
      />
      <FormField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={MIN_PASSWORD_LENGTH}
        hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        required
        value={values.password}
        onChange={handleChange}
      />
      <FormField
        label="Confirm password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        error={errors.confirmPassword}
        value={values.confirmPassword}
        onChange={handleChange}
      />
    </AuthForm>
  );
}
