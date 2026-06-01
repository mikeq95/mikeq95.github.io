import React, { useState, useRef, useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { Icon } from '@iconify/react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useAuth } from '@site/src/context/AuthContext';
import { supabase } from '@site/src/lib/supabase';
import styles from './styles.module.css';

const PROVIDERS = [
  { id: 'google', label: 'Google', icon: 'logos:google-icon' },
  { id: 'github', label: 'GitHub', icon: 'mdi:github' },
  { id: 'discord', label: 'Discord', icon: 'logos:discord-icon' },
  { id: 'twitter', label: 'X', icon: 'ri:twitter-x-fill' },
];

function AuthButtonsInner() {
  const { user, loading } = useAuth();
  const { siteConfig, i18n: { currentLocale, defaultLocale } } = useDocusaurusContext();
  const isEn = currentLocale === 'en';
  const lp = currentLocale === defaultLocale ? '' : `/${currentLocale}`;
  const [loginOpen, setLoginOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const loginRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (loginRef.current && !loginRef.current.contains(e.target)) setLoginOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const signIn = async (provider) => {
    setLoginOpen(false);
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: siteConfig.url },
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
          className={`${styles.btn} ${styles.btnPrimary}`}
          data-auth-trigger
          onClick={() => setLoginOpen(o => !o)}
        >
          {isEn ? 'Login' : '登录'}
        </button>
        {loginOpen && (
          <div className={styles.dropdown}>
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
    <div className={styles.auth} ref={userRef}>
      <button
        type="button"
        className={styles.avatarBtn}
        onClick={() => setUserOpen(o => !o)}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className={styles.avatar} />
        ) : (
          <div className={styles.avatarFallback}>{name?.[0]?.toUpperCase()}</div>
        )}
      </button>
      {userOpen && (
        <div className={styles.dropdown}>
          <div className={styles.userName}>{name}</div>
          <hr className={styles.divider} />
          <a href={`${lp}/my-likes`} className={styles.dropdownItem}>
            {isEn ? 'My Likes' : '我的点赞'}
          </a>
          <a href={`${lp}/my-bookmarks`} className={styles.dropdownItem}>
            {isEn ? 'My Bookmarks' : '我的收藏'}
          </a>
          <hr className={styles.divider} />
          <button type="button" className={styles.dropdownItem} onClick={signOut}>
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
