import React, { useState } from 'react';
import styles from './styles.module.css';

export default function SettingsDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <button className={styles.trigger} onClick={() => setOpen(!open)}>
        <img src="/img/material-symbols--settings.svg" alt="Settings" className={styles.icon} />
      </button>

      {open && (
        <div className={styles.panel}>
          <p>设置 1</p>
          <p>设置 2</p>
        </div>
      )}
    </div>
  );
}