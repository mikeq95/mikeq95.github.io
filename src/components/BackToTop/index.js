import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import styles from './styles.module.css';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <button
      type="button"
      className={`${styles.btn} ${visible ? styles.visible : ''}`}
      onClick={scrollToTop}
      aria-label="返回顶部"
    >
      <Icon icon="mdi:arrow-up" width={22} height={22} />
    </button>
  );
}
