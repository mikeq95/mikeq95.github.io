import React, { useState, useRef, useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { Icon } from '@iconify/react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useAuth } from '@site/src/context/AuthContext';
import { supabase } from '@site/src/lib/supabase';
import GlassSurface from '@site/src/components/GlassSurface';
import {
  Popover,
  PopoverButton,
  PopoverPanel,
} from '@/components/animate-ui/components/headless/popover';
import styles from './styles.module.css';

const PROVIDERS = [
  { id: 'github', label: 'GitHub', icon: 'mdi:github' },
  { id: 'discord', label: 'Discord', icon: 'logos:discord-icon' },
];

const PANEL_RESET_CLASS = 'w-auto rounded-none border-0 bg-transparent p-0 shadow-none';

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

// Keeps the page from scrolling behind the drawer on mobile while it's open.
// Rendered as a permanent sibling of PopoverButton/PopoverPanel (not inside
// the panel itself) so it stays mounted across open/close and can react to
// `open` toggling either way.
function MobileScrollLock({ open }) {
  useEffect(() => {
    const isFine = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;
    if (isFine || !open) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  return null;
}

function AuthButtonsInner() {
  const { user, loading } = useAuth();
  const { i18n: { currentLocale, defaultLocale } } = useDocusaurusContext();
  const isEn = currentLocale === 'en';
  const lp = currentLocale === defaultLocale ? '' : `/${currentLocale}`;

  // Drawer data: posts-meta.json (cover images) + Supabase like/bookmark stats.
  // Loaded once as soon as a user is known, not gated on the drawer being open.
  const [postsMeta, setPostsMeta] = useState(null);
  const metaStarted = useRef(false);
  const dataStarted = useRef(false);
  const [likeCount, setLikeCount] = useState(null);
  const [likeSlugs, setLikeSlugs] = useState([]);
  const [bookmarkCount, setBookmarkCount] = useState(null);

  useEffect(() => {
    if (!user) return;

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
  }, [user]);

  const signIn = async (provider) => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return null;

  if (!user) {
    return (
      <Popover className={styles.auth}>
        {({ close }) => (
          <>
            <PopoverButton
              as="button"
              type="button"
              className={styles.loginPillBtn}
              data-auth-trigger
              aria-label={isEn ? 'Login' : '登录'}
            >
              <LoginIcon />
              <span>{isEn ? 'Login' : '登录'}</span>
            </PopoverButton>

            <PopoverPanel
              anchor={{ to: 'bottom end', gap: 6 }}
              className={PANEL_RESET_CLASS}
            >
              <GlassSurface
                className={styles.dropdown}
                width="auto"
                height="auto"
                borderRadius={10}
                brightness={50}
                opacity={0.9}
                blur={11}
                displace={0.5}
                backgroundOpacity={0.45}
                distortionScale={-60}
              >
                {PROVIDERS.map(({ id, label, icon }) => (
                  <button
                    key={id}
                    type="button"
                    className={styles.providerBtn}
                    onClick={() => { close(); signIn(id); }}
                  >
                    <Icon icon={icon} width={18} />
                    <span>{label} {isEn ? 'Login' : '登录'}</span>
                  </button>
                ))}
              </GlassSurface>
            </PopoverPanel>
          </>
        )}
      </Popover>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url;
  const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email;

  return (
    <Popover className={styles.auth}>
      {({ open, close }) => (
        <>
          <PopoverButton
            as="button"
            type="button"
            className={styles.avatarBtn}
            aria-label={name}
            aria-haspopup="menu"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className={styles.avatar} />
            ) : (
              <div className={styles.avatarFallback}>{name?.[0]?.toUpperCase()}</div>
            )}
          </PopoverButton>

          <MobileScrollLock open={open} />

          <PopoverPanel
            anchor={{ to: 'bottom end', gap: 8 }}
            className={PANEL_RESET_CLASS}
          >
            <GlassSurface
              className={styles.drawer}
              width="min(280px, calc(100vw - 24px))"
              height="auto"
              borderRadius={14}
              brightness={50}
              opacity={0.9}
              blur={11}
              displace={0.5}
              backgroundOpacity={0.45}
              distortionScale={-60}
            >
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

              {/* Sign out */}
              <button
                type="button"
                className={styles.signOutBtn}
                onClick={() => { close(); signOut(); }}
              >
                {isEn ? 'Sign Out' : '退出登录'}
              </button>
            </GlassSurface>
          </PopoverPanel>
        </>
      )}
    </Popover>
  );
}

export default function AuthButtons() {
  return (
    <BrowserOnly fallback={null}>
      {() => <AuthButtonsInner />}
    </BrowserOnly>
  );
}
