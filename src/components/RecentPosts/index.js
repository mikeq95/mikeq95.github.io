import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

export default function RecentPosts({ posts }) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>最新文章</h2>
        <Link to="/blog" className={styles.viewAll}>查看全部 →</Link>
      </div>
      <div className={styles.grid}>
        {posts.map((post) => {
          const { permalink, title, date, tags } = post.metadata;
          const dateStr = new Date(date).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          return (
            <Link key={permalink} to={permalink} className={styles.card}>
              <p className={styles.cardTitle}>{title}</p>
              <div className={styles.cardMeta}>
                <span className={styles.cardDate}>{dateStr}</span>
                {tags && tags.length > 0 && (
                  <div className={styles.cardTags}>
                    {tags.slice(0, 3).map((tag) => (
                      <span key={tag.label} className={styles.tag}>
                        {tag.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
