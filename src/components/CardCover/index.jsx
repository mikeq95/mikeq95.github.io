import React, { useEffect, useRef, useState } from 'react';
import { getGradient } from '@site/src/utils/gradients';
import styles from './index.module.css';

export default function CardCover({ image, permalink }) {
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  return (
    <div className={styles.cardCoverWrap}>
      <div className={styles.cardCoverGradient} style={{ background: getGradient(permalink) }} />
      {image && !err && (
        <img
          ref={imgRef}
          className={`${styles.cardCoverImg} ${loaded ? styles.cardCoverImgLoaded : ''}`}
          src={image} alt=""
          onLoad={() => setLoaded(true)}
          onError={() => setErr(true)}
        />
      )}
    </div>
  );
}
