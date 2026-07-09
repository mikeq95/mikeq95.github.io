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
          <Heading as="h1" className={styles.title}>
            {isZh
              ? '写给自己看的技术笔记，顺便也分享给你。'
              : 'Notes I wrote for myself — happy to share with you too.'}
          </Heading>
          <p className={styles.description}>
            {isZh
              ? '记录了从零搭博客、驯服 Claude Code、到和各种命令行工具死磕的过程——理工科的严谨，速查卡的简洁。'
              : 'Documenting the process of building this blog from scratch, taming Claude Code, and wrestling with command-line tools — engineering rigor, cheat-sheet brevity.'}
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
