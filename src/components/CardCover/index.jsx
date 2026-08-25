import React, { useEffect, useRef, useState } from 'react';
import { getGradient } from '@site/src/utils/gradients';
import styles from './index.module.css';

// `aspectRatio` / `radius` let a caller override the default 1200:630 cover
// shape and --radius-panel corner (e.g. RecentPosts' bigger 16:9 cards use
// aspectRatio="16 / 9" and radius="var(--radius-card)").
export default function CardCover({ image, permalink, width, height, aspectRatio, radius }) {
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  const wrapStyle = {
    ...(aspectRatio ? { aspectRatio } : null),
    ...(radius ? { '--cover-radius': radius } : null),
  };

  return (
    <div className={styles.cardCoverWrap} style={wrapStyle}>
      <div className={styles.cardCoverGradient} style={{ backgroundImage: getGradient(permalink) }} />
      {image && !err && (
        <img
          ref={imgRef}
          className={`${styles.cardCoverImg} ${loaded ? styles.cardCoverImgLoaded : ''}`}
          src={image}
          // Decorative: every cover sits right next to a visible text title,
          // so a screen reader repeating that same title would just be noise.
          alt=""
          width={width}
          height={height}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setErr(true)}
        />
      )}
    </div>
  );
}
