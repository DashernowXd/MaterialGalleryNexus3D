import { useState, useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { MATERIAL_CATALOG } from '../materials/materialRegistry';
import { MaterialDefinition, MaterialParameters, GeometryType, EnvironmentPreset } from '../types/materials';
import { useThreeScene } from '../hooks/useThreeScene';
import { usePointerInteraction } from '../hooks/usePointerInteraction';
import { usePhysicsBalls } from '../hooks/usePhysicsBalls';
import { MaterialGallery } from '../components/MaterialGallery';
import { InspectorPanel } from '../components/InspectorPanel';
import { BallCounterHUD } from '../components/BallCounterHUD';
import { CanvasViewport } from '../components/CanvasViewport';
import { useDocumentMetadata } from '../hooks/useDocumentMetadata';

interface MaterialsStudioViewProps {
  onUpdateActiveBalls?: (count: number) => void;
  onRegisterResetCamera?: (fn: () => void) => void;
}

export function MaterialsStudioView() {
  useDocumentMetadata({
    title: 'Nexus3D // Estudio de Materiales Interactivos & Simulador Físico',
    description: 'Experimenta con shaders procedurales dinámicos, simulación de físicas de gravedad y colisión, y catálogo interactivo de materiales Three.js.',
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Estado de Material Seleccionado y Parámetros
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialDefinition>(MATERIAL_CATALOG[0]);
  const [materialParams, setMaterialParams] = useState<MaterialParameters>({
    roughness: MATERIAL_CATALOG[0].roughness,
    metalness: MATERIAL_CATALOG[0].metalness,
    distortion: MATERIAL_CATALOG[0].distortion,
    speed: MATERIAL_CATALOG[0].speed,
    color: MATERIAL_CATALOG[0].color,
    secondaryColor: MATERIAL_CATALOG[0].secondaryColor,
    wireframe: false,
  });

  // 2. Estado de Escenario 3D
  const [geometryType, setGeometryType] = useState<GeometryType>('sphere');
  const [environmentPreset, setEnvironmentPreset] = useState<EnvironmentPreset>('studio');

  const handleSelectMaterial = useCallback((mat: MaterialDefinition) => {
    setSelectedMaterial(mat);
    setMaterialParams({
      roughness: mat.roughness,
      metalness: mat.metalness,
      distortion: mat.distortion,
      speed: mat.speed,
      color: mat.color,
      secondaryColor: mat.secondaryColor,
      wireframe: false,
    });
  }, []);

  const handleChangeParams = useCallback((newParams: Partial<MaterialParameters>) => {
    setMaterialParams(prev => ({ ...prev, ...newParams }));
  }, []);

  // Referencias para interoperabilidad entre hooks
  const updatePhysicsRef = useRef<((delta: number) => void) | null>(null);
  const updatePointerRef = useRef<((delta: number) => void) | null>(null);

  const handleFrameUpdate = useCallback((delta: number) => {
    if (updatePointerRef.current) {
      updatePointerRef.current(delta);
    }
    if (updatePhysicsRef.current) {
      updatePhysicsRef.current(delta);
    }
  }, []);

  // 3. Inicializar Escena Three.js
  const {
    sceneRef,
    cameraRef,
    mainMeshRef,
    pointerLightRef,
    uniformsRef,
    resetCamera,
  } = useThreeScene({
    canvasRef,
    selectedMaterial,
    materialParams,
    geometryType,
    environmentPreset,
    onFrameUpdate: handleFrameUpdate,
  });

  // 4. Motor de Físicas de Pelotas & Contador
  const {
    totalDropped,
    activeBallCount,
    ballStyle,
    setBallStyle,
    gravity,
    setGravity,
    restitution,
    setRestitution,
    spawnBall,
    updatePhysics,
    clearBalls,
    resetCounter,
    ballsRef,
  } = usePhysicsBalls({
    sceneRef,
    activeMaterialColor: materialParams.color,
  });

  useEffect(() => {
    updatePhysicsRef.current = updatePhysics;
  }, [updatePhysics]);

  // 5. Interacción de Puntero (Cursor, Clics y Arrastre de Pelotas)
  const {
    handlePointerMove,
    handlePointerDown,
    handlePointerUp,
    updatePointerState,
  } = usePointerInteraction({
    canvasRef,
    cameraRef,
    mainMeshRef,
    pointerLightRef,
    uniformsRef,
    ballsRef,
    onSpawnBall: (pos, vel) => spawnBall(pos, vel),
  });

  useEffect(() => {
    updatePointerRef.current = updatePointerState;
  }, [updatePointerState]);

  const handleHUDDropBall = useCallback(() => {
    spawnBall(
      new THREE.Vector3(
        (Math.random() - 0.5) * 1.5,
        4.0 + Math.random(),
        (Math.random() - 0.5) * 1.5
      ),
      new THREE.Vector3(
        (Math.random() - 0.5) * 2.0,
        -1.0,
        (Math.random() - 0.5) * 2.0
      )
    );
  }, [spawnBall]);

  const handleDropBurst = useCallback((count: number) => {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        spawnBall(
          new THREE.Vector3(
            (Math.random() - 0.5) * 2.5,
            4.5 + Math.random() * 1.5,
            (Math.random() - 0.5) * 2.5
          ),
          new THREE.Vector3(
            (Math.random() - 0.5) * 3.5,
            -0.5 + Math.random() * 1.5,
            (Math.random() - 0.5) * 3.5
          )
        );
      }, i * 65);
    }
  }, [spawnBall]);

  return (
    <main className="main-viewport">
      <CanvasViewport
        canvasRef={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      />

      <MaterialGallery
        selectedMaterial={selectedMaterial}
        onSelectMaterial={handleSelectMaterial}
      />

      <InspectorPanel
        geometryType={geometryType}
        environmentPreset={environmentPreset}
        params={materialParams}
        onSelectGeometry={setGeometryType}
        onSelectEnvironment={setEnvironmentPreset}
        onChangeParams={handleChangeParams}
      />

      <BallCounterHUD
        totalDropped={totalDropped}
        activeBalls={activeBallCount}
        ballStyle={ballStyle}
        gravity={gravity}
        restitution={restitution}
        onDropBall={handleHUDDropBall}
        onDropBurst={handleDropBurst}
        onClearBalls={clearBalls}
        onResetCounter={resetCounter}
        onSelectBallStyle={setBallStyle}
        onChangeGravity={setGravity}
        onChangeRestitution={setRestitution}
      />
    </main>
  );
}
