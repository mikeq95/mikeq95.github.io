import React, {
  useEffect,
  useLayoutEffect as useLayoutEffectBase,
  useRef,
  useState,
  useMemo,
} from 'react';
import ReactDOM from 'react-dom';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { gsap } from 'gsap';
import { useAuth } from '@site/src/context/AuthContext';
import { supabase } from '@site/src/lib/supabase';
import styles from './index.module.css';

// Safe on SSR (Docusaurus pre-renders without window)
const useLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffectBase : useEffect;

const GRADIENTS = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  'linear-gradient(135deg, #fda085, #f6d365)',
  'linear-gradient(135deg, #89f7fe, #66a6ff)',
];

function getGradient(permalink) {
  return GRADIENTS[permalink.length % GRADIENTS.length];
}

function CardCover({ image, permalink, title }) {
  const [imgError, setImgError] = useState(false);
  if (!image || imgError) {
    return (
      <div
        className={styles.cardCover}
        style={{ background: getGradient(permalink) }}
      />
    );
  }
  return (
    <img
      className={styles.cardCover}
      src={image}
      alt={title}
      onError={() => setImgError(true)}
    />
  );
}

function ContextMenu({ x, y, isPinned, isFavorite, onPin, onFavorite, onClose }) {
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
            ? (isZh ? '📌 取消置顶' : '📌 Unpin')
            : (isZh ? '📌 置顶文章' : '📌 Pin post')}
        </button>
        <button className={styles.ctxItem} onClick={onFavorite}>
          {isFavorite
            ? (isZh ? '❤️ 移出最爱' : '❤️ Remove favorite')
            : (isZh ? '❤️ 加入最爱' : '❤️ Add to favorites')}
        </button>
      </div>
    </div>,
    document.body,
  );
}

const TABS = [
  { key: 'all',       zh: '所有文章',     en: 'All Posts' },
  { key: 'pinned',    zh: '置顶文章',     en: 'Pinned' },
  { key: 'favorites', zh: '我的最爱',     en: 'Favorites' },
  { key: 'about',     zh: '关于这个博客', en: 'About This Blog' },
];

