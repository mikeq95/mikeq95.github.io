import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './music-player.module.css';

export default function MusicPlayerPage() {
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const isEn = currentLocale === 'en';
  return (
    <Layout
      title={isEn ? 'Music Player' : '在线音乐播放器'}
      description={isEn ? 'Apple Music-style player with scrolling lyrics' : 'Apple Music 风格的在线音乐播放器，支持歌词滚动、音量控制'}
    >
      <main className={styles.main}>
        <BrowserOnly fallback={<div className={styles.loading}>{isEn ? 'Loading…' : '加载播放器中…'}</div>}>
          {() => {
            const MusicPlayer = require('@site/src/components/MusicPlayer').default;
            return (
              <div className={styles.playerWrap}>
                <MusicPlayer />
              </div>
            );
          }}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
