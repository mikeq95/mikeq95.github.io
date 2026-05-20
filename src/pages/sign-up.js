import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import { SignUp } from '@clerk/clerk-react';

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
        <BrowserOnly fallback={<p>加载中…</p>}>
          {() => <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
