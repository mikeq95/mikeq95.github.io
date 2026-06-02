import React, { useEffect, useRef } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';

export default function RecentPosts({ posts = [] }) {
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const isZh = currentLocale.startsWith('zh');
  const cardsRef = useRef(null);

  useEffect(() => {
    if (!cardsRef.current || !cardsRef.current.children.length) return;
    let ctx;
    Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]).then(([{ gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.from(Array.from(cardsRef.current.children), {
          opacity: 0,
          y: 30,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 80%',
          },
        });
      });
    });
    return () => ctx?.revert();
  }, [posts.length]);

  if (!posts.length) return null;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.sectionTitle}>
          {isZh ? '最新文章' : 'Recent Posts'}
        </h2>
        <div className={styles.grid} ref={cardsRef}>
          {posts.map(post => (
            <Link key={post.id} to={post.permalink} className={styles.card}>
              <div className={styles.cardMeta}>
                <time className={styles.date}>
                  {new Date(post.date).toLocaleDateString(
                    isZh ? 'zh-CN' : 'en-US',
                    { year: 'numeric', month: 'short', day: 'numeric' },
                  )}
                </time>
              </div>
              <h3 className={styles.cardTitle}>{post.title}</h3>
              {post.tags.length > 0 && (
                <div className={styles.tags}>
                  {post.tags.slice(0, 2).map(tag => (
                    <span key={tag.label} className={styles.tag}>{tag.label}</span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
        <div className={styles.more}>
          <Link to="/blog" className={styles.moreLink}>
            {isZh ? '查看全部文章 →' : 'All posts →'}
          </Link>
        </div>
      </div>
    </section>
  );
}
