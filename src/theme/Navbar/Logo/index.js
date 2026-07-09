import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

export default function NavbarLogo() {
  const { siteConfig } = useDocusaurusContext();
  const homeUrl = useBaseUrl('/');
  return (
    <Link to={homeUrl} className={styles.pill}>
      {siteConfig.title}
    </Link>
  );
}
