'use client';

import React from 'react';
import { ScoringResult } from '@/lib/types';

interface ScoreBreakdownProps {
  result: ScoringResult;
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ result }) => {
  const {
    archetype,
    budgetingScore,
    impulseScore,
    budgetingAnsweredCount,
    impulseAnsweredCount,
    badges,
    matchedReason,
  } = result;

  const bPct = budgetingScore ? Math.min(100, Math.max(0, ((budgetingScore - 1) / 4) * 100)) : 0;
  const iPct = impulseScore ? Math.min(100, Math.max(0, ((impulseScore - 1) / 4) * 100)) : 0;

  return (
    <div>
      {/* Archetype details */}
      <div style={{ marginBottom: '2.5rem' }}>
        <p className="label" style={{ marginBottom: '0.5rem' }}>
          {archetype.rarity} · {archetype.tier}
        </p>

        <h2 style={{ marginBottom: '0.25rem' }}>{archetype.name}</h2>
        <p className="bangla" style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          {archetype.banglaName}
        </p>

        <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
          &ldquo;{archetype.tagline}&rdquo;
        </p>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>
          {archetype.blurb}
        </p>

        {archetype.subLine && (
          <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {archetype.subLine}
          </p>
        )}
      </div>

      <hr className="rule rule--thin" />

      {/* Scores */}
      <div style={{ marginBottom: '2rem' }}>
        <p className="label" style={{ marginBottom: '1rem' }}>Score Breakdown</p>

        <div className="score-bar">
          <div className="score-bar__header">
            <span style={{ fontWeight: 600 }}>Budgeting Discipline</span>
            <span style={{ color: 'var(--text-muted)' }}>
              {budgetingScore !== null ? `${budgetingScore.toFixed(1)} / 5.0` : 'N/A'}
            </span>
          </div>
          <div className="score-bar__track">
            <div className="score-bar__fill" style={{ width: `${bPct}%` }} />
          </div>
          <p className="score-bar__note">
            {budgetingAnsweredCount} of 5 items answered · midpoint threshold: 3.0
          </p>
        </div>

        <div className="score-bar">
          <div className="score-bar__header">
            <span style={{ fontWeight: 600 }}>Online Impulse Tendency</span>
            <span style={{ color: 'var(--text-muted)' }}>
              {impulseScore !== null
                ? `${impulseScore.toFixed(1)} / 5.0`
                : result.isUntouchable
                  ? '0.0 (never shops online)'
                  : 'N/A'}
            </span>
          </div>
          <div className="score-bar__track">
            <div className="score-bar__fill" style={{ width: `${iPct}%` }} />
          </div>
          <p className="score-bar__note">
            {result.isUntouchable
              ? 'Q57 gate: respondent never shops online'
              : `${impulseAnsweredCount} of 5 items answered`}
          </p>
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <p className="label" style={{ marginBottom: '0.75rem' }}>
            Badges Unlocked ({badges.length})
          </p>
          <div className="badge-row">
            {badges.map((b) => (
              <span key={b.id} className="badge-chip">
                {b.icon} {b.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Match reason */}
      <div>
        <p className="label" style={{ marginBottom: '0.25rem' }}>Classification Logic</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {matchedReason}
        </p>
      </div>
    </div>
  );
};
