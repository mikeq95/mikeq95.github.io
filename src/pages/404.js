import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './404.module.css';

export default function NotFound() {
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const isZh = currentLocale.startsWith('zh');

  return (
    <Layout
      title={isZh ? '页面未找到' : 'Page Not Found'}
      description={isZh ? '找不到您要访问的页面' : 'The page you are looking for does not exist'}
    >
      <main className={styles.container}>
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>
          {isZh ? '找不到这个页面' : 'Page Not Found'}
        </h1>
        <p className={styles.description}>
          {isZh
            ? '您访问的页面不存在，可能已被移动或删除。'
            : "The page you're looking for doesn't exist or has been moved."}
        </p>
        <Link className={styles.button} to="/">
          {isZh ? '回到首页' : 'Back to Home'}
        </Link>
      </main>
    </Layout>
  );
}
