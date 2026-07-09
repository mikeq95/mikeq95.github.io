import React from 'react';
import clsx from 'clsx';
import useIsBrowser from '@docusaurus/useIsBrowser';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import GlassSurface from '@site/src/components/GlassSurface';
import {
  Popover,
  PopoverButton,
  PopoverPanel,
} from '@/components/animate-ui/components/headless/popover';
import styles from './index.module.css';

const SOCIAL = [
  { href: 'imessage://giffgaffuk78459@icloud.com', img: '/img/message-light.png', labelZh: 'iMessage', labelEn: 'iMessage', titleZh: '给我发 iMessage', titleEn: 'iMessage me' },
  { href: 'mailto:giffgaffuk78459@icloud.com',     img: '/img/email.png',         labelZh: '邮箱',      labelEn: 'Email',    titleZh: '给我发邮件',   titleEn: 'Email me'   },
];

function ContactIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M22 7.535v9.465a3 3 0 0 1 -2.824 2.995l-.176 .005h-14a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-9.465l9.445 6.297l.116 .066a1 1 0 0 0 .878 0l.116 -.066l9.445 -6.297z" />
      <path d="M19 4c1.08 0 2.027 .57 2.555 1.427l-9.555 6.37l-9.555 -6.37a2.999 2.999 0 0 1 2.354 -1.42l.201 -.007h14z" />
    </svg>
  );
}

function SocialLink({ href, img, label, title }) {
  return (
    <a href={href} className={styles.socialLink} title={title}>
      <img src={img} alt="" className={styles.socialIcon} />
      <span>{label}</span>
    </a>
  );
}

function ContactButtonInner({ mobile }) {
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const isEn = currentLocale === 'en';

  return (
    <Popover className={clsx(styles.wrapper, !mobile && 'navbar-desktop-only')}>
      <PopoverButton
        as="button"
        className={styles.pill}
        aria-label={isEn ? 'Contact' : '联系我'}
      >
        <ContactIcon />
      </PopoverButton>

      <PopoverPanel
        anchor={{ to: 'bottom end', gap: 6 }}
        className="w-auto rounded-none border-0 bg-transparent p-0 shadow-none"
      >
        <GlassSurface
          className={styles.glass}
          width="auto"
          height="auto"
          borderRadius={10}
        >
          <div className={styles.section}>
            {SOCIAL.map((s) => (
              <SocialLink
                key={s.href}
                href={s.href}
                img={s.img}
                label={isEn ? s.labelEn : s.labelZh}
                title={isEn ? s.titleEn : s.titleZh}
              />
            ))}
          </div>
        </GlassSurface>
      </PopoverPanel>
    </Popover>
  );
}

export default function NavbarContactButton({ mobile }) {
  const isBrowser = useIsBrowser();
  if (!isBrowser) return null;
  return <ContactButtonInner mobile={mobile} />;
}
