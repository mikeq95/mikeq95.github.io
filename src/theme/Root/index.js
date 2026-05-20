import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { ClerkProvider } from '@clerk/clerk-react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function ClerkWrapper({ children, publishableKey }) {
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}

export default function Root({ children }) {
  const { siteConfig } = useDocusaurusContext();
  const publishableKey = siteConfig.customFields?.clerkPublishableKey;

  if (!publishableKey) {
    return children;
  }

  return (
    <BrowserOnly fallback={children}>
      {() => (
        <ClerkWrapper publishableKey={publishableKey}>
          {children}
        </ClerkWrapper>
      )}
    </BrowserOnly>
  );
}
