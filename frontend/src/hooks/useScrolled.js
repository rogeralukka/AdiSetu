import { useState, useEffect } from 'react';

/**
 * Hook to track whether the page's scroll container has scrolled past a threshold.
 * Used for scroll-aware top nav fade masks.
 *
 * @param {number} threshold - Scroll threshold in pixels (default: 6)
 * @param {React.RefObject|null} containerRef - Optional ref to scrollable container
 * @returns {boolean} - true if scrolled past threshold, false otherwise
 */
export function useScrolled(threshold = 6, containerRef = null) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const getContainer = () =>
      containerRef?.current || document.querySelector('.page-scroll-wrapper');

    function handleScroll(e) {
      const container = getContainer();
      // Capture-phase window listener receives scroll events from every scrollable
      // element (including the dropdown's language list). Only react to the page's
      // own scroll container so an inner list's scroll isn't misread as the page.
      if (!container || e.target !== container) return;
      setScrolled(container.scrollTop > threshold);
    }

    // Initial state (no event — read the container directly)
    const initial = getContainer();
    if (initial) setScrolled(initial.scrollTop > threshold);

    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    return () => window.removeEventListener('scroll', handleScroll, { capture: true });
  }, [threshold, containerRef]);

  return scrolled;
}
