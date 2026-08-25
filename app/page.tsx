'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TallyEmbed } from '@/components/TallyEmbed';
import { mapTallyPayload } from '@/lib/mapTally';

export default function HomePage() {
  const router = useRouter();

  return (
    <div>
      {/* Hero — just the title, description, and survey */}
      <section className="survey-hero">
        <div className="container">
          <p className="label">Research Survey</p>

          <h1>
            Living Conditions, Background
            <br />
            &amp; Financial Behavior
          </h1>

          <p className="body-text" style={{ margin: '1rem auto 0.5rem' }}>
            A study of financial habits, budgeting discipline, and online impulse purchasing
            among university students in Bangladesh.
          </p>

          <p
            className="bangla body-text"
            style={{ margin: '0 auto', fontSize: '0.95rem' }}
          >
            বাংলাদেশের বিশ্ববিদ্যালয় শিক্ষার্থীদের আর্থিক অভ্যাস, বাজেটিং শৃঙ্খলা
            এবং অনলাইন আবেগপ্রবণ ক্রয় সম্পর্কিত একটি গবেষণা সমীক্ষা।
          </p>
        </div>
      </section>

      <hr className="rule rule--thin" />

      {/* Survey Embed */}
      <section className="survey-section">
        <div className="container">
          <div style={{ marginBottom: '1.5rem' }}>
            <p className="label" style={{ marginBottom: '0.25rem' }}>Take the Survey</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Brief · Less than 10 minutes · 100% anonymous
            </p>
          </div>

          <TallyEmbed
            onSubmitted={(payload) => {
              try {
                sessionStorage.setItem('surveyPayloadRaw', JSON.stringify(payload));
                const { answers, unmapped } = mapTallyPayload(payload);
                sessionStorage.setItem('surveyAnswers', JSON.stringify(answers));
                if (unmapped.length > 0) {
                  sessionStorage.setItem('surveyUnmapped', JSON.stringify(unmapped));
                } else {
                  sessionStorage.removeItem('surveyUnmapped');
                }
              } catch {
                // sessionStorage unavailable (private mode, etc) — /result will
                // show its "couldn't find your answers" state instead.
              }
              router.push('/result');
            }}
          />

          <p
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginTop: '1.5rem',
              maxWidth: '480px',
            }}
          >
            At the end you will receive a light-hearted "money personality" card based on your
            answers. It is just for fun and is not part of our research findings. Your answers
            stay anonymous either way.
          </p>
        </div>
      </section>
    </div>
  );
}
