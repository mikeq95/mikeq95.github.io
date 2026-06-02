import React, { useEffect, useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { useAuth } from '@site/src/context/AuthContext';
import { supabase } from '@site/src/lib/supabase';
import { useBlogTitleMap } from '@site/src/hooks/useBlogTitleMap';
import styles from './my-collection.module.css';

function MyBookmarksInner() {
  const { user, loading } = useAuth();
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
      .then(({ data }) => {
        setPosts(data ?? []);
        setFetching(false);
      });
  }, [user]);

  if (loading || fetching) return <p className={styles.hint}>加载中…</p>;

  if (!user) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyText}>请先登录查看你的收藏记录。</p>
        <div className={styles.emptyActions}>
          <button
            type="button"
            className={styles.emptyBtn}
            onClick={() => document.querySelector('[data-auth-trigger]')?.click()}
          >
            立即登录
          </button>
          <Link to="/blog" className={`${styles.emptyBtn} ${styles.emptyBtnSecondary}`}>
            去浏览文章
          </Link>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyText}>还没有收藏任何文章。</p>
        <Link to="/blog" className={styles.emptyBtn}>
          去浏览文章
        </Link>
      </div>
    );
  }

  return (
    <ul className={styles.list}>
      {posts.map(({ post_id, created_at }) => (
        <li key={post_id} className={styles.item}>
          <Link to={post_id} className={styles.link}>
            {titleMap.get(post_id) ?? post_id}
          </Link>
          <span className={styles.date}>
            {new Date(created_at).toLocaleDateString('zh-CN')}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function MyBookmarksPage() {
  return (
    <Layout title="我的收藏" description="你收藏过的文章">
      <main className={styles.container}>
        <h1 className={styles.title}>我的收藏 🔖</h1>
        <BrowserOnly fallback={<p>加载中…</p>}>
          {() => <MyBookmarksInner />}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
