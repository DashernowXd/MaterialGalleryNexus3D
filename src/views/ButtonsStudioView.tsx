import React, { useState, useRef } from 'react';
import { useThreeButtonsScene } from '../hooks/useThreeButtonsScene';
import { BUTTONS_3D_CATALOG } from '../materials/buttonsCatalog';
import { Button3DConfig, ButtonEventLog } from '../types/buttons3d';
import { Layers, Terminal, RotateCcw, Crosshair, CheckCircle2, Zap, Move } from 'lucide-react';
import { DraggableFiguresHUD } from '../components/DraggableFiguresHUD';
import { useDocumentMetadata } from '../hooks/useDocumentMetadata';

export const ButtonsStudioView: React.FC = () => {
  useDocumentMetadata({
    title: 'Nexus3D // Botones 3D Táctiles & Texturas Hápticas',
    description: 'Tablero interactivo 3D con pulsadores de recorrido mecánico real, shaders de bisel y telemetría de eventos con respuesta lumínica LED.',
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedFocus, setSelectedFocus] = useState<Button3DConfig>(BUTTONS_3D_CATALOG[0]);
  const [eventLogs, setEventLogs] = useState<ButtonEventLog[]>([
    {
      id: 'init-log',
      buttonName: 'Sistema de Botones 3D',
      action: 'press',
      timestamp: new Date().toLocaleTimeString(),
      texture: 'Inicializado',
    },
  ]);
  const [totalClicks, setTotalClicks] = useState<number>(0);

  const handleButtonPress = (log: ButtonEventLog) => {
    setEventLogs(prev => [log, ...prev.slice(0, 19)]);
    setTotalClicks(prev => prev + 1);
  };

  const {
    handlePointerMove,
    handlePointerDown,
    handlePointerUp,
    focusOnButton,
    resetView,
    activeFiguresCount,
    dimLightEnabled,
    spawnFigure,
    clearFigures,
    resetFigures,
    toggleDimLighting,
  } = useThreeButtonsScene({
    canvasRef,
    onButtonPress: handleButtonPress,
    onSelectButtonFocus: setSelectedFocus,
  });

  const handleCardClick = (btn: Button3DConfig) => {
    setSelectedFocus(btn);
    focusOnButton(btn.id);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent, btn: Button3DConfig) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(btn);
    }
  };

  return (
    <main className="buttons-view-container" aria-label="Estudio de Botones 3D Hápticos">
      {/* Canvas 3D Principal */}
      <div className="buttons-canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="webgl-canvas"
          role="img"
          aria-label="Escenario 3D interactivo con botonera táctil háptica, pulsadores y figuras geométricas arrastrables"
          tabIndex={0}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <p>
            Tu navegador no soporta Canvas 3D WebGL. Tablero de botones táctiles con respuesta física
            y simulación háptica en tiempo real.
          </p>
        </canvas>

        {/* HUD Flotante de Figuras 3D Arrastrables e Iluminación */}
        <DraggableFiguresHUD
          activeCount={activeFiguresCount}
          dimLightEnabled={dimLightEnabled}
          onSpawnFigure={spawnFigure}
          onToggleDimLight={toggleDimLighting}
          onResetFigures={resetFigures}
          onClearFigures={clearFigures}
        />

        {/* Guía flotante sobre el canvas */}
        <div className="viewport-overlay-hint" aria-hidden="true">
          <div className="hint-pill">
            <Zap size={14} className="text-cyan animate-bounce" aria-hidden="true" />
            <span>Presiona los botones 3D del tablero</span>
          </div>
          <div className="hint-pill">
            <Move size={14} className="text-pink animate-pulse" aria-hidden="true" />
            <span>Arrastra las figuras 3D luminosas por el entorno</span>
          </div>
          <div className="hint-pill">
            <Crosshair size={14} className="text-purple" aria-hidden="true" />
            <span>Hover para elevación y LED</span>
          </div>
        </div>
      </div>

      {/* Galería Lateral Izquierda de Botones */}
      <aside className="gallery-container buttons-sidebar" aria-label="Catálogo lateral de botones táctiles">
        <div className="gallery-header">
          <Layers size={16} className="text-cyan" aria-hidden="true" />
          <h2>Catálogo de Botones y Texturas</h2>
        </div>

        <div className="gallery-cards-list" role="listbox" aria-label="Lista de botones 3D disponibles">
          {BUTTONS_3D_CATALOG.map(btn => {
            const isSelected = btn.id === selectedFocus.id;
            return (
              <div
                key={btn.id}
                className={`material-card ${isSelected ? 'active' : ''}`}
                onClick={() => handleCardClick(btn)}
                onKeyDown={e => handleCardKeyDown(e, btn)}
                role="option"
                aria-selected={isSelected}
                aria-label={`Botón ${btn.name}: forma ${btn.shape}, textura ${btn.textureType}. ${btn.tagline}`}
                tabIndex={0}
              >
                <div className="card-top">
                  <div
                    className="color-orb"
                    aria-hidden="true"
                    style={{
                      backgroundColor: btn.glowColor,
                      boxShadow: `0 0 10px ${btn.glowColor}90`,
                    }}
                  />
                  <span className="material-category">{btn.shape}</span>
                  <span className="material-badge">{btn.behavior}</span>
                  {isSelected && <CheckCircle2 size={16} className="check-icon" aria-label="Enfocado actualmente" />}
                </div>

                <h3 className="material-title">{btn.name}</h3>
                <p className="material-description">{btn.tagline}</p>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Consola de Telemetría y Eventos en Vivo (Derecha) */}
      <aside className="inspector-container buttons-console" aria-label="Telemetría háptica y registro de eventos">
        <div className="inspector-header">
          <Terminal size={16} className="text-cyan" aria-hidden="true" />
          <h2>Telemetría Háptica & Eventos</h2>
          <button
            type="button"
            className="mini-text-btn"
            style={{ marginLeft: 'auto' }}
            onClick={resetView}
            title="Vista general del tablero"
            aria-label="Restablecer posición de cámara a vista general del tablero"
          >
            <RotateCcw size={12} aria-hidden="true" />
            <span>Reset Cam</span>
          </button>
        </div>

        {/* Resumen del Botón Enfocado */}
        <div className="telemetry-focus-card" role="region" aria-label="Detalles técnicos del botón seleccionado">
          <div className="focus-header">
            <span className="badge-pill highlight">{selectedFocus.textureType}</span>
            <span className="focus-depth">Recorrido: {(selectedFocus.pressDepth * 100).toFixed(0)}mm</span>
          </div>
          <h3 className="focus-title">{selectedFocus.name}</h3>
          <p className="focus-desc">{selectedFocus.tagline}</p>
          <div className="focus-stats">
            <div className="stat-box">
              <span className="stat-label">Comportamiento</span>
              <span className="stat-val">{selectedFocus.behavior}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Total Clics</span>
              <span className="stat-val text-cyan" aria-label={`${totalClicks} pulsaciones registradas`}>
                {totalClicks}
              </span>
            </div>
          </div>
        </div>

        {/* Feed de Eventos en Tiempo Real */}
        <div className="event-stream-container" role="region" aria-label="Feed de eventos en tiempo real">
          <div className="stream-header">
            <span>Log de Pulsaciones en Tiempo Real</span>
            <span className="live-dot-pill" aria-hidden="true">LIVE</span>
          </div>

          <div className="event-logs-list" role="log" aria-live="polite" aria-relevant="additions">
            {eventLogs.map(log => (
              <div key={log.id} className="event-log-item">
                <span className="log-time">{log.timestamp}</span>
                <span className="log-btn-name">{log.buttonName}</span>
                <span className={`log-badge ${log.action}`}>
                  {log.action === 'toggle_on'
                    ? 'ON'
                    : log.action === 'toggle_off'
                    ? 'OFF'
                    : log.action.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </main>
  );
};
