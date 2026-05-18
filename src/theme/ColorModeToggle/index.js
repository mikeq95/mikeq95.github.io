import React from 'react';
import useIsBrowser from '@docusaurus/useIsBrowser';
import OriginalColorModeToggle from '@theme-original/ColorModeToggle';
import styles from './styles.module.css';

function getModeLabel(value) {
  return '';
}

export default function ColorModeToggle(props) {
  const isBrowser = useIsBrowser();
  const label = isBrowser ? getModeLabel(props.value) : '';

  return (
    <div className={styles.wrapper}>
      <span className={styles.modeLabel}>{label}</span>
      <OriginalColorModeToggle {...props} title="" />
    </div>
  );
}

