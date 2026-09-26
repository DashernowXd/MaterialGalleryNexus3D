import React from 'react';
import {
  Sliders,
  Zap,
  Target,
  Trash2,
  Unlink,
  Palette,
  Sun,
  Grid,
  Share2,
  Info,
  Minimize2,
  Maximize2,
  ArrowRightLeft,
  CircleDot,
} from 'lucide-react';
import {
  NetworkSphereData,
  NetworkSettings,
  SphereColorPreset,
  OpenTubeLengthType,
} from '../types/sphereNetwork';

const COLOR_OPTIONS: { hex: SphereColorPreset; label: string }[] = [
  { hex: '#06b6d4', label: 'Cyan Neón' },
  { hex: '#ec4899', label: 'Rosa Eléctrico' },
  { hex: '#a855f7', label: 'Púrpura Plasma' },
  { hex: '#3b82f6', label: 'Azul Hiperión' },
  { hex: '#10b981', label: 'Esmeralda Láser' },
  { hex: '#f59e0b', label: 'Ámbar Solar' },
  { hex: '#f43f5e', label: 'Rubí Fusión' },
  { hex: '#ffffff', label: 'Blanco Estelar' },
];

interface SphereInspectorPanelProps {
  selectedSphere: NetworkSphereData | null;
  settings: NetworkSettings;
  onUpdateSettings: (newSettings: Partial<NetworkSettings>) => void;
  onUpdateSphereColor: (color: string) => void;
  onUpdateSphereRadius: (radius: number) => void;
  onDeleteSphere: (id: string) => void;
  onDisconnectLink: (idA: string, idB: string) => void;
  onAddOpenTube: (sphereId: string, lengthType: OpenTubeLengthType) => void;
  onRemoveOpenTube: (openTubeId: string) => void;
  onToggleOpenTubeLength: (openTubeId: string) => void;
  onCloseSelection: () => void;
}

