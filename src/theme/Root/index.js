import React from 'react';
import { AuthProvider } from '@site/src/context/AuthContext';

export default function Root({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
