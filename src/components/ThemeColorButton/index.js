import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';

const PRESET_COLORS = [
  '#32ADE6', // Cyan
  '#34C759', // Green
  '#FF2D55', // Magenta
  '#AF52DE', // Purple (Default)
];

export default function ThemeColorButton({ label = '外观', colorLabel = '主题颜色', children }) {
  const [color, setColor] = useState('#AF52DE'); // Default purple
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const styleId = 'custom-theme-color-style';
    let styleEl = document.getElementById(styleId);
    
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    styleEl.innerHTML = `
      :root {
        --ifm-color-primary: ${color} !important;
        --ifm-color-primary-dark: ${color} !important;
        --ifm-color-primary-darker: ${color} !important;
        --ifm-color-primary-darkest: ${color} !important;
        --ifm-color-primary-light: ${color} !important;
        --ifm-color-primary-lighter: ${color} !important;
        --ifm-color-primary-lightest: ${color} !important;
        --ifm-link-color: ${color} !important;
      }
      
      ::selection {
        background-color: ${color} !important;
        color: #fff !important;
      }
      ::-moz-selection {
        background-color: ${color} !important;
        color: #fff !important;
      }
    `;
  }, [color]);

  return (
    <div style={{ marginBottom: '12px' }}>
      <div 
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span style={{ fontSize: '15px', fontWeight: '500', whiteSpace: 'nowrap' }}>{label}</span>
        <span style={{ fontSize: '16px', color: 'var(--ifm-color-content-secondary)' }}>
          {isExpanded ? '˅' : '›'}
        </span>
      </div>
      
      {isExpanded && (
        <div className={styles.expanded}>
          {children}
          <div className={styles.paletteRow}>
            <span className={styles.paletteLabel}>{colorLabel}</span>
            <div className={styles.paletteInline}>
              {PRESET_COLORS.map(c => (
                <div
                  key={c}
                  className={styles.colorSwatch}
                  style={{
                    backgroundColor: c,
                    border: color === c ? '2px solid var(--ifm-color-content)' : '1px solid rgba(0,0,0,0.15)',
                    transform: color === c ? 'scale(1.15)' : 'scale(1)'
                  }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