export default function RecentPosts({ posts = [] }) {
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const isZh = currentLocale.startsWith('zh');
  const { user } = useAuth();
  const { siteConfig } = useDocusaurusContext();
  const adminIds = siteConfig.customFields?.adminUserIds ?? [];
  const isAdmin = user?.id && adminIds.includes(user.id);

  const scrollRef = useRef(null);
  const tabBarRef = useRef(null);
  const pillRef = useRef(null);
  const tabRefs = useRef([]);
  const isFirstRender = useRef(true);
  const reducedMotion = useRef(false);

  const [activeIdx, setActiveIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [pinnedIds, setPinnedIds] = useState(new Set());
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [menu, setMenu] = useState(null);

  // Respect prefers-reduced-motion
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: reduce)', () => {
      reducedMotion.current = true;
      return () => { reducedMotion.current = false; };
    });
    return () => mm.revert();
  }, []);

  // Load pinned + favorite IDs from Supabase
  useEffect(() => {
    if (!supabase) return;
    supabase.from('pinned_posts').select('post_id').then(({ data }) => {
      if (data) setPinnedIds(new Set(data.map(r => r.post_id)));
    });
    supabase.from('favorite_posts').select('post_id').then(({ data }) => {
      if (data) setFavoriteIds(new Set(data.map(r => r.post_id)));
    });
  }, []);

  // GSAP pill slide — runs synchronously after every activeTab change
  useLayoutEffect(() => {
    const activeIndex = TABS.findIndex(t => t.key === activeTab);
    const activeEl = tabRefs.current[activeIndex];
    const pill = pillRef.current;
    const bar = tabBarRef.current;
    if (!activeEl || !pill || !bar) return;

    const barRect = bar.getBoundingClientRect();
    const btnRect = activeEl.getBoundingClientRect();
    const targetX = btnRect.left - barRect.left;
    const targetW = btnRect.width;

    if (isFirstRender.current) {
      gsap.set(pill, { x: targetX, width: targetW });
      isFirstRender.current = false;
      return;
    }

    gsap.to(pill, {
      x: targetX,
      width: targetW,
      duration: reducedMotion.current ? 0 : 0.4,
      ease: 'power2.inOut',
      overwrite: true,
    });
  }, [activeTab]);

  // GSAP card track fade-in on tab change
  useEffect(() => {
    const track = scrollRef.current;
    if (!track) return;
    setActiveIdx(0);
    track.scrollLeft = 0;
    gsap.fromTo(
      track,
      { opacity: 0, y: 8 },
      {
        opacity: 1,
        y: 0,
        duration: reducedMotion.current ? 0 : 0.3,
        ease: 'power2.out',
        clearProps: 'transform',
      }
    );
  }, [activeTab]);

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
  }, [activeTab]);

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const aPin = pinnedIds.has(a.permalink) ? 0 : 1;
      const bPin = pinnedIds.has(b.permalink) ? 0 : 1;
      return aPin - bPin;
    });
  }, [posts, pinnedIds]);

  const filteredPosts = useMemo(() => {
    switch (activeTab) {
      case 'pinned':
        return sortedPosts.filter(p => pinnedIds.has(p.permalink));
      case 'favorites':
        return sortedPosts.filter(p => favoriteIds.has(p.permalink));
      case 'about':
        return sortedPosts.filter(p =>
          p.tags?.some(t => ['关于博客', 'about', 'faq'].includes(t.label?.toLowerCase()))
        );
      default:
        return sortedPosts;
    }
  }, [activeTab, sortedPosts, pinnedIds, favoriteIds]);

  const handleContextMenu = (e, permalink) => {
    if (!isAdmin) return;
    e.preventDefault();
    const x = Math.min(e.clientX, window.innerWidth - 180);
    const y = Math.min(e.clientY, window.innerHeight - 90);
    setMenu({ x, y, permalink, isPinned: pinnedIds.has(permalink), isFavorite: favoriteIds.has(permalink) });
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

  const toggleFavorite = async () => {
    if (!menu || !supabase) return;
    const { permalink, isFavorite } = menu;
    setMenu(null);
    if (isFavorite) {
      await supabase.from('favorite_posts').delete().eq('post_id', permalink);
      setFavoriteIds(prev => { const s = new Set(prev); s.delete(permalink); return s; });
    } else {
      await supabase.from('favorite_posts').insert({ post_id: permalink });
      setFavoriteIds(prev => new Set([...prev, permalink]));
    }
  };

  if (!posts.length) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        {isZh ? '最新文章' : 'Recent Posts'}
      </h2>

      {/* Tab bar — pill slides via GSAP, buttons are just labels */}
      <div className={styles.tabBarOuter}>
        <div className={styles.tabBar} ref={tabBarRef}>
          <div className={styles.tabPill} ref={pillRef} />
          {TABS.map((tab, i) => (
            <button
              key={tab.key}
              ref={el => { tabRefs.current[i] = el; }}
              className={[
                styles.tabBtn,
                activeTab === tab.key ? styles.tabBtnActive : '',
              ].join(' ')}
              onClick={() => setActiveTab(tab.key)}
            >
              {isZh ? tab.zh : tab.en}
            </button>
          ))}
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className={styles.emptyWrapper}>
          {isZh ? '暂无文章' : 'No posts yet'}
        </div>
      ) : (
        <div className={styles.track} ref={scrollRef}>
          {filteredPosts.map((post, i) => (
            <Link
              key={post.id ?? post.permalink}
              to={post.permalink}
              className={[
                styles.card,
                i === activeIdx ? styles.cardActive : styles.cardInactive,
              ].join(' ')}
              onContextMenu={e => handleContextMenu(e, post.permalink)}
            >
              <CardCover
                image={post.frontMatter?.image}
                permalink={post.permalink}
                title={post.title}
              />
              <div className={styles.cardBody}>
                {(pinnedIds.has(post.permalink) || favoriteIds.has(post.permalink)) && (
                  <div className={styles.badges}>
                    {pinnedIds.has(post.permalink) && (
                      <span className={styles.badge}>📌 {isZh ? '置顶' : 'PINNED'}</span>
                    )}
                    {favoriteIds.has(post.permalink) && (
                      <span className={[styles.badge, styles.badgeFav].join(' ')}>
                        ❤️ {isZh ? '最爱' : 'FAV'}
                      </span>
                    )}
                  </div>
                )}
                <h3 className={styles.cardTitle}>{post.title}</h3>
                <time className={styles.cardDate}>
                  {new Date(post.date).toLocaleDateString(
                    isZh ? 'zh-CN' : 'en-US',
                    { year: 'numeric', month: 'short', day: 'numeric' },
                  )}
                </time>
                {post.tags?.length > 0 && (
                  <div className={styles.tags}>
                    {post.tags.slice(0, 2).map(tag => (
                      <span key={tag.label} className={styles.tag}>{tag.label}</span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

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
          isFavorite={menu.isFavorite}
          onPin={togglePin}
          onFavorite={toggleFavorite}
          onClose={() => setMenu(null)}
        />
      )}
    </section>
  );
}
