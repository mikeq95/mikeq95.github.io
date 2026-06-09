import React, { useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { AuthProvider } from '@site/src/context/AuthContext';
import BackToTop from '@site/src/components/BackToTop';

function applyAccentColor(color) {
  let styleEl = document.getElementById('custom-theme-color-style');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'custom-theme-color-style';
    document.head.appendChild(styleEl);
  }
  styleEl.innerHTML = `
    :root {
      --ifm-color-primary: ${color} !important;
      --ifm-color-primary-dark: ${color} !important;
      --ifm-color-primary-darker: ${color} !important;
      --ifm-color-primary-darkest: ${color} !important;
      --ifm-color-primary-light: ${color} !important;
      --ifm-color-primary-lighter: ${color} !important;
      --ifm-color-primary-lightest: ${color} !important;
      --ifm-link-color: ${color} !important;
    }
    ::selection { background-color: ${color} !important; color: #fff !important; }
    ::-moz-selection { background-color: ${color} !important; color: #fff !important; }
  `;
}

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
