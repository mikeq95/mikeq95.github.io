import { useEffect, useRef } from 'react';

// Loads GSAP dynamically — only needed for animations, not initial render.
// Returns a ref so callers can read gsapRef.current once the import resolves.
export function useGsap() {
  const gsapRef = useRef(null);

  useEffect(() => {
    import('gsap').then(({ gsap }) => { gsapRef.current = gsap; });
  }, []);

  return gsapRef;
}
