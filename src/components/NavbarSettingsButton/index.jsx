import React from 'react';
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

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M14.647 4.081a.724 .724 0 0 0 1.08 .448c2.439 -1.485 5.23 1.305 3.745 3.744a.724 .724 0 0 0 .447 1.08c2.775 .673 2.775 4.62 0 5.294a.724 .724 0 0 0 -.448 1.08c1.485 2.439 -1.305 5.23 -3.744 3.745a.724 .724 0 0 0 -1.08 .447c-.673 2.775 -4.62 2.775 -5.294 0a.724 .724 0 0 0 -1.08 -.448c-2.439 1.485 -5.23 -1.305 -3.745 -3.744a.724 .724 0 0 0 -.447 -1.08c-2.775 -.673 -2.775 -4.62 0 -5.294a.724 .724 0 0 0 .448 -1.08c-1.485 -2.439 1.305 -5.23 3.744 -3.745a.722 .722 0 0 0 1.08 -.447c.673 -2.775 4.62 -2.775 5.294 0zm-2.647 4.919a3 3 0 1 0 0 6a3 3 0 0 0 0 -6" />
    </svg>
  );
}

function SettingsButtonInner() {
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const isEn = currentLocale === 'en';

  return (
    <Popover className={styles.wrapper}>
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
        >
          <div className={styles.section}>
            <ThemeColorButton
              label={isEn ? 'Appearance' : '外观'}
              colorLabel={isEn ? 'Theme Colors' : '主题颜色'}
            >
              <div className={styles.darkModeRow}>
                <span className={styles.darkModeLabel}>{isEn ? 'Dark Mode:' : '夜间模式：'}</span>
                <ColorModeToggle />
              </div>
            </ThemeColorButton>
          </div>
        </GlassSurface>
      </PopoverPanel>
    </Popover>
  );
}

export default function NavbarSettingsButton() {
  const isBrowser = useIsBrowser();
  if (!isBrowser) return null;
  return <SettingsButtonInner />;
}
