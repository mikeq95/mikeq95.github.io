import React, { useEffect, useRef, useState, useMemo } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { Icon } from '@iconify/react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useAuth } from '@site/src/context/AuthContext';
import { supabase } from '@site/src/lib/supabase';
import { useBlogTitleMap } from '@site/src/hooks/useBlogTitleMap';
import styles from './my-collection.module.css';

const GRADIENTS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'linear-gradient(135deg,#fda085,#f6d365)',
  'linear-gradient(135deg,#89f7fe,#66a6ff)',
];
function getGradient(s) { return GRADIENTS[s.length % GRADIENTS.length]; }

function CardCover({ image, permalink }) {
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  return (
    <div className={styles.cardCoverWrap}>
      <div className={styles.cardCoverGradient} style={{ background: getGradient(permalink) }} />
      {image && !err && (
        <img
          ref={imgRef}
          className={`${styles.cardCoverImg} ${loaded ? styles.cardCoverImgLoaded : ''}`}
          src={image} alt=""
          onLoad={() => setLoaded(true)}
          onError={() => setErr(true)}
        />
      )}
    </div>
  );
}

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

function MyBookmarksInner() {
  const { user, loading } = useAuth();
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const isEn = currentLocale === 'en';
  const isZh = !isEn;
  const [posts, setPosts] = useState([]);
  const [fetching, setFetching] = useState(false);
  const titleMap = useBlogTitleMap();

  useEffect(() => {
    if (!user || !supabase) return;
    setFetching(true);
    supabase
      .from('bookmarks')
      .select('post_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setPosts(data ?? []); setFetching(false); });
  }, [user]);

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
        <Icon icon="mdi:bookmark-off-outline" width={96} height={96} className={styles.emptyIcon} />
        <p className={styles.emptyText}>{isEn ? 'Please log in to see your bookmarks.' : '请先登录查看你的收藏记录。'}</p>
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
        <Icon icon="mdi:bookmark-off-outline" width={96} height={96} className={styles.emptyIcon} />
        <p className={styles.emptyText}>{isEn ? 'No bookmarks yet.' : '还没有收藏任何文章。'}</p>
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

export default function MyBookmarksPage() {
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const isEn = currentLocale === 'en';
  return (
    <Layout title={isEn ? 'My Bookmarks' : '我的收藏'} description={isEn ? 'Posts you bookmarked' : '你收藏过的文章'}>
      <main className={styles.container}>
        <h1 className={styles.pageTitle}>{isEn ? 'My Bookmarks 🔖' : '我的收藏 🔖'}</h1>
        <BrowserOnly fallback={<p className={styles.hint}>{isEn ? 'Loading…' : '加载中…'}</p>}>
          {() => <MyBookmarksInner />}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
