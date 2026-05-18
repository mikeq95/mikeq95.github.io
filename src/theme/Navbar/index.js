import React, { useState, useEffect } from 'react';
import OriginalNavbar from '@theme-original/Navbar';
import SettingsDropdown from '@site/src/components/SettingsDropdown';
import TranslateButton from '@site/src/components/TranslateButton';

function useTheme() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const update = () => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

function ModeLabelBadge() {
  const isDark = useTheme();
  const labelStyle = {
    fontSize: '20px',
    userSelect: 'none',
    lineHeight: '1',
  };
  return <span style={labelStyle}>{isDark ? '🌙' : '🌞'}</span>;
}

function MessageIcon() {
  const isDark = useTheme();
  return (
    <a href="mailto:giffgaffuk78459@icloud.com" style={{ display: 'flex', alignItems: 'center' }} title="iMessage me">
      <img src={isDark ? "/img/message-dark.png" : "/img/message-light.png"} alt="iMessage" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
    </a>
  );
}

export default function NavbarWrapper(props) {
  return (
    <>
      <OriginalNavbar {...props} />
      <div style={{
        position: 'fixed',
        top: '0',
        right: '72px',
        height: '60px',
        zIndex: 1000,
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
      }}>
        <MessageIcon />
        <a href="mailto:giffgaffuk78459@icloud.com" style={{ display: 'flex', alignItems: 'center' }} title="Email me">
          <img src="/img/email.png" alt="Email" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
        </a>
        <TranslateButton />
        <SettingsDropdown />
        <ModeLabelBadge />
      </div>
    </>
  );
}