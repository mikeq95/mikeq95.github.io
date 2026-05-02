import React, { useState, useEffect } from 'react';

const colors = [
  { name: 'Purple', primary: '#7c3aed', light: '#a78bfa' },
  { name: 'Blue', primary: '#2563eb', light: '#60a5fa' },
  { name: 'Green', primary: '#16a34a', light: '#4ade80' },
  { name: 'Red', primary: '#dc2626', light: '#f87171' },
  { name: 'Orange', primary: '#ea580c', light: '#fb923c' },
  { name: 'Pink', primary: '#db2777', light: '#f472b6' },
];

export default function ColorPicker() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme-color');
    if (saved) {
      const color = JSON.parse(saved);
      applyColor(color);
    }
  }, []);

  function applyColor(color) {
    document.documentElement.style.setProperty('--ifm-color-primary', color.primary);
    document.documentElement.style.setProperty('--ifm-color-primary-light', color.light);
    localStorage.setItem('theme-color', JSON.stringify(color));
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'var(--ifm-color-primary)',
          border: 'none',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '500',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '14px',
          transition: 'background 0.3s',
        }}
      >
        Theme color
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '36px',
          background: 'var(--ifm-background-surface-color)',
          border: '1px solid var(--ifm-color-emphasis-200)',
          borderRadius: '8px',
          padding: '8px',
          display: 'flex',
          gap: '8px',
          zIndex: 999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() => { applyColor(color); setOpen(false); }}
              title={color.name}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: color.primary,
                border: 'none',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
