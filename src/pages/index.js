import { useMemo } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import { useEffect, useRef } from 'react';
import Heading from '@theme/Heading';
import { usePluginData } from '@docusaurus/useGlobalData';
import RecentPosts from '@site/src/components/RecentPosts';
import HeroAuthCard from '@site/src/components/HeroAuthCard';
import styles from './index.module.css';

function HomepageHeader() {
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const isZh = currentLocale.startsWith('zh');
  const heroTextRef = useRef(null);
  const cardRef = useRef(null);

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
        gsap.from(cardRef.current, {
          opacity: 0,
          scale: 0.9,
          duration: 0.8,
          ease: 'power2.out',
        });
      });
    });
    return () => ctx?.revert();
  }, []);

  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroContainer}>
        <div className={styles.heroText} ref={heroTextRef}>
          <Heading as="h1" className={styles.title}>
            你好, <span className={styles.gradientText}>こんにちは, 안녕하세요, Hello</span>
          </Heading>
          <p className={styles.description}>
            {isZh
              ? '我是一名来自中国的大学生，欢迎来到我的博客。'
              : 'I am a university student from China. Welcome to my blog.'}
          </p>
          <div className={styles.buttons}>
            <Link className={styles.blogButton} to="/blog">
              {isZh ? '阅读我的博客' : 'Read my blog'}
            </Link>
          </div>
        </div>
        <div className={styles.heroCardContainer} ref={cardRef}>
          <HeroAuthCard />
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
      description="mikeq95's personal blog — a university student from China sharing tech, tools, and personal notes.">
      <HomepageHeader />
      <main>
        <RecentPosts posts={recentPosts} />
      </main>
    </Layout>
  );
}
