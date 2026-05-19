import React from 'react';
import styles from './styles.module.css';

export default function ShareButtons({ title, url }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const twitterUrl = 'https://twitter.com/intent/tweet?text=' + encodedTitle + '&url=' + encodedUrl;
  const facebookUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodedUrl;
  const linkedinUrl = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodedUrl;

  return (
    <div className={styles.shareContainer}>
      <span className={styles.shareLabel}>Share:</span>
      <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className={styles.shareButton}>
        X (Twitter)
      </a>
      <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className={styles.shareButton}>
        Facebook
      </a>
      <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className={styles.shareButton}>
        LinkedIn
      </a>
    </div>
  );
}
