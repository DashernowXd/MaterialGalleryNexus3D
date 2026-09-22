import React, { useState, useRef } from 'react';
import { useThreeCreditCardScene } from '../hooks/useThreeCreditCardScene';
import { CardThemeId, CARD_THEMES } from '../utils/cardTextureGenerator';
import { CreditCardFlyer } from '../components/CreditCardFlyer';
import { RotateCw, Compass, Lightbulb } from 'lucide-react';
import { useDocumentMetadata } from '../hooks/useDocumentMetadata';

export const CreditCardStudioView: React.FC = () => {
  useDocumentMetadata({
    title: 'Nexus3D // Tarjeta Titanium Prime 3D & Flyer',
    description: 'Visualizador de alta fidelidad 3D para la tarjeta física Titanium Prime. Biseles reflectantes CNC, inclinación magnética por cursor e iluminación de silueta.',
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeThemeId, setActiveThemeId] = useState<CardThemeId>('obsidian');

  const {
    isFlipped,
    toggleFlip,
    resetCamera,
    handlePointerMove,
    handlePointerLeave,
  } = useThreeCreditCardScene({
    canvasRef,
    activeThemeId,
  });

  const activeTheme = CARD_THEMES[activeThemeId] || CARD_THEMES.obsidian;

  return (
    <main className="card-studio-layout" aria-label="Visualizador 3D de Tarjeta Metálica y Flyer de Producto">
      {/* Viewport 3D Principal */}
      <div className="card-canvas-container">
        <canvas
          ref={canvasRef}
          className="webgl-canvas"
          role="img"
          aria-label="Lienzo 3D de la tarjeta metálica Titanium Prime con respuesta lumínica e inclinación al cursor"
          tabIndex={0}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <p>
            Tu navegador no soporta Canvas WebGL. Se muestra una tarjeta metálica interactiva 3D con
            microchip EMV y biseles pulidos.
          </p>
        </canvas>

        {/* Badge Flotante Superior de Tema Activo */}
        <div
          className="card-floating-badge"
          role="status"
          aria-label={`Tema visual activo: ${activeTheme.name}`}
        >
          <div
            className="theme-indicator-dot"
            aria-hidden="true"
            style={{
              backgroundColor: activeTheme.accentColor,
              boxShadow: `0 0 12px ${activeTheme.rimColor}`,
            }}
          />
          <span className="theme-indicator-text">{activeTheme.name}</span>
          <span className="theme-indicator-pill">Simulación 3D</span>
        </div>

        {/* Guía flotante sobre el canvas */}
        <div className="viewport-overlay-hint" aria-hidden="true">
          <div className="hint-pill">
            <Compass size={14} className="text-cyan animate-pulse" aria-hidden="true" />
            <span>Mueve el cursor para reflejar la luz en la tarjeta (Magnetic Tilt)</span>
          </div>
          <div className="hint-pill">
            <Lightbulb size={14} className="text-amber" aria-hidden="true" />
            <span>Iluminación de silueta para destacar biseles y cantos</span>
          </div>
        </div>

        {/* Botón Flotante Rápido de Giro 180° sobre el Canvas */}
        <div className="canvas-quick-controls">
          <button
            type="button"
            className="quick-flip-btn"
            onClick={toggleFlip}
            title="Voltear tarjeta para ver anverso o reverso"
            aria-label={isFlipped ? 'Voltear tarjeta para mostrar anverso frontal' : 'Voltear tarjeta para mostrar reverso posterior'}
          >
            <RotateCw size={15} className={isFlipped ? 'animate-spin-once' : ''} aria-hidden="true" />
            <span>{isFlipped ? 'Girar al Anverso' : 'Girar al Reverso'}</span>
          </button>
        </div>
      </div>

      {/* Panel Lateral: Flyer y Ficha Técnica del Producto */}
      <CreditCardFlyer
        activeThemeId={activeThemeId}
        onSelectTheme={setActiveThemeId}
        isFlipped={isFlipped}
        onToggleFlip={toggleFlip}
        onResetView={resetCamera}
      />
    </main>
  );
};
