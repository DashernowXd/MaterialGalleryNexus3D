import React, { useState, useRef, useCallback } from 'react';
import { useThreeSphereNetworkScene } from '../hooks/useThreeSphereNetworkScene';
import {
  NetworkSphereData,
  NetworkSettings,
  NetworkTelemetry,
  NetworkPreset,
  OpenTubeLengthType,
} from '../types/sphereNetwork';
import { SphereNetworkHUD } from '../components/SphereNetworkHUD';
import { SphereInspectorPanel } from '../components/SphereInspectorPanel';
import { useDocumentMetadata } from '../hooks/useDocumentMetadata';
import { Zap, Link2, Sparkles, Sliders } from 'lucide-react';

const INITIAL_SETTINGS: NetworkSettings = {
  tubeThickness: 0.08,
  energySpeed: 3.0,
  glowIntensity: 1.6,
  autoConnectRange: 6.0,
  showFloorGrid: true,
  enableDynamicLights: true,
  soundEnabled: true,
};

export const SphereNetworkStudioView: React.FC = () => {
  useDocumentMetadata({
    title: 'Nexus3D // Red de Esferas Lumínicas & Tubos Conductores',
    description:
      'Generador interactivo 3D de esferas conectables por tubos conductores de plasma con respuesta lumínica fotónica, tubos libres cortos/largos y telemetría en tiempo real.',
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Estados reactivos de la vista
  const [telemetry, setTelemetry] = useState<NetworkTelemetry>({
    totalSpheres: 0,
    illuminatedSpheres: 0,
    totalConnections: 0,
    totalOpenTubes: 0,
    energyFlowRate: 0,
    coveragePercent: 0,
  });

  const [selectedSphere, setSelectedSphere] = useState<NetworkSphereData | null>(null);
  const [settings, setSettings] = useState<NetworkSettings>(INITIAL_SETTINGS);
  const [isConnectMode, setIsConnectMode] = useState<boolean>(true);
  const [isClickToSpawn, setIsClickToSpawn] = useState<boolean>(false);

  // Estado de apertura del panel inspector (automático por resolución)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > 960;
    }
    return true;
  });

  const handleSelectSphere = useCallback((sphere: NetworkSphereData | null) => {
    setSelectedSphere(sphere);
    // En móviles / tablets, abrir automáticamente el drawer cuando se toca una esfera
    if (sphere && typeof window !== 'undefined' && window.innerWidth <= 960) {
      setIsSidebarOpen(true);
    }
  }, []);

  // Inicializar hook Three.js
  const {
    spawnSphere,
    removeSphere,
    toggleConnection,
    connectChain,
    connectNearestNeighbors,
    connectFullMesh,
    connectHubAndSpoke,
    disconnectAll,
    clearAll,
    loadPreset,
    selectSphere,
    updateSelectedSphereColor,
    updateSelectedSphereRadius,
    updateSettings,
    resetCamera,
    addOpenTubeToSphere,
    removeOpenTube,
    toggleOpenTubeLength,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    setConnectMode,
    setClickToSpawnMode,
  } = useThreeSphereNetworkScene({
    canvasRef,
    onSelectSphere: handleSelectSphere,
    onTelemetryUpdate: setTelemetry,
  });

  // Alternar modo conexión vs modo arrastre
  const handleToggleConnectMode = useCallback(() => {
    setIsConnectMode(prev => {
      const next = !prev;
      setConnectMode(next);
      return next;
    });
  }, [setConnectMode]);

  // Alternar modo clic en suelo para generar
  const handleToggleClickToSpawn = useCallback(() => {
    setIsClickToSpawn(prev => {
      const next = !prev;
      setClickToSpawnMode(next);
      return next;
    });
  }, [setClickToSpawnMode]);

  // Modificar settings globales
  const handleUpdateSettings = useCallback(
    (newSettings: Partial<NetworkSettings>) => {
      setSettings(prev => {
        const updated = { ...prev, ...newSettings };
        updateSettings(newSettings);
        return updated;
      });
    },
    [updateSettings]
  );

  // Añadir tubo libre desde el HUD rápido
  const handleAddOpenTubeFromHUD = useCallback(
    (lengthType: OpenTubeLengthType) => {
      if (selectedSphere) {
        addOpenTubeToSphere(selectedSphere.id, lengthType);
      } else {
        // Si no hay nodo seleccionado, crear una nueva esfera con ese tubo libre ya conectado
        const newSphere = spawnSphere();
        if (newSphere) {
          setTimeout(() => {
            addOpenTubeToSphere(newSphere.id, lengthType);
            selectSphere(newSphere.id);
          }, 80);
        }
      }
    },
    [selectedSphere, addOpenTubeToSphere, spawnSphere, selectSphere]
  );

  return (
    <main
      className="network-studio-layout"
      aria-label="Generador interactivo de esferas y tubos luminosos 3D"
    >
      {/* 1. Viewport 3D Principal */}
      <div className="network-canvas-container">
        <canvas
          ref={canvasRef}
          className="webgl-canvas"
          role="img"
          aria-label="Escenario 3D interactivo con esferas cuánticas y tubos conductores de plasma lumínico"
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <p>
            Tu navegador no soporta Canvas 3D WebGL. Entorno de generación de esferas conectables por
            tubos lumínicos con simulación de flujo fotónico.
          </p>
        </canvas>

        {/* HUD Flotante con Telemetría y Acciones Rápidas */}
        <SphereNetworkHUD
          telemetry={telemetry}
          isConnectMode={isConnectMode}
          isClickToSpawn={isClickToSpawn}
          selectedSphereId={selectedSphere?.id}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          onToggleConnectMode={handleToggleConnectMode}
          onToggleClickToSpawn={handleToggleClickToSpawn}
          onSpawnSphere={() => spawnSphere()}
          onAddOpenTube={handleAddOpenTubeFromHUD}
          onConnectChain={connectChain}
          onConnectNeighbors={() => connectNearestNeighbors(2)}
          onConnectFullMesh={connectFullMesh}
          onConnectHub={connectHubAndSpoke}
          onDisconnectAll={disconnectAll}
          onClearAll={clearAll}
          onLoadPreset={(preset: NetworkPreset) => loadPreset(preset)}
          onResetCamera={resetCamera}
        />

        {/* Botón flotante para abrir el panel cuando está cerrado (especialmente útil en móviles/tablets) */}
        {!isSidebarOpen && (
          <button
            type="button"
            className="inspector-open-floating-btn"
            onClick={() => setIsSidebarOpen(true)}
            title="Abrir panel lateral de configuración e inspector"
            aria-label="Abrir panel inspector"
          >
            <Sliders size={16} aria-hidden="true" />
            <span>Inspector & Ajustes</span>
          </button>
        )}

        {/* Guía flotante contextual */}
        <div className="viewport-overlay-hint" aria-hidden="true">
          <div className="hint-pill">
            <Zap size={14} className="text-cyan animate-bounce" aria-hidden="true" />
            <span>Los tubos (entre esferas o libres cortos/largos) iluminan las esferas al conectarse</span>
          </div>
          <div className="hint-pill">
            <Link2 size={14} className="text-pink animate-pulse" aria-hidden="true" />
            <span>
              {isConnectMode
                ? 'Modo Conectar: Haz clic en Nodo 1 y luego en Nodo 2'
                : 'Modo Mover: Arrastra las esferas libremente'}
            </span>
          </div>
          <div className="hint-pill">
            <Sparkles size={14} className="text-amber" aria-hidden="true" />
            <span>Selecciona cualquier esfera para añadirle tubos libres cortos o largos</span>
          </div>
        </div>
      </div>

      {/* 2. Panel Lateral de Inspección y Parámetros */}
      <SphereInspectorPanel
        selectedSphere={selectedSphere}
        settings={settings}
        isOpen={isSidebarOpen}
        onClosePanel={() => setIsSidebarOpen(false)}
        onUpdateSettings={handleUpdateSettings}
        onUpdateSphereColor={updateSelectedSphereColor}
        onUpdateSphereRadius={updateSelectedSphereRadius}
        onDeleteSphere={removeSphere}
        onDisconnectLink={(idA, idB) => toggleConnection(idA, idB)}
        onAddOpenTube={addOpenTubeToSphere}
        onRemoveOpenTube={removeOpenTube}
        onToggleOpenTubeLength={toggleOpenTubeLength}
        onCloseSelection={() => selectSphere(null)}
      />
    </main>
  );
};
