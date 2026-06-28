import React, { useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { AuthProvider } from '@site/src/context/AuthContext';
import BackToTop from '@site/src/components/BackToTop';
import { applyAccentColor } from '@site/src/utils/themeColor';

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

    // Apply saved accent color immediately on every page load
    try {
      const saved = localStorage.getItem('theme-accent-color');
      if (saved) applyAccentColor(saved);
    } catch {}
  }, []);
  return (
    <AuthProvider>
      {children}
      <BrowserOnly>{() => <BackToTop />}</BrowserOnly>
    </AuthProvider>
  );
}
