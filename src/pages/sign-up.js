import React from 'react';
import Layout from '@theme/Layout';
import { SignUp } from '@clerk/clerk-react';
import ClerkGate from '@site/src/components/ClerkGate';

export default function SignUpPage() {
  return (
    <Layout title="注册" description="创建新账户">
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
          <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
        </ClerkGate>
      </main>
    </Layout>
  );
}
