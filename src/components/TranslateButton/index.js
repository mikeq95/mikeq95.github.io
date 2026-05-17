import React, { useState, useEffect, useRef } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

const LANGUAGES = [
  { code: 'zh-CN', flag: '🇨🇳', label: '简体中文' },
  { code: 'zh-TW', flag: '🇹🇼', label: '繁體中文' },
  { code: 'en',    flag: '🇺🇸', label: 'English' },
  { code: 'ja',    flag: '🇯🇵', label: '日本語' },
  { code: 'ko',    flag: '🇰🇷', label: '한국어' },
];

const DEFAULT_COLOR = '#AF52DE';

function getThemeColor() {
  // Read the injected style element to extract the current theme color
  const styleEl = document.getElementById('custom-theme-color-style');
  if (styleEl) {
    const match = styleEl.innerHTML.match(/--ifm-color-primary:\s*(#[0-9a-fA-F]{3,8}|rgb[^)]+\))/);
    if (match) return match[1].trim();
  }
  return DEFAULT_COLOR;
}

export default function TranslateButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(LANGUAGES[0]);
  const [pillColor, setPillColor] = useState(DEFAULT_COLOR);
  const wrapperRef = useRef(null);
  const iconSrc = useBaseUrl('/img/material-symbols--translate.svg');

  // Sync pill color when theme color changes
  useEffect(() => {
    const update = () => setPillColor(getThemeColor());

    // Watch for changes to <head> (where the style tag lives)
    const observer = new MutationObserver(update);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });

    // Also watch the style element's text content once it exists
    const styleEl = document.getElementById('custom-theme-color-style');
    if (styleEl) observer.observe(styleEl, { characterData: true, subtree: true, childList: true });

    update(); // initial read
    return () => observer.disconnect();
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (lang) => {
    setSelected(lang);
    setIsOpen(false);
    document.documentElement.lang = lang.code;
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        className={styles.pill}
        style={{ backgroundColor: pillColor }}
        onClick={() => setIsOpen(!isOpen)}
        title="切换语言 / Change Language"
      >
        <img src={iconSrc} alt="Translate" className={styles.icon} />
        {selected.flag}
      </button>

      {isOpen && (
        <div className={styles.panel}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className={styles.option}
              style={selected.code === lang.code ? { background: 'var(--ifm-color-emphasis-100)', fontWeight: 700 } : {}}
              onClick={() => handleSelect(lang)}
            >
              <span className={styles.flag}>{lang.flag}</span>
              <span className={styles.label}>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
