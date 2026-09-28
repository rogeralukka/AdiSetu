import { useState, useEffect } from 'react';

/**
 * Hook to track whether window or container ref has scrolled past a given threshold.
 * Used for scroll-aware top nav fade masks.
 * 
 * @param {number} threshold - Scroll threshold in pixels (default: 6)
 * @param {React.RefObject|null} containerRef - Optional ref to scrollable container
 * @returns {boolean} - true if scrolled past threshold, false otherwise
 */
export function useScrolled(threshold = 6, containerRef = null) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll(e) {
      const el = containerRef?.current || 
        (e && e.target && typeof e.target.scrollTop === 'number' ? e.target : document.querySelector('.page-scroll-wrapper'));
      const y = el ? el.scrollTop : (window.scrollY || document.documentElement.scrollTop || 0);
      setScrolled(y > threshold);
    }

    handleScroll();

    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    return () => window.removeEventListener('scroll', handleScroll, { capture: true });
  }, [threshold, containerRef]);

  return scrolled;
}
