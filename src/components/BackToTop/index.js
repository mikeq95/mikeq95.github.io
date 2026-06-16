import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useLocation } from '@docusaurus/router';
import styles from './styles.module.css';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const { i18n: { currentLocale, defaultLocale } } = useDocusaurusContext();
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // The hero/landing page (site root) has its own short layout — back-to-top
  // doesn't make sense there, only on long-scroll pages like the blog.
  const basePath = currentLocale === defaultLocale
    ? pathname
    : pathname.replace(new RegExp(`^/${currentLocale}`), '') || '/';
  if (basePath === '/' || basePath === '') return null;

  return (
    <button
      type="button"
      className={`${styles.btn} ${visible ? styles.visible : ''}`}
      onClick={scrollToTop}
      aria-label={currentLocale === 'en' ? 'Back to top' : '返回顶部'}
    >
      <Icon icon="mdi:arrow-up" width={22} height={22} />
    </button>
  );
}
