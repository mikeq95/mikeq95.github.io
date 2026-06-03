import React, { useEffect, useRef, useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useAuth } from '@site/src/context/AuthContext';
import { supabase } from '@site/src/lib/supabase';
import styles from './index.module.css';

function ContextMenu({ x, y, isPinned, onPin, onClose }) {
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const isZh = currentLocale.startsWith('zh');

  return ReactDOM.createPortal(
    <div className={styles.ctxOverlay} onMouseDown={onClose}>
      <div
        className={styles.ctxMenu}
        style={{ top: y, left: x }}
        onMouseDown={e => e.stopPropagation()}
      >
        <button className={styles.ctxItem} onClick={onPin}>
          {isPinned
            ? (isZh ? '取消置顶' : 'Unpin post')
            : (isZh ? '置顶文章' : 'Pin post')}
        </button>
      </div>
    </div>,
    document.body,
  );
}

export default function RecentPosts({ posts = [] }) {
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const isZh = currentLocale.startsWith('zh');
  const { user } = useAuth();
  const { siteConfig } = useDocusaurusContext();
  const adminIds = siteConfig.customFields?.adminUserIds ?? [];
  const isAdmin = user?.id && adminIds.includes(user.id);

  const scrollRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [pinnedIds, setPinnedIds] = useState(new Set());
  const [menu, setMenu] = useState(null);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('pinned_posts')
      .select('post_id')
      .then(({ data }) => {
        if (data) setPinnedIds(new Set(data.map(r => r.post_id)));
      });
  }, []);

  // Track which card is snapped to center
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    let rafId;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const center = container.scrollLeft + container.clientWidth / 2;
        let closestIdx = 0;
        let closestDist = Infinity;
        Array.from(container.children).forEach((card, i) => {
          const dist = Math.abs((card.offsetLeft + card.offsetWidth / 2) - center);
          if (dist < closestDist) { closestDist = dist; closestIdx = i; }
        });
        setActiveIdx(closestIdx);
      });
    };
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => { container.removeEventListener('scroll', onScroll); cancelAnimationFrame(rafId); };
  }, []);

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const aPin = pinnedIds.has(a.permalink) ? 0 : 1;
      const bPin = pinnedIds.has(b.permalink) ? 0 : 1;
      return aPin - bPin;
    });
  }, [posts, pinnedIds]);

  const handleContextMenu = (e, permalink) => {
    if (!isAdmin) return;
    e.preventDefault();
    const x = Math.min(e.clientX, window.innerWidth - 160);
    const y = Math.min(e.clientY, window.innerHeight - 60);
    setMenu({ x, y, permalink, isPinned: pinnedIds.has(permalink) });
  };

  const togglePin = async () => {
    if (!menu || !supabase) return;
    const { permalink, isPinned } = menu;
    setMenu(null);
    if (isPinned) {
      await supabase.from('pinned_posts').delete().eq('post_id', permalink);
      setPinnedIds(prev => { const s = new Set(prev); s.delete(permalink); return s; });
    } else {
      await supabase.from('pinned_posts').insert({ post_id: permalink });
      setPinnedIds(prev => new Set([...prev, permalink]));
    }
  };

  if (!sortedPosts.length) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        {isZh ? '最新文章' : 'Recent Posts'}
      </h2>

      <div className={styles.track} ref={scrollRef}>
        {sortedPosts.map((post, i) => (
          <Link
            key={post.id}
            to={post.permalink}
            className={[
              styles.card,
              i === activeIdx ? styles.cardActive : styles.cardInactive,
              pinnedIds.has(post.permalink) ? styles.pinned : '',
            ].join(' ')}
            onContextMenu={e => handleContextMenu(e, post.permalink)}
          >
            <div className={styles.cardMeta}>
              <time className={styles.date}>
                {new Date(post.date).toLocaleDateString(
                  isZh ? 'zh-CN' : 'en-US',
                  { year: 'numeric', month: 'short', day: 'numeric' },
                )}
              </time>
              {pinnedIds.has(post.permalink) && (
                <span className={styles.pinBadge}>
                  {isZh ? '📌 置顶' : '📌 Pinned'}
                </span>
              )}
            </div>
            <h3 className={styles.cardTitle}>{post.title}</h3>
            {post.tags.length > 0 && (
              <div className={styles.tags}>
                {post.tags.slice(0, 2).map(tag => (
                  <span key={tag.label} className={styles.tag}>{tag.label}</span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>

      <div className={styles.more}>
        <Link to="/blog" className={styles.moreLink}>
          {isZh ? '查看全部文章 →' : 'All posts →'}
        </Link>
      </div>

      {menu && typeof document !== 'undefined' && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          isPinned={menu.isPinned}
          onPin={togglePin}
          onClose={() => setMenu(null)}
        />
      )}
    </section>
  );
}
