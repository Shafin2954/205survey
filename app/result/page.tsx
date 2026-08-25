'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ARCHETYPES, BADGES } from '@/lib/archetypes';
import { computeSurveyResult } from '@/lib/scoring';
import { Badge, ScoringResult, SurveyAnswers } from '@/lib/types';
import { ResultCardCanvas } from '@/components/ResultCardCanvas';
import { ScoreBreakdown } from '@/components/ScoreBreakdown';
import confetti from 'canvas-confetti';
import Link from 'next/link';

// Kept only for the explicit `?demo=1` preview link — no longer a silent
// fallback when a real respondent's answers are missing.
const DEMO_ANSWERS: SurveyAnswers = {
  q45: 5, q46: 5, q47: 4, q48: 5, q49: 4, q50: 5, q51: 4, q52: 5, q53: 4, q54: 1,
  q59: 1, q60: 2, q61: 1, q62: 2, q63: 1, q64: 2,
  q31: 'Yes',
  q57: '1–3 times a month',
};

function previewResult(typeParam: string, badgeParam: string | null): ScoringResult | null {
  const arch = ARCHETYPES[typeParam];
  if (!arch) return null;

  const badges: Badge[] = [];
  if (badgeParam) {
    badgeParam.split(',').forEach((bId) => {
      if (BADGES[bId.trim()]) badges.push(BADGES[bId.trim()]);
    });
  }

  return {
    archetype: arch,
    budgetingScore: 3.8,
    impulseScore: 2.1,
    budgetingAnsweredCount: 10,
    impulseAnsweredCount: 6,
    isBudgetingValid: true,
    isImpulseValid: true,
    isUntouchable: arch.id === 'untouchable',
    isEnigma: arch.id === 'enigma',
    matchedReason: `Direct preview: ${arch.name}`,
    badges,
    answersSummary: { totalAnswered: 78, completionPercentage: 100 },
  };
}

interface DebugInfo {
  raw: unknown;
  answers: SurveyAnswers;
  unmapped: unknown[];
}

function ResultContent() {
  const searchParams = useSearchParams();
  const isDebug = searchParams.get('debug') === '1';

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  // Reads sessionStorage, so this must run client-side only (not during the
  // useState initializer, which also executes on the server during prerender).
  useEffect(() => {
    const typeParam = searchParams.get('type');
    const badgeParam = searchParams.get('badges');
    const isDemo = searchParams.get('demo') === '1';

    if (typeParam) {
      setResult(previewResult(typeParam, badgeParam));
      setLoading(false);
      return;
    }

    if (isDemo) {
      setResult(computeSurveyResult(DEMO_ANSWERS));
      setLoading(false);
      return;
    }

    try {
      const stored = sessionStorage.getItem('surveyAnswers');
      if (stored) {
        const answers: SurveyAnswers = JSON.parse(stored);
        setResult(computeSurveyResult(answers));

        if (isDebug) {
          const rawStr = sessionStorage.getItem('surveyPayloadRaw');
          const unmappedStr = sessionStorage.getItem('surveyUnmapped');
          setDebugInfo({
            raw: rawStr ? JSON.parse(rawStr) : null,
            answers,
            unmapped: unmappedStr ? JSON.parse(unmappedStr) : [],
          });
        }
      }
    } catch {
      // Leave result null — the "couldn't find your answers" state below covers it.
    }
    setLoading(false);
  }, [searchParams, isDebug]);

  useEffect(() => {
    if (!result) return;
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#1A1A1A', '#8E8E8E', '#C4BAA8', '#D9D2C7'],
        gravity: 1.2,
        ticks: 100,
      });
    } catch {
      // ok
    }
  }, [result]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading your result…
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <p className="label" style={{ marginBottom: '1rem' }}>No result found</p>
        <h1 style={{ marginBottom: '1rem' }}>We couldn&apos;t find your answers</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 2rem' }}>
          This usually happens if you reloaded this page directly or opened it in a new tab.
          Please take the survey again to see your money personality result.
        </p>
        <Link href="/" className="btn btn--primary">
          Take the survey
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '6rem' }}>
      {isDebug && (
        <details style={{ marginBottom: '2rem', border: '1px solid var(--border, #ddd)', borderRadius: '8px', padding: '1rem', fontSize: '0.8rem' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Debug info (?debug=1)</summary>
          <pre style={{ overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(
              {
                matchedReason: result.matchedReason,
                answersSummary: result.answersSummary,
                debugInfo,
              },
              null,
              2
            )}
          </pre>
        </details>
      )}

      {/* Top back navigation */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" className="btn btn--outline btn--small">
          ← Back to survey
        </Link>
        <span className="label" style={{ margin: 0 }}>
          Survey Complete
        </span>
      </div>

      {/* Header — Centered */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <p className="label" style={{ marginBottom: '0.5rem' }}>Your Money Personality Result</p>
        <h1 style={{ marginBottom: '0.35rem', fontSize: '3rem' }}>{result.archetype.name}</h1>
        <p className="bangla" style={{ fontSize: '1.4rem', color: 'var(--text-secondary)' }}>
          {result.archetype.banglaName}
        </p>
      </div>

      {/* Centered Large Card Canvas with 1408x768 native artwork */}
      <div style={{ marginBottom: '3.5rem' }}>
        <ResultCardCanvas archetype={result.archetype} badges={result.badges} />
      </div>

      <hr className="rule" />

      {/* Score Breakdown and Insights Section */}
      <div style={{ maxWidth: '680px', margin: '0 auto', marginBottom: '3.5rem' }}>
        <ScoreBreakdown result={result} />
      </div>

      <hr className="rule rule--thin" />

      {/* Share Section with centered buttons and right-floating Plead character */}
      <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Share with Friends &amp; Classmates</h3>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Help us reach more students across universities — share the survey link with your friends!
        </p>

        {/* Relative wrapper holding centered buttons and right-floating character */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '120px',
          }}
        >
          {/* Strictly Centered Action Buttons */}
          <div className="actions-row" style={{ justifyContent: 'center', margin: '0 auto' }}>
            <button
              onClick={() => {
                const url = window.location.origin;
                navigator.clipboard.writeText(url);
              }}
              className="btn btn--primary"
            >
              Copy Survey Link
            </button>
            <button
              onClick={() => {
                const text = encodeURIComponent(
                  `I got "${result.archetype.name}" (${result.archetype.banglaName}) on the Money Personality Survey! Take it here: ${window.location.origin}`
                );
                window.open(`https://wa.me/?text=${text}`, '_blank');
              }}
              className="btn btn--outline"
            >
              Share on WhatsApp
            </button>
          </div>

          {/* Right Floating Character & Arrow */}
          <div className="plead-floater">
            {/* Curved Arrow pointing right to the character (higher z-index) */}
            <svg
              className="plead-arrow"
              width="72"
              height="44"
              viewBox="0 0 72 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 28C22 38 46 32 62 14M62 14L48 15M62 14L60 27"
                stroke="#4A4A4A"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Plead Character shifted left under the arrow (lower z-index) */}
            <div className="plead-img-wrapper">
              <img
                src="/plead.png"
                alt="Please share the survey"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading result…</div>}>
      <ResultContent />
    </Suspense>
  );
}
