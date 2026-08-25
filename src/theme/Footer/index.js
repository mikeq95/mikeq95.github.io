import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

export default function Footer() {
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const isEn = currentLocale === 'en';
  return (
    <footer className={styles.footer}>
      <p className={styles.tagline}>
        {isEn ? 'Think independently, and distinguish right from wrong.' : '独立思考，明辨是非。'}
      </p>
    </footer>
  );
}
