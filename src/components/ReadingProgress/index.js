import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import styles from './styles.module.css';

export default function ReadingProgress() {
  const rawProgress = useMotionValue(0);
  const smoothProgress = useSpring(rawProgress, { stiffness: 200, damping: 30 });
  const width = useTransform(smoothProgress, (v) => `${v}%`);
  const [completed, setCompleted] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const value = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      rawProgress.set(value);
      setProgress(value);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [rawProgress]);

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

  return <motion.div className={cls} style={{ width }} />;
}
