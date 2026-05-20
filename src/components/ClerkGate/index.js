import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useClerkReady } from '@site/src/components/ClerkReadyContext';

/**
 * Renders children only when ClerkProvider is mounted (client + publishable key).
 */
export default function ClerkGate({ children, fallback = null }) {
  const { siteConfig } = useDocusaurusContext();
  const publishableKey = siteConfig.customFields?.clerkPublishableKey;
  const clerkReady = useClerkReady();

  if (!publishableKey) {
    return (
      <p style={{ textAlign: 'center', color: 'var(--ifm-color-emphasis-700)' }}>
        登录功能未配置。请在构建环境中设置 VITE_CLERK_PUBLISHABLE_KEY。
      </p>
    );
  }

  if (!clerkReady) {
    return fallback;
  }

  return children;
}
