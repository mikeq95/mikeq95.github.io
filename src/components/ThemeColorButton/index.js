import React, { useState, useEffect } from 'react';
import { applyAccentColor } from '@site/src/utils/themeColor';
import styles from './styles.module.css';

const PRESET_COLORS = [
  '#32ADE6', // Cyan
  '#34C759', // Green
  '#FF2D55', // Magenta
  '#AF52DE', // Purple (Default)
];
const COLOR_NAMES = {
  '#32ADE6': 'Cyan',
  '#34C759': 'Green',
  '#FF2D55': 'Magenta',
  '#AF52DE': 'Purple',
};
const STORAGE_KEY = 'theme-accent-color';
const DEFAULT_COLOR = '#AF52DE';

export default function ThemeColorButton({ label = '外观', colorLabel = '主题颜色', children }) {
  const [color, setColor] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || DEFAULT_COLOR; } catch { return DEFAULT_COLOR; }
  });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, color); } catch {}
    applyAccentColor(color);
  }, [color]);

  return (
    <div style={{ marginBottom: '12px' }}>
      <button
        type="button"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', width: '100%', background: 'none', border: 'none', padding: 0 }}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-label={label}
      >
        <span style={{ fontSize: '15px', fontWeight: '500', whiteSpace: 'nowrap' }}>{label}</span>
        <span style={{ fontSize: '16px', color: 'var(--ifm-color-content-secondary)' }}>
          {isExpanded ? '˅' : '›'}
        </span>
      </button>
      
      {isExpanded && (
        <div className={styles.expanded}>
          {children}
          <div className={styles.paletteRow}>
            <span className={styles.paletteLabel}>{colorLabel}</span>
            <div className={styles.paletteInline}>
              {PRESET_COLORS.map(c => (
                <div
                  key={c}
                  role="button"
                  tabIndex={0}
                  className={styles.colorSwatch}
                  style={{
                    backgroundColor: c,
                    border: color === c ? '2px solid var(--ifm-color-content)' : '1px solid rgba(0,0,0,0.15)',
                    transform: color === c ? 'scale(1.15)' : 'scale(1)'
                  }}
                  aria-label={`${COLOR_NAMES[c] || c}${color === c ? ' (selected)' : ''}`}
                  aria-pressed={color === c}
                  onClick={() => setColor(c)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setColor(c); } }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
