/**
 * @file Hook that tracks the rendered width of an element.
 */

import { useEffect, useRef, useState } from "react";

/**
 * Returns a ref to attach to an element and that element's current width in pixels.
 *
 * The width updates whenever the element is resized. Until the first
 * measurement, and where ResizeObserver is not available, the fallback width
 * is returned.
 *
 * @param {number} fallbackWidth - Width to use before the element is measured.
 * @returns {[import("react").RefObject<HTMLElement>, number]} The ref and the width.
 */
export function useElementWidth(fallbackWidth) {
  const elementRef = useRef(null);
  const [width, setWidth] = useState(fallbackWidth);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || typeof ResizeObserver === "undefined") {
      return undefined;
    }
    const observer = new ResizeObserver(([entry]) => {
      const measuredWidth = Math.floor(entry.contentRect.width);
      if (measuredWidth > 0) {
        setWidth(measuredWidth);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [elementRef, width];
}
