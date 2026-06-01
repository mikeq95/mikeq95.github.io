import React, { useEffect, useRef } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function WalineCommentInner() {
  const containerRef = useRef(null);
  const walineRef = useRef(null);
  const { i18n: { currentLocale } } = useDocusaurusContext();

  useEffect(() => {
    (async () => {
      const { init } = await import('@waline/client');
      await import('@waline/client/style');
      if (containerRef.current) {
        walineRef.current = init({
          el: containerRef.current,
          serverURL: 'https://waline1111.vercel.app',
          lang: currentLocale === 'en' ? 'en' : 'zh-CN',
        });
      }
    })();
    return () => {
      walineRef.current?.destroy();
    };
  }, [currentLocale]);

  return <div ref={containerRef} />;
}

export default function WalineComment() {
  return <BrowserOnly fallback={<div />}>{() => <WalineCommentInner />}</BrowserOnly>;
}
