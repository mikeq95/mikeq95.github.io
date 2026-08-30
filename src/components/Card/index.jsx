import React from 'react';
import styles from './index.module.css';

export function CardGrid({ children }) {
  return <div className={styles.grid}>{children}</div>;
}

export function Card({ title, icon, href, children }) {
  const body = (
    <>
      {icon && <div className={styles.icon}>{icon}</div>}
      {title && <div className={styles.title}>{title}</div>}
      {children && <div className={styles.body}>{children}</div>}
    </>
  );

  if (href) {
    return (
      <a className={`${styles.card} ${styles.cardLink}`} href={href}>
        {body}
      </a>
    );
  }

  return <div className={styles.card}>{body}</div>;
}
