/**
 * @file Hook that scrolls an element into view whenever a watched value changes.
 */

import { useEffect, useRef } from "react";

/**
 * Scrolls the element to the top of the window each time the value changes, but not on the first render.
 *
 * @param {import("react").RefObject<HTMLElement>} targetRef - Ref of the element to scroll to.
 * @param {unknown} value - Value to watch, for example the current page number.
 */
export function useScrollIntoViewOnChange(targetRef, value) {
  const previousValueRef = useRef(value);

  useEffect(() => {
    if (previousValueRef.current === value) {
      return;
    }
    previousValueRef.current = value;
    targetRef.current?.scrollIntoView?.({ block: "start", behavior: "smooth" });
  }, [targetRef, value]);
}
