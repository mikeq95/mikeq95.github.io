import React, { useState } from 'react';

const LANGUAGES = [
  { code: 'zh-CN', flag: '🇨🇳', label: '简体中文' },
  { code: 'zh-TW', flag: '🇹🇼', label: '繁體中文' },
  { code: 'en',    flag: '🇺🇸', label: 'English' },
  { code: 'ja',    flag: '🇯🇵', label: '日本語' },
  { code: 'ko',    flag: '🇰🇷', label: '한국어' },
];

export default function TranslateButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(LANGUAGES[0]);

  const handleSelect = (lang) => {
    setSelected(lang);
    setIsOpen(false);
    document.documentElement.lang = lang.code;
  };

  return (
    <div style={{ marginBottom: '12px' }}>
      <div 
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ fontSize: '15px', fontWeight: '500', whiteSpace: 'nowrap' }}>语言</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>{selected.flag}</span>
          <span style={{ fontSize: '16px', color: 'var(--ifm-color-content-secondary)' }}>
            {isOpen ? '˅' : '›'}
          </span>
        </div>
      </div>

      {isOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 0 4px 0' }}>
          {LANGUAGES.map((lang) => (
            <div
              key={lang.code}
              onClick={() => handleSelect(lang)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: selected.code === lang.code ? 'var(--ifm-color-emphasis-200)' : 'transparent',
                fontWeight: selected.code === lang.code ? 'bold' : 'normal',
              }}
            >
              <span style={{ fontSize: '18px' }}>{lang.flag}</span>
              <span style={{ fontSize: '14px' }}>{lang.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
