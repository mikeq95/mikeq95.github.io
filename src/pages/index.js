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
            {isZh ? (
              <>
                Claude、GitHub，或者其他。
                <br />
                我一直在写。
              </>
            ) : (
              <>
                Claude, GitHub, or others.
                <br />
                I keep writing.
              </>
            )}
          </Heading>
          <p className={styles.description}>
            {isZh
              ? '读你想读的内容，用你喜欢的方式——这是一个为记录而生的博客。探索能直接照做的教程，读懂经过验证的方法，用清晰的排版找到你需要的答案。没有广告干扰，内容持续更新，你随时都能找到你需要的。'
              : "Read what you want, the way you like — a blog built for exactly that. Explore tutorials you can follow step by step, methods that have been put to the test, and a layout clear enough to find what you need. No ads in the way, content updated regularly, so what you're looking for is always here."}
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
      description="mikeq95's personal blog — a university student from China sharing tech, tools, and personal notes.">
      <HomepageHeader />
      <main>
        <RecentPosts posts={recentPosts} />
      </main>
    </Layout>
  );
}
