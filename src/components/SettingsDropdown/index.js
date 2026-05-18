import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';
import ThemeColorButton from '@site/src/components/ThemeColorButton';
import TranslateButton from '@site/src/components/TranslateButton';
import { useColorMode } from '@docusaurus/theme-common';

export default function SettingsDropdown() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const { colorMode, setColorMode } = useColorMode();
  const isDark = colorMode === 'dark';

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
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>设置</span>
          </div>

          <ThemeColorButton />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '15px', fontWeight: '500' }}>深色模式</span>
            <div 
              onClick={() => setColorMode(isDark ? 'light' : 'dark')}
              style={{
                width: '44px',
                height: '24px',
                borderRadius: '12px',
                backgroundColor: isDark ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-300)',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
            >
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                position: 'absolute',
                top: '2px',
                left: isDark ? '22px' : '2px',
                transition: 'left 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }} />
            </div>
          </div>

          <TranslateButton />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '15px', fontWeight: '500' }}>iMessage</span>
            <a href="imessage://giffgaffuk78459@icloud.com" style={{ display: 'flex', alignItems: 'center' }} title="iMessage me">
              <img src={isDark ? "/img/message-dark.png" : "/img/message-light.png"} alt="iMessage" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '15px', fontWeight: '500' }}>Email</span>
            <a href="mailto:giffgaffuk78459@icloud.com" style={{ display: 'flex', alignItems: 'center' }} title="Email me">
              <img src="/img/email.png" alt="Email" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}