import React from 'react';
import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/clerk-react';
import styles from './styles.module.css';

export default function AuthButtons() {
  return (
    <div className={styles.auth}>
      <ClerkLoading>
        <span className={styles.loading}>…</span>
      </ClerkLoading>
      <ClerkLoaded>
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
      </ClerkLoaded>
    </div>
  );
}
