'use client';

import React, { useState } from 'react';
import { ARCHETYPES } from '@/lib/archetypes';
import { Archetype, ArchetypeTier } from '@/lib/types';
import { Sparkles, Eye, Info } from 'lucide-react';

interface CharacterGalleryProps {
  onSelectArchetype?: (archetype: Archetype) => void;
}

export const CharacterGallery: React.FC<CharacterGalleryProps> = ({ onSelectArchetype }) => {
  const [activeTier, setActiveTier] = useState<string>('all');
  const [selectedChar, setSelectedChar] = useState<Archetype | null>(null);

  const archetypesList = Object.values(ARCHETYPES);

  const filtered = activeTier === 'all'
    ? archetypesList
    : archetypesList.filter((a) => a.tier === activeTier);

  return (
    <section style={{ margin: '3rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span className="logo-badge">
          <Sparkles size={14} /> 19 Unique Money Archetypes
        </span>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.5rem' }}>
          Discover the Personalities
        </h2>
        <p style={{ color: '#94A3B8', maxWidth: '600px', margin: '0.5rem auto 0' }}>
          From spreadsheet enthusiasts to 2AM flash-sale warriors — which financial archetype matches your campus lifestyle?
        </p>
      </div>

      {/* Tier Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '1.75rem',
        }}
      >
        {[
          { id: 'all', label: 'All (19)' },
          { id: 'base', label: 'Base 2×2 Grid (4)' },
          { id: 'contradiction', label: 'Contradiction Types (3)' },
          { id: 'lifestyle', label: 'Campus Lifestyle (9)' },
          { id: 'special', label: 'Special & Fallbacks (2)' },
          { id: 'bonus', label: 'Bonus Types (2)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTier(tab.id)}
            className={`btn ${activeTier === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Archetypes */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              setSelectedChar(item);
              if (onSelectArchetype) onSelectArchetype(item);
            }}
            className="teaser-card"
            style={{
              cursor: 'pointer',
              borderColor: selectedChar?.id === item.id ? item.accentColor : undefined,
              boxShadow: selectedChar?.id === item.id ? `0 0 20px ${item.accentColor}44` : undefined,
            }}
          >
            <div style={{ position: 'relative' }}>
              <img
                src={item.imagePath}
                alt={item.name}
                className="teaser-avatar"
                style={{ borderColor: `${item.accentColor}66` }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  right: '15px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '9999px',
                  background: item.accentColor,
                  color: '#0B0F19',
                }}
              >
                {item.rarity}
              </span>
            </div>
            <h4 className="teaser-name">{item.name}</h4>
            <p className="bangla-text" style={{ fontSize: '0.85rem', color: item.accentColor, fontWeight: 600 }}>
              {item.banglaName}
            </p>
            <p className="teaser-tag" style={{ fontStyle: 'italic', marginTop: '0.4rem' }}>
              "{item.tagline}"
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
