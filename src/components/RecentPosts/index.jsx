import React, {
  useEffect,
  useLayoutEffect as useLayoutEffectBase,
  useRef,
  useState,
  useMemo,
} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {translate} from '@docusaurus/Translate';
import { gsap } from 'gsap';
import { Icon } from '@iconify/react';
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
  const [loaded, setLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const imgRef = useRef(null);

  // Cached images won't fire onLoad — check img.complete after mount
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  return (
    <div className={styles.cardCoverWrap}>
      <div className={styles.cardCoverPlaceholder} style={{ background: getGradient(permalink) }} />
      {image && !imgError && (
        <img
          ref={imgRef}
          className={`${styles.cardCoverImg} ${loaded ? styles.cardCoverImgLoaded : ''}`}
          src={image}
          alt={title}
          onLoad={() => setLoaded(true)}
          onError={() => setImgError(true)}
        />
      )}
    </div>
  );
}


const TABS = [
  { key: 'all',       labelId: 'recentPosts.tab.all',       defaultLabel: 'All Posts' },
  { key: 'pinned',    labelId: 'recentPosts.tab.pinned',    defaultLabel: 'Pinned' },
  { key: 'favorites', labelId: 'recentPosts.tab.favorites', defaultLabel: 'Favorites' },
  { key: 'about',     labelId: 'recentPosts.tab.about',     defaultLabel: 'About This Blog' },
];

