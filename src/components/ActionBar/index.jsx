import React, { useState, useRef, useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { Icon } from '@iconify/react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useAuth } from '@site/src/context/AuthContext';
import { supabase } from '@site/src/lib/supabase';
import { triggerLogin } from '@site/src/utils/authTrigger';
import { usePostViews } from '@site/src/hooks/usePostViews';
import { Popover, PopoverButton, PopoverPanel } from '@/components/animate-ui/components/headless/popover';
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

// Flashes a keyed state (e.g. 'discord', 'markdown-failed') for `resetMs`,
// then clears it. Used for the "copied!"/"failed" pill feedback below.
function useCopiedState(resetMs = 2000) {
  const [copied, setCopied] = useState(null);
  const timerRef = useRef(null);
  const flash = (key) => {
    clearTimeout(timerRef.current);
    setCopied(key);
    timerRef.current = setTimeout(() => setCopied(null), resetMs);
  };
  useEffect(() => () => clearTimeout(timerRef.current), []);
  return [copied, flash];
}

function ActionBarInner({ postId, title, url }) {
  const { user } = useAuth();
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const isEn = currentLocale === 'en';
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [copied, flashCopied] = useCopiedState();
  const counts = usePostViews(postId);

  const likeIconRef     = useRef(null);
  const bookmarkIconRef = useRef(null);
  const gsapRef         = useRef(null);
  const pendingRef      = useRef(new Set());

  useEffect(() => {
    import('gsap').then(({ gsap }) => { gsapRef.current = gsap; });
  }, []);

  const encodedUrl   = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const twitterUrl   = 'https://twitter.com/intent/tweet?text=' + encodedTitle + '&url=' + encodedUrl;

  // ── Supabase fetch ────────────────────────────────────────────────────────
  React.useEffect(() => {
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

  // ── GSAP icon animations ──────────────────────────────────────────────────
  function triggerLikeAnim(isNowLiked) {
    const el = likeIconRef.current;
    const g = gsapRef.current;
    if (!el || !g) return;
    const tl = g.timeline();
    tl.to(el, { scale: 1.4, duration: 0.15, ease: 'back.out(3)' })
      .to(el, { scale: 1,   duration: 0.1,  ease: 'power2.in'   });
    if (isNowLiked) {
      tl.to(el, { filter: 'drop-shadow(0 0 8px rgba(254,44,85,0.9))', duration: 0 }, '<')
        .to(el, { filter: 'none', duration: 0.35, ease: 'power2.out' });
    }
  }

  function triggerBookmarkAnim() {
    const el = bookmarkIconRef.current;
    const g = gsapRef.current;
    if (!el || !g) return;
    g.fromTo(el,
      { rotationY: 0 },
      {
        rotationY: 360,
        transformPerspective: 600,
        duration: 0.4,
        ease: 'power2.inOut',
        onComplete: () => g.set(el, { rotationY: 0 }),
      }
    );
  }

  // ── Interactions ──────────────────────────────────────────────────────────
  // Shared insert/delete/count logic for the like and bookmark toggles below —
  // they only differ in which table they hit and which state setters they use.
  const toggleFlag = async (table, { isActive, setIsActive, setCount, onTrigger }) => {
    if (!user) { triggerLogin(); return; }
    if (pendingRef.current.has(table)) return;
    pendingRef.current.add(table);
    onTrigger?.();
    try {
      if (isActive) {
        const { error } = await supabase.from(table).delete().eq('post_id', postId).eq('user_id', user.id);
        if (error) { console.error(`Failed to remove ${table}:`, error); return; }
        setIsActive(false);
        setCount(c => c - 1);
      } else {
        const { error } = await supabase.from(table).insert({ post_id: postId, user_id: user.id });
        if (error) { console.error(`Failed to add ${table}:`, error); return; }
        setIsActive(true);
        setCount(c => c + 1);
      }
    } finally {
      pendingRef.current.delete(table);
    }
  };

  const toggleLike = () => toggleFlag('likes', {
    isActive: liked,
    setIsActive: setLiked,
    setCount: setLikeCount,
    onTrigger: () => triggerLikeAnim(!liked),
  });

  const toggleBookmark = () => toggleFlag('bookmarks', {
    isActive: bookmarked,
    setIsActive: setBookmarked,
    setCount: setBookmarkCount,
    onTrigger: triggerBookmarkAnim,
  });

  const shareToDiscord = async () => {
    try {
      await navigator.clipboard.writeText(url);
      flashCopied('discord');
    } catch (error) {
      console.error('Failed to copy link:', error);
      flashCopied('discord-failed');
    }
  };

  const copyMarkdown = async () => {
    try {
      const contentEl = document.querySelector('article .markdown') || document.querySelector('article');
      const md = contentEl
        ? `# ${title}\n\n${htmlToMarkdown(contentEl)}`
        : `# ${title}\n\n${url}`;
      await navigator.clipboard.writeText(md);
      flashCopied('markdown');
    } catch (error) {
      console.error('Failed to copy markdown:', error);
      flashCopied('markdown-failed');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.bar}>
      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.actionBtn} ${styles.likeBtn} ${liked ? styles.liked : ''}`}
          onClick={toggleLike}
          title={isEn ? 'Like' : '点赞'}
        >
          <span ref={likeIconRef} className={styles.iconWrap}>
            <Icon icon={liked ? 'mdi:heart' : 'mdi:heart-outline'} className={styles.icon} />
          </span>
          <span className={styles.count}>{likeCount}</span>
        </button>

        <button
          type="button"
          className={`${styles.actionBtn} ${styles.bookmarkBtn} ${bookmarked ? styles.bookmarked : ''}`}
          onClick={toggleBookmark}
          title={isEn ? 'Bookmark' : '收藏'}
        >
          <span ref={bookmarkIconRef} className={styles.iconWrap}>
            <Icon icon={bookmarked ? 'mdi:bookmark' : 'mdi:bookmark-outline'} className={styles.icon} />
          </span>
          <span className={styles.count}>{bookmarkCount}</span>
        </button>
      </div>

      <div className={styles.divider} />

      <div className={styles.stats}>
        {counts === null ? (
          <>
            <span className={styles.skeleton} />
            <span className={styles.skeletonSep} />
            <span className={styles.skeleton} />
          </>
        ) : counts.error ? (
          <span className={styles.statsLabel}>{isEn ? 'Views unavailable' : '浏览数加载失败'}</span>
        ) : (
          <>
            <Icon icon="mdi:eye-outline" className={styles.statsIcon} />
            <span className={styles.statsNum}>{counts.total.toLocaleString()}</span>
            <span className={styles.statsLabel}>{isEn ? ' views' : ' 次浏览'}</span>
            <span className={styles.statsDot}>·</span>
            <Icon icon="mdi:account-outline" className={styles.statsIcon} />
            <span className={styles.statsNum}>{counts.unique.toLocaleString()}</span>
            <span className={styles.statsLabel}>{isEn ? ' readers' : ' 位读者'}</span>
          </>
        )}
      </div>

      <Popover className={styles.shareWrapper}>
        <PopoverButton as="button" className={styles.shareTrigger}>
          <Icon icon="mdi:share-variant-outline" className={styles.pillIcon} />
          <span>{isEn ? 'Share' : '分享'}</span>
        </PopoverButton>

        <PopoverPanel
          anchor={{ to: 'bottom end', gap: 8 }}
          className="w-auto rounded-none border-0 bg-transparent p-0 shadow-none"
        >
          <div className={styles.shareMenu}>
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
              className={`${styles.pillBtn} ${styles.pillDiscord} ${copied === 'discord' ? styles.pillCopied : ''} ${copied === 'discord-failed' ? styles.pillFailed : ''}`}
              onClick={shareToDiscord}
            >
              <Icon icon="simple-icons:discord" className={styles.pillIcon} />
              <span>
                {copied === 'discord'
                  ? (isEn ? 'Link Copied!' : '链接已复制!')
                  : copied === 'discord-failed'
                    ? (isEn ? 'Copy failed' : '复制失败')
                    : (isEn ? 'Copy Link for Discord' : '复制链接分享到 Discord')}
              </span>
            </button>

            <button
              type="button"
              className={`${styles.pillBtn} ${styles.pillMd} ${copied === 'markdown' ? styles.pillCopied : ''} ${copied === 'markdown-failed' ? styles.pillFailed : ''}`}
              onClick={copyMarkdown}
            >
              <Icon icon="mdi:language-markdown" className={styles.pillIcon} />
              <span>
                {copied === 'markdown'
                  ? (isEn ? 'Copied!' : '已复制!')
                  : copied === 'markdown-failed'
                    ? (isEn ? 'Copy failed' : '复制失败')
                    : (isEn ? 'Copy Markdown' : '复制为 Markdown')}
              </span>
            </button>
          </div>
        </PopoverPanel>
      </Popover>
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
