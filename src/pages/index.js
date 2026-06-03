import { useMemo } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import { useEffect, useRef } from 'react';
import Heading from '@theme/Heading';
import { usePluginData } from '@docusaurus/useGlobalData';
import RecentPosts from '@site/src/components/RecentPosts';
import styles from './index.module.css';

function HomepageHeader() {
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const isZh = currentLocale.startsWith('zh');
  const heroTextRef = useRef(null);
  const imgRef = useRef(null);
  const blogData = usePluginData('blog-global-data');
  const tags = useMemo(() => {
    const map = new Map();
    (blogData?.blogPosts ?? []).forEach(post => {
      (post.tags ?? []).forEach(tag => {
        const e = map.get(tag.label) ?? { ...tag, count: 0 };
        e.count++;
        map.set(tag.label, e);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [blogData]);

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
        gsap.from(imgRef.current, {
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
          {tags.length > 0 && (
            <div className={styles.heroTags}>
              {tags.map(tag => (
                <Link key={tag.label} to={tag.permalink} className={styles.heroTag}>
                  {tag.label}
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className={styles.heroImageContainer}>
          <img
            ref={imgRef}
            src={useBaseUrl('/img/ahri.jpg')}
            alt="Profile Avatar"
            className={styles.heroImage}
          />
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
    () => (blogData?.blogPosts ?? []).slice(0, 4),
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
