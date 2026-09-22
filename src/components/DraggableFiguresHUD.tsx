import React from 'react';
import { Circle, Square, Gem, Disc, Lightbulb, RotateCcw, Trash2, Sparkles, Move } from 'lucide-react';
import { DraggableShapeType } from '../types/draggableFigures';

interface DraggableFiguresHUDProps {
  activeCount: number;
  dimLightEnabled: boolean;
  onSpawnFigure: (shape: DraggableShapeType) => void;
  onToggleDimLight: () => void;
  onResetFigures: () => void;
  onClearFigures: () => void;
}

export const DraggableFiguresHUD: React.FC<DraggableFiguresHUDProps> = ({
  activeCount,
  dimLightEnabled,
  onSpawnFigure,
  onToggleDimLight,
  onResetFigures,
  onClearFigures,
}) => {
  return (
    <div className="draggable-figures-hud" role="region" aria-label="Control de Figuras 3D Arrastrables e Iluminación">
      <div className="hud-title-bar">
        <div className="title-left">
          <Sparkles size={14} className="text-cyan animate-pulse" aria-hidden="true" />
          <span className="hud-label">Figuras 3D Arrastrables</span>
        </div>
        <div className="title-badges">
          <span className="count-pill" aria-label={`${activeCount} figuras presentes en escena`}>
            <Move size={11} aria-hidden="true" />
            {activeCount} {activeCount === 1 ? 'Figura' : 'Figuras'}
          </span>
        </div>
      </div>

      <div className="hud-actions-row" role="toolbar" aria-label="Herramientas para generar y manipular figuras 3D">
        {/* Generar figuras específicas */}
        <div className="spawn-buttons-group" role="group" aria-label="Generar figuras 3D geométricas">
          <button
            type="button"
            className="hud-action-btn spawn-btn sphere"
            onClick={() => onSpawnFigure('sphere')}
            title="Añadir Orbe de Plasma luminiscente"
            aria-label="Añadir Esfera: Orbe de Plasma luminiscente"
          >
            <Circle size={13} className="text-cyan" aria-hidden="true" />
            <span>Esfera</span>
          </button>

          <button
            type="button"
            className="hud-action-btn spawn-btn cube"
            onClick={() => onSpawnFigure('cube')}
            title="Añadir Cubo Cuántico reflectante"
            aria-label="Añadir Cubo: Cubo Cuántico reflectante"
          >
            <Square size={13} className="text-amber" aria-hidden="true" />
            <span>Cubo</span>
          </button>

          <button
            type="button"
            className="hud-action-btn spawn-btn crystal"
            onClick={() => onSpawnFigure('octahedron')}
            title="Añadir Cristal Estelar magenta"
            aria-label="Añadir Cristal: Poliedro Estelar magenta"
          >
            <Gem size={13} className="text-pink" aria-hidden="true" />
            <span>Cristal</span>
          </button>

          <button
            type="button"
            className="hud-action-btn spawn-btn torus"
            onClick={() => onSpawnFigure('torus')}
            title="Añadir Anillo Magnético verde"
            aria-label="Añadir Anillo: Toroide Magnético verde"
          >
            <Disc size={13} className="text-emerald" aria-hidden="true" />
            <span>Anillo</span>
          </button>
        </div>

        <div className="hud-divider" aria-hidden="true" />

        {/* Acciones de iluminación y limpieza */}
        <div className="utility-buttons-group" role="group" aria-label="Ajustes de iluminación y reinicio">
          <button
            type="button"
            className={`hud-action-btn toggle-light ${dimLightEnabled ? 'active' : ''}`}
            onClick={onToggleDimLight}
            title={dimLightEnabled ? 'Luz tenue encendida (clic para apagar)' : 'Luz tenue apagada (clic para encender)'}
            aria-label={dimLightEnabled ? 'Apagar luz ambiental tenue' : 'Encender luz ambiental tenue'}
            aria-pressed={dimLightEnabled}
          >
            <Lightbulb size={13} aria-hidden="true" />
            <span>{dimLightEnabled ? 'Luz Tenue ON' : 'Luz OFF'}</span>
          </button>

          <button
            type="button"
            className="hud-action-btn mini-icon-btn"
            onClick={onResetFigures}
            title="Restablecer posiciones originales de las figuras"
            aria-label="Restablecer posiciones iniciales de todas las figuras 3D"
          >
            <RotateCcw size={13} aria-hidden="true" />
          </button>

          {activeCount > 0 && (
            <button
              type="button"
              className="hud-action-btn mini-icon-btn danger"
              onClick={onClearFigures}
              title="Limpiar todas las figuras del entorno"
              aria-label="Eliminar y limpiar todas las figuras 3D del entorno"
            >
              <Trash2 size={13} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
