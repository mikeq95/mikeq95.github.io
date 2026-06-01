import React, { useEffect } from 'react';
import { AuthProvider } from '@site/src/context/AuthContext';

export default function Root({ children }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.gtag) {
      window.gtag = function() {};
    }
  }, []);
  return <AuthProvider>{children}</AuthProvider>;
}
