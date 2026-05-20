import React, { useEffect, useState } from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { ClerkReadyContext } from '@site/src/components/ClerkReadyContext';

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!publishableKey) {
    return (
      <ClerkReadyContext.Provider value={false}>
        {children}
      </ClerkReadyContext.Provider>
    );
  }

  if (!mounted) {
    return (
      <ClerkReadyContext.Provider value={false}>
        {children}
      </ClerkReadyContext.Provider>
    );
  }

  return (
    <ClerkReadyContext.Provider value={true}>
      <ClerkWrapper publishableKey={publishableKey}>
        {children}
      </ClerkWrapper>
    </ClerkReadyContext.Provider>
  );
}
