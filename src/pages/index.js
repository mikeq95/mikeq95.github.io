import { useMemo, useRef, useEffect } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import { usePluginData } from '@docusaurus/useGlobalData';
import RecentPosts from '@site/src/components/RecentPosts';
import HeroAuthCard from '@site/src/components/HeroAuthCard';
import styles from './index.module.css';

// Each word gets its own gradient segment so together they form one rainbow
const LANG_GREETINGS = [
  { text: 'こんにちは, ', gradient: 'linear-gradient(135deg, #FF2D55, #AF52DE)' },
  { text: '안녕하세요, ', gradient: 'linear-gradient(135deg, #AF52DE, #32ADE6)' },
  { text: 'Hello',            gradient: 'linear-gradient(135deg, #32ADE6, #34C759)' },
];

function tagTierStyle(count) {
  if (count >= 3) return { fontSize: '0.9rem',  opacity: 1    };
  if (count >= 2) return { fontSize: '0.82rem', opacity: 0.78 };
  return              { fontSize: '0.75rem', opacity: 0.58 };
}

function HomepageHeader() {
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const isZh = currentLocale.startsWith('zh');

  const greetingRef  = useRef(null);
  const descRef      = useRef(null);
  const ctaRef       = useRef(null);
  const cardRef      = useRef(null);
  const heroTagsRef  = useRef(null);

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
        // Layer 1 – greeting words stagger in from below
        if (greetingRef.current?.children) {
          gsap.from(Array.from(greetingRef.current.children), {
            opacity: 0, y: 18,
            duration: 0.45, stagger: 0.15, ease: 'power2.out', delay: 0.05,
          });
        }
        // Layer 2 – description
        gsap.from(descRef.current, {
          opacity: 0, y: 20,
          duration: 0.55, ease: 'power2.out', delay: 0.42,
        });
        // Layer 3 – CTA button
        gsap.from(ctaRef.current, {
          opacity: 0, y: 14,
          duration: 0.5, ease: 'power2.out', delay: 0.58,
        });
        // Layer 4 – card (independent, slides in with scale)
        gsap.from(cardRef.current, {
          opacity: 0, scale: 0.92,
          duration: 0.7, ease: 'power2.out', delay: 0.2,
        });
        // Layer 5 – tag pills stagger
        if (heroTagsRef.current?.children) {
          gsap.from(Array.from(heroTagsRef.current.children), {
            opacity: 0, y: 10,
            duration: 0.38, stagger: 0.05, ease: 'power2.out', delay: 0.72,
          });
        }
      });
    });
    return () => ctx?.revert();
  }, []);

  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroContainer}>

        <div className={styles.heroText}>
          <Heading as="h1" className={styles.title}>
            {'你好, '}
            <span ref={greetingRef}>
              {LANG_GREETINGS.map(({ text, gradient }, i) => (
                <span key={i} className={styles.greetingWord} style={{ backgroundImage: gradient }}>
                  {text}
                </span>
              ))}
            </span>
          </Heading>

          <p className={styles.description} ref={descRef}>
            {isZh
              ? '我是一名来自中国的大学生，欢迎来到我的博客。'
              : 'I am a university student from China. Welcome to my blog.'}
          </p>

          <div className={styles.buttons} ref={ctaRef}>
            <Link className={styles.blogButton} to="/blog">
              {isZh ? '阅读我的博客' : 'Read my blog'}
            </Link>
          </div>

          {tags.length > 0 && (
            <div className={styles.heroTags} ref={heroTagsRef}>
              {tags.map(tag => (
                <Link
                  key={tag.label}
                  to={tag.permalink}
                  className={styles.heroTag}
                  style={tagTierStyle(tag.count)}
                >
                  {tag.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className={styles.heroCardContainer} ref={cardRef}>
          <HeroAuthCard />
        </div>

      </div>
    </header>
  );
}

export default function Home() {
  const blogData = usePluginData('blog-global-data');
  const recentPosts = useMemo(() => blogData?.blogPosts ?? [], [blogData]);
  return (
    <Layout description="mikeq95's personal blog — a university student from China sharing tech, tools, and personal notes.">
      <HomepageHeader />
      <main>
        <RecentPosts posts={recentPosts} />
      </main>
    </Layout>
  );
}
