import React, { useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { AuthProvider } from '@site/src/context/AuthContext';
import BackToTop from '@site/src/components/BackToTop';

export default function Root({ children }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.gtag) {
      window.gtag = function() {};
    }

    const onScroll = () => {
      document.documentElement.classList.toggle('nav-scrolled', window.scrollY > 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <AuthProvider>
      {children}
      <BrowserOnly>{() => <BackToTop />}</BrowserOnly>
    </AuthProvider>
  );
}
