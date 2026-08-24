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
import { supabase } from '@site/src/lib/supabase';
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
          width={340}
          height={191}
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
  const isMountedRef = useRef(true);

  const [activeIdx, setActiveIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
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

  // On unmount: stop late setState calls from in-flight async work.
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
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

  // Restore counts from sessionStorage cache before first paint so sort order is stable on repeat visits.
  useLayoutEffect(() => {
    const cached = loadCountsCache(currentLocale);
    if (cached) {
      setLikeCounts(cached.likeCounts);
      setBookmarkCounts(cached.bookmarkCounts);
    }
  }, [currentLocale]);

  // Fetch like/bookmark counts — used only to power the "most liked" / "most bookmarked" tab sort.
  useEffect(() => {
    if (!supabase) return;
    const postIds = posts.map(p => p.permalink);
    if (!postIds.length) return;
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
      saveCountsCache(currentLocale, newLikeCounts, newBookmarkCounts);
    });
  }, [posts]);

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
                  <span className={styles.readMore}>
                    {translate({id: 'recentPosts.readMore', message: '阅读全文'})}
                    <Icon icon="mdi:chevron-right" width={16} height={16} />
                  </span>
                </div>
              </Link>
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
