import React, { useState, useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { translate } from '@docusaurus/Translate';
import { Icon } from '@iconify/react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useAuth } from '@site/src/context/AuthContext';
import { supabase } from '@site/src/lib/supabase';
import styles from './index.module.css';

const PROVIDERS = [
  { id: 'github', label: 'GitHub', icon: 'mdi:github' },
  { id: 'discord', label: 'Discord', icon: 'logos:discord-icon' },
];

function HeroAuthCardInner() {
  const { user, loading } = useAuth();
  const { i18n: { currentLocale, defaultLocale } } = useDocusaurusContext();
  const lp = currentLocale === defaultLocale ? '' : `/${currentLocale}`;
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [{ count: likes }, { count: bookmarks }] = await Promise.all([
        supabase.from('likes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('bookmarks').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);
      if (!cancelled) setCounts({ likes: likes ?? 0, bookmarks: bookmarks ?? 0 });
    })();
    return () => { cancelled = true; };
  }, [user]);

  const signIn = async (provider) => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
  };

  if (loading) {
    return <div className={styles.card} aria-hidden="true" />;
  }

  if (!user) {
    return (
      <div className={styles.card}>
        <div className={styles.cardTitle}>
          {translate({id: 'heroAuthCard.joinTitle', message: '加入讨论'})}
        </div>
        <p className={styles.cardText}>
          {translate({id: 'heroAuthCard.joinDesc', message: '登录后即可点赞文章、收藏内容，参与评论讨论。'})}
        </p>
        <div className={styles.providerList}>
          {PROVIDERS.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              className={styles.providerBtn}
              onClick={() => signIn(id)}
            >
              <Icon icon={icon} width={18} />
              <span>{translate({id: 'heroAuthCard.continueWith', message: '使用 {provider} 登录'}, {provider: label})}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url;
  const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email;

  return (
    <div className={styles.card}>
      <div className={styles.profile}>
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className={styles.avatar} />
        ) : (
          <div className={styles.avatarFallback}>{name?.[0]?.toUpperCase()}</div>
        )}
        <div className={styles.greeting}>
          {translate({id: 'heroAuthCard.welcomeBack', message: '欢迎回来，{name}'}, {name})}
        </div>
      </div>
      <div className={styles.statsRow}>
        <a href={`${lp}/my-likes`} className={styles.statLink}>
          <span className={styles.statValue}>{counts ? counts.likes : '–'}</span>
          <span className={styles.statLabel}>{translate({id: 'heroAuthCard.likes', message: '点赞'})}</span>
        </a>
        <a href={`${lp}/my-bookmarks`} className={styles.statLink}>
          <span className={styles.statValue}>{counts ? counts.bookmarks : '–'}</span>
          <span className={styles.statLabel}>{translate({id: 'heroAuthCard.bookmarks', message: '收藏'})}</span>
        </a>
      </div>
    </div>
  );
}

export default function HeroAuthCard() {
  return (
    <BrowserOnly fallback={<div className="hero-auth-card-placeholder" />}>
      {() => <HeroAuthCardInner />}
    </BrowserOnly>
  );
}
