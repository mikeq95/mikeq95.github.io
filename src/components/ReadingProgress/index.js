import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [hidden, setHidden] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (progress >= 98 && !completed) {
      setCompleted(true);
      timerRef.current = setTimeout(() => setHidden(true), 1000);
    } else if (progress < 98 && completed) {
      // User scrolled back up — reset
      clearTimeout(timerRef.current);
      setCompleted(false);
      setHidden(false);
    }
    return () => clearTimeout(timerRef.current);
  }, [progress, completed]);

  const cls = [
    styles.bar,
    completed ? styles.completed : '',
    hidden    ? styles.hidden    : '',
  ].filter(Boolean).join(' ');

  return <div className={cls} style={{ width: `${progress}%` }} />;
}
