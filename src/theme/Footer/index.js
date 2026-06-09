import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import Link from '@docusaurus/Link';
import { Icon } from '@iconify/react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { usePluginData } from '@docusaurus/useGlobalData';
import styles from './styles.module.css';

const SOCIAL = [
  { href: 'imessage://giffgaffuk78459@icloud.com', icon: 'mdi:message-outline',  labelZh: 'iMessage',  labelEn: 'iMessage', titleZh: '给我发 iMessage', titleEn: 'iMessage me' },
  { href: 'mailto:giffgaffuk78459@icloud.com',     icon: 'mdi:email-outline',    labelZh: '邮箱',       labelEn: 'Email',    titleZh: '给我发邮件',    titleEn: 'Email me'   },
];

function SocialIcon({ href, icon, label, title }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const enter = () => gsap.to(el, { y: -4, scale: 1.1, duration: 0.2, ease: 'power2.out', overwrite: 'auto' });
    const leave = () => gsap.to(el, { y: 0,  scale: 1,   duration: 0.2, ease: 'power2.out', overwrite: 'auto' });
    el.addEventListener('mouseenter', enter);
    el.addEventListener('mouseleave', leave);
    return () => { el.removeEventListener('mouseenter', enter); el.removeEventListener('mouseleave', leave); };
  }, []);

  return (
    <a ref={ref} href={href} className={styles.socialLink} title={title} aria-label={label}>
      <Icon icon={icon} className={styles.socialIcon} />
      <span>{label}</span>
    </a>
  );
}

export default function Footer() {
  const { siteConfig, i18n: { currentLocale } } = useDocusaurusContext();
  const isZh = currentLocale.startsWith('zh');
  const year = new Date().getFullYear();
  const blogData = usePluginData('blog-global-data');
  const recentPosts = (blogData?.blogPosts ?? []).slice(0, 3);

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

        {/* Center: recent posts */}
        <div className={styles.col}>
          <div className={styles.colTitle}>{isZh ? '近期文章' : 'Recent Posts'}</div>
          <ul className={styles.postList}>
            {recentPosts.map(post => (
              <li key={post.id ?? post.permalink}>
                <Link to={post.permalink} className={styles.postLink}>
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: social */}
        <div className={styles.col}>
          <div className={styles.colTitle}>{isZh ? '联系我' : 'Contact'}</div>
          <div className={styles.socialLinks}>
            {SOCIAL.map(s => (
              <SocialIcon
                key={s.href}
                href={s.href}
                icon={s.icon}
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
