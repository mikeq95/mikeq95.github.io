import React from 'react';
import styles from './index.module.css';

export default function Columns({ children, count }) {
  const style = count ? { '--columns-count': count } : undefined;
  return (
    <div className={styles.columns} style={style}>
      {children}
    </div>
  );
}
