import React, { useState, useEffect } from 'react';
import OriginalNavbar from '@theme-original/Navbar';
import SettingsDropdown from '@site/src/components/SettingsDropdown';
import ThemeColorButton from '@site/src/components/ThemeColorButton';
import TranslateButton from '@site/src/components/TranslateButton';

function ModeLabelBadge() {
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

  const labelStyle = {
    fontSize: '20px',
    userSelect: 'none',
    lineHeight: '1',
  };

  return <span style={labelStyle}>{isDark ? '🌙' : '🌞'}</span>;
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
        gap: '16px',
        alignItems: 'center',
      }}>
        <ThemeColorButton />
        <TranslateButton />
        <SettingsDropdown />
        <ModeLabelBadge />
      </div>
    </>
  );
}