import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useClerkReady } from '@site/src/components/ClerkReadyContext';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/clerk-react';
import styles from './styles.module.css';

function AuthButtonsInner() {
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <button type="button" className={styles.btn}>
            登录
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`}>
            注册
          </button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              avatarBox: styles.avatar,
            },
          }}
        />
      </SignedIn>
    </>
  );
}

export default function AuthButtons() {
  const { siteConfig } = useDocusaurusContext();
  const publishableKey = siteConfig.customFields?.clerkPublishableKey;
  const clerkReady = useClerkReady();

  if (!publishableKey) {
    return null;
  }

  if (!clerkReady) {
    return <span className={styles.loading}>…</span>;
  }

  return (
    <div className={styles.auth}>
      <AuthButtonsInner />
    </div>
  );
}
