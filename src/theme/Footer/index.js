import React, { useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

const SOCIAL = [
  { href: 'imessage://giffgaffuk78459@icloud.com', img: '/img/message-light.png', labelZh: 'iMessage', labelEn: 'iMessage', titleZh: '给我发 iMessage', titleEn: 'iMessage me' },
  { href: 'mailto:giffgaffuk78459@icloud.com',     img: '/img/email.png',         labelZh: '邮箱',      labelEn: 'Email',    titleZh: '给我发邮件',   titleEn: 'Email me'   },
];

function SocialIcon({ href, img, label, title }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cleanup = () => {};
    import('gsap').then(({ gsap }) => {
      if (!ref.current) return;
      const enter = () => gsap.to(el, { y: -4, scale: 1.1, duration: 0.2, ease: 'power2.out', overwrite: 'auto' });
      const leave = () => gsap.to(el, { y: 0,  scale: 1,   duration: 0.2, ease: 'power2.out', overwrite: 'auto' });
      el.addEventListener('mouseenter', enter);
      el.addEventListener('mouseleave', leave);
      cleanup = () => { el.removeEventListener('mouseenter', enter); el.removeEventListener('mouseleave', leave); };
    });
    return () => cleanup();
  }, []);

  return (
    <a ref={ref} href={href} className={styles.socialLink} title={title} aria-label={label}>
      <img src={img} alt={label} className={styles.socialIcon} />
      <span>{label}</span>
    </a>
  );
}

export default function Footer() {
  const { siteConfig, i18n: { currentLocale } } = useDocusaurusContext();
  const isZh = currentLocale.startsWith('zh');
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>

        {/* Left: brand + tagline + RSS */}
        <div className={styles.col}>
          <div className={styles.brand}>{siteConfig.title}</div>
          <p className={styles.tagline}>
            {isZh ? '记录想法，分享技术，留住青春。' : 'Tech, tools, and personal notes.'}
          </p>
          <a href="/blog/rss.xml" className={styles.rssLink} target="_blank" rel="noopener noreferrer">
            <Icon icon="mdi:rss" className={styles.rssIcon} />
            RSS
          </a>
        </div>

        {/* Right: social */}
        <div className={styles.col}>
          <div className={styles.colTitle}>{isZh ? '联系我' : 'Contact'}</div>
          <div className={styles.socialLinks}>
            {SOCIAL.map(s => (
              <SocialIcon
                key={s.href}
                href={s.href}
                img={s.img}
                label={isZh ? s.labelZh : s.labelEn}
                title={isZh ? s.titleZh : s.titleEn}
              />
            ))}
          </div>
        </div>

      </div>

      <div className={styles.bottom}>
        <span>© {year} {siteConfig.title}</span>
        <span className={styles.bottomDot}>·</span>
        <span>{isZh ? '用 ❤️ 构建' : 'Built with ❤️'}</span>
      </div>
    </footer>
  );
}
