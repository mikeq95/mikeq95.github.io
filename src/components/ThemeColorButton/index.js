import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';

const PRESET_COLORS = [
  '#000000', // Black
  '#007AFF', // Blue
  '#A2845E', // Brown
  '#32ADE6', // Cyan
  '#34C759', // Green
  '#FF2D55', // Magenta
  '#FF9500', // Orange
  '#AF52DE', // Purple (Default)
  '#FF3B30', // Red
  '#FFCC00', // Yellow
  '#FFFFFF', // White
];

export default function ThemeColorButton() {
  const [color, setColor] = useState('#AF52DE'); // Default purple
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <div className={styles.colorPickerWrapper} ref={wrapperRef}>
      <button 
        className={styles.colorPickerPill} 
        style={{ backgroundColor: color, color: color === '#FFFFFF' ? '#000' : '#fff' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        Theme Color
      </button>
      
      {isOpen && (
        <div className={styles.palette}>
          {PRESET_COLORS.map(c => (
            <div 
              key={c}
              className={styles.colorSwatch}
              style={{ backgroundColor: c }}
              onClick={() => {
                setColor(c);
                setIsOpen(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
