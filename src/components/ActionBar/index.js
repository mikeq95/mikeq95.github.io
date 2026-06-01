import React, { useState, useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { Icon } from '@iconify/react';
import { useAuth } from '@site/src/context/AuthContext';
import { supabase } from '@site/src/lib/supabase';
import styles from './styles.module.css';

function ActionBarInner({ postId, title, url }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [likeAnim, setLikeAnim] = useState(false);
  const [bookmarkAnim, setBookmarkAnim] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const twitterUrl = 'https://twitter.com/intent/tweet?text=' + encodedTitle + '&url=' + encodedUrl;
  const facebookUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodedUrl;
  const linkedinUrl = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodedUrl;

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
    <div className={styles.bar}>
      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.actionBtn} ${liked ? styles.liked : ''} ${likeAnim ? styles.pop : ''}`}
          onClick={toggleLike}
          title="点赞"
        >
          <Icon icon={liked ? 'mdi:heart' : 'mdi:heart-outline'} className={styles.icon} />
          <span className={styles.count}>{likeCount}</span>
        </button>
        <button
          type="button"
          className={`${styles.actionBtn} ${bookmarked ? styles.bookmarked : ''} ${bookmarkAnim ? styles.pop : ''}`}
          onClick={toggleBookmark}
          title="收藏"
        >
          <Icon icon={bookmarked ? 'mdi:bookmark' : 'mdi:bookmark-outline'} className={styles.icon} />
          <span className={styles.count}>{bookmarkCount}</span>
        </button>
      </div>

      <div className={styles.divider} />

      <div className={styles.share}>
        <span className={styles.shareLabel}>分享</span>
        <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className={styles.shareLink} title="分享到 X">
          <Icon icon="simple-icons:x" className={styles.shareIcon} />
        </a>
        <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className={styles.shareLink} title="分享到 Facebook">
          <Icon icon="mdi:facebook" className={styles.shareIcon} />
        </a>
        <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className={styles.shareLink} title="分享到 LinkedIn">
          <Icon icon="mdi:linkedin" className={styles.shareIcon} />
        </a>
      </div>
    </div>
  );
}

export default function ActionBar({ postId, title, url }) {
  return (
    <BrowserOnly fallback={null}>
      {() => <ActionBarInner postId={postId} title={title} url={url} />}
    </BrowserOnly>
  );
}
