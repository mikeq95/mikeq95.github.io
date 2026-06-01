import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';
import ThemeColorButton from '@site/src/components/ThemeColorButton';
import { useColorMode } from '@docusaurus/theme-common';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function SettingsDropdown() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const isZh = currentLocale.startsWith('zh');

  const t = {
    settings: isZh ? '设置' : 'Settings',
    appearance: isZh ? '外观' : 'Appearance',
    email: isZh ? '电子邮件' : 'Email',
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button className={styles.trigger} onClick={() => setOpen(!open)}>
        <img src="/img/material-symbols--settings.svg" alt="Settings" className={styles.icon} />
      </button>

      {open && (
        <div className={styles.panel}>
          <div style={{ borderBottom: '1px solid var(--ifm-color-emphasis-200)', paddingBottom: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{t.settings}</span>
          </div>

          <ThemeColorButton label={t.appearance} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '15px', fontWeight: '500' }}>iMessage</span>
            <a href="imessage://giffgaffuk78459@icloud.com" style={{ display: 'flex', alignItems: 'center' }} title="iMessage me">
              <img src={isDark ? "/img/message-dark.png" : "/img/message-light.png"} alt="iMessage" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '15px', fontWeight: '500' }}>{t.email}</span>
            <a href="mailto:giffgaffuk78459@icloud.com" style={{ display: 'flex', alignItems: 'center' }} title="Email me">
              <img src="/img/email.png" alt="Email" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}