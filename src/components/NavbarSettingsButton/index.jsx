import React, { useState, useRef, useEffect } from 'react';
import useIsBrowser from '@docusaurus/useIsBrowser';
import GlassSurface from '@site/src/components/GlassSurface';
import ThemeColorButton from '@site/src/components/ThemeColorButton';
import ColorModeToggle from '@site/src/theme/ColorModeToggle';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
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
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const closeTimer = useRef(null);

  // Pointer type: desktop (fine) opens on hover, mobile (coarse) opens on click —
  // same pattern as AuthButtons / NavbarLanguageSwitcher.
  const [isFine, setIsFine] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches,
  );

  useEffect(() => {
    setIsFine(window.matchMedia('(pointer: fine)').matches);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openMenu = () => {
    if (!isFine) return;
    clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const scheduleClose = () => {
    if (!isFine) return;
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  return (
    <div
      ref={ref}
      className={styles.wrapper}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        className={styles.pill}
        onClick={() => { if (!isFine) setOpen(o => !o); }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={isEn ? 'Settings' : '设置'}
      >
        <SettingsIcon />
      </button>

      {open && (
        <GlassSurface
          className={styles.dropdown}
          width="auto"
          height="auto"
          borderRadius={10}
          brightness={50}
          opacity={0.9}
          blur={11}
          displace={0.5}
          backgroundOpacity={0.45}
          distortionScale={-60}
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
      )}
    </div>
  );
}

export default function NavbarSettingsButton() {
  const isBrowser = useIsBrowser();
  if (!isBrowser) return null;
  return <SettingsButtonInner />;
}
