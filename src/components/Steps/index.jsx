import React from 'react';
import styles from './index.module.css';

export function Steps({ children }) {
  return <ol className={styles.steps}>{children}</ol>;
}

export function Step({ title, children }) {
  return (
    <li className={styles.step}>
      {title && <div className={styles.stepTitle}>{title}</div>}
      <div className={styles.stepBody}>{children}</div>
    </li>
  );
}
