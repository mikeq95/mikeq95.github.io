import React, {
  useEffect,
  useLayoutEffect as useLayoutEffectBase,
  useRef,
  useState,
  useMemo,
} from 'react';
import Link from '@docusaurus/Link';
import {translate} from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { Icon } from '@iconify/react';
import { useAuth } from '@site/src/context/AuthContext';
import { supabase } from '@site/src/lib/supabase';
import { triggerLogin } from '@site/src/utils/authTrigger';
import { getGradient } from '@site/src/utils/gradients';
import styles from './index.module.css';

const COUNTS_CACHE_TTL = 3 * 60 * 1000; // 3 minutes

function loadCountsCache(locale) {
  try {
    const raw = sessionStorage.getItem(`blog_counts_${locale}`);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > COUNTS_CACHE_TTL) return null;
    return data;
  } catch { return null; }
}

function saveCountsCache(locale, likeCounts, bookmarkCounts) {
  try {
    sessionStorage.setItem(`blog_counts_${locale}`, JSON.stringify({
      data: { likeCounts, bookmarkCounts },
      ts: Date.now(),
    }));
  } catch {}
}

// Safe on SSR (Docusaurus pre-renders without window)
const useLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffectBase : useEffect;

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
      <div className={styles.cardCoverPlaceholder} style={{ '--card-gradient': getGradient(permalink) }} />
      {image && !imgError && (
        <img
          ref={imgRef}
          className={`${styles.cardCoverImg} ${loaded ? styles.cardCoverImgLoaded : ''}`}
          src={image}
          alt={title}
          width={280}
          height={152}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setImgError(true)}
        />
      )}
    </div>
  );
}


const TABS = [
  { key: 'all',           labelId: 'recentPosts.tab.all',           defaultLabel: 'All Posts' },
  { key: 'mostLiked',     labelId: 'recentPosts.tab.mostLiked',     defaultLabel: '点赞最多' },
  { key: 'mostBookmarked',labelId: 'recentPosts.tab.mostBookmarked', defaultLabel: '收藏最多' },
  { key: 'about',         labelId: 'recentPosts.tab.about',         defaultLabel: 'About This Blog' },
];

