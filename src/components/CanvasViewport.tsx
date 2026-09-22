import React from 'react';
import { MousePointerClick, Move } from 'lucide-react';

interface CanvasViewportProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onPointerMove: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerDown: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerUp?: (e: React.PointerEvent<HTMLCanvasElement>) => void;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  canvasRef,
  onPointerMove,
  onPointerDown,
  onPointerUp,
}) => {
  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        className="webgl-canvas"
        role="img"
        aria-label="Lienzo interactivo 3D: renderizado de mallas con shaders procedurales y simulación de físicas"
        tabIndex={0}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <p>
          Tu navegador no soporta Canvas WebGL. Se muestra una escena interactiva 3D con deformación
          de materiales y simulación de pelotas físicas.
        </p>
      </canvas>

      {/* Guía flotante de interactividad */}
      <div className="viewport-overlay-hint" aria-hidden="true">
        <div className="hint-pill">
          <MousePointerClick size={14} className="text-cyan animate-bounce" aria-hidden="true" />
          <span>Clic: Deforma material & suelta pelota</span>
        </div>
        <div className="hint-pill">
          <Move size={14} className="text-pink animate-pulse" aria-hidden="true" />
          <span>Arrastra pelotas directamente para lanzarlas</span>
        </div>
      </div>
    </div>
  );
};