export const SphereInspectorPanel: React.FC<SphereInspectorPanelProps> = ({
  selectedSphere,
  settings,
  onUpdateSettings,
  onUpdateSphereColor,
  onUpdateSphereRadius,
  onDeleteSphere,
  onDisconnectLink,
  onAddOpenTube,
  onRemoveOpenTube,
  onToggleOpenTubeLength,
  onCloseSelection,
}) => {
  const totalConnections = selectedSphere?.connections.length || 0;
  const totalOpenTubes = selectedSphere?.openTubes?.length || 0;
  const totalTubes = totalConnections + totalOpenTubes;
  const isIlluminated = totalTubes > 0;

  return (
    <aside
      className="network-inspector-sidebar"
      aria-label="Panel de configuración de red e inspección de nodos"
    >
      {/* 1. SECCIÓN: Nodo Seleccionado */}
      <div className="inspector-card-group">
        <div className="inspector-card-header">
          <Target size={16} className="text-cyan" aria-hidden="true" />
          <h3>{selectedSphere ? selectedSphere.name : 'Nodo Objetivo'}</h3>
          {selectedSphere && (
            <button
              type="button"
              className="inspector-close-mini-btn"
              onClick={onCloseSelection}
              title="Deseleccionar nodo"
              aria-label="Cerrar selección de nodo"
            >
              ✕
            </button>
          )}
        </div>

        {selectedSphere ? (
          <div className="inspector-node-details">
            {/* Estado de Iluminación */}
            <div className="node-status-banner">
              <div
                className="status-beacon"
                style={{
                  backgroundColor: isIlluminated ? selectedSphere.color : '#475569',
                  boxShadow: isIlluminated ? `0 0 14px ${selectedSphere.color}` : 'none',
                }}
              />
              <div className="status-text-wrapper">
                <span className="status-title">
                  {isIlluminated ? 'ENERGIZADO & ILUMINADO' : 'MODO DORMIDO / AISLADO'}
                </span>
                <span className="status-sub">
                  {isIlluminated
                    ? `${totalTubes} tubo(s) activos (${totalConnections} entre esferas, ${totalOpenTubes} libres sin nodo)`
                    : 'Sin tubos. Conéctale tubos a otros nodos o añade tubos libres para iluminarlo.'}
                </span>
              </div>
            </div>

            {/* Selector de Color del Nodo */}
            <div className="inspector-field">
              <label className="field-label">
                <Palette size={13} aria-hidden="true" />
                <span>Color de Plasma del Nodo</span>
              </label>
              <div className="color-swatches-grid">
                {COLOR_OPTIONS.map(c => {
                  const isCurrent =
                    selectedSphere.color.toLowerCase() === c.hex.toLowerCase();
                  return (
                    <button
                      key={c.hex}
                      type="button"
                      className={`swatch-btn ${isCurrent ? 'active' : ''}`}
                      style={{ backgroundColor: c.hex }}
                      onClick={() => onUpdateSphereColor(c.hex)}
                      title={`Aplicar ${c.label}`}
                      aria-label={`Color ${c.label}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* SECCIÓN: Tamaño & Radio Individual del Nodo */}
            <div className="inspector-field">
              <div className="field-label-between">
                <label className="field-label">
                  <CircleDot size={13} className="text-cyan" aria-hidden="true" />
                  <span>Radio / Tamaño Individual</span>
                </label>
                <span className="field-value-badge">
                  {selectedSphere.radius.toFixed(2)}m
                </span>
              </div>

              {/* Presets de tamaño rápido */}
              <div className="radius-presets-grid">
                {[
                  { label: 'Mini', val: 0.35 },
                  { label: 'Normal', val: 0.55 },
                  { label: 'Grande', val: 0.85 },
                  { label: 'Titán', val: 1.2 },
                ].map(p => {
                  const isCurrent = Math.abs(selectedSphere.radius - p.val) < 0.05;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      className={`radius-preset-btn ${isCurrent ? 'active' : ''}`}
                      onClick={() => onUpdateSphereRadius(p.val)}
                      title={`Fijar tamaño a ${p.label} (${p.val}m)`}
                      aria-label={`Tamaño ${p.label}`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {/* Slider de ajuste fino individual */}
              <div className="slider-row compact">
                <input
                  type="range"
                  min="0.25"
                  max="1.40"
                  step="0.05"
                  value={selectedSphere.radius}
                  onChange={e => onUpdateSphereRadius(parseFloat(e.target.value))}
                  aria-label="Calibrar radio individual de esta esfera"
                />
              </div>
            </div>

            {/* SECCIÓN NUEVA: Tubos Libres Sin Nodo (Cortos y Largos) */}
            <div className="inspector-field">
              <label className="field-label">
                <Zap size={13} className="text-amber" aria-hidden="true" />
                <span>Tubos Libres Sin Nodos ({totalOpenTubes})</span>
              </label>

              {/* Botones de acción para añadir tubo corto o largo */}
              <div className="open-tubes-btn-grid">
                <button
                  type="button"
                  className="add-open-tube-btn short"
                  onClick={() => onAddOpenTube(selectedSphere.id, 'short')}
                  title="Conectar un tubo libre corto (~1.8m) que ilumina la esfera"
                  aria-label="Añadir tubo corto sin nodo"
                >
                  <Minimize2 size={13} aria-hidden="true" />
                  <span>+ Tubo Corto</span>
                  <span className="btn-dimension-tag">1.8m</span>
                </button>

                <button
                  type="button"
                  className="add-open-tube-btn long"
                  onClick={() => onAddOpenTube(selectedSphere.id, 'long')}
                  title="Conectar un tubo libre largo (~5.2m) de largo alcance"
                  aria-label="Añadir tubo largo sin nodo"
                >
                  <Maximize2 size={13} aria-hidden="true" />
                  <span>+ Tubo Largo</span>
                  <span className="btn-dimension-tag">5.2m</span>
                </button>
              </div>

              {/* Lista de tubos libres conectados */}
              {totalOpenTubes === 0 ? (
                <p className="empty-field-hint">
                  Puedes conectar tubos libres (cortos o largos) que no requieren un segundo nodo. Al conectarlos, ¡la esfera se iluminará!
                </p>
              ) : (
                <div className="open-tubes-list">
                  {selectedSphere.openTubes.map((ot, idx) => (
                    <div key={ot.id} className="open-tube-row-pill">
                      <div className="open-tube-info">
                        <span className={`open-tube-type-badge ${ot.lengthType}`}>
                          {ot.lengthType === 'short' ? 'Corto' : 'Largo'}
                        </span>
                        <span className="open-tube-label">
                          Conductor #{idx + 1} ({ot.length.toFixed(1)}m)
                        </span>
                      </div>
                      <div className="open-tube-actions">
                        <button
                          type="button"
                          className="switch-length-btn"
                          onClick={() => onToggleOpenTubeLength(ot.id)}
                          title={`Alternar a ${ot.lengthType === 'short' ? 'Largo (5.2m)' : 'Corto (1.8m)'}`}
                          aria-label="Alternar longitud"
                        >
                          <ArrowRightLeft size={11} />
                          <span>{ot.lengthType === 'short' ? 'Agrandar' : 'Acortar'}</span>
                        </button>
                        <button
                          type="button"
                          className="disconnect-mini-btn"
                          onClick={() => onRemoveOpenTube(ot.id)}
                          title="Eliminar este tubo libre"
                          aria-label="Eliminar tubo libre"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Conexiones Inter-nodo Activas de este Nodo */}
            <div className="inspector-field">
              <label className="field-label">
                <Share2 size={13} aria-hidden="true" />
                <span>Tubos Conectados a Otros Nodos ({totalConnections})</span>
              </label>

              {totalConnections === 0 ? (
                <p className="empty-field-hint">
                  Haz clic en otra esfera en el canvas para formar un tubo entre ambas.
                </p>
              ) : (
                <div className="node-connections-pills">
                  {selectedSphere.connections.map(targetId => (
                    <div key={targetId} className="connection-pill">
                      <span className="target-id">{targetId.slice(0, 10)}...</span>
                      <button
                        type="button"
                        className="disconnect-mini-btn"
                        onClick={() => onDisconnectLink(selectedSphere.id, targetId)}
                        title="Cortar este tubo conector"
                        aria-label={`Desconectar enlace hacia ${targetId}`}
                      >
                        <Unlink size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Acciones de Nodo */}
            <button
              type="button"
              className="inspector-delete-btn"
              onClick={() => onDeleteSphere(selectedSphere.id)}
              aria-label="Eliminar esta esfera de la red"
            >
              <Trash2 size={13} aria-hidden="true" />
              <span>Eliminar Nodo de la Red</span>
            </button>
          </div>
        ) : (
          <div className="inspector-empty-placeholder">
            <Info size={22} className="text-cyan animate-pulse" aria-hidden="true" />
            <p className="placeholder-text">
              Haz clic en cualquier esfera 3D del lienzo para ver su telemetría, añadir tubos cortos/largos sin nodo o cambiar su color.
            </p>
            <div className="placeholder-tip">
              <span>Tip:</span> Al conectar tubos libres (cortos o largos) a una esfera aislada, esta se enciende de inmediato con su luz y halo.
            </div>
          </div>
        )}
      </div>

      {/* 2. SECCIÓN: Parámetros Globales de Energía y Tubos */}
      <div className="inspector-card-group">
        <div className="inspector-card-header">
          <Sliders size={16} className="text-cyan" aria-hidden="true" />
          <h3>Dinámica de Red & Tubos</h3>
        </div>

        <div className="inspector-controls-list">
          {/* Slider: Grosor del Tubo */}
          <div className="slider-row">
            <div className="slider-header">
              <span className="slider-title">Grosor de Tubos Conectores</span>
              <span className="slider-value">{(settings.tubeThickness * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.03"
              max="0.22"
              step="0.01"
              value={settings.tubeThickness}
              onChange={e =>
                onUpdateSettings({ tubeThickness: parseFloat(e.target.value) })
              }
              aria-label="Grosor de los tubos conductores"
            />
          </div>

          {/* Slider: Velocidad del Pulso Lumínico */}
          <div className="slider-row">
            <div className="slider-header">
              <span className="slider-title">Velocidad del Flujo Lumínico</span>
              <span className="slider-value">{settings.energySpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="8.0"
              step="0.5"
              value={settings.energySpeed}
              onChange={e =>
                onUpdateSettings({ energySpeed: parseFloat(e.target.value) })
              }
              aria-label="Velocidad de pulsos lumínicos en tubos"
            />
          </div>

          {/* Slider: Intensidad del Resplandor (Glow) */}
          <div className="slider-row">
            <div className="slider-header">
              <span className="slider-title">Intensidad de Resplandor (Glow)</span>
              <span className="slider-value">{settings.glowIntensity.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="3.5"
              step="0.1"
              value={settings.glowIntensity}
              onChange={e =>
                onUpdateSettings({ glowIntensity: parseFloat(e.target.value) })
              }
              aria-label="Intensidad lumínica de resplandor"
            />
          </div>

          {/* Slider: Rango de Auto-conexión */}
          <div className="slider-row">
            <div className="slider-header">
              <span className="slider-title">Rango de Proximidad Automática</span>
              <span className="slider-value">{settings.autoConnectRange.toFixed(1)}m</span>
            </div>
            <input
              type="range"
              min="3.0"
              max="15.0"
              step="0.5"
              value={settings.autoConnectRange}
              onChange={e =>
                onUpdateSettings({ autoConnectRange: parseFloat(e.target.value) })
              }
              aria-label="Rango de proximidad para auto-conexión"
            />
          </div>

          {/* Toggles */}
          <div className="inspector-toggle-grid">
            {/* Luces Puntuales Dinámicas */}
            <button
              type="button"
              className={`toggle-pill-btn ${settings.enableDynamicLights ? 'active' : ''}`}
              onClick={() =>
                onUpdateSettings({ enableDynamicLights: !settings.enableDynamicLights })
              }
              title="Activar PointLights reales emitidas por cada esfera y punta iluminada"
            >
              <Sun size={14} aria-hidden="true" />
              <span>Luces Dinámicas</span>
            </button>

            {/* Cuadrícula Holográfica */}
            <button
              type="button"
              className={`toggle-pill-btn ${settings.showFloorGrid ? 'active' : ''}`}
              onClick={() =>
                onUpdateSettings({ showFloorGrid: !settings.showFloorGrid })
              }
              title="Mostrar u ocultar cuadrícula digital en el suelo"
            >
              <Grid size={14} aria-hidden="true" />
              <span>Cuadrícula Cyber</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Guía de Interacción Rápida */}
      <div className="inspector-guide-box">
        <div className="guide-header">
          <Zap size={14} className="text-amber" aria-hidden="true" />
          <span>Dinámica de Tubos Libres & Red</span>
        </div>
        <p className="guide-body">
          Cualquier tubo conectado a una esfera (ya sea inter-nodo o un tubo libre corto/largo sin nodo) activa la inyección de energía. Las puntas de los tubos libres disponen de electrodos con resplandor propio.
        </p>
      </div>
    </aside>
  );
};
