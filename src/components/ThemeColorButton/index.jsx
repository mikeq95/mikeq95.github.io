import React, { useState, useEffect } from 'react';
import { applyAccentColor } from '@site/src/utils/themeColor';
import styles from './styles.module.css';

const PRESET_COLORS = [
  'blume', // Blume (Default)
  '#007AFF', // Blue
  '#32ADE6', // Cyan
  '#34C759', // Green
  '#FF2D55', // Magenta
  '#AF52DE', // Purple
];
const COLOR_NAMES = {
  blume: 'Blume',
  '#007AFF': 'Blue',
  '#32ADE6': 'Cyan',
  '#34C759': 'Green',
  '#FF2D55': 'Magenta',
  '#AF52DE': 'Purple',
};
const STORAGE_KEY = 'theme-accent-color';
const DEFAULT_COLOR = 'blume';

export default function ThemeColorButton({ label = '外观', colorLabel = '主题颜色', colorNames = COLOR_NAMES, selectedSuffix = ' (selected)', children }) {
  const [color, setColor] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || DEFAULT_COLOR; } catch { return DEFAULT_COLOR; }
  });
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, color); } catch {}
    applyAccentColor(color);
  }, [color]);

  return (
    <div className={styles.headerWrap}>
      <button
        type="button"
        className={styles.headerBtn}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-label={label}
      >
        <span className={styles.headerLabel}>{label}</span>
        <span className={styles.headerChevron}>
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
                  className={`${styles.colorSwatch} ${color === c ? styles.colorSwatchSelected : ''}`}
                  // backgroundColor is the one genuinely data-driven value here
                  // (a runtime hex from PRESET_COLORS) — selection state itself
                  // is expressed via the CSS modifier class above. "blume" isn't
                  // a single hex (it's a full neutral palette), so its swatch is
                  // a black/white split instead of a flat fill.
                  style={
                    c === 'blume'
                      ? { background: 'linear-gradient(135deg, #0d0d0d 50%, #ffffff 50%)' }
                      : { backgroundColor: c }
                  }
                  aria-label={`${colorNames[c] || c}${color === c ? selectedSuffix : ''}`}
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
