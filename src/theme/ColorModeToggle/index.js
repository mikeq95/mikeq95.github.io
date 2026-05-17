import React from 'react';
import useIsBrowser from '@docusaurus/useIsBrowser';
import OriginalColorModeToggle from '@theme-original/ColorModeToggle';
import styles from './styles.module.css';

function getModeLabel(value) {
  if (value === 'dark') return '夜间模式';
  return '日间模式';
}

export default function ColorModeToggle(props) {
  const isBrowser = useIsBrowser();
  const label = isBrowser ? getModeLabel(props.value) : '日间模式';

  return (
    <div className={styles.wrapper}>
      <span className={styles.modeLabel}>{label}</span>
      <OriginalColorModeToggle {...props} />
    </div>
  );
}

