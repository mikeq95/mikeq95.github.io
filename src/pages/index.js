import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroContainer}>
        <div className={styles.heroText}>
          <Heading as="h1" className={styles.title}>
            你好, <span className={styles.gradientText}>こんにちは, 안녕하세요, Hello</span>
          </Heading>
          <p className={styles.description}>
            I am a university student from China. Welcome to my blog.
          </p>
          <div className={styles.buttons}>
            <Link className={styles.blogButton} to="/blog">
              Read my blog
            </Link>
          </div>
        </div>
        <div className={styles.heroImageContainer}>
          <img 
            src={useBaseUrl('/img/颗秘！.jpg')} 
            alt="Profile Avatar" 
            className={styles.heroImage}
          />
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
      </main>
    </Layout>
  );
}
