import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Box } from 'lucide-react';
import { soundSynth } from '../utils/audioSynth';
import { NavigationTabs } from './NavigationTabs';

interface HeaderProps {
  onResetCamera?: () => void;
  activeBalls?: number;
}

export const Header: React.FC<HeaderProps> = ({ activeBalls = 0 }) => {
  const [isMuted, setIsMuted] = useState<boolean>(() => soundSynth.getIsMuted());

  const toggleSound = () => {
    const nextState = !isMuted;
    soundSynth.setMuted(nextState);
    setIsMuted(nextState);
  };

  return (
    <header className="header-glass" role="banner">
      <div className="header-brand">
        <div className="brand-icon-wrapper" aria-hidden="true">
          <Sparkles className="brand-icon" size={20} />
        </div>
        <div>
          <h1 className="brand-title">NEXUS // 3D</h1>
          <p className="brand-subtitle">Estudio de Materiales & Botones Táctiles</p>
        </div>
      </div>

      {/* Pestañas de Ruteo Centrales */}
      <NavigationTabs />

      <div className="header-actions">
        <div className="badge-pill" aria-label="Versión del motor: Three.js r174">
          <Box size={14} className="text-cyan" aria-hidden="true" />
          <span>Three.js r174</span>
        </div>

        {activeBalls > 0 && (
          <div
            className="badge-pill highlight"
            role="status"
            aria-live="polite"
            aria-label={`${activeBalls} pelotas activas en simulación`}
          >
            <span>{activeBalls} Pelotas Activas</span>
          </div>
        )}

        <button
          type="button"
          className={`icon-button ${isMuted ? 'muted' : ''}`}
          onClick={toggleSound}
          title={isMuted ? 'Activar sonido Web Audio' : 'Silenciar sonido'}
          aria-label={isMuted ? 'Activar efectos de sonido Web Audio' : 'Silenciar efectos de sonido'}
          aria-pressed={!isMuted}
        >
          {isMuted ? <VolumeX size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
};
