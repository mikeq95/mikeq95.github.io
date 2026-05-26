import React, { useState, useEffect, useRef } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { Icon } from '@iconify/react';
import { useAuth } from '@site/src/context/AuthContext';
import { supabase } from '@site/src/lib/supabase';
import styles from './styles.module.css';

function PostActionsInner({ postId }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [likeAnim, setLikeAnim] = useState(false);
  const [bookmarkAnim, setBookmarkAnim] = useState(false);
  const loginTriggerRef = useRef(null);

  useEffect(() => {
    if (!supabase) return;
    fetchCounts();
    if (user) fetchUserState();
  }, [user, postId]);

  const fetchCounts = async () => {
    const [{ count: lc }, { count: bc }] = await Promise.all([
      supabase.from('likes').select('*', { count: 'exact', head: true }).eq('post_id', postId),
      supabase.from('bookmarks').select('*', { count: 'exact', head: true }).eq('post_id', postId),
    ]);
    setLikeCount(lc ?? 0);
    setBookmarkCount(bc ?? 0);
  };

  const fetchUserState = async () => {
    const [{ data: likeData }, { data: bookmarkData }] = await Promise.all([
      supabase.from('likes').select('id').eq('post_id', postId).eq('user_id', user.id).maybeSingle(),
      supabase.from('bookmarks').select('id').eq('post_id', postId).eq('user_id', user.id).maybeSingle(),
    ]);
    setLiked(!!likeData);
    setBookmarked(!!bookmarkData);
  };

  const triggerLogin = () => {
    const btn = document.querySelector('[data-auth-trigger]');
    if (btn) btn.click();
  };

  const toggleLike = async () => {
    if (!user) { triggerLogin(); return; }
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 400);
    if (liked) {
      await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', user.id);
      setLiked(false);
      setLikeCount(c => c - 1);
    } else {
      await supabase.from('likes').insert({ post_id: postId, user_id: user.id });
      setLiked(true);
      setLikeCount(c => c + 1);
    }
  };

  const toggleBookmark = async () => {
    if (!user) { triggerLogin(); return; }
    setBookmarkAnim(true);
    setTimeout(() => setBookmarkAnim(false), 400);
    if (bookmarked) {
      await supabase.from('bookmarks').delete().eq('post_id', postId).eq('user_id', user.id);
      setBookmarked(false);
      setBookmarkCount(c => c - 1);
    } else {
      await supabase.from('bookmarks').insert({ post_id: postId, user_id: user.id });
      setBookmarked(true);
      setBookmarkCount(c => c + 1);
    }
  };

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={`${styles.actionBtn} ${liked ? styles.liked : ''} ${likeAnim ? styles.pop : ''}`}
        onClick={toggleLike}
      >
        <Icon icon={liked ? 'mdi:heart' : 'mdi:heart-outline'} className={styles.icon} />
        <span className={styles.count}>{likeCount}</span>
      </button>
      <button
        type="button"
        className={`${styles.actionBtn} ${bookmarked ? styles.bookmarked : ''} ${bookmarkAnim ? styles.pop : ''}`}
        onClick={toggleBookmark}
      >
        <Icon icon={bookmarked ? 'mdi:bookmark' : 'mdi:bookmark-outline'} className={styles.icon} />
        <span className={styles.count}>{bookmarkCount}</span>
      </button>
    </div>
  );
}

export default function PostActions({ postId }) {
  return (
    <BrowserOnly fallback={null}>
      {() => <PostActionsInner postId={postId} />}
    </BrowserOnly>
  );
}
