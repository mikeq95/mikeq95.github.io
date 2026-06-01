import React, { useEffect, useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useAuth } from '@site/src/context/AuthContext';
import { supabase } from '@site/src/lib/supabase';
import styles from './my-collection.module.css';

function MyLikesInner() {
  const { user, loading } = useAuth();
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const isEn = currentLocale === 'en';
  const [posts, setPosts] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!user || !supabase) return;
    setFetching(true);
    supabase
      .from('likes')
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
        <p>{isEn ? 'Please log in to see your liked posts.' : '请先登录查看你的点赞记录。'}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return <p className={styles.hint}>{isEn ? 'No liked posts yet.' : '还没有点赞任何文章。'}</p>;
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

export default function MyLikesPage() {
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const isEn = currentLocale === 'en';
  return (
    <Layout title={isEn ? 'My Likes' : '我的点赞'} description={isEn ? 'Posts you liked' : '你点赞过的文章'}>
      <main className={styles.container}>
        <h1 className={styles.title}>{isEn ? 'My Likes' : '我的点赞'} ❤️</h1>
        <BrowserOnly fallback={<p>{isEn ? 'Loading…' : '加载中…'}</p>}>
          {() => <MyLikesInner />}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
