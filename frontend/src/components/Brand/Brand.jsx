/**
 * @file Product logo and name, shown at the start of every top bar.
 */

import { APP_NAME } from "@/constants/app.js";
import styles from "./Brand.module.css";

const LOGO_SIZE_PX = 28;

/**
 * Renders the logo next to the product name, as plain content; wrap it in a link where it should navigate.
 *
 * @returns {JSX.Element} The brand.
 */
export default function Brand() {
  return (
    <span className={styles.brand}>
      <img src="/favicon.svg" alt="" width={LOGO_SIZE_PX} height={LOGO_SIZE_PX} />
      {APP_NAME}
    </span>
  );
}
