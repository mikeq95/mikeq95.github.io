import React, { useEffect, useRef } from 'react';
import { init } from '@waline/client';
import '@waline/client/style';

export default function WalineComment() {
  const containerRef = useRef(null);

  useEffect(() => {
    const waline = init({
      el: containerRef.current,
      serverURL: 'https://waline-gamma-lovat.vercel.app',
      lang: 'en',
    });

    return () => {
      waline?.destroy();
    };
  }, []);

  return <div ref={containerRef} />;
}