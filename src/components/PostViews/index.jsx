import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { usePostViews } from '@site/src/hooks/usePostViews';
import styles from './index.module.css';

function PostViewsInner({ postId }) {
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const isZh = currentLocale.startsWith('zh');
  const counts = usePostViews(postId);

  if (!counts) return null;

  return (
    <div className={styles.views}>
      <span className={styles.stat}>{counts.total.toLocaleString()}</span>
      <span className={styles.label}>{isZh ? ' 次浏览' : ' views'}</span>
      <span className={styles.dot}>·</span>
      <span className={styles.stat}>{counts.unique.toLocaleString()}</span>
      <span className={styles.label}>{isZh ? ' 位读者' : ' readers'}</span>
    </div>
  );
}

export default function PostViews({ postId }) {
  return (
    <BrowserOnly fallback={null}>
      {() => <PostViewsInner postId={postId} />}
    </BrowserOnly>
  );
}
