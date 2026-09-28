import { useState, useEffect, useRef } from 'react';

export function useScrollDirection(containerRef = null) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    function onScroll(e) {
      const el = containerRef?.current || 
        (e && e.target && typeof e.target.scrollTop === 'number' ? e.target : document.querySelector('.page-scroll-wrapper'));
      const y = el ? el.scrollTop : window.scrollY;
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
