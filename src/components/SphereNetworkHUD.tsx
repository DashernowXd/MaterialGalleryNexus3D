import React from 'react';
import {
  Zap,
  Activity,
  Plus,
  Link2,
  Unlink,
  RotateCcw,
  Sparkles,
  Layers,
  Move3d,
  Trash2,
  Share2,
  Minimize2,
  Maximize2,
  Sliders,
} from 'lucide-react';
import { NetworkTelemetry, NetworkPreset, OpenTubeLengthType } from '../types/sphereNetwork';

interface SphereNetworkHUDProps {
  telemetry: NetworkTelemetry;
  isConnectMode: boolean;
  isClickToSpawn: boolean;
  selectedSphereId?: string | null;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onToggleConnectMode: () => void;
  onToggleClickToSpawn: () => void;
  onSpawnSphere: () => void;
  onAddOpenTube: (lengthType: OpenTubeLengthType) => void;
  onConnectChain: () => void;
  onConnectNeighbors: () => void;
  onConnectFullMesh: () => void;
  onConnectHub: () => void;
  onDisconnectAll: () => void;
  onClearAll: () => void;
  onLoadPreset: (preset: NetworkPreset) => void;
  onResetCamera: () => void;
}

export const SphereNetworkHUD: React.FC<SphereNetworkHUDProps> = ({
  telemetry,
  isConnectMode,
  isClickToSpawn,
  selectedSphereId,
  isSidebarOpen,
  onToggleSidebar,
  onToggleConnectMode,
  onToggleClickToSpawn,
  onSpawnSphere,
  onAddOpenTube,
  onConnectChain,
  onConnectNeighbors,
  onConnectFullMesh,
  onConnectHub,
  onDisconnectAll,
  onClearAll,
  onLoadPreset,
  onResetCamera,
}) => {
  return (
    <div className="network-hud-wrapper" aria-label="Controles y Telemetría de la Red 3D">
      {/* 1. Barra Superior de Telemetría Energética */}
      <div className="network-telemetry-bar">
        <div className="telemetry-pill">
          <Activity size={14} className="text-cyan animate-pulse" aria-hidden="true" />
          <span className="telemetry-label">Nodos:</span>
          <span className="telemetry-value text-cyan">{telemetry.totalSpheres}</span>
        </div>

        <div className="telemetry-pill">
          <Zap size={14} className="text-pink animate-bounce" aria-hidden="true" />
          <span className="telemetry-label">Iluminados:</span>
          <span className="telemetry-value text-pink">
            {telemetry.illuminatedSpheres} / {telemetry.totalSpheres}
          </span>
        </div>

        <div className="telemetry-pill">
          <Link2 size={14} className="text-purple" aria-hidden="true" />
          <span className="telemetry-label">Tubos Nodos:</span>
          <span className="telemetry-value text-purple">{telemetry.totalConnections}</span>
        </div>

        <div className="telemetry-pill">
          <Share2 size={14} className="text-emerald" aria-hidden="true" />
          <span className="telemetry-label">Tubos Libres:</span>
          <span className="telemetry-value text-emerald">{telemetry.totalOpenTubes || 0}</span>
        </div>

        <div className="telemetry-pill highlight">
          <Sparkles size={14} className="text-amber" aria-hidden="true" />
          <span className="telemetry-label">Potencia:</span>
          <span className="telemetry-value text-amber">{telemetry.energyFlowRate} MW</span>
        </div>

        <div className="telemetry-pill">
          <span className="telemetry-label">Cobertura:</span>
          <div className="telemetry-progress-bg">
            <div
              className="telemetry-progress-fill"
              style={{ width: `${telemetry.coveragePercent}%` }}
            />
          </div>
          <span className="telemetry-value">{telemetry.coveragePercent}%</span>
        </div>
      </div>

      {/* 2. Barra de Acción Rápida Flotante */}
      <div className="network-quick-actions">
        {/* Generar Esfera */}
        <button
          type="button"
          className="hud-action-btn primary"
          onClick={onSpawnSphere}
          title="Generar nueva esfera de plasma en el espacio 3D"
          aria-label="Generar nueva esfera"
        >
          <Plus size={15} aria-hidden="true" />
          <span>Generar Esfera</span>
        </button>

        {/* Tubos Libres Sin Nodo (Corto o Largo) */}
        <div className="hud-dropdown-container">
          <button
            type="button"
            className="hud-action-btn secondary highlight-amber"
            title="Conectar un tubo libre (corto o largo) que ilumina la esfera sin requerir otro nodo"
            aria-haspopup="true"
          >
            <Zap size={14} className="text-amber" aria-hidden="true" />
            <span>+ Tubo Libre ▾</span>
          </button>
          <div className="hud-dropdown-menu">
            <button
              type="button"
              onClick={() => onAddOpenTube('short')}
              className="dropdown-item"
            >
              <Minimize2 size={13} className="text-cyan" />
              <span>Tubo Corto (~1.8m)</span>
            </button>
            <button
              type="button"
              onClick={() => onAddOpenTube('long')}
              className="dropdown-item"
            >
              <Maximize2 size={13} className="text-pink" />
              <span>Tubo Largo (~5.2m)</span>
            </button>
          </div>
        </div>

        {/* Selector de Modo: Conectar vs Arrastrar */}
        <div className="hud-mode-toggle-group">
          <button
            type="button"
            className={`hud-mode-btn ${isConnectMode ? 'active' : ''}`}
            onClick={onToggleConnectMode}
            title={
              isConnectMode
                ? 'Modo Conexión Activo: Clic en Nodo A y luego en Nodo B para tender un tubo lumínico'
                : 'Activar modo conexión con tubos'
            }
            aria-pressed={isConnectMode}
          >
            <Link2 size={14} aria-hidden="true" />
            <span>Trazar Tubos</span>
          </button>

          <button
            type="button"
            className={`hud-mode-btn ${!isConnectMode ? 'active' : ''}`}
            onClick={onToggleConnectMode}
            title="Modo Mover: Arrastra esferas libremente por el espacio 3D"
            aria-pressed={!isConnectMode}
          >
            <Move3d size={14} aria-hidden="true" />
            <span>Mover Nodos</span>
          </button>
        </div>

        {/* Toggle Clic en Suelo */}
        <button
          type="button"
          className={`hud-action-btn ${isClickToSpawn ? 'active-highlight' : 'secondary'}`}
          onClick={onToggleClickToSpawn}
          title="Al estar activo, hacer clic en el suelo genera una esfera en esa posición exacta"
          aria-pressed={isClickToSpawn}
        >
          <Sparkles size={14} aria-hidden="true" />
          <span>Clic en Suelo: {isClickToSpawn ? 'ON' : 'OFF'}</span>
        </button>

        {/* Conectores Inteligentes */}
        <div className="hud-dropdown-container">
          <button
            type="button"
            className="hud-action-btn secondary"
            title="Conectar automáticamente esferas"
            aria-haspopup="true"
          >
            <Share2 size={14} aria-hidden="true" />
            <span>Auto-Conectar ▾</span>
          </button>
          <div className="hud-dropdown-menu">
            <button type="button" onClick={onConnectNeighbors} className="dropdown-item">
              <Link2 size={13} className="text-cyan" />
              <span>Conectar Nodos Cercanos</span>
            </button>
            <button type="button" onClick={onConnectChain} className="dropdown-item">
              <Activity size={13} className="text-pink" />
              <span>Conectar en Cadena (Pipeline)</span>
            </button>
            <button type="button" onClick={onConnectHub} className="dropdown-item">
              <Sparkles size={13} className="text-amber" />
              <span>Conexión en Estrella (Hub)</span>
            </button>
            <button type="button" onClick={onConnectFullMesh} className="dropdown-item">
              <Layers size={13} className="text-purple" />
              <span>Malla Completa (Full Mesh)</span>
            </button>
          </div>
        </div>

        {/* Presets Geométricos */}
        <div className="hud-dropdown-container">
          <button
            type="button"
            className="hud-action-btn secondary"
            title="Cargar configuraciones geométricas predefinidas"
            aria-haspopup="true"
          >
            <Layers size={14} aria-hidden="true" />
            <span>Presets ▾</span>
          </button>
          <div className="hud-dropdown-menu">
            <button
              type="button"
              onClick={() => onLoadPreset('constellation')}
              className="dropdown-item"
            >
              <Sparkles size={13} className="text-cyan" />
              <span>Constelación & Tubos Libres</span>
            </button>
            <button type="button" onClick={() => onLoadPreset('ring')} className="dropdown-item">
              <RotateCcw size={13} className="text-pink" />
              <span>Anillo con Antenas</span>
            </button>
            <button type="button" onClick={() => onLoadPreset('triangle')} className="dropdown-item">
              <Zap size={13} className="text-amber" />
              <span>Triángulo de Plasma</span>
            </button>
            <button type="button" onClick={() => onLoadPreset('cube')} className="dropdown-item">
              <Layers size={13} className="text-purple" />
              <span>Cubo Reticular 3D</span>
            </button>
            <button type="button" onClick={() => onLoadPreset('atom')} className="dropdown-item">
              <Share2 size={13} className="text-emerald" />
              <span>Átomo & Sondas</span>
            </button>
          </div>
        </div>

        {/* Desconectar Todo */}
        <button
          type="button"
          className="hud-action-btn secondary text-warning"
          onClick={onDisconnectAll}
          title="Apagar y desconectar todos los tubos conductores (inter-nodos y libres)"
          aria-label="Desconectar todos los tubos"
        >
          <Unlink size={14} aria-hidden="true" />
          <span>Desconectar</span>
        </button>

        {/* Limpiar Todo */}
        <button
          type="button"
          className="hud-action-btn secondary text-danger"
          onClick={onClearAll}
          title="Eliminar todas las esferas y tubos de la escena"
          aria-label="Limpiar toda la escena"
        >
          <Trash2 size={14} aria-hidden="true" />
          <span>Limpiar</span>
        </button>

        {/* Resetear Cámara */}
        <button
          type="button"
          className="hud-action-btn icon-only"
          onClick={onResetCamera}
          title="Restablecer posición de cámara"
          aria-label="Restablecer cámara 3D"
        >
          <RotateCcw size={14} aria-hidden="true" />
        </button>

        {/* Alternar Panel Inspector */}
        {onToggleSidebar && (
          <button
            type="button"
            className={`hud-action-btn ${isSidebarOpen ? 'active-highlight' : 'secondary'} hud-sidebar-toggle-btn`}
            onClick={onToggleSidebar}
            title={isSidebarOpen ? 'Ocultar panel inspector' : 'Mostrar panel inspector'}
            aria-label="Alternar panel inspector"
          >
            <Sliders size={14} aria-hidden="true" />
            <span className="hud-btn-text">Panel</span>
          </button>
        )}
      </div>
    </div>
  );
};
