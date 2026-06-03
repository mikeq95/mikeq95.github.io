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

  const cardsRef = useRef(null);
  const [pinnedIds, setPinnedIds] = useState(new Set());
  const [menu, setMenu] = useState(null); // { x, y, permalink, isPinned }

  // Fetch pinned posts from Supabase
  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('pinned_posts')
      .select('post_id')
      .then(({ data }) => {
        if (data) setPinnedIds(new Set(data.map(r => r.post_id)));
      });
  }, []);

  // GSAP scroll animation
  useEffect(() => {
    if (!cardsRef.current || !cardsRef.current.children.length) return;
    let ctx;
    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger);
        ctx = gsap.context(() => {
          gsap.from(Array.from(cardsRef.current.children), {
            opacity: 0,
            y: 30,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: { trigger: cardsRef.current, start: 'top 80%' },
          });
        });
      },
    );
    return () => ctx?.revert();
  }, [posts.length]);

  // Pinned posts float to the top, order within group preserved
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
      <div className={styles.inner}>
        <h2 className={styles.sectionTitle}>
          {isZh ? '最新文章' : 'Recent Posts'}
        </h2>
        <div className={styles.grid} ref={cardsRef}>
          {sortedPosts.map(post => (
            <Link
              key={post.id}
              to={post.permalink}
              className={`${styles.card} ${pinnedIds.has(post.permalink) ? styles.pinned : ''}`}
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
