import React, { useMemo } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { Icon } from '@iconify/react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useUserCollection } from '@site/src/hooks/useUserCollection';
import { useBlogTitleMap } from '@site/src/hooks/useBlogTitleMap';
import CardCover from '@site/src/components/CardCover';
import styles from './styles.module.css';

function PostCard({ post_id, created_at, titleMap, isEn }) {
  const info = titleMap.get(post_id);
  const title = info?.title ?? post_id;
  const image = info?.image ?? null;
  const firstTag = info?.tags?.[0]?.label ?? null;
  return (
    <Link to={post_id} className={styles.card}>
      <CardCover image={image} permalink={post_id} />
      <div className={styles.cardBody}>
        {firstTag && <span className={styles.cardTag}>{firstTag}</span>}
        <h3 className={styles.cardTitle}>{title}</h3>
        <time className={styles.cardDate}>
          {new Date(created_at).toLocaleDateString(isEn ? 'en-US' : 'zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })}
        </time>
      </div>
    </Link>
  );
}

function CollectionInner({ table, emptyIcon, copy }) {
  const { user, loading, posts, fetching } = useUserCollection(table);
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const isEn = currentLocale === 'en';
  const isZh = !isEn;
  const titleMap = useBlogTitleMap();

  const grouped = useMemo(() => {
    const map = new Map();
    posts.forEach(item => {
      const d = new Date(item.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = isZh
        ? `${d.getFullYear()}年${d.getMonth() + 1}月`
        : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      if (!map.has(key)) map.set(key, { label, items: [] });
      map.get(key).items.push(item);
    });
    return Array.from(map.values());
  }, [posts, isZh]);

  if (loading || fetching) return <p className={styles.hint}>{isEn ? 'Loading…' : '加载中…'}</p>;

  if (!user) {
    return (
      <div className={styles.emptyState}>
        <Icon icon={emptyIcon} width={96} height={96} className={styles.emptyIcon} />
        <p className={styles.emptyText}>{isEn ? copy.loginPrompt.en : copy.loginPrompt.zh}</p>
        <div className={styles.emptyActions}>
          <button type="button" className={styles.emptyBtn} onClick={() => document.querySelector('[data-auth-trigger]')?.click()}>
            {isEn ? 'Log in' : '立即登录'}
          </button>
          <Link to="/blog" className={`${styles.emptyBtn} ${styles.emptyBtnSecondary}`}>
            {isEn ? 'Browse posts' : '去浏览文章'}
          </Link>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Icon icon={emptyIcon} width={96} height={96} className={styles.emptyIcon} />
        <p className={styles.emptyText}>{isEn ? copy.emptyText.en : copy.emptyText.zh}</p>
        <Link to="/blog" className={styles.emptyBtn}>{isEn ? 'Browse posts' : '去浏览文章'}</Link>
      </div>
    );
  }

  return (
    <>
      {grouped.map(({ label, items }) => (
        <section key={label} className={styles.monthGroup}>
          <div className={styles.monthLabel}>{label}</div>
          <div className={styles.grid}>
            {items.map(item => (
              <PostCard key={item.post_id} {...item} titleMap={titleMap} isEn={isEn} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

// A "my saved posts" page (likes / bookmarks) — same shell, grouping, and
// empty/loading states, parameterized by Supabase table + copy.
export default function CollectionPage({ table, emptyIcon, copy }) {
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const isEn = currentLocale === 'en';
  return (
    <Layout
      title={isEn ? copy.title.en : copy.title.zh}
      description={isEn ? copy.description.en : copy.description.zh}
    >
      <main className={styles.container}>
        <h1 className={styles.pageTitle}>{isEn ? copy.pageTitle.en : copy.pageTitle.zh}</h1>
        <BrowserOnly fallback={<p className={styles.hint}>{isEn ? 'Loading…' : '加载中…'}</p>}>
          {() => <CollectionInner table={table} emptyIcon={emptyIcon} copy={copy} />}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
