import React, { useState, useRef, useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { Icon } from '@iconify/react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useAuth } from '@site/src/context/AuthContext';
import { supabase } from '@site/src/lib/supabase';
import ThemeColorButton from '@site/src/components/ThemeColorButton';
import ColorModeToggle from '@site/src/theme/ColorModeToggle';
import styles from './styles.module.css';

const PROVIDERS = [
  { id: 'github', label: 'GitHub', icon: 'mdi:github' },
  { id: 'discord', label: 'Discord', icon: 'logos:discord-icon' },
];

function LoginIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" />
    </svg>
  );
}

function DarkModeRow({ isEn }) {
  return (
    <div className={styles.darkModeRow}>
      <span className={styles.darkModeLabel}>{isEn ? 'Dark Mode:' : '夜间模式：'}</span>
      <ColorModeToggle />
    </div>
  );
}

function CustomizeSection({ isEn }) {
  return (
    <div className={styles.customizeSection}>
      <ThemeColorButton
        label={isEn ? 'Customize' : '个性化'}
        colorLabel={isEn ? 'Theme Colors' : '主题颜色'}
      >
        <DarkModeRow isEn={isEn} />
      </ThemeColorButton>
    </div>
  );
}

// Single cover thumbnail in the "My Likes" preview. Falls back to a grey
// placeholder block when there is no image URL or the image fails to load.
function CoverThumb({ src }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className={styles.coverPlaceholder} />;
  return (
    <img
      src={src}
      alt=""
      className={styles.cover}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function AuthButtonsInner() {
  const { user, loading } = useAuth();
  const { siteConfig, i18n: { currentLocale, defaultLocale } } = useDocusaurusContext();
  const isEn = currentLocale === 'en';
  const lp = currentLocale === defaultLocale ? '' : `/${currentLocale}`;
  const [loginOpen, setLoginOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const loginRef = useRef(null);
  const userRef = useRef(null);

  // Pointer type: desktop (fine) uses hover, mobile (coarse) uses click.
  const [isFine, setIsFine] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches,
  );
  const openTimer = useRef(null);
  const closeTimer = useRef(null);

  // Drawer data: posts-meta.json (cover images) + Supabase like/bookmark stats.
  const [postsMeta, setPostsMeta] = useState(null);
  const metaStarted = useRef(false);
  const dataStarted = useRef(false);
  const [likeCount, setLikeCount] = useState(null);
  const [likeSlugs, setLikeSlugs] = useState([]);
  const [bookmarkCount, setBookmarkCount] = useState(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (loginRef.current && !loginRef.current.contains(e.target)) setLoginOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsFine(window.matchMedia('(pointer: fine)').matches);
  }, []);

  // Clean up any pending hover timers on unmount.
  useEffect(() => () => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
  }, []);

  // Hover-to-open with delays (desktop only).
  const handleDrawerEnter = () => {
    if (!isFine) return;
    clearTimeout(closeTimer.current);
    openTimer.current = setTimeout(() => setUserOpen(true), 200);
  };
  const handleDrawerLeave = () => {
    if (!isFine) return;
    clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setUserOpen(false), 300);
  };

  // Load drawer data the first time it opens (once per mount).
  useEffect(() => {
    if (!userOpen || !user) return;

    if (!metaStarted.current) {
      metaStarted.current = true;
      fetch('/posts-meta.json')
        .then(r => r.json())
        .then(setPostsMeta)
        .catch(() => setPostsMeta({}));
    }

    if (!dataStarted.current) {
      dataStarted.current = true;
      (async () => {
        try {
          const [likesRes, bmRes] = await Promise.all([
            supabase
              .from('likes')
              .select('post_id', { count: 'exact' })
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(3),
            supabase
              .from('bookmarks')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id),
          ]);
          if (likesRes.error) throw likesRes.error;
          if (bmRes.error) throw bmRes.error;
          setLikeSlugs((likesRes.data || []).map(r => r.post_id));
          setLikeCount(likesRes.count ?? 0);
          setBookmarkCount(bmRes.count ?? 0);
        } catch {
          // Silent failure: show zero counts and no covers.
          setLikeSlugs([]);
          setLikeCount(0);
          setBookmarkCount(0);
        }
      })();
    }
  }, [userOpen, user]);

  // Lock body scroll while the drawer is open (mobile only).
  useEffect(() => {
    if (isFine || !userOpen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [userOpen, isFine]);

  const signIn = async (provider) => {
    setLoginOpen(false);
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
  };

  const signOut = async () => {
    setUserOpen(false);
    await supabase.auth.signOut();
  };

  if (loading) return null;

  if (!user) {
    return (
      <div className={styles.auth} ref={loginRef}>
        <button
          type="button"
          className={styles.iconBtn}
          data-auth-trigger
          onClick={() => setLoginOpen(o => !o)}
          aria-label={isEn ? 'Login' : '登录'}
        >
          <LoginIcon />
        </button>
        {loginOpen && (
          <div className={styles.dropdown}>
            <CustomizeSection isEn={isEn} />
            <hr className={styles.divider} />
            {PROVIDERS.map(({ id, label, icon }) => (
              <button
                key={id}
                type="button"
                className={styles.providerBtn}
                onClick={() => signIn(id)}
              >
                <Icon icon={icon} width={18} />
                <span>{label} {isEn ? 'Login' : '登录'}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url;
  const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email;

  return (
    <div
      className={styles.auth}
      ref={userRef}
      onMouseEnter={handleDrawerEnter}
      onMouseLeave={handleDrawerLeave}
    >
      <button
        type="button"
        className={styles.avatarBtn}
        onClick={() => { if (!isFine) setUserOpen(o => !o); }}
        aria-label={name}
        aria-expanded={userOpen}
        aria-haspopup="menu"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className={styles.avatar} />
        ) : (
          <div className={styles.avatarFallback}>{name?.[0]?.toUpperCase()}</div>
        )}
      </button>
      {userOpen && (
        <div className={styles.drawer}>
          {/* User info */}
          <div className={styles.drawerHeader}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className={styles.drawerAvatar} />
            ) : (
              <div className={styles.drawerAvatarFallback}>{name?.[0]?.toUpperCase()}</div>
            )}
            <span className={styles.drawerName}>{name}</span>
          </div>

          <hr className={styles.drawerDivider} />

          {/* My Likes */}
          <div className={styles.section}>
            <a href={`${lp}/my-likes`} className={styles.sectionRow}>
              <span className={styles.sectionLabel}>{isEn ? '❤️ My Likes' : '❤️ 我的喜欢'}</span>
              <span className={styles.sectionMeta}>
                <span className={styles.count}>{likeCount === null ? '—' : likeCount}</span>
                <span className={styles.arrow}>›</span>
              </span>
            </a>
            {(likeCount === null || likeCount > 0) && (
              <div className={styles.covers}>
                {likeCount === null
                  ? [0, 1, 2].map(i => <div key={i} className={styles.coverPlaceholder} />)
                  : likeSlugs.slice(0, 3).map((slug, i) => (
                      <CoverThumb key={`${slug}-${i}`} src={postsMeta?.[slug]?.image} />
                    ))}
              </div>
            )}
          </div>

          <hr className={styles.drawerDivider} />

          {/* My Bookmarks */}
          <div className={styles.section}>
            <a href={`${lp}/my-bookmarks`} className={styles.sectionRow}>
              <span className={styles.sectionLabel}>{isEn ? '⭐ My Bookmarks' : '⭐ 我的收藏'}</span>
              <span className={styles.sectionMeta}>
                <span className={styles.count}>{bookmarkCount === null ? '—' : bookmarkCount}</span>
                <span className={styles.arrow}>›</span>
              </span>
            </a>
          </div>

          <hr className={styles.drawerDivider} />

          {/* Personalization (theme color + dark mode) */}
          <CustomizeSection isEn={isEn} />

          <hr className={styles.drawerDivider} />

          {/* Sign out */}
          <button type="button" className={styles.signOutBtn} onClick={signOut}>
            {isEn ? 'Sign Out' : '退出登录'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function AuthButtons() {
  return (
    <BrowserOnly fallback={null}>
      {() => <AuthButtonsInner />}
    </BrowserOnly>
  );
}