export default function RecentPosts({ posts = [] }) {
  const { user, loading: authLoading } = useAuth();
  const { siteConfig } = useDocusaurusContext();
  const adminIds = siteConfig.customFields?.adminUserIds ?? [];
  const isAdmin = user?.id && adminIds.includes(user.id);

  const scrollRef    = useRef(null);
  const tabBarRef    = useRef(null);
  const pillRef      = useRef(null);
  const tabRefs      = useRef([]);
  const leftBtnRef   = useRef(null);
  const rightBtnRef  = useRef(null);
  const isFirstRender = useRef(true);
  const reducedMotion = useRef(false);

  const [activeIdx, setActiveIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [pinnedIds, setPinnedIds] = useState(new Set());
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [likedIds, setLikedIds] = useState(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  // Respect prefers-reduced-motion
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: reduce)', () => {
      reducedMotion.current = true;
      return () => { reducedMotion.current = false; };
    });
    return () => mm.revert();
  }, []);

  // GSAP scale hover on glass scroll buttons
  useEffect(() => {
    const buttons = [leftBtnRef.current, rightBtnRef.current].filter(Boolean);
    if (!buttons.length) return;
    const cleanups = [];
    buttons.forEach(btn => {
      const enter = () => gsap.to(btn, { scale: 1.1, duration: 0.18, ease: 'power2.out', overwrite: 'auto' });
      const leave = () => gsap.to(btn, { scale: 1,   duration: 0.18, ease: 'power2.out', overwrite: 'auto' });
      btn.addEventListener('mouseenter', enter);
      btn.addEventListener('mouseleave', leave);
      cleanups.push(() => {
        btn.removeEventListener('mouseenter', enter);
        btn.removeEventListener('mouseleave', leave);
      });
    });
    return () => cleanups.forEach(fn => fn());
  }, []);

  // Load all Supabase-backed state. Wait for auth so the correct JWT is attached.
  useEffect(() => {
    if (!supabase || authLoading) return;
    supabase.from('pinned_posts').select('post_id').then(({ data }) => {
      if (data) setPinnedIds(new Set(data.map(r => r.post_id)));
    });
    if (user) {
      if (isAdmin) {
        supabase.from('favorite_posts').select('post_id').then(({ data }) => {
          if (data) setFavoriteIds(new Set(data.map(r => r.post_id)));
        });
      } else {
        supabase.from('likes').select('post_id').eq('user_id', user.id).then(({ data }) => {
          if (data) setLikedIds(new Set(data.map(r => r.post_id)));
        });
        supabase.from('bookmarks').select('post_id').eq('user_id', user.id).then(({ data }) => {
          if (data) setBookmarkedIds(new Set(data.map(r => r.post_id)));
        });
      }
    } else {
      setFavoriteIds(new Set());
      setLikedIds(new Set());
      setBookmarkedIds(new Set());
    }
  }, [user, authLoading, isAdmin]);

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
      duration: reducedMotion.current ? 0 : 0.15,
      ease: 'power3.out',
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
          p.tags?.some(t => ['关于博客', '关于', 'about', 'faq'].includes(t.label?.toLowerCase()))
        );
      default:
        return sortedPosts;
    }
  }, [activeTab, sortedPosts, pinnedIds, favoriteIds]);

  const handlePin = async (e, permalink) => {
    e.preventDefault();
    e.stopPropagation();
    if (!supabase) return;
    if (pinnedIds.has(permalink)) {
      const { error } = await supabase.from('pinned_posts').delete().eq('post_id', permalink);
      if (!error) setPinnedIds(prev => { const s = new Set(prev); s.delete(permalink); return s; });
    } else {
      const { error } = await supabase.from('pinned_posts').insert({ post_id: permalink });
      if (!error) setPinnedIds(prev => new Set([...prev, permalink]));
    }
  };

  const handleFavorite = async (e, permalink) => {
    e.preventDefault();
    e.stopPropagation();
    if (!supabase) return;
    if (favoriteIds.has(permalink)) {
      const { error } = await supabase.from('favorite_posts').delete().eq('post_id', permalink);
      if (!error) setFavoriteIds(prev => { const s = new Set(prev); s.delete(permalink); return s; });
    } else {
      const { error } = await supabase.from('favorite_posts').insert({ post_id: permalink });
      if (!error) setFavoriteIds(prev => new Set([...prev, permalink]));
    }
  };

  const promptLogin = () => {
    const btn = document.querySelector('[data-auth-trigger]');
    if (btn) btn.click();
  };

  const scrollTrack = (direction) => {
    const track = scrollRef.current;
    if (!track) return;
    const card = track.children[0];
    if (!card) return;
    const gap = parseFloat(getComputedStyle(track).columnGap || '0');
    track.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: 'smooth' });
  };

  const handleLike = async (e, permalink) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { promptLogin(); return; }
    if (!supabase) return;
    if (likedIds.has(permalink)) {
      const { error } = await supabase.from('likes').delete().eq('post_id', permalink).eq('user_id', user.id);
      if (!error) setLikedIds(prev => { const s = new Set(prev); s.delete(permalink); return s; });
    } else {
      const { error } = await supabase.from('likes').insert({ post_id: permalink, user_id: user.id });
      if (!error) setLikedIds(prev => new Set([...prev, permalink]));
    }
  };

  const handleBookmark = async (e, permalink) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { promptLogin(); return; }
    if (!supabase) return;
    if (bookmarkedIds.has(permalink)) {
      const { error } = await supabase.from('bookmarks').delete().eq('post_id', permalink).eq('user_id', user.id);
      if (!error) setBookmarkedIds(prev => { const s = new Set(prev); s.delete(permalink); return s; });
    } else {
      const { error } = await supabase.from('bookmarks').insert({ post_id: permalink, user_id: user.id });
      if (!error) setBookmarkedIds(prev => new Set([...prev, permalink]));
    }
  };

  if (!posts.length) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        {translate({id: 'recentPosts.title', message: 'Recent Posts'})}
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
              {translate({id: tab.labelId, message: tab.defaultLabel})}
            </button>
          ))}
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className={styles.emptyWrapper}>
          {translate({id: 'recentPosts.empty', message: 'No posts yet'})}
        </div>
      ) : (
        <div className={styles.trackWrapper}>
          <button
            type="button"
            ref={leftBtnRef}
            className={`${styles.scrollBtn} ${styles.scrollBtnLeft}`}
            onClick={() => scrollTrack(-1)}
            aria-label={translate({id: 'recentPosts.scrollLeft', message: 'Scroll left'})}
          >
            <Icon icon="mdi:chevron-left" width={24} height={24} />
          </button>
          <div className={styles.track} ref={scrollRef}>
          {filteredPosts.map((post, i) => (
            <div
              key={post.id ?? post.permalink}
              className={`${styles.cardWrapper} ${i === activeIdx ? styles.cardWrapperActive : ''}`}
            >
              <Link
                to={post.permalink}
                className={[
                  styles.card,
                  i === activeIdx ? styles.cardActive : styles.cardInactive,
                ].join(' ')}
              >
                <CardCover
                  image={post.frontMatter?.image}
                  permalink={post.permalink}
                  title={post.title}
                />
                <div className={styles.cardBody}>
                  {post.tags?.length > 0 && (
                    <div className={styles.tags}>
                      {post.tags.slice(0, 2).map(tag => (
                        <span key={tag.label} className={styles.tag}>{tag.label}</span>
                      ))}
                    </div>
                  )}
                  <h3 className={styles.cardTitle}>{post.title}</h3>
                  <time className={styles.cardDate}>
                    {new Date(post.date).toLocaleDateString(
                      undefined,
                      { year: 'numeric', month: 'short', day: 'numeric' },
                    )}
                  </time>
                </div>
              </Link>
              {/* Action row — admin: pin+fav  |  user: like+bookmark (greyed if not logged in) */}
              <div className={styles.actionRow}>
                {isAdmin ? (
                  <>
                    <button
                      className={[styles.actionBtn, pinnedIds.has(post.permalink) ? styles.actionBtnPinActive : ''].join(' ')}
                      onClick={e => handlePin(e, post.permalink)}
                    >
                      <Icon icon={pinnedIds.has(post.permalink) ? 'ic:sharp-pin-off' : 'ic:sharp-push-pin'} width={14} />
                      {pinnedIds.has(post.permalink) ? '已置顶' : '置顶'}
                    </button>
                    <button
                      className={[styles.actionBtn, favoriteIds.has(post.permalink) ? styles.actionBtnFavActive : ''].join(' ')}
                      onClick={e => handleFavorite(e, post.permalink)}
                    >
                      <Icon icon={favoriteIds.has(post.permalink) ? 'material-symbols:heart-check-rounded' : 'material-symbols:heart-plus-outline'} width={14} />
                      {favoriteIds.has(post.permalink) ? '已最爱' : '最爱'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className={[styles.actionBtn, likedIds.has(post.permalink) ? styles.actionBtnLikeActive : !user ? styles.actionBtnGuest : ''].join(' ')}
                      onClick={e => handleLike(e, post.permalink)}
                    >
                      <Icon icon={likedIds.has(post.permalink) ? 'material-symbols:thumb-up' : 'material-symbols:thumb-up-outline'} width={14} />
                      {likedIds.has(post.permalink) ? '已点赞' : '点赞'}
                    </button>
                    <button
                      className={[styles.actionBtn, bookmarkedIds.has(post.permalink) ? styles.actionBtnBookmarkActive : !user ? styles.actionBtnGuest : ''].join(' ')}
                      onClick={e => handleBookmark(e, post.permalink)}
                    >
                      <Icon icon={bookmarkedIds.has(post.permalink) ? 'material-symbols:bookmark' : 'material-symbols:bookmark-outline'} width={14} />
                      {bookmarkedIds.has(post.permalink) ? '已收藏' : '收藏'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          </div>
          <button
            type="button"
            ref={rightBtnRef}
            className={`${styles.scrollBtn} ${styles.scrollBtnRight}`}
            onClick={() => scrollTrack(1)}
            aria-label={translate({id: 'recentPosts.scrollRight', message: 'Scroll right'})}
          >
            <Icon icon="mdi:chevron-right" width={24} height={24} />
          </button>
        </div>
      )}

      <div className={styles.more}>
        <Link to="/blog" className={styles.moreLink}>
          {translate({id: 'recentPosts.viewAll', message: 'All posts →'})}
        </Link>
      </div>

    </section>
  );
}
