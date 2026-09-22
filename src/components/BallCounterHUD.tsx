import React, { useState } from 'react';
import { Play, Trash2, RotateCcw, Sliders, Zap, CircleDot } from 'lucide-react';
import { BallMaterialStyle } from '../types/physics';

interface BallCounterHUDProps {
  totalDropped: number;
  activeBalls: number;
  ballStyle: BallMaterialStyle;
  gravity: number;
  restitution: number;
  onDropBall: () => void;
  onDropBurst: (count: number) => void;
  onClearBalls: () => void;
  onResetCounter: () => void;
  onSelectBallStyle: (style: BallMaterialStyle) => void;
  onChangeGravity: (val: number) => void;
  onChangeRestitution: (val: number) => void;
}

export const BallCounterHUD: React.FC<BallCounterHUDProps> = ({
  totalDropped,
  activeBalls,
  ballStyle,
  gravity,
  restitution,
  onDropBall,
  onDropBurst,
  onClearBalls,
  onResetCounter,
  onSelectBallStyle,
  onChangeGravity,
  onChangeRestitution,
}) => {
  const [showPhysicsTweak, setShowPhysicsTweak] = useState<boolean>(false);

  return (
    <section className="ball-counter-hud" aria-label="Panel de Control y Físicas de Pelotas 3D">
      {/* Marcador Digital Principal */}
      <div className="counter-display" role="region" aria-label="Marcador digital de pelotas">
        <div className="counter-label-group">
          <span className="counter-badge">SIMULADOR FÍSICO 3D</span>
          <span className="counter-title">Pelotas Lanzadas</span>
        </div>

        <div className="counter-number-wrapper">
          <span
            className="counter-number"
            key={totalDropped}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            aria-label={`${totalDropped} pelotas lanzadas en total`}
          >
            {totalDropped}
          </span>
        </div>

        <div className="counter-meta">
          <div className="meta-item">
            <span className="meta-dot live" aria-hidden="true" />
            <span aria-label={`${activeBalls} pelotas activas en pantalla`}>{activeBalls} en escena</span>
          </div>
          <button
            type="button"
            className="mini-text-btn"
            onClick={onResetCounter}
            title="Reiniciar contador a 0"
            aria-label="Reiniciar contador de pelotas a cero"
          >
            <RotateCcw size={12} aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Botones de Acción Primaria */}
      <div className="hud-actions-row" role="toolbar" aria-label="Acciones de lanzamiento y físicas">
        <button
          type="button"
          className="btn-launch-ball"
          onClick={onDropBall}
          id="btn-drop-ball"
          aria-label="Soltar una pelota 3D en el escenario"
        >
          <Play size={18} className="icon-pulse fill-current" aria-hidden="true" />
          <span className="btn-text">SOLTAR PELOTA</span>
        </button>

        <button
          type="button"
          className="btn-burst"
          onClick={() => onDropBurst(5)}
          title="Soltar ráfaga de 5 pelotas"
          aria-label="Soltar ráfaga rápida de 5 pelotas 3D"
        >
          <Zap size={16} aria-hidden="true" />
          <span>x5</span>
        </button>

        <button
          type="button"
          className="btn-icon-clear"
          onClick={onClearBalls}
          title="Limpiar pelotas del suelo"
          aria-label="Limpiar y eliminar todas las pelotas del escenario"
          disabled={activeBalls === 0}
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>

        <button
          type="button"
          className={`btn-icon-toggle ${showPhysicsTweak ? 'active' : ''}`}
          onClick={() => setShowPhysicsTweak(!showPhysicsTweak)}
          title="Ajustar gravedad y rebote"
          aria-label="Configurar parámetros físicos de gravedad y rebote"
          aria-expanded={showPhysicsTweak}
        >
          <Sliders size={16} aria-hidden="true" />
        </button>
      </div>

      {/* Selector de Estilo de Pelota */}
      <div className="hud-ball-styles" role="group" aria-label="Selector de acabado de pelotas">
        <div className="style-chips">
          <span className="chips-label">Estilo:</span>
          {(
            [
              { id: 'matchCurrent', label: 'Material' },
              { id: 'neonGlow', label: 'Neón' },
              { id: 'chrome', label: 'Cromo' },
              { id: 'golden', label: 'Oro' },
              { id: 'crystalGlass', label: 'Cristal' },
            ] as const
          ).map(style => (
            <button
              key={style.id}
              type="button"
              className={`chip-btn ${ballStyle === style.id ? 'active' : ''}`}
              onClick={() => onSelectBallStyle(style.id)}
              aria-pressed={ballStyle === style.id}
              aria-label={`Estilo de material para pelota: ${style.label}`}
            >
              <CircleDot size={11} aria-hidden="true" />
              <span>{style.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Panel Desplegable de Ajustes de Física */}
      {showPhysicsTweak && (
        <div className="physics-popup" role="region" aria-label="Ajustes de variables de física">
          <div className="slider-group">
            <div className="field-header">
              <span id="label-gravity">Gravedad</span>
              <span>{Math.abs(gravity).toFixed(0)} m/s²</span>
            </div>
            <input
              type="range"
              min={-40}
              max={-5}
              step={1}
              value={gravity}
              aria-labelledby="label-gravity"
              aria-label="Fuerza de aceleración de gravedad"
              aria-valuemin={-40}
              aria-valuemax={-5}
              aria-valuenow={gravity}
              onChange={e => onChangeGravity(Number(e.target.value))}
            />
          </div>

          <div className="slider-group">
            <div className="field-header">
              <span id="label-restitution">Elasticidad (Rebote)</span>
              <span>{(restitution * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0.2}
              max={0.95}
              step={0.02}
              value={restitution}
              aria-labelledby="label-restitution"
              aria-label="Coeficiente de restitución elástica de rebote"
              aria-valuemin={0.2}
              aria-valuemax={0.95}
              aria-valuenow={restitution}
              onChange={e => onChangeRestitution(Number(e.target.value))}
            />
          </div>
        </div>
      )}

      {/* Pista de interacción rápida */}
      <div className="hud-hint" aria-hidden="true">
        <span>💡 Clic en cualquier punto del 3D para lanzar una pelota allí</span>
      </div>
    </section>
  );
};
