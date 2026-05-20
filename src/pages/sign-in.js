import React from 'react';
import Layout from '@theme/Layout';
import { SignIn } from '@clerk/clerk-react';
import ClerkGate from '@site/src/components/ClerkGate';

export default function SignInPage() {
  return (
    <Layout title="登录" description="登录你的账户">
      <main
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - var(--ifm-navbar-height) - 120px)',
          padding: '2rem 1rem',
        }}
      >
        <ClerkGate fallback={<p>加载中…</p>}>
          <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
        </ClerkGate>
      </main>
    </Layout>
  );
}