export default function RecentPosts({ posts = [] }) {
  const { user, loading: authLoading } = useAuth();
  const { i18n: { currentLocale } } = useDocusaurusContext();

  const scrollRef    = useRef(null);
  const tabBarRef    = useRef(null);
  const pillRef      = useRef(null);
  const tabRefs      = useRef([]);
  const leftBtnRef   = useRef(null);
  const rightBtnRef  = useRef(null);
  const isFirstRender = useRef(true);
  const reducedMotion = useRef(false);
  const gsapRef      = useRef(null);
  const isButtonScrolling = useRef(false);
  const pendingFxRef = useRef([]);
  const isMountedRef = useRef(true);

  const [activeIdx, setActiveIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [likedIds, setLikedIds] = useState(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [likeCounts, setLikeCounts] = useState({});
  const [bookmarkCounts, setBookmarkCounts] = useState({});
  const [countsLoading, setCountsLoading] = useState(true);

  // Respect prefers-reduced-motion (native, no GSAP dependency)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion.current = mq.matches;
    const onChange = (e) => { reducedMotion.current = e.matches; };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Load GSAP dynamically — only needed for animations, not initial render
  useEffect(() => {
    import('gsap').then(({ gsap }) => { gsapRef.current = gsap; });
  }, []);

  // On unmount: stop late setState calls and remove any like-animation
  // elements left over from a tween that got interrupted mid-flight.
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      pendingFxRef.current.forEach(el => el.remove());
      pendingFxRef.current = [];
    };
  }, []);

  // GSAP scale hover on glass scroll buttons
  useEffect(() => {
    const buttons = [leftBtnRef.current, rightBtnRef.current].filter(Boolean);
    if (!buttons.length) return;
    const cleanups = [];
    buttons.forEach(btn => {
      const enter = () => gsapRef.current?.to(btn, { scale: 1.1, duration: 0.18, ease: 'power2.out', overwrite: 'auto' });
      const leave = () => gsapRef.current?.to(btn, { scale: 1,   duration: 0.18, ease: 'power2.out', overwrite: 'auto' });
      btn.addEventListener('mouseenter', enter);
      btn.addEventListener('mouseleave', leave);
      cleanups.push(() => {
        btn.removeEventListener('mouseenter', enter);
        btn.removeEventListener('mouseleave', leave);
      });
    });
    return () => cleanups.forEach(fn => fn());
  }, []);

  // Restore counts from sessionStorage cache before first paint to avoid skeleton flash on repeat visits.
  useLayoutEffect(() => {
    const cached = loadCountsCache(currentLocale);
    if (cached) {
      setLikeCounts(cached.likeCounts);
      setBookmarkCounts(cached.bookmarkCounts);
      setCountsLoading(false);
    }
  }, [currentLocale]);

  // Load all Supabase-backed state. Wait for auth so the correct JWT is attached.
  useEffect(() => {
    if (!supabase || authLoading) return;
    const postIds = posts.map(p => p.permalink);
    if (!postIds.length) return;
    // Fetch like and bookmark counts together so we can cache them atomically
    Promise.all([
      supabase.from('likes').select('post_id').in('post_id', postIds),
      supabase.from('bookmarks').select('post_id').in('post_id', postIds),
    ]).then(([likesRes, bookmarksRes]) => {
      if (!isMountedRef.current) return;
      if (likesRes.error) console.error('Failed to load like counts:', likesRes.error);
      if (bookmarksRes.error) console.error('Failed to load bookmark counts:', bookmarksRes.error);
      const newLikeCounts = {};
      (likesRes.data ?? []).forEach(r => { newLikeCounts[r.post_id] = (newLikeCounts[r.post_id] ?? 0) + 1; });
      const newBookmarkCounts = {};
      (bookmarksRes.data ?? []).forEach(r => { newBookmarkCounts[r.post_id] = (newBookmarkCounts[r.post_id] ?? 0) + 1; });
      setLikeCounts(newLikeCounts);
      setBookmarkCounts(newBookmarkCounts);
      setCountsLoading(false);
      saveCountsCache(currentLocale, newLikeCounts, newBookmarkCounts);
    });
    if (user) {
      supabase.from('likes').select('post_id').eq('user_id', user.id).then(({ data, error }) => {
        if (!isMountedRef.current) return;
        if (error) { console.error('Failed to load liked posts:', error); return; }
        if (data) setLikedIds(new Set(data.map(r => r.post_id)));
      });
      supabase.from('bookmarks').select('post_id').eq('user_id', user.id).then(({ data, error }) => {
        if (!isMountedRef.current) return;
        if (error) { console.error('Failed to load bookmarked posts:', error); return; }
        if (data) setBookmarkedIds(new Set(data.map(r => r.post_id)));
      });
    } else {
      setLikedIds(new Set());
      setBookmarkedIds(new Set());
    }
  }, [user, authLoading]);

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
      isFirstRender.current = false;
      if (gsapRef.current) {
        gsapRef.current.set(pill, { x: targetX, width: targetW });
      } else {
        // GSAP not yet loaded on first render — set position directly
        pill.style.transform = `translateX(${targetX}px)`;
        pill.style.width = `${targetW}px`;
      }
      return;
    }

    gsapRef.current?.to(pill, {
      x: targetX,
      width: targetW,
      duration: reducedMotion.current ? 0 : 0.32,
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
    gsapRef.current?.fromTo(
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
      if (isButtonScrolling.current) return;
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

  const filteredPosts = useMemo(() => {
    switch (activeTab) {
      case 'mostLiked':
        return [...posts].sort((a, b) => (likeCounts[b.permalink] ?? 0) - (likeCounts[a.permalink] ?? 0));
      case 'mostBookmarked':
        return [...posts].sort((a, b) => (bookmarkCounts[b.permalink] ?? 0) - (bookmarkCounts[a.permalink] ?? 0));
      case 'about':
        return posts.filter(p =>
          p.tags?.some(t => ['关于博客', '关于', 'about', 'faq'].includes(t.label?.toLowerCase()))
        );
      default:
        return posts;
    }
  }, [activeTab, posts, likeCounts, bookmarkCounts]);


  const scrollTrack = (direction) => {
    const track = scrollRef.current;
    if (!track) return;
    const card = track.children[0];
    if (!card) return;
    const gap = parseFloat(getComputedStyle(track).columnGap || '0');
    const targetIdx = Math.max(0, Math.min(filteredPosts.length - 1, activeIdx + direction));
    isButtonScrolling.current = true;
    setActiveIdx(targetIdx);
    track.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: 'smooth' });
    const onScrollEnd = () => { isButtonScrolling.current = false; };
    if ('onscrollend' in window) {
      track.addEventListener('scrollend', onScrollEnd, { once: true });
    } else {
      setTimeout(onScrollEnd, 350);
    }
  };

  const triggerLikeAnim = (btnEl, isNowLiked) => {
    const g = gsapRef.current;
    if (!g || reducedMotion.current) return;
    const iconWrap = btnEl.querySelector('[data-icon-wrap]');
    if (!iconWrap) return;
    const rect = iconWrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const tl = g.timeline();
    // Phase 1: compress
    tl.to(iconWrap, { scale: 0.8, duration: 0.08, ease: 'power2.in' });
    if (isNowLiked) {
      // Phase 2: ring burst
      const ring = document.createElement('div');
      Object.assign(ring.style, {
        position: 'fixed', left: cx + 'px', top: cy + 'px',
        width: '18px', height: '18px', marginLeft: '-9px', marginTop: '-9px',
        borderRadius: '50%', border: '2px solid #ff6b8a',
        pointerEvents: 'none', zIndex: '9999', opacity: '0.7',
      });
      document.body.appendChild(ring);
      pendingFxRef.current.push(ring);
      tl.to(ring, {
        scale: 2.8, opacity: 0, duration: 0.35, ease: 'power2.out',
        onComplete: () => {
          ring.remove();
          pendingFxRef.current = pendingFxRef.current.filter(el => el !== ring);
        },
      }, '<0.05');
      // Phase 3: particles
      const COLORS = ['#ff6b8a', '#ffb347'];
      const COUNT = 7;
      const angleStep = (Math.PI * 2) / COUNT;
      const particles = Array.from({ length: COUNT }, (_, i) => {
        const p = document.createElement('div');
        Object.assign(p.style, {
          position: 'fixed', left: cx + 'px', top: cy + 'px',
          width: '5px', height: '5px', marginLeft: '-2.5px', marginTop: '-2.5px',
          borderRadius: '50%', background: COLORS[i % COLORS.length],
          pointerEvents: 'none', zIndex: '9999',
        });
        document.body.appendChild(p);
        pendingFxRef.current.push(p);
        return p;
      });
      tl.fromTo(particles,
        { scale: 0, opacity: 1, x: 0, y: 0 },
        {
          scale: 1, opacity: 0,
          x: (i) => Math.cos(i * angleStep - Math.PI / 2) * (16 + (i % 3) * 4),
          y: (i) => Math.sin(i * angleStep - Math.PI / 2) * (16 + (i % 3) * 4),
          duration: 0.45, ease: 'power2.out', stagger: 0.02,
          onComplete: () => {
            particles.forEach(p => p.remove());
            pendingFxRef.current = pendingFxRef.current.filter(el => !particles.includes(el));
          },
        },
        '<0.05'
      );
    }
    // Phase 4: bounce back with overshoot
    tl.to(iconWrap, {
      scale: isNowLiked ? 1.25 : 1,
      duration: isNowLiked ? 0.18 : 0.12,
      ease: 'back.out(3)',
    }, isNowLiked ? '>-0.3' : '<0.05');
    if (isNowLiked) {
      tl.to(iconWrap, { scale: 1, duration: 0.1, ease: 'power2.in' });
    }
  };

  const triggerBookmarkAnim = (btnEl) => {
    const g = gsapRef.current;
    if (!g || reducedMotion.current) return;
    const iconWrap = btnEl.querySelector('[data-icon-wrap]');
    if (!iconWrap) return;
    const tl = g.timeline();
    tl.to(iconWrap, { scale: 1.15, duration: 0.12, ease: 'back.out(2)' });
    tl.to(iconWrap, { scale: 1, duration: 0.1, ease: 'power2.in' });
  };

  const pendingActions = useRef(new Set());

  const handleLike = async (e, permalink) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { triggerLogin(); return; }
    if (!supabase) return;
    const key = `like:${permalink}`;
    if (pendingActions.current.has(key)) return;
    triggerLikeAnim(e.currentTarget, !likedIds.has(permalink));
    pendingActions.current.add(key);
    try {
      if (likedIds.has(permalink)) {
        const { error } = await supabase.from('likes').delete().eq('post_id', permalink).eq('user_id', user.id);
        if (!error) {
          setLikedIds(prev => { const s = new Set(prev); s.delete(permalink); return s; });
          setLikeCounts(prev => ({ ...prev, [permalink]: Math.max(0, (prev[permalink] ?? 0) - 1) }));
        } else {
          console.error('Failed to unlike post:', error);
        }
      } else {
        const { error } = await supabase.from('likes').insert({ post_id: permalink, user_id: user.id });
        if (!error) {
          setLikedIds(prev => new Set([...prev, permalink]));
          setLikeCounts(prev => ({ ...prev, [permalink]: (prev[permalink] ?? 0) + 1 }));
        } else {
          console.error('Failed to like post:', error);
        }
      }
    } finally {
      pendingActions.current.delete(key);
    }
  };

  const handleBookmark = async (e, permalink) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { triggerLogin(); return; }
    if (!supabase) return;
    const key = `bookmark:${permalink}`;
    if (pendingActions.current.has(key)) return;
    triggerBookmarkAnim(e.currentTarget);
    pendingActions.current.add(key);
    try {
      if (bookmarkedIds.has(permalink)) {
        const { error } = await supabase.from('bookmarks').delete().eq('post_id', permalink).eq('user_id', user.id);
        if (!error) {
          setBookmarkedIds(prev => { const s = new Set(prev); s.delete(permalink); return s; });
          setBookmarkCounts(prev => ({ ...prev, [permalink]: Math.max(0, (prev[permalink] ?? 0) - 1) }));
        } else {
          console.error('Failed to remove bookmark:', error);
        }
      } else {
        const { error } = await supabase.from('bookmarks').insert({ post_id: permalink, user_id: user.id });
        if (!error) {
          setBookmarkedIds(prev => new Set([...prev, permalink]));
          setBookmarkCounts(prev => ({ ...prev, [permalink]: (prev[permalink] ?? 0) + 1 }));
        } else {
          console.error('Failed to bookmark post:', error);
        }
      }
    } finally {
      pendingActions.current.delete(key);
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
                      currentLocale,
                      { year: 'numeric', month: 'short', day: 'numeric' },
                    )}
                  </time>
                </div>
              </Link>
              {/* Action row — like + bookmark for all users (greyed if not logged in) */}
              <div className={styles.actionRow}>
                <button
                  className={[styles.actionBtn, styles.actionBtnLike, likedIds.has(post.permalink) ? styles.actionBtnLikeActive : !user ? styles.actionBtnGuest : ''].join(' ')}
                  onClick={e => handleLike(e, post.permalink)}
                  aria-label={likedIds.has(post.permalink) ? translate({id: 'recentPosts.unlike', message: '取消点赞'}) : translate({id: 'recentPosts.like', message: '点赞'})}
                >
                  <span className={styles.iconWrap} data-icon-wrap><Icon icon={likedIds.has(post.permalink) ? 'tabler:thumb-up-filled' : 'tabler:thumb-up'} width={16} /></span>
                  <span className={styles.actionLabel}>{translate({id: 'recentPosts.like', message: '点赞'})}</span>
                  <span className={styles.actionCount}>{countsLoading ? <span className={styles.countSkeleton} /> : (likeCounts[post.permalink] ?? 0)}</span>
                </button>
                <button
                  className={[styles.actionBtn, styles.actionBtnBookmark, bookmarkedIds.has(post.permalink) ? styles.actionBtnBookmarkActive : !user ? styles.actionBtnGuest : ''].join(' ')}
                  onClick={e => handleBookmark(e, post.permalink)}
                  aria-label={bookmarkedIds.has(post.permalink) ? translate({id: 'recentPosts.unbookmark', message: '取消收藏'}) : translate({id: 'recentPosts.bookmark', message: '收藏'})}
                >
                  <span className={styles.iconWrap} data-icon-wrap><Icon icon={bookmarkedIds.has(post.permalink) ? 'tabler:bookmark-filled' : 'tabler:bookmark'} width={16} /></span>
                  <span className={styles.actionLabel}>{translate({id: 'recentPosts.bookmark', message: '收藏'})}</span>
                  <span className={styles.actionCount}>{countsLoading ? <span className={styles.countSkeleton} /> : (bookmarkCounts[post.permalink] ?? 0)}</span>
                </button>
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
