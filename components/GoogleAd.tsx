'use client';

import { useEffect, useRef, useState } from 'react';

interface GoogleAdProps {
  className?: string;
}

export default function GoogleAd({ className = '' }: GoogleAdProps) {
  const adRef = useRef<HTMLModElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    if (adLoaded) return;

    const loadAd = () => {
      try {
        if (typeof window !== 'undefined' && adRef.current) {
          const ins = adRef.current;

          if (ins.getAttribute('data-adsbygoogle-status')) {
            setAdLoaded(true);
            return;
          }

          if (!(window as any).adsbygoogle) {
            setTimeout(loadAd, 100);
            return;
          }

          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          setAdLoaded(true);
        }
      } catch (error) {
        console.error('AdSense error:', error);
      }
    };

    const timer = setTimeout(loadAd, 100);

    return () => clearTimeout(timer);
  }, [adLoaded]);

  return (
    <div className={className}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', minHeight: '100px', backgroundColor: '#f3f4f6' }}
        data-ad-client="ca-pub-9851663453336407"
        data-ad-slot="1968368650"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
