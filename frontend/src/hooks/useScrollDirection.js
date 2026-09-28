import { useState, useEffect, useRef } from 'react';

export function useScrollDirection(containerRef = null) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    function onScroll(e) {
      const container = containerRef?.current || document.querySelector('.page-scroll-wrapper');
      // This is a capture-phase listener on window, so it receives scroll events
      // from EVERY scrollable element on the page — including nested ones like the
      // profile dropdown's language list. Only react when the event actually came
      // from the page's own scroll container; otherwise scrolling an inner list
      // would be misread as the page scrolling and hide the search bar.
      if (!container || e.target !== container) return;
      const y = container.scrollTop;
      if (y < 80) {
        setHidden(false); // always show near the top
      } else if (y > lastY.current + 4) {
        setHidden(true); // scrolling down
      } else if (y < lastY.current - 4) {
        setHidden(false); // scrolling up
      }
      lastY.current = y;
    }
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => window.removeEventListener('scroll', onScroll, { capture: true });
  }, [containerRef]);

  return hidden;
}
