'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';

interface TallyEmbedProps {
  formId?: string;
  onSubmitted?: (payload: any) => void;
}

declare global {
  interface Window {
    Tally?: {
      loadEmbeds: () => void;
    };
  }
}

export const TallyEmbed: React.FC<TallyEmbedProps> = ({
  formId = process.env.NEXT_PUBLIC_TALLY_FORM_ID || 'MepXr0',
  onSubmitted,
}) => {
  const router = useRouter();

  useEffect(() => {
    // If Tally widget script is already loaded on page, trigger loadEmbeds
    if (typeof window !== 'undefined' && window.Tally) {
      window.Tally.loadEmbeds();
    }

    const handleMessage = (e: MessageEvent) => {
      if (typeof e.data === 'string') {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed.event === 'Tally.FormSubmitted') {
            if (onSubmitted) {
              onSubmitted(parsed);
            } else {
              router.push('/result');
            }
          }
        } catch {
          if (e.data.includes?.('Tally.FormSubmitted')) {
            router.push('/result');
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [router, onSubmitted]);

  return (
    <div className="survey-embed-wrapper">
      <iframe
        data-tally-src={`https://tally.so/embed/${formId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`}
        loading="lazy"
        width="100%"
        height="477"
        frameBorder="0"
        marginHeight={0}
        marginWidth={0}
        title="Living Conditions, Background, and Financial Behavior"
        style={{ border: 'none', width: '100%', minHeight: '480px' }}
      />

      <Script
        id="tally-js"
        src="https://tally.so/widgets/embed.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.Tally) {
            window.Tally.loadEmbeds();
          }
        }}
      />
    </div>
  );
};
