import React from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

function ContactLink({ href, iconSrc, label, title }) {
  return (
    <a href={href} className={styles.contactLink} title={title} aria-label={label}>
      <img src={iconSrc} alt="" className={styles.contactIcon} />
      <span>{label}</span>
    </a>
  );
}

export default function Footer() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const { siteConfig, i18n: { currentLocale } } = useDocusaurusContext();
  const isZh = currentLocale.startsWith('zh');
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>{siteConfig.title}</div>
        <div className={styles.contacts}>
          <ContactLink
            href="imessage://giffgaffuk78459@icloud.com"
            iconSrc={isDark ? '/img/message-dark.png' : '/img/message-light.png'}
            label="iMessage"
            title={isZh ? '给我发 iMessage' : 'iMessage me'}
          />
          <ContactLink
            href="mailto:giffgaffuk78459@icloud.com"
            iconSrc="/img/email.png"
            label={isZh ? '邮箱' : 'Email'}
            title={isZh ? '给我发邮件' : 'Email me'}
          />
        </div>
        <div className={styles.copyright}>
          © {year} {siteConfig.title}
        </div>
      </div>
    </footer>
  );
}
