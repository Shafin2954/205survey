'use client';

import React, { useState } from 'react';
import { ARCHETYPES, BADGES } from '@/lib/archetypes';
import { computeSurveyResult } from '@/lib/scoring';
import { LikertValue, ScoringResult, SurveyAnswers } from '@/lib/types';
import { ResultCardCanvas } from './ResultCardCanvas';
import { ScoreBreakdown } from './ScoreBreakdown';
import { X, Play, Sliders, Sparkles, RefreshCw } from 'lucide-react';

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimulatorModal: React.FC<SimulatorModalProps> = ({ isOpen, onClose }) => {
  // Active test answers
  const [answers, setAnswers] = useState<SurveyAnswers>({
    q45: 5, q46: 5, q47: 5, q48: 5, q49: 5, q50: 5, q51: 5, q52: 5, q53: 5, q54: 1,
    q59: 1, q60: 1, q61: 1, q62: 1, q63: 1, q64: 1,
    q57: '1–3 times a month',
    q31: 'No',
    q23: 'No, I am open about my spending',
    q65: 'No, I use it as planned',
  });

  const [scoringResult, setScoringResult] = useState<ScoringResult>(() => computeSurveyResult(answers));

  if (!isOpen) return null;

  const handleArchetypePreset = (archetypeId: string) => {
    let newAnswers: SurveyAnswers = { ...answers };

    switch (archetypeId) {
      case 'hishabi':
        newAnswers = {
          q45: 5, q46: 5, q47: 5, q48: 5, q49: 5, q50: 5, q51: 5, q52: 5, q53: 5, q54: 1,
          q59: 1, q60: 1, q61: 1, q62: 1, q63: 1, q64: 1,
          q57: '1–3 times a month',
        };
        break;
      case 'plan-then-panic':
        newAnswers = {
          q45: 4, q46: 4, q47: 4, q48: 4, q49: 4, q50: 4, q51: 4, q52: 4, q53: 2, q54: 2,
          q59: 5, q60: 5, q61: 5, q62: 5, q63: 4, q64: 5,
          q57: 'Several times a week',
        };
        break;
      case '2am-checkout':
        newAnswers = {
          q45: 1, q46: 1, q47: 2, q48: 1, q49: 1, q50: 2, q51: 1, q52: 1, q53: 2, q54: 5,
          q59: 5, q60: 5, q61: 5, q62: 5, q63: 5, q64: 5,
          q57: 'Almost daily',
        };
        break;
      case 'ghost-spender':
        newAnswers = {
          q45: 2, q46: 2, q47: 2, q48: 2, q49: 2, q50: 2, q51: 2, q52: 2, q53: 2, q54: 4,
          q59: 2, q60: 2, q61: 2, q62: 2, q63: 2, q64: 2,
          q57: 'Less than once a month',
        };
        break;
      case 'untouchable':
        newAnswers = {
          q57: 'Never',
          q45: 4, q46: 4, q47: 4, q48: 4, q49: 4, q50: 4, q51: 4, q52: 4, q53: 4, q54: 2,
        };
        break;
      case 'enigma':
        newAnswers = {
          q45: 4, q46: 4, // only 2 items answered -> invalid
          q59: 4,
        };
        break;
      case 'delusional-cfo':
        newAnswers = {
          q45: 3, q46: 3, q47: 3, q48: 3, q49: 3, q50: 3, q51: 3, q52: 3,
          q53: 5, q54: 5, // Confident & runs out
          q59: 3, q60: 3, q61: 3, q62: 3, q63: 3, q64: 3,
          q57: '1–3 times a month',
        };
        break;
      case 'humble-menace':
        newAnswers = {
          q45: 3, q46: 3, q47: 3, q48: 3, q49: 3, q50: 3, q51: 3, q52: 3, q53: 3, q54: 3,
          q59: 5, q60: 5, q61: 4, q62: 5, q63: 4, q64: 5,
          q73: 'Less than most',
          q57: '1–3 times a month',
        };
        break;
      case 'family-pillar':
        newAnswers = {
          q45: 3, q46: 3, q47: 3, q48: 3, q49: 3, q50: 3, q51: 3, q52: 3, q53: 3, q54: 3,
          q59: 2, q60: 2, q61: 2, q62: 2, q63: 2, q64: 2,
          q31: 'Yes',
          q34: 'Below ৳2,000',
          q57: '1–3 times a month',
        };
        break;
      case 'hustler':
        newAnswers = {
          q45: 3, q46: 3, q47: 3, q48: 3, q49: 3, q50: 3, q51: 3, q52: 3, q53: 3, q54: 3,
          q59: 2, q60: 2, q61: 2, q62: 2, q63: 2, q64: 2,
          q33: ['Private tuition', 'Part-time job', 'Freelancing / online work'],
          q57: '1–3 times a month',
        };
        break;
      case 'bank-of-friends':
        newAnswers = {
          q45: 3, q46: 3, q47: 3, q48: 3, q49: 3, q50: 3, q51: 3, q52: 3, q53: 3, q54: 3,
          q59: 2, q60: 2, q61: 2, q62: 2, q63: 2, q64: 2,
          q43: "Yes, frequently, and I don't always track who owes whom",
          q57: '1–3 times a month',
        };
        break;
      case 'window-shopper':
        newAnswers = {
          q45: 3, q46: 3, q47: 3, q48: 3, q49: 3, q50: 3, q51: 3, q52: 3, q53: 3, q54: 3,
          q59: 2, q60: 2, q61: 2, q62: 2, q63: 2, q64: 2,
          q67: 'Yes, daily',
          q68: '0',
          q57: '1–3 times a month',
        };
        break;
      case 'cart-monk':
        newAnswers = {
          q45: 3, q46: 3, q47: 3, q48: 3, q49: 3, q50: 3, q51: 3, q52: 3, q53: 3, q54: 3,
          q59: 2, q60: 2, q61: 2, q62: 2, q63: 2, q64: 2,
          q66: 'Yes, and it usually stops me from buying',
          q57: '1–3 times a month',
        };
        break;
      case 'pay-day-phenomenon':
        newAnswers = {
          q45: 3, q46: 3, q47: 3, q48: 3, q49: 3, q50: 3, q51: 3, q52: 3, q53: 3,
          q37: 'Significantly more',
          q54: 5,
          q59: 3, q60: 3, q61: 3, q62: 3, q63: 3, q64: 3,
          q57: '1–3 times a month',
        };
        break;
      case 'cash-purist':
        newAnswers = {
          q45: 3, q46: 3, q47: 3, q48: 3, q49: 3, q50: 3, q51: 3, q52: 3, q53: 3, q54: 3,
          q59: 2, q60: 2, q61: 2, q62: 2, q63: 2, q64: 2,
          q40: ['Cash'],
          q57: '1–3 times a month',
        };
        break;
      case 'survivor':
        newAnswers = {
          q45: 3, q46: 3, q47: 3, q48: 3, q49: 3, q50: 3, q51: 3, q52: 3, q53: 3, q54: 3,
          q59: 2, q60: 2, q61: 2, q62: 2, q63: 2, q64: 2,
          q28: 'Yes, it disrupted my budget significantly',
          q27: 5,
          q57: '1–3 times a month',
        };
        break;
      case 'cash-hoarder':
        newAnswers = {
          q45: 4, q46: 4, q47: 4, q48: 4, q49: 4, q50: 4, q51: 4, q52: 4, q53: 4, q54: 2,
          q59: 2, q60: 2, q61: 2, q62: 2, q63: 2, q64: 2,
          q41: 'Yes, every month',
          q42: 'More than 50%',
          q57: '1–3 times a month',
        };
        break;
      case 'son-of-king':
        newAnswers = {
          q45: 2, q46: 2, q47: 2, q48: 2, q49: 2, q50: 2, q51: 2, q52: 2, q53: 2, q54: 3,
          q59: 3, q60: 3, q61: 3, q62: 3, q63: 3, q64: 3,
          q34: '৳20,000 and above',
          q21: 'Entirely my family',
          q57: '1–3 times a month',
        };
        break;
      default:
        break;
    }

    setAnswers(newAnswers);
    setScoringResult(computeSurveyResult(newAnswers));
  };

  const toggleBadge = (badgeKey: 'q31' | 'q23' | 'q65') => {
    const nextAnswers = { ...answers };
    if (badgeKey === 'q31') {
      nextAnswers.q31 = answers.q31 === 'Yes' ? 'No' : 'Yes';
    } else if (badgeKey === 'q23') {
      nextAnswers.q23 = answers.q23 === 'Occasionally' ? 'No' : 'Occasionally';
    } else if (badgeKey === 'q65') {
      nextAnswers.q65 = answers.q65 === 'Yes, I use it more than planned' ? 'No' : 'Yes, I use it more than planned';
    }
    setAnswers(nextAnswers);
    setScoringResult(computeSurveyResult(nextAnswers));
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={22} color="#6366F1" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF' }}>
              Archetype & Card Simulator
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Preset Selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            ⚡ Fast Preset Load (Click any of the 19 archetypes to preview):
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {Object.values(ARCHETYPES).map((arch) => (
              <button
                key={arch.id}
                onClick={() => handleArchetypePreset(arch.id)}
                className="btn"
                style={{
                  fontSize: '0.8rem',
                  padding: '0.35rem 0.75rem',
                  background: scoringResult.archetype.id === arch.id ? arch.accentColor : 'rgba(255, 255, 255, 0.05)',
                  color: scoringResult.archetype.id === arch.id ? '#FFFFFF' : '#CBD5E1',
                  border: `1px solid ${scoringResult.archetype.id === arch.id ? arch.accentColor : 'rgba(255, 255, 255, 0.1)'}`,
                }}
              >
                {arch.name}
              </button>
            ))}
          </div>
        </div>

        {/* Badges Toggle Strip */}
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.75rem' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F59E0B', marginBottom: '0.5rem' }}>
            🛡️ Stackable Badges Simulator:
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => toggleBadge('q31')}
              className={`badge-chip ${answers.q31 === 'Yes' ? 'btn-primary' : ''}`}
              style={{ cursor: 'pointer' }}
            >
              🛡️ Family Safety Net ({answers.q31 === 'Yes' ? 'ON' : 'OFF'})
            </button>
            <button
              onClick={() => toggleBadge('q23')}
              className={`badge-chip ${answers.q23 === 'Occasionally' ? 'btn-primary' : ''}`}
              style={{ cursor: 'pointer' }}
            >
              🤫 Secret Shopper ({answers.q23 === 'Occasionally' ? 'ON' : 'OFF'})
            </button>
            <button
              onClick={() => toggleBadge('q65')}
              className={`badge-chip ${answers.q65 === 'Yes, I use it more than planned' ? 'btn-primary' : ''}`}
              style={{ cursor: 'pointer' }}
            >
              💳 EMI Enthusiast ({answers.q65 === 'Yes, I use it more than planned' ? 'ON' : 'OFF'})
            </button>
          </div>
        </div>

        {/* Live Preview Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.2fr', gap: '1.5rem', alignItems: 'start' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#A5B4FC', marginBottom: '0.75rem' }}>
              Generated 1080×1080 Card Preview:
            </h3>
            <ResultCardCanvas archetype={scoringResult.archetype} badges={scoringResult.badges} />
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#A5B4FC', marginBottom: '0.75rem' }}>
              Scoring Details & Logic Evaluation:
            </h3>
            <ScoreBreakdown result={scoringResult} />
          </div>
        </div>
      </div>
    </div>
  );
};
