import React from 'react';
import Giscus from '@giscus/react';

export default function GiscusComment() {
  return (
    <Giscus
      repo="mikeq95/mikeq95.github.io"
      repoId="R_kgDOSdUdFQ"
      category="Announcements"
      categoryId="DIC_kwDOSdUdFc4C9Wy8"
      mapping="pathname"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="bottom"
      theme="preferred_color_scheme"
      lang="en"
      crossorigin="anonymous"
    />
  );
}