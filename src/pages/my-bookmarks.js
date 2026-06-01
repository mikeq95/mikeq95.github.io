import React, { useEffect, useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useAuth } from '@site/src/context/AuthContext';
import { supabase } from '@site/src/lib/supabase';
import styles from './my-collection.module.css';

function MyBookmarksInner() {
  const { user, loading } = useAuth();
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const isEn = currentLocale === 'en';
  const [posts, setPosts] = useState([]);
  const [fetching, setFetching] = useState(false);

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

  if (loading || fetching) return <p className={styles.hint}>{isEn ? 'Loading…' : '加载中…'}</p>;

  if (!user) {
    return (
      <div className={styles.hint}>
        <p>{isEn ? 'Please log in to see your bookmarks.' : '请先登录查看你的收藏记录。'}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return <p className={styles.hint}>{isEn ? 'No bookmarks yet.' : '还没有收藏任何文章。'}</p>;
  }

  return (
    <ul className={styles.list}>
      {posts.map(({ post_id, created_at }) => (
        <li key={post_id} className={styles.item}>
          <Link to={post_id} className={styles.link}>
            {post_id}
          </Link>
          <span className={styles.date}>
            {new Date(created_at).toLocaleDateString(isEn ? 'en-US' : 'zh-CN')}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function MyBookmarksPage() {
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const isEn = currentLocale === 'en';
  return (
    <Layout title={isEn ? 'My Bookmarks' : '我的收藏'} description={isEn ? 'Posts you bookmarked' : '你收藏过的文章'}>
      <main className={styles.container}>
        <h1 className={styles.title}>{isEn ? 'My Bookmarks' : '我的收藏'} 🔖</h1>
        <BrowserOnly fallback={<p>{isEn ? 'Loading…' : '加载中…'}</p>}>
          {() => <MyBookmarksInner />}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
