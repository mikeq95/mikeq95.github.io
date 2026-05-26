import React, { useEffect, useRef } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

function WalineCommentInner() {
  const containerRef = useRef(null);
  const walineRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { init } = await import('@waline/client');
      await import('@waline/client/style');
      if (containerRef.current) {
        walineRef.current = init({
          el: containerRef.current,
          serverURL: 'https://waline1111.vercel.app',
          lang: 'en',
        });
      }
    })();
    return () => {
      walineRef.current?.destroy();
    };
  }, []);

  return <div ref={containerRef} />;
}

export default function WalineComment() {
  return <BrowserOnly fallback={<div />}>{() => <WalineCommentInner />}</BrowserOnly>;
}
