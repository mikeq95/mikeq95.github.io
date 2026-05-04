import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './index.module.css';

export default function Home() {
  return (
    <Layout title="mikeq95's blog" description="mikeQ95's personal blog">
      <main className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>👨‍💻 iOS Developer</div>
            <h1 className={styles.heroTitle}>
              你好 <span className={styles.gradient1}>こんにちは</span>{' '}
              <span className={styles.gradient2}>안녕하세요</span>{' '}
              <span className={styles.gradient3}>Hello</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Hello everyone🥳, I am a sophomore college student from China🇨🇳. Welcome to my blog!
            </p>
            <p className={styles.heroSubtitleText}>
              I write about Swift, iOS development, embedded systems, and things I find interesting.
            </p>
            <div className={styles.heroButtonWrapper}>
              <Link className={styles.heroButton} to="/blog">
                Read my blog →
              </Link>
            </div>
          </div>
          <div className={styles.avatarContainer}>
            <img src={useBaseUrl('img/avatar.jpg')} alt="mikeQ95 Avatar" className={styles.avatarImage} />
          </div>
        </div>
      </main>
    </Layout>
  );
}
