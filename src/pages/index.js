import { useEffect, useMemo, useRef } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import { usePluginData } from '@docusaurus/useGlobalData';
import RecentPosts from '@site/src/components/RecentPosts';
import styles from './index.module.css';

function HomepageHeader() {
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const isZh = currentLocale.startsWith('zh');
  const heroTextRef = useRef(null);

  useEffect(() => {
    let ctx;
    import('gsap').then(({ gsap }) => {
      ctx = gsap.context(() => {
        const children = heroTextRef.current?.children;
        if (children) {
          gsap.from(Array.from(children), {
            opacity: 0,
            y: 20,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power2.out',
          });
        }
      });
    });
    return () => ctx?.revert();
  }, []);

  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroContainer}>
        <div className={styles.heroText} ref={heroTextRef}>
          <div className={styles.logoLockup}>
            <img src="/img/favicon.ico" alt="" className={styles.logoIcon} />
            <span className={styles.logoWordmark}>mikeq95</span>
          </div>
          <Heading as="h1" className={styles.title}>
            mikeq95's blog
          </Heading>
          <p className={styles.description}>
            Welcome to my blog
          </p>
          <div className={styles.buttons}>
            <Link className={styles.blogButton} to="/blog">
              {isZh ? '阅读我的博客' : 'Read my blog'}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig, i18n: { currentLocale } } = useDocusaurusContext();
  const isZh = currentLocale.startsWith('zh');
  const blogData = usePluginData('blog-global-data');
  const recentPosts = useMemo(
    () => blogData?.blogPosts ?? [],
    [blogData],
  );
  return (
    <Layout
      description={
        isZh
          ? 'mikeq95 的个人博客——一名中国大学生分享技术、工具和个人笔记。'
          : "mikeq95's personal blog — a university student from China sharing tech, tools, and personal notes."
      }>
      <HomepageHeader />
      <main>
        <RecentPosts posts={recentPosts} />
      </main>
    </Layout>
  );
}
