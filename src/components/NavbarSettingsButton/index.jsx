import React from 'react';
import clsx from 'clsx';
import useIsBrowser from '@docusaurus/useIsBrowser';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import GlassSurface from '@site/src/components/GlassSurface';
import ThemeColorButton from '@site/src/components/ThemeColorButton';
import ColorModeToggle from '@site/src/theme/ColorModeToggle';
import {
  Popover,
  PopoverButton,
  PopoverPanel,
} from '@/components/animate-ui/components/headless/popover';
import styles from './index.module.css';

const COLOR_NAMES_ZH = {
  blume: 'Blume',
  '#007AFF': '蓝色',
  '#32ADE6': '青色',
  '#34C759': '绿色',
  '#FF2D55': '品红',
  '#AF52DE': '紫色',
};

// Contact links, ported in from the now-retired NavbarContactButton.
const SOCIAL = [
  { href: 'imessage://giffgaffuk78459@icloud.com', img: '/img/message-light.png', labelZh: 'iMessage', labelEn: 'iMessage', titleZh: '给我发 iMessage', titleEn: 'iMessage me' },
  { href: 'mailto:giffgaffuk78459@icloud.com',     img: '/img/email.png',         labelZh: '邮箱',      labelEn: 'Email',    titleZh: '给我发邮件',   titleEn: 'Email me'   },
];

// The 4 external links previously sitting inline in the navbar's left side.
const OTHER_LINKS = [
  { href: 'https://ai.mikeq95blog.uk', labelZh: 'AI 博客', labelEn: 'AI Blog' },
  { href: 'https://www.cheapchina.uk', labelZh: '小店', labelEn: 'Shop' },
  { href: 'https://notes.mikeq95blog.uk', labelZh: 'Kris 的笔记', labelEn: "Kris' Notes" },
  { href: 'https://second.mikeq95blog.uk/blog/English/2026-04-29-general-english-vocabulary', labelZh: 'Amy 的英语笔记', labelEn: "Amy's English Notes" },
];

function SocialLink({ href, img, label, title }) {
  return (
    <a href={href} className={styles.socialLink} title={title}>
      {img && <img src={img} alt="" className={styles.socialIcon} />}
      <span>{label}</span>
    </a>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M14.647 4.081a.724 .724 0 0 0 1.08 .448c2.439 -1.485 5.23 1.305 3.745 3.744a.724 .724 0 0 0 .447 1.08c2.775 .673 2.775 4.62 0 5.294a.724 .724 0 0 0 -.448 1.08c1.485 2.439 -1.305 5.23 -3.744 3.745a.724 .724 0 0 0 -1.08 .447c-.673 2.775 -4.62 2.775 -5.294 0a.724 .724 0 0 0 -1.08 -.448c-2.439 1.485 -5.23 -1.305 -3.745 -3.744a.724 .724 0 0 0 -.447 -1.08c-2.775 -.673 -2.775 -4.62 0 -5.294a.724 .724 0 0 0 .448 -1.08c-1.485 -2.439 1.305 -5.23 3.744 -3.745a.722 .722 0 0 0 1.08 -.447c.673 -2.775 4.62 -2.775 5.294 0zm-2.647 4.919a3 3 0 1 0 0 6a3 3 0 0 0 0 -6" />
    </svg>
  );
}

function SettingsButtonInner({ mobile }) {
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const isEn = currentLocale === 'en';

  return (
    <Popover className={clsx(styles.wrapper, !mobile && 'navbar-desktop-only')}>
      <PopoverButton
        as="button"
        className={styles.pill}
        aria-label={isEn ? 'Settings' : '设置'}
      >
        <SettingsIcon />
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
          solid={mobile}
        >
          <div className={styles.section}>
            <ThemeColorButton
              label={isEn ? 'Appearance' : '外观'}
              colorLabel={isEn ? 'Theme Colors' : '主题颜色'}
              colorNames={isEn ? undefined : COLOR_NAMES_ZH}
              selectedSuffix={isEn ? ' (selected)' : '（已选中）'}
            >
              <div className={styles.darkModeRow}>
                <span className={styles.darkModeLabel}>{isEn ? 'Dark Mode:' : '夜间模式：'}</span>
                <ColorModeToggle />
              </div>
            </ThemeColorButton>
          </div>

          <div className={styles.divider} />

          <div className={clsx(styles.section, styles.linkSection)}>
            <span className={styles.sectionLabel}>{isEn ? 'Contact' : '联系'}</span>
            {SOCIAL.map(s => (
              <SocialLink
                key={s.href}
                href={s.href}
                img={s.img}
                label={isEn ? s.labelEn : s.labelZh}
                title={isEn ? s.titleEn : s.titleZh}
              />
            ))}
          </div>

          <div className={styles.divider} />

          <div className={clsx(styles.section, styles.linkSection)}>
            <span className={styles.sectionLabel}>{isEn ? 'Other' : '其他'}</span>
            {OTHER_LINKS.map(link => (
              <SocialLink
                key={link.href}
                href={link.href}
                label={isEn ? link.labelEn : link.labelZh}
              />
            ))}
          </div>
        </GlassSurface>
      </PopoverPanel>
    </Popover>
  );
}

export default function NavbarSettingsButton({ mobile }) {
  const isBrowser = useIsBrowser();
  if (!isBrowser) return null;
  return <SettingsButtonInner mobile={mobile} />;
}
