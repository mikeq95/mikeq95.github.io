import React, { useState, useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { Icon } from '@iconify/react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useAuth } from '@site/src/context/AuthContext';
import { supabase } from '@site/src/lib/supabase';
import styles from './styles.module.css';

function htmlToMarkdown(el) {
  function walk(node) {
    if (node.nodeType === 3) return node.textContent;
    if (node.nodeType !== 1) return '';
    const tag = node.tagName.toLowerCase();
    if (tag === 'pre') {
      const lang = node.querySelector('code')?.className.match(/language-(\w+)/)?.[1] ?? '';
      return `\`\`\`${lang}\n${node.textContent.trimEnd()}\n\`\`\`\n\n`;
    }
    if (tag === 'script' || tag === 'style' || tag === 'button') return '';
    const kids = Array.from(node.childNodes).map(walk).join('');
    switch (tag) {
      case 'h1': return `# ${kids.trim()}\n\n`;
      case 'h2': return `## ${kids.trim()}\n\n`;
      case 'h3': return `### ${kids.trim()}\n\n`;
      case 'h4': return `#### ${kids.trim()}\n\n`;
      case 'h5': return `##### ${kids.trim()}\n\n`;
      case 'h6': return `###### ${kids.trim()}\n\n`;
      case 'p': return `${kids}\n\n`;
      case 'strong': case 'b': return `**${kids}**`;
      case 'em': case 'i': return `*${kids}*`;
      case 'code': return `\`${kids}\``;
      case 'a': { const href = node.getAttribute('href') || ''; return href ? `[${kids}](${href})` : kids; }
      case 'ul': return kids + '\n';
      case 'ol': return kids + '\n';
      case 'li': return `- ${kids.trim()}\n`;
      case 'blockquote': return `> ${kids.trim()}\n\n`;
      case 'hr': return `---\n\n`;
      case 'br': return '\n';
      case 'img': return `![${node.getAttribute('alt') || ''}](${node.getAttribute('src') || ''})`;
      default: return kids;
    }
  }
  return walk(el).replace(/\n{3,}/g, '\n\n').trim();
}

function ActionBarInner({ postId, title, url }) {
  const { user } = useAuth();
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const isEn = currentLocale === 'en';
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [likeAnim, setLikeAnim] = useState(false);
  const [bookmarkAnim, setBookmarkAnim] = useState(false);
  const [copied, setCopied] = useState(null);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const twitterUrl = 'https://twitter.com/intent/tweet?text=' + encodedTitle + '&url=' + encodedUrl;

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
    document.querySelector('[data-auth-trigger]')?.click();
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

  const shareToDiscord = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied('discord');
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  };

  const copyMarkdown = async () => {
    try {
      const contentEl = document.querySelector('article .markdown') || document.querySelector('article');
      const md = contentEl
        ? `# ${title}\n\n${htmlToMarkdown(contentEl)}`
        : `# ${title}\n\n${url}`;
      await navigator.clipboard.writeText(md);
      setCopied('markdown');
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  };

  return (
    <div className={styles.bar}>
      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.actionBtn} ${styles.likeBtn} ${liked ? styles.liked : ''} ${likeAnim ? styles.pop : ''}`}
          onClick={toggleLike}
          title={isEn ? 'Like' : '点赞'}
        >
          <Icon icon={liked ? 'mdi:heart' : 'mdi:heart-outline'} className={styles.icon} />
          <span className={styles.count}>{likeCount}</span>
        </button>
        <button
          type="button"
          className={`${styles.actionBtn} ${styles.bookmarkBtn} ${bookmarked ? styles.bookmarked : ''} ${bookmarkAnim ? styles.pop : ''}`}
          onClick={toggleBookmark}
          title={isEn ? 'Bookmark' : '收藏'}
        >
          <Icon icon={bookmarked ? 'mdi:bookmark' : 'mdi:bookmark-outline'} className={styles.icon} />
          <span className={styles.count}>{bookmarkCount}</span>
        </button>
      </div>

      <div className={styles.divider} />

      <div className={styles.share}>
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.pillBtn} ${styles.pillX}`}
        >
          <Icon icon="simple-icons:x" className={styles.pillIcon} />
          <span>{isEn ? 'Share on X' : '分享到 X'}</span>
        </a>
        <button
          type="button"
          className={`${styles.pillBtn} ${styles.pillDiscord} ${copied === 'discord' ? styles.pillCopied : ''}`}
          onClick={shareToDiscord}
        >
          <Icon icon="simple-icons:discord" className={styles.pillIcon} />
          <span>
            {copied === 'discord'
              ? (isEn ? 'Link Copied!' : '链接已复制!')
              : (isEn ? 'Share to Discord' : '分享到 Discord')}
          </span>
        </button>
        <button
          type="button"
          className={`${styles.pillBtn} ${styles.pillMd} ${copied === 'markdown' ? styles.pillCopied : ''}`}
          onClick={copyMarkdown}
        >
          <Icon icon="mdi:language-markdown" className={styles.pillIcon} />
          <span>
            {copied === 'markdown'
              ? (isEn ? 'Copied!' : '已复制!')
              : (isEn ? 'Copy Markdown' : '复制为 Markdown')}
          </span>
        </button>
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
