import React, {
  useEffect,
  useLayoutEffect as useLayoutEffectBase,
  useRef,
  useState,
  useMemo,
} from 'react';
import Link from '@docusaurus/Link';
import {translate} from '@docusaurus/Translate';
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

  const scrollRef    = useRef(null);
  const tabBarRef    = useRef(null);
  const pillRef      = useRef(null);
  const tabRefs      = useRef([]);
  const leftBtnRef   = useRef(null);
  const rightBtnRef  = useRef(null);
  const isFirstRender = useRef(true);
  const reducedMotion = useRef(false);
  const gsapRef      = useRef(null);

  const [activeIdx, setActiveIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [likedIds, setLikedIds] = useState(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [likeCounts, setLikeCounts] = useState({});
  const [bookmarkCounts, setBookmarkCounts] = useState({});

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

  // Load all Supabase-backed state. Wait for auth so the correct JWT is attached.
  useEffect(() => {
    if (!supabase || authLoading) return;
    const postIds = posts.map(p => p.permalink);
    if (!postIds.length) return;
    // Load like/bookmark counts for the current post set only
    supabase.from('likes').select('post_id').in('post_id', postIds).then(({ data, error }) => {
      if (error) { console.error('Failed to load like counts:', error); return; }
      if (data) {
        const counts = {};
        data.forEach(r => { counts[r.post_id] = (counts[r.post_id] ?? 0) + 1; });
        setLikeCounts(counts);
      }
    });
    supabase.from('bookmarks').select('post_id').in('post_id', postIds).then(({ data, error }) => {
      if (error) { console.error('Failed to load bookmark counts:', error); return; }
      if (data) {
        const counts = {};
        data.forEach(r => { counts[r.post_id] = (counts[r.post_id] ?? 0) + 1; });
        setBookmarkCounts(counts);
      }
    });
    if (user) {
      supabase.from('likes').select('post_id').eq('user_id', user.id).then(({ data, error }) => {
        if (error) { console.error('Failed to load liked posts:', error); return; }
        if (data) setLikedIds(new Set(data.map(r => r.post_id)));
      });
      supabase.from('bookmarks').select('post_id').eq('user_id', user.id).then(({ data, error }) => {
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

  const pendingActions = useRef(new Set());

  const handleLike = async (e, permalink) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { promptLogin(); return; }
    if (!supabase) return;
    const key = `like:${permalink}`;
    if (pendingActions.current.has(key)) return;
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
    if (!user) { promptLogin(); return; }
    if (!supabase) return;
    const key = `bookmark:${permalink}`;
    if (pendingActions.current.has(key)) return;
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
                      undefined,
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
                  <Icon icon={likedIds.has(post.permalink) ? 'tabler:thumb-up-filled' : 'tabler:thumb-up'} width={16} />
                  <span className={styles.actionLabel}>{translate({id: 'recentPosts.like', message: '点赞'})}</span>
                  <span className={styles.actionCount}>{likeCounts[post.permalink] ?? 0}</span>
                </button>
                <button
                  className={[styles.actionBtn, styles.actionBtnBookmark, bookmarkedIds.has(post.permalink) ? styles.actionBtnBookmarkActive : !user ? styles.actionBtnGuest : ''].join(' ')}
                  onClick={e => handleBookmark(e, post.permalink)}
                  aria-label={bookmarkedIds.has(post.permalink) ? translate({id: 'recentPosts.unbookmark', message: '取消收藏'}) : translate({id: 'recentPosts.bookmark', message: '收藏'})}
                >
                  <Icon icon={bookmarkedIds.has(post.permalink) ? 'tabler:bookmark-filled' : 'tabler:bookmark'} width={16} />
                  <span className={styles.actionLabel}>{translate({id: 'recentPosts.bookmark', message: '收藏'})}</span>
                  <span className={styles.actionCount}>{bookmarkCounts[post.permalink] ?? 0}</span>
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
