/**
 * @file Card that frames an account form: heading, fields, submit button, status message and footer link.
 */

import Button from "@/components/Button/Button.jsx";
import Card from "@/components/Card/Card.jsx";
import styles from "./AuthForm.module.css";

/**
 * Renders an account form inside a centered card.
 *
 * @param {object} props - Form props.
 * @param {string} props.title - Page heading shown at the top of the card.
 * @param {string} props.subtitle - One line under the heading.
 * @param {string} props.submitLabel - Label of the submit button.
 * @param {function(import("react").FormEvent<HTMLFormElement>): void} props.onSubmit - Called when the form is submitted.
 * @param {boolean} [props.noValidate=false] - Whether to skip the browser's built-in validation because the page validates the fields itself.
 * @param {string} [props.statusMessage] - Message announced after a submit, shown under the form.
 * @param {import("react").ReactNode} props.footer - Content under the form, usually a link to the other account page.
 * @param {import("react").ReactNode} props.children - The form fields.
 * @returns {JSX.Element} The form card.
 */
export default function AuthForm({
  title,
  subtitle,
  submitLabel,
  onSubmit,
  noValidate = false,
  statusMessage,
  footer,
  children,
}) {
  return (
    <Card className={styles.card}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>
      <form className={styles.form} onSubmit={onSubmit} noValidate={noValidate}>
        {children}
        <Button type="submit" fullWidth>
          {submitLabel}
        </Button>
      </form>
      <div role="status">{statusMessage && <p className={styles.status}>{statusMessage}</p>}</div>
      <p className={styles.footer}>{footer}</p>
    </Card>
  );
}
