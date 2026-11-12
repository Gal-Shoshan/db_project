/**
 * @file Hook that moves keyboard focus to an element once the next render is on screen.
 */

import { useCallback, useEffect, useRef } from "react";

/**
 * Returns a function that asks for an element to receive focus after the next render.
 *
 * Use it when an action removes or disables the control that has focus, so
 * focus moves somewhere useful instead of being lost.
 *
 * @returns {function(import("react").RefObject<HTMLElement>): void} Call with the ref of the element to focus.
 */
export function useFocusAfterRender() {
  const pendingTargetRef = useRef(null);

  useEffect(() => {
    const targetRef = pendingTargetRef.current;
    if (targetRef === null) {
      return;
    }
    pendingTargetRef.current = null;
    targetRef.current?.focus();
  });

  return useCallback((targetRef) => {
    pendingTargetRef.current = targetRef;
  }, []);
}
