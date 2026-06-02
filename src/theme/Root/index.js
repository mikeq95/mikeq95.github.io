import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { AuthProvider } from '@site/src/context/AuthContext';
import BackToTop from '@site/src/components/BackToTop';

export default function Root({ children }) {
  return (
    <AuthProvider>
      {children}
      <BrowserOnly>{() => <BackToTop />}</BrowserOnly>
    </AuthProvider>
  );
}
