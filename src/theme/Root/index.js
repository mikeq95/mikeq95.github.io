import React, { useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { AuthProvider } from '@site/src/context/AuthContext';
import BackToTop from '@site/src/components/BackToTop';

export default function Root({ children }) {
  useEffect(() => {
    // Redirect old github.io domain to canonical domain
    if (window.location.hostname === 'mikeq95.github.io') {
      window.location.replace(
        'https://mikeq95blog.uk' +
        window.location.pathname +
        window.location.search +
        window.location.hash
      );
      return;
    }

    if (!window.gtag) window.gtag = function() {};

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
