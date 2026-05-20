import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import { SignIn } from '@clerk/clerk-react';

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
        <BrowserOnly fallback={<p>加载中…</p>}>
          {() => <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
