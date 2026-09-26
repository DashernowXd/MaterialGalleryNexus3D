import { useEffect, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  NetworkSphereData,
  NetworkSphereRuntime,
  NetworkTubeData,
  NetworkTubeRuntime,
  NetworkOpenTubeData,
  NetworkOpenTubeRuntime,
  OpenTubeLengthType,
  NetworkSettings,
  NetworkTelemetry,
  NetworkPreset,
  SphereColorPreset,
} from '../types/sphereNetwork';
import { createEnergyTubeMaterial } from '../materials/shaders/energyTubeShader';
import { soundSynth } from '../utils/audioSynth';

const DEFAULT_SETTINGS: NetworkSettings = {
  tubeThickness: 0.08,
  energySpeed: 3.0,
  glowIntensity: 1.6,
  autoConnectRange: 6.0,
  showFloorGrid: true,
  enableDynamicLights: true,
  soundEnabled: true,
};

const COLOR_PALETTE: SphereColorPreset[] = [
  '#06b6d4', // Cyan
  '#ec4899', // Rosa Eléctrico
  '#a855f7', // Púrpura Plasma
  '#3b82f6', // Azul Hiperión
  '#10b981', // Esmeralda Láser
  '#f59e0b', // Ámbar Solar
  '#f43f5e', // Rubí Fusión
];

interface UseThreeSphereNetworkSceneProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onSelectSphere?: (sphere: NetworkSphereData | null) => void;
  onTelemetryUpdate?: (telemetry: NetworkTelemetry) => void;
}

export function useThreeSphereNetworkScene({
  canvasRef,
  onSelectSphere,
  onTelemetryUpdate,
}: UseThreeSphereNetworkSceneProps) {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Mapas de tiempo de ejecución
  const spheresMapRef = useRef<Map<string, NetworkSphereRuntime>>(new Map());
  const tubesMapRef = useRef<Map<string, NetworkTubeRuntime>>(new Map());
  const openTubesMapRef = useRef<Map<string, NetworkOpenTubeRuntime>>(new Map());

  const selectedSphereIdRef = useRef<string | null>(null);
  const isConnectModeRef = useRef<boolean>(true);
  const clickToSpawnModeRef = useRef<boolean>(false);
  const draggingSphereIdRef = useRef<string | null>(null);
  const settingsRef = useRef<NetworkSettings>(DEFAULT_SETTINGS);

  // Callbacks refs para evitar re-suscripciones
  const onSelectSphereRef = useRef(onSelectSphere);
  const onTelemetryUpdateRef = useRef(onTelemetryUpdate);
  useEffect(() => {
    onSelectSphereRef.current = onSelectSphere;
    onTelemetryUpdateRef.current = onTelemetryUpdate;
  }, [onSelectSphere, onTelemetryUpdate]);

  // Raycasting y planos matemáticos
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const mouseNorm = useMemo(() => new THREE.Vector2(-999, -999), []);
  const dragPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.2), []);
  const groundIntersectionPoint = useMemo(() => new THREE.Vector3(), []);
  const floorMeshRef = useRef<THREE.Mesh | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);

  // Cálculos de telemetría reactiva
  const recalculateTelemetry = useCallback(() => {
    const totalSpheres = spheresMapRef.current.size;
    let illuminatedCount = 0;
    spheresMapRef.current.forEach(s => {
      if (s.data.connections.length > 0 || s.data.openTubes.length > 0) {
        illuminatedCount++;
      }
    });

    const totalConnections = tubesMapRef.current.size;
    const totalOpenTubes = openTubesMapRef.current.size;
    const coveragePercent =
      totalSpheres > 0 ? Math.round((illuminatedCount / totalSpheres) * 100) : 0;
    const energyFlowRate = parseFloat(
      (totalConnections * 42.5 + totalOpenTubes * 26.0 + illuminatedCount * 18.2).toFixed(1)
    );

    if (onTelemetryUpdateRef.current) {
      onTelemetryUpdateRef.current({
        totalSpheres,
        illuminatedSpheres: illuminatedCount,
        totalConnections,
        totalOpenTubes,
        energyFlowRate,
        coveragePercent,
      });
    }
  }, []);

  // Actualizar el estado visual de una esfera (Luminiscencia y PointLight)
  const updateSphereIllumination = useCallback((runtime: NetworkSphereRuntime) => {
    // Una esfera está energizada si tiene conexiones con otras esferas O tubos abiertos sin nodo
    const isConnected = runtime.data.connections.length > 0 || runtime.data.openTubes.length > 0;
    runtime.isConnected = isConnected;

    const baseColor = new THREE.Color(runtime.data.color);
    const standardMat = runtime.mesh.material as THREE.MeshStandardMaterial;

    if (isConnected) {
      // Estado ILUMINADO / ENERGIZADO: Alta emisión y halo activo
      standardMat.color.copy(baseColor).multiplyScalar(0.7);
      standardMat.emissive.copy(baseColor);
      standardMat.emissiveIntensity = runtime.isSelected ? 3.2 : 2.4;
      standardMat.roughness = 0.15;
      standardMat.metalness = 0.85;

      runtime.pointLight.color.copy(baseColor);
      runtime.pointLight.intensity = settingsRef.current.enableDynamicLights ? 3.4 : 0;
      runtime.pointLight.distance = 9.5;

      runtime.haloMesh.visible = true;
      (runtime.haloMesh.material as THREE.MeshBasicMaterial).color.copy(baseColor);
      (runtime.haloMesh.material as THREE.MeshBasicMaterial).opacity = 0.38;
    } else {
      // Estado APAGADO / DORMIDO: Oscuro, bajo brillo
      standardMat.color.set('#222838');
      standardMat.emissive.copy(baseColor);
      standardMat.emissiveIntensity = runtime.isSelected ? 1.5 : 0.15;
      standardMat.roughness = 0.35;
      standardMat.metalness = 0.9;

      runtime.pointLight.intensity = runtime.isSelected ? 0.8 : 0.05;
      runtime.pointLight.distance = 4.0;

      runtime.haloMesh.visible = runtime.isSelected;
      (runtime.haloMesh.material as THREE.MeshBasicMaterial).color.copy(baseColor);
      (runtime.haloMesh.material as THREE.MeshBasicMaterial).opacity = runtime.isSelected ? 0.2 : 0.0;
    }

    // Anillo de selección
    runtime.selectionRing.visible = runtime.isSelected;
    if (runtime.isSelected) {
      (runtime.selectionRing.material as THREE.MeshBasicMaterial).color.set(
        isConnected ? '#ffffff' : '#06b6d4'
      );
    }
  }, []);

  // Actualizar la posición, orientación y longitud de un tubo existente entre dos esferas
  const updateTubeGeometry = useCallback((tubeRuntime: NetworkTubeRuntime) => {
    const sphereA = spheresMapRef.current.get(tubeRuntime.data.sphereAId);
    const sphereB = spheresMapRef.current.get(tubeRuntime.data.sphereBId);

    if (!sphereA || !sphereB) return;

    const posA = sphereA.mesh.position;
    const posB = sphereB.mesh.position;

    const dir = new THREE.Vector3().subVectors(posB, posA);
    const length = dir.length();
    tubeRuntime.length = length;

    // Posición del tubo en el punto medio exacto
    const midpoint = new THREE.Vector3().addVectors(posA, posB).multiplyScalar(0.5);
    tubeRuntime.group.position.copy(midpoint);

    // Orientación del cilindro
    const normalizedDir = dir.clone().normalize();
    const upVector = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(upVector, normalizedDir);
    tubeRuntime.group.quaternion.copy(quaternion);

    // Escalar la altura del cilindro en Y a la longitud exacta entre nodos
    tubeRuntime.cylinderMesh.scale.set(1, length, 1);
    tubeRuntime.glowMesh.scale.set(1, length, 1);

    // Collares conectores en los extremos
    tubeRuntime.capA.position.set(0, -length * 0.46, 0);
    tubeRuntime.capB.position.set(0, length * 0.46, 0);
  }, []);

  // Actualizar la posición y orientación de un tubo libre (sin nodo)
  const updateOpenTubeGeometry = useCallback((openTubeRuntime: NetworkOpenTubeRuntime) => {
    const sphere = spheresMapRef.current.get(openTubeRuntime.data.sphereId);
    if (!sphere) return;

    const dir = new THREE.Vector3(...openTubeRuntime.data.direction).normalize();
    const length = openTubeRuntime.data.length;

    // El centro del cilindro se ubica a partir de la superficie de la esfera hacia afuera
    const centerPos = sphere.mesh.position
      .clone()
      .add(dir.clone().multiplyScalar(sphere.data.radius + length / 2));
    openTubeRuntime.group.position.copy(centerPos);

    // Orientar el eje vertical Y del cilindro en la dirección hacia afuera
    const upVector = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(upVector, dir);
    openTubeRuntime.group.quaternion.copy(quaternion);
  }, []);

  // Crear un nuevo tubo lumínico entre dos esferas
  const createTubeBetweenSpheres = useCallback(
    (sphereAId: string, sphereBId: string): boolean => {
      const scene = sceneRef.current;
      if (!scene) return false;

      const tubeId = [sphereAId, sphereBId].sort().join('--');
      if (tubesMapRef.current.has(tubeId)) return false;

      const sphereA = spheresMapRef.current.get(sphereAId);
      const sphereB = spheresMapRef.current.get(sphereBId);
      if (!sphereA || !sphereB) return false;

      const group = new THREE.Group();
      const thickness = settingsRef.current.tubeThickness;

      // 1. Núcleo conductor principal
      const cylinderGeom = new THREE.CylinderGeometry(thickness, thickness, 1, 16, 1, true);
      const shaderMaterial = createEnergyTubeMaterial(
        sphereA.data.color,
        sphereB.data.color,
        settingsRef.current.energySpeed,
        settingsRef.current.glowIntensity
      );
      const cylinderMesh = new THREE.Mesh(cylinderGeom, shaderMaterial);
      group.add(cylinderMesh);

      // 2. Funda exterior translúcida de halo de plasma
      const glowGeom = new THREE.CylinderGeometry(
        thickness * 1.7,
        thickness * 1.7,
        1,
        16,
        1,
        true
      );
      const glowMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(sphereA.data.color).lerp(new THREE.Color(sphereB.data.color), 0.5),
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
      });
      const glowMesh = new THREE.Mesh(glowGeom, glowMat);
      group.add(glowMesh);

      // 3. Collares de unión
      const capGeom = new THREE.CylinderGeometry(thickness * 1.5, thickness * 1.5, 0.12, 16);
      const capMat = new THREE.MeshStandardMaterial({
        color: '#64748b',
        metalness: 0.95,
        roughness: 0.2,
      });
      const capA = new THREE.Mesh(capGeom, capMat);
      const capB = new THREE.Mesh(capGeom, capMat);
      group.add(capA);
      group.add(capB);

      scene.add(group);

      const tubeRuntime: NetworkTubeRuntime = {
        data: {
          id: tubeId,
          sphereAId,
          sphereBId,
          colorA: sphereA.data.color,
          colorB: sphereB.data.color,
          powerFlow: 1.0,
          active: true,
        },
        group,
        cylinderMesh,
        glowMesh,
        capA,
        capB,
        material: capMat,
        glowMaterial: shaderMaterial,
        length: 1,
      };

      tubesMapRef.current.set(tubeId, tubeRuntime);

      if (!sphereA.data.connections.includes(sphereBId)) {
        sphereA.data.connections.push(sphereBId);
      }
      if (!sphereB.data.connections.includes(sphereAId)) {
        sphereB.data.connections.push(sphereAId);
      }

      updateTubeGeometry(tubeRuntime);

      // ¡ILUMINAR AMBAS ESFERAS!
      updateSphereIllumination(sphereA);
      updateSphereIllumination(sphereB);

      if (settingsRef.current.soundEnabled) {
        soundSynth.playSphereConnectSound();
      }

      recalculateTelemetry();
      return true;
    },
    [updateTubeGeometry, updateSphereIllumination, recalculateTelemetry]
  );

  // Eliminar un tubo existente entre dos esferas
  const removeTube = useCallback(
    (tubeId: string) => {
      const tubeRuntime = tubesMapRef.current.get(tubeId);
      if (!tubeRuntime) return;

      const scene = sceneRef.current;
      if (scene) {
        scene.remove(tubeRuntime.group);
      }

      tubeRuntime.cylinderMesh.geometry.dispose();
      tubeRuntime.glowMesh.geometry.dispose();
      tubeRuntime.capA.geometry.dispose();
      tubeRuntime.capB.geometry.dispose();
      if ('dispose' in tubeRuntime.glowMaterial) {
        tubeRuntime.glowMaterial.dispose();
      }
      tubeRuntime.material.dispose();

      const sphereA = spheresMapRef.current.get(tubeRuntime.data.sphereAId);
      const sphereB = spheresMapRef.current.get(tubeRuntime.data.sphereBId);

      if (sphereA) {
        sphereA.data.connections = sphereA.data.connections.filter(
          id => id !== tubeRuntime.data.sphereBId
        );
        updateSphereIllumination(sphereA);
      }
      if (sphereB) {
        sphereB.data.connections = sphereB.data.connections.filter(
          id => id !== tubeRuntime.data.sphereAId
        );
        updateSphereIllumination(sphereB);
      }

      tubesMapRef.current.delete(tubeId);

      if (settingsRef.current.soundEnabled) {
        soundSynth.playSphereDisconnectSound();
      }

      recalculateTelemetry();
    },
    [updateSphereIllumination, recalculateTelemetry]
  );

  // AGREGAR TUBO LIBRE SIN NODO (Corto o Largo) A UNA ESFERA
  const addOpenTubeToSphere = useCallback(
    (
      sphereId: string,
      lengthType: OpenTubeLengthType = 'short',
      customDirection?: [number, number, number]
    ): NetworkOpenTubeData | null => {
      const scene = sceneRef.current;
      if (!scene) return null;

      const sphereRuntime = spheresMapRef.current.get(sphereId);
      if (!sphereRuntime) return null;

      const openTubeId = `opentube-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const length = lengthType === 'long' ? 5.2 : 1.85;

      // Calcular dirección de salida del tubo libre
      let dir: THREE.Vector3;
      if (customDirection) {
        dir = new THREE.Vector3(...customDirection).normalize();
      } else {
        const count = sphereRuntime.data.openTubes.length;
        // Distribución angular estética para evitar solapamientos
        const phi = (count * 137.5 * Math.PI) / 180;
        const theta = 0.4 + ((count % 4) * 0.35);
        dir = new THREE.Vector3(
          Math.cos(phi) * Math.sin(theta),
          Math.cos(theta) * (count % 2 === 0 ? 1 : -0.75),
          Math.sin(phi) * Math.sin(theta)
        ).normalize();
      }

      const group = new THREE.Group();
      const thickness = settingsRef.current.tubeThickness;

      // 1. Cilindro conductor principal con shader fotónico
      const cylinderGeom = new THREE.CylinderGeometry(thickness, thickness, length, 16, 1, true);
      const shaderMaterial = createEnergyTubeMaterial(
        sphereRuntime.data.color,
        '#ffffff', // La punta terminal irradia plasma blanco/fotónico
        settingsRef.current.energySpeed,
        settingsRef.current.glowIntensity * 1.2
      );
      const cylinderMesh = new THREE.Mesh(cylinderGeom, shaderMaterial);
      group.add(cylinderMesh);

      // 2. Funda exterior de halo luminoso
      const glowGeom = new THREE.CylinderGeometry(
        thickness * 1.8,
        thickness * 1.8,
        length,
        16,
        1,
        true
      );
      const glowMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(sphereRuntime.data.color),
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
      });
      const glowMesh = new THREE.Mesh(glowGeom, glowMat);
      group.add(glowMesh);

      // 3. Collar metálico en la base de la esfera
      const collarGeom = new THREE.CylinderGeometry(thickness * 1.6, thickness * 1.6, 0.12, 16);
      const collarMat = new THREE.MeshStandardMaterial({
        color: '#64748b',
        metalness: 0.95,
        roughness: 0.2,
      });
      const baseCap = new THREE.Mesh(collarGeom, collarMat);
      baseCap.position.set(0, -length * 0.48, 0);
      group.add(baseCap);

      // 4. Electrodo terminal de chispa en la punta abierta (sin nodo)
      const tipGeom = new THREE.SphereGeometry(thickness * 1.45, 16, 16);
      const tipMat = new THREE.MeshStandardMaterial({
        color: '#ffffff',
        emissive: new THREE.Color(sphereRuntime.data.color),
        emissiveIntensity: 3.5,
        roughness: 0.1,
        metalness: 0.9,
      });
      const tipCap = new THREE.Mesh(tipGeom, tipMat);
      tipCap.position.set(0, length * 0.5, 0);
      group.add(tipCap);

      // Luz puntual en la punta libre del tubo
      const tipLight = new THREE.PointLight(sphereRuntime.data.color, 1.8, 4.5, 2.0);
      tipCap.add(tipLight);

      scene.add(group);

      const openTubeData: NetworkOpenTubeData = {
        id: openTubeId,
        sphereId,
        lengthType,
        length,
        direction: [dir.x, dir.y, dir.z],
        color: sphereRuntime.data.color,
        createdAt: Date.now(),
      };

      const runtime: NetworkOpenTubeRuntime = {
        data: openTubeData,
        group,
        cylinderMesh,
        glowMesh,
        baseCap,
        tipCap,
        tipLight,
        material: shaderMaterial,
        glowMaterial: glowMat,
      };

      openTubesMapRef.current.set(openTubeId, runtime);
      sphereRuntime.data.openTubes.push(openTubeData);

      // Orientar y ubicar en el espacio 3D
      updateOpenTubeGeometry(runtime);

      // ¡ILUMINAR LA ESFERA! Al conectarle el tubo libre, se energiza e ilumina
      updateSphereIllumination(sphereRuntime);

      if (settingsRef.current.soundEnabled) {
        soundSynth.playOpenTubeAttachSound(lengthType === 'long');
      }

      recalculateTelemetry();

      if (onSelectSphereRef.current && selectedSphereIdRef.current === sphereId) {
        onSelectSphereRef.current({ ...sphereRuntime.data });
      }

      return openTubeData;
    },
    [updateOpenTubeGeometry, updateSphereIllumination, recalculateTelemetry]
  );

  // ELIMINAR UN TUBO LIBRE SIN NODO
  const removeOpenTube = useCallback(
    (openTubeId: string) => {
      const runtime = openTubesMapRef.current.get(openTubeId);
      if (!runtime) return;

      const scene = sceneRef.current;
      if (scene) {
        scene.remove(runtime.group);
      }

      runtime.cylinderMesh.geometry.dispose();
      runtime.glowMesh.geometry.dispose();
      runtime.baseCap.geometry.dispose();
      (runtime.baseCap.material as THREE.Material).dispose();
      runtime.tipCap.geometry.dispose();
      (runtime.tipCap.material as THREE.Material).dispose();
      runtime.material.dispose();
      runtime.glowMaterial.dispose();

      const sphere = spheresMapRef.current.get(runtime.data.sphereId);
      if (sphere) {
        sphere.data.openTubes = sphere.data.openTubes.filter(t => t.id !== openTubeId);
        updateSphereIllumination(sphere);

        if (onSelectSphereRef.current && selectedSphereIdRef.current === sphere.data.id) {
          onSelectSphereRef.current({ ...sphere.data });
        }
      }

      openTubesMapRef.current.delete(openTubeId);

      if (settingsRef.current.soundEnabled) {
        soundSynth.playOpenTubeDetachSound();
      }

      recalculateTelemetry();
    },
    [updateSphereIllumination, recalculateTelemetry]
  );

  // ALTERNAR LONGITUD (CORTO <-> LARGO) DE UN TUBO LIBRE
  const toggleOpenTubeLength = useCallback(
    (openTubeId: string) => {
      const runtime = openTubesMapRef.current.get(openTubeId);
      if (!runtime) return;

      const nextType: OpenTubeLengthType = runtime.data.lengthType === 'short' ? 'long' : 'short';
      const nextLength = nextType === 'long' ? 5.2 : 1.85;

      runtime.data.lengthType = nextType;
      runtime.data.length = nextLength;

      const thickness = settingsRef.current.tubeThickness;

      // Actualizar mallas
      runtime.cylinderMesh.geometry.dispose();
      runtime.glowMesh.geometry.dispose();

      runtime.cylinderMesh.geometry = new THREE.CylinderGeometry(
        thickness,
        thickness,
        nextLength,
        16,
        1,
        true
      );
      runtime.glowMesh.geometry = new THREE.CylinderGeometry(
        thickness * 1.8,
        thickness * 1.8,
        nextLength,
        16,
        1,
        true
      );

      runtime.baseCap.position.set(0, -nextLength * 0.48, 0);
      runtime.tipCap.position.set(0, nextLength * 0.5, 0);

      updateOpenTubeGeometry(runtime);

      const sphere = spheresMapRef.current.get(runtime.data.sphereId);
      if (sphere) {
        const item = sphere.data.openTubes.find(t => t.id === openTubeId);
        if (item) {
          item.lengthType = nextType;
          item.length = nextLength;
        }
        if (onSelectSphereRef.current && selectedSphereIdRef.current === sphere.data.id) {
          onSelectSphereRef.current({ ...sphere.data });
        }
      }

      if (settingsRef.current.soundEnabled) {
        soundSynth.playOpenTubeAttachSound(nextType === 'long');
      }

      recalculateTelemetry();
    },
    [updateOpenTubeGeometry, recalculateTelemetry]
  );

  // Crear una nueva esfera en el espacio 3D
  const spawnSphere = useCallback(
    (
      position?: [number, number, number],
      color?: string,
      radius: number = 0.55
    ): NetworkSphereData | null => {
      const scene = sceneRef.current;
      if (!scene) return null;

      const sphereId = `node-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const sphereNumber = spheresMapRef.current.size + 1;
      const assignedColor =
        color || COLOR_PALETTE[(sphereNumber - 1) % COLOR_PALETTE.length];

      let finalPos: [number, number, number];
      if (position) {
        finalPos = position;
      } else {
        const angle = Math.random() * Math.PI * 2;
        const dist = 1.8 + Math.random() * 3.5;
        const y = 1.0 + Math.random() * 1.5;
        finalPos = [Math.cos(angle) * dist, y, Math.sin(angle) * dist];
      }

      // 1. Malla de la Esfera Principal
      const sphereGeom = new THREE.SphereGeometry(radius, 32, 32);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: '#222838',
        emissive: new THREE.Color(assignedColor),
        emissiveIntensity: 0.15,
        roughness: 0.35,
        metalness: 0.9,
      });
      const mesh = new THREE.Mesh(sphereGeom, sphereMat);
      mesh.position.set(...finalPos);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { sphereId, isSphereNode: true };
      scene.add(mesh);

      // 2. Halo de energía exterior
      const haloGeom = new THREE.SphereGeometry(radius * 1.25, 24, 24);
      const haloMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(assignedColor),
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
      });
      const haloMesh = new THREE.Mesh(haloGeom, haloMat);
      haloMesh.visible = false;
      mesh.add(haloMesh);

      // 3. Anillo de selección táctil
      const ringGeom = new THREE.TorusGeometry(radius * 1.55, 0.035, 16, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: '#06b6d4',
        wireframe: false,
      });
      const selectionRing = new THREE.Mesh(ringGeom, ringMat);
      selectionRing.rotation.x = Math.PI / 2;
      selectionRing.visible = false;
      mesh.add(selectionRing);

      // 4. Luz puntual de iluminación dinámica
      const pointLight = new THREE.PointLight(assignedColor, 0.05, 4.0, 2.0);
      mesh.add(pointLight);

      const sphereData: NetworkSphereData = {
        id: sphereId,
        name: `Nodo ${sphereNumber.toString().padStart(2, '0')}`,
        position: finalPos,
        color: assignedColor,
        radius,
        connections: [],
        openTubes: [],
        createdAt: Date.now(),
      };

      const runtime: NetworkSphereRuntime = {
        data: sphereData,
        mesh,
        haloMesh,
        selectionRing,
        pointLight,
        isHovered: false,
        isSelected: false,
        isConnected: false,
        baseY: finalPos[1],
        pulsePhase: Math.random() * Math.PI * 2,
      };

      spheresMapRef.current.set(sphereId, runtime);

      if (settingsRef.current.soundEnabled) {
        soundSynth.playSphereSpawnSound(1.0 + (sphereNumber % 5) * 0.12);
      }

      recalculateTelemetry();
      return sphereData;
    },
    [recalculateTelemetry]
  );

  // Eliminar una esfera y todos sus tubos (conectados y libres)
  const removeSphere = useCallback(
    (sphereId: string) => {
      const runtime = spheresMapRef.current.get(sphereId);
      if (!runtime) return;

      const scene = sceneRef.current;

      // 1. Eliminar tubos inter-nodo asociados
      const tubesToRemove: string[] = [];
      tubesMapRef.current.forEach(tube => {
        if (tube.data.sphereAId === sphereId || tube.data.sphereBId === sphereId) {
          tubesToRemove.push(tube.data.id);
        }
      });
      tubesToRemove.forEach(tId => removeTube(tId));

      // 2. Eliminar tubos abiertos asociados
      const openTubesToRemove: string[] = [];
      openTubesMapRef.current.forEach(ot => {
        if (ot.data.sphereId === sphereId) {
          openTubesToRemove.push(ot.data.id);
        }
      });
      openTubesToRemove.forEach(otId => removeOpenTube(otId));

      // 3. Eliminar malla de la escena
      if (scene) {
        scene.remove(runtime.mesh);
      }
      runtime.mesh.geometry.dispose();
      (runtime.mesh.material as THREE.Material).dispose();
      runtime.haloMesh.geometry.dispose();
      (runtime.haloMesh.material as THREE.Material).dispose();
      runtime.selectionRing.geometry.dispose();
      (runtime.selectionRing.material as THREE.Material).dispose();

      spheresMapRef.current.delete(sphereId);

      if (selectedSphereIdRef.current === sphereId) {
        selectedSphereIdRef.current = null;
        if (onSelectSphereRef.current) {
          onSelectSphereRef.current(null);
        }
      }

      recalculateTelemetry();
    },
    [removeTube, removeOpenTube, recalculateTelemetry]
  );

  // Conectar o alternar conexión entre dos esferas
  const toggleConnection = useCallback(
    (idA: string, idB: string) => {
      if (idA === idB) return;
      const tubeId = [idA, idB].sort().join('--');
      if (tubesMapRef.current.has(tubeId)) {
        removeTube(tubeId);
      } else {
        createTubeBetweenSpheres(idA, idB);
      }
    },
    [createTubeBetweenSpheres, removeTube]
  );

  // Seleccionar esfera activa
  const selectSphere = useCallback(
    (sphereId: string | null) => {
      const prevId = selectedSphereIdRef.current;
      if (prevId && spheresMapRef.current.has(prevId)) {
        const prevRuntime = spheresMapRef.current.get(prevId)!;
        prevRuntime.isSelected = false;
        updateSphereIllumination(prevRuntime);
      }

      selectedSphereIdRef.current = sphereId;

      if (sphereId && spheresMapRef.current.has(sphereId)) {
        const nextRuntime = spheresMapRef.current.get(sphereId)!;
        nextRuntime.isSelected = true;
        updateSphereIllumination(nextRuntime);
        if (onSelectSphereRef.current) {
          onSelectSphereRef.current({ ...nextRuntime.data });
        }
        if (settingsRef.current.soundEnabled) {
          soundSynth.playNodeSelectSound();
        }
      } else {
        if (onSelectSphereRef.current) {
          onSelectSphereRef.current(null);
        }
      }
    },
    [updateSphereIllumination]
  );

  // Limpiar toda la red
  const clearAll = useCallback(() => {
    const sphereIds = Array.from(spheresMapRef.current.keys());
    sphereIds.forEach(id => removeSphere(id));
    selectSphere(null);
  }, [removeSphere, selectSphere]);

  // Desconectar todos los tubos (inter-nodo y libres) sin borrar esferas
  const disconnectAll = useCallback(() => {
    const tubeIds = Array.from(tubesMapRef.current.keys());
    tubeIds.forEach(id => removeTube(id));

    const openTubeIds = Array.from(openTubesMapRef.current.keys());
    openTubeIds.forEach(otId => removeOpenTube(otId));
  }, [removeTube, removeOpenTube]);

  // Conectar esferas en cadena secuencial
  const connectChain = useCallback(() => {
    const spheres = Array.from(spheresMapRef.current.values());
    if (spheres.length < 2) return;

    for (let i = 0; i < spheres.length - 1; i++) {
      createTubeBetweenSpheres(spheres[i].data.id, spheres[i + 1].data.id);
    }
  }, [createTubeBetweenSpheres]);

  // Conectar con los vecinos más cercanos dentro del rango
  const connectNearestNeighbors = useCallback(
    (maxConnectionsPerNode: number = 2) => {
      const spheres = Array.from(spheresMapRef.current.values());
      if (spheres.length < 2) return;

      spheres.forEach(sphere => {
        const neighbors = spheres
          .filter(s => s.data.id !== sphere.data.id)
          .map(s => ({
            id: s.data.id,
            dist: sphere.mesh.position.distanceTo(s.mesh.position),
          }))
          .sort((a, b) => a.dist - b.dist)
          .slice(0, maxConnectionsPerNode);

        neighbors.forEach(neighbor => {
          if (neighbor.dist <= settingsRef.current.autoConnectRange) {
            createTubeBetweenSpheres(sphere.data.id, neighbor.id);
          }
        });
      });
    },
    [createTubeBetweenSpheres]
  );

  // Conectar en malla completa
  const connectFullMesh = useCallback(() => {
    const spheres = Array.from(spheresMapRef.current.values());
    if (spheres.length < 2) return;

    for (let i = 0; i < spheres.length; i++) {
      for (let j = i + 1; j < spheres.length; j++) {
        createTubeBetweenSpheres(spheres[i].data.id, spheres[j].data.id);
      }
    }
  }, [createTubeBetweenSpheres]);

  // Conectar en estrella (Hub central)
  const connectHubAndSpoke = useCallback(() => {
    const spheres = Array.from(spheresMapRef.current.values());
    if (spheres.length < 2) return;

    const hubId = spheres[0].data.id;
    for (let i = 1; i < spheres.length; i++) {
      createTubeBetweenSpheres(hubId, spheres[i].data.id);
    }
  }, [createTubeBetweenSpheres]);

  // Cargar Presets Geométricos (con soporte de tubos libres cortos y largos)
  const loadPreset = useCallback(
    (preset: NetworkPreset) => {
      clearAll();

      if (preset === 'triangle') {
        const s1 = spawnSphere([0, 2.5, 0], '#06b6d4', 0.85); // Grande
        const s2 = spawnSphere([-2.6, 1.0, 1.8], '#ec4899', 0.55); // Estándar
        const s3 = spawnSphere([2.6, 1.0, 1.8], '#a855f7', 0.38); // Mini
        if (s1 && s2 && s3) {
          setTimeout(() => {
            createTubeBetweenSpheres(s1.id, s2.id);
            createTubeBetweenSpheres(s2.id, s3.id);
            createTubeBetweenSpheres(s3.id, s1.id);
            // Demostración: Añadir tubo libre corto y largo en vértices
            addOpenTubeToSphere(s1.id, 'short', [0, 1, 0]);
            addOpenTubeToSphere(s2.id, 'long', [-1, 0.4, 0.5]);
          }, 80);
        }
      } else if (preset === 'ring') {
        const count = 7;
        const radius = 3.6;
        const created: string[] = [];
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const y = 1.3 + Math.sin(angle * 2) * 0.4;
          // Tamaños rítmicos alternados (grande vs compacto)
          const nodeRadius = i % 2 === 0 ? 0.72 : 0.42;
          const sp = spawnSphere([x, y, z], undefined, nodeRadius);
          if (sp) created.push(sp.id);
        }
        setTimeout(() => {
          for (let i = 0; i < created.length; i++) {
            const nextIdx = (i + 1) % created.length;
            createTubeBetweenSpheres(created[i], created[nextIdx]);
          }
          // Añadir tubos radiales libres saliendo del anillo
          if (created[0]) addOpenTubeToSphere(created[0], 'long');
          if (created[3]) addOpenTubeToSphere(created[3], 'short');
        }, 100);
      } else if (preset === 'cube') {
        const size = 1.7;
        const created: string[] = [];
        const offsets = [-size, size];
        let idx = 0;
        offsets.forEach(x => {
          offsets.forEach(y => {
            offsets.forEach(z => {
              const nodeRadius = idx % 2 === 0 ? 0.65 : 0.45;
              const sp = spawnSphere([x, y + 1.8, z], undefined, nodeRadius);
              if (sp) created.push(sp.id);
              idx++;
            });
          });
        });
        setTimeout(() => {
          connectNearestNeighbors(3);
        }, 120);
      } else if (preset === 'atom') {
        // Núcleo central gigante con conductores libres
        const core = spawnSphere([0, 1.8, 0], '#ffffff', 1.15);
        const count = 6;
        const ringRadius = 3.2;
        const satellites: string[] = [];
        const satelliteSizes = [0.4, 0.58, 0.38, 0.62, 0.45, 0.52];
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const x = Math.cos(angle) * ringRadius;
          const z = Math.sin(angle) * ringRadius;
          const y = 1.8 + Math.sin(angle * 3) * 0.8;
          const sat = spawnSphere([x, y, z], undefined, satelliteSizes[i % satelliteSizes.length]);
          if (sat) satellites.push(sat.id);
        }
        setTimeout(() => {
          if (core) {
            satellites.forEach(satId => createTubeBetweenSpheres(core.id, satId));
            addOpenTubeToSphere(core.id, 'long', [0, 1, 0]);
            addOpenTubeToSphere(core.id, 'short', [0, -1, 0]);
          }
        }, 100);
      } else {
        // Constelación estelar por defecto con variedad orgánica de tamaños
        const count = 8;
        const created: string[] = [];
        const organicSizes = [0.4, 0.75, 0.52, 0.95, 0.35, 0.65, 0.85, 0.48];
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
          const dist = 1.8 + Math.random() * 3.2;
          const x = Math.cos(angle) * dist;
          const z = Math.sin(angle) * dist;
          const y = 1.0 + Math.random() * 2.0;
          const nodeRadius = organicSizes[i % organicSizes.length];
          const sp = spawnSphere([x, y, z], undefined, nodeRadius);
          if (sp) created.push(sp.id);
        }
        setTimeout(() => {
          connectNearestNeighbors(2);
          // Demostrar tubos libres sin nodo (corto y largo)
          if (created[0]) addOpenTubeToSphere(created[0], 'short');
          if (created[1]) addOpenTubeToSphere(created[1], 'long');
          if (created[created.length - 1]) addOpenTubeToSphere(created[created.length - 1], 'short');
        }, 100);
      }
    },
    [clearAll, spawnSphere, createTubeBetweenSpheres, connectNearestNeighbors, addOpenTubeToSphere]
  );

  // Modificar color de la esfera seleccionada
  const updateSelectedSphereColor = useCallback(
    (newColor: string) => {
      const selectedId = selectedSphereIdRef.current;
      if (!selectedId) return;

      const runtime = spheresMapRef.current.get(selectedId);
      if (!runtime) return;

      runtime.data.color = newColor;
      updateSphereIllumination(runtime);

      // Actualizar materiales de los tubos asociados
      tubesMapRef.current.forEach(tube => {
        if (tube.data.sphereAId === selectedId) {
          tube.data.colorA = newColor;
          const mat = tube.glowMaterial as THREE.ShaderMaterial;
          if (mat.uniforms && mat.uniforms.uColorA) {
            mat.uniforms.uColorA.value.set(newColor);
          }
        }
        if (tube.data.sphereBId === selectedId) {
          tube.data.colorB = newColor;
          const mat = tube.glowMaterial as THREE.ShaderMaterial;
          if (mat.uniforms && mat.uniforms.uColorB) {
            mat.uniforms.uColorB.value.set(newColor);
          }
        }
      });

      // Actualizar materiales de los tubos libres sin nodo asociados
      openTubesMapRef.current.forEach(ot => {
        if (ot.data.sphereId === selectedId) {
          ot.data.color = newColor;
          if (ot.material.uniforms && ot.material.uniforms.uColorA) {
            ot.material.uniforms.uColorA.value.set(newColor);
          }
          ot.glowMaterial.color.set(newColor);
          (ot.tipCap.material as THREE.MeshStandardMaterial).emissive.set(newColor);
          ot.tipLight.color.set(newColor);
        }
      });

      if (onSelectSphereRef.current) {
        onSelectSphereRef.current({ ...runtime.data });
      }
    },
    [updateSphereIllumination]
  );

  // Modificar individualmente el radio / tamaño de una esfera seleccionada
  const updateSelectedSphereRadius = useCallback(
    (newRadius: number, sphereId?: string) => {
      const targetId = sphereId || selectedSphereIdRef.current;
      if (!targetId) return;

      const runtime = spheresMapRef.current.get(targetId);
      if (!runtime) return;

      const clampedRadius = Math.max(0.25, Math.min(1.4, newRadius));
      runtime.data.radius = clampedRadius;

      // 1. Recrear geometría de la esfera principal
      runtime.mesh.geometry.dispose();
      runtime.mesh.geometry = new THREE.SphereGeometry(clampedRadius, 32, 32);

      // 2. Recrear halo de energía exterior
      runtime.haloMesh.geometry.dispose();
      runtime.haloMesh.geometry = new THREE.SphereGeometry(clampedRadius * 1.25, 24, 24);

      // 3. Recrear anillo de selección
      runtime.selectionRing.geometry.dispose();
      runtime.selectionRing.geometry = new THREE.TorusGeometry(clampedRadius * 1.55, 0.035, 16, 48);

      // 4. Adaptar alcance e intensidad de la PointLight al nuevo tamaño
      runtime.pointLight.distance = Math.max(5.0, clampedRadius * 11.0);
      if (runtime.isConnected) {
        runtime.pointLight.intensity = (clampedRadius / 0.55) * 3.4;
      }

      // 5. Reposicionar tubos abiertos sin nodo conectados a esta esfera (la superficie se expande o contrae)
      openTubesMapRef.current.forEach(openTube => {
        if (openTube.data.sphereId === targetId) {
          updateOpenTubeGeometry(openTube);
        }
      });

      // 6. Sonido sintético con modulación de frecuencia según el radio
      if (settingsRef.current.soundEnabled) {
        soundSynth.playSphereResizeSound(clampedRadius);
      }

      // 7. Notificar a React
      if (onSelectSphereRef.current && selectedSphereIdRef.current === targetId) {
        onSelectSphereRef.current({ ...runtime.data });
      }

      recalculateTelemetry();
    },
    [updateOpenTubeGeometry, recalculateTelemetry]
  );

  // Modificar grosor de los tubos y settings globales
  const updateSettings = useCallback(
    (newSettings: Partial<NetworkSettings>) => {
      settingsRef.current = { ...settingsRef.current, ...newSettings };

      if (newSettings.tubeThickness !== undefined) {
        const thickness = newSettings.tubeThickness;

        // Tubos inter-esferas
        tubesMapRef.current.forEach(tube => {
          tube.cylinderMesh.geometry.dispose();
          tube.glowMesh.geometry.dispose();
          tube.cylinderMesh.geometry = new THREE.CylinderGeometry(
            thickness,
            thickness,
            1,
            16,
            1,
            true
          );
          tube.glowMesh.geometry = new THREE.CylinderGeometry(
            thickness * 1.7,
            thickness * 1.7,
            1,
            16,
            1,
            true
          );
        });

        // Tubos libres sin nodo
        openTubesMapRef.current.forEach(openTube => {
          openTube.cylinderMesh.geometry.dispose();
          openTube.glowMesh.geometry.dispose();
          openTube.cylinderMesh.geometry = new THREE.CylinderGeometry(
            thickness,
            thickness,
            openTube.data.length,
            16,
            1,
            true
          );
          openTube.glowMesh.geometry = new THREE.CylinderGeometry(
            thickness * 1.8,
            thickness * 1.8,
            openTube.data.length,
            16,
            1,
            true
          );
        });
      }

      if (newSettings.energySpeed !== undefined) {
        const speed = newSettings.energySpeed;
        tubesMapRef.current.forEach(tube => {
          const mat = tube.glowMaterial as THREE.ShaderMaterial;
          if (mat.uniforms && mat.uniforms.uSpeed) {
            mat.uniforms.uSpeed.value = speed;
          }
        });
        openTubesMapRef.current.forEach(ot => {
          if (ot.material.uniforms && ot.material.uniforms.uSpeed) {
            ot.material.uniforms.uSpeed.value = speed;
          }
        });
      }

      if (newSettings.glowIntensity !== undefined) {
        const glow = newSettings.glowIntensity;
        tubesMapRef.current.forEach(tube => {
          const mat = tube.glowMaterial as THREE.ShaderMaterial;
          if (mat.uniforms && mat.uniforms.uGlowIntensity) {
            mat.uniforms.uGlowIntensity.value = glow;
          }
        });
        openTubesMapRef.current.forEach(ot => {
          if (ot.material.uniforms && ot.material.uniforms.uGlowIntensity) {
            ot.material.uniforms.uGlowIntensity.value = glow * 1.2;
          }
        });
      }

      if (newSettings.showFloorGrid !== undefined && gridHelperRef.current) {
        gridHelperRef.current.visible = newSettings.showFloorGrid;
      }

      if (newSettings.enableDynamicLights !== undefined) {
        spheresMapRef.current.forEach(s => updateSphereIllumination(s));
      }
    },
    [updateSphereIllumination]
  );

  // Resetear cámara
  const resetCamera = useCallback(() => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 6.5, 9.5);
      controlsRef.current.target.set(0, 1.5, 0);
      controlsRef.current.update();
    }
  }, []);

  // Inicialización de la escena WebGL Three.js
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#07090e');
    scene.fog = new THREE.FogExp2('#07090e', 0.038);
    sceneRef.current = scene;

    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 6.5, 9.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 1.5, 0);
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minDistance = 3.0;
    controls.maxDistance = 22.0;
    controlsRef.current = controls;

    // Iluminación de ambiente sci-fi
    const ambLight = new THREE.AmbientLight('#121826', 1.4);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight('#ffffff', 1.8);
    dirLight.position.set(6, 12, 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 30;
    dirLight.shadow.camera.left = -10;
    dirLight.shadow.camera.right = 10;
    dirLight.shadow.camera.top = 10;
    dirLight.shadow.camera.bottom = -10;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight('#06b6d4', 0.8);
    rimLight.position.set(-8, 4, -6);
    scene.add(rimLight);

    // Suelo reflectante cyberpunk
    const floorGeom = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#0a0d14',
      roughness: 0.25,
      metalness: 0.8,
    });
    const floorMesh = new THREE.Mesh(floorGeom, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0;
    floorMesh.receiveShadow = true;
    floorMesh.userData = { isFloor: true };
    scene.add(floorMesh);
    floorMeshRef.current = floorMesh;

    // Cuadrícula futurista
    const gridHelper = new THREE.GridHelper(40, 40, '#06b6d4', '#1e293b');
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // Cargar preset inicial
    loadPreset('constellation');

    // Resize listener
    const handleResize = () => {
      if (!canvas || !rendererRef.current || !cameraRef.current) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height, false);
    };

    window.addEventListener('resize', handleResize);

    // Bucle de Renderizado Continuo a 60 FPS
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // 1. Actualizar controles de cámara
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // 2. Animar tubos inter-esferas
      tubesMapRef.current.forEach(tube => {
        const mat = tube.glowMaterial as THREE.ShaderMaterial;
        if (mat.uniforms && mat.uniforms.uTime) {
          mat.uniforms.uTime.value = elapsedTime;
        }
      });

      // 3. Animar tubos libres sin nodo
      openTubesMapRef.current.forEach(openTube => {
        if (openTube.material.uniforms && openTube.material.uniforms.uTime) {
          openTube.material.uniforms.uTime.value = elapsedTime;
        }
      });

      // 4. Animar esferas: suave levitación flotante y pulsación de halos
      spheresMapRef.current.forEach(runtime => {
        const floatOffset = Math.sin(elapsedTime * 1.5 + runtime.pulsePhase) * 0.04;
        runtime.mesh.position.y = runtime.baseY + floatOffset;

        if (runtime.isSelected) {
          runtime.selectionRing.rotation.z += delta * 2.0;
        }

        if (runtime.isConnected) {
          const haloPulse = 0.3 + Math.sin(elapsedTime * 3.0 + runtime.pulsePhase) * 0.08;
          (runtime.haloMesh.material as THREE.MeshBasicMaterial).opacity = haloPulse;
        }
      });

      // 5. Actualizar posiciones de tubos para seguir la sutil levitación
      tubesMapRef.current.forEach(tube => {
        updateTubeGeometry(tube);
      });
      openTubesMapRef.current.forEach(openTube => {
        updateOpenTubeGeometry(openTube);
      });

      // 6. Renderizar escena
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      spheresMapRef.current.forEach(s => {
        s.mesh.geometry.dispose();
        (s.mesh.material as THREE.Material).dispose();
      });
      spheresMapRef.current.clear();

      tubesMapRef.current.forEach(t => {
        t.cylinderMesh.geometry.dispose();
        t.glowMesh.geometry.dispose();
      });
      tubesMapRef.current.clear();

      openTubesMapRef.current.forEach(ot => {
        ot.cylinderMesh.geometry.dispose();
        ot.glowMesh.geometry.dispose();
      });
      openTubesMapRef.current.clear();

      floorGeom.dispose();
      floorMat.dispose();
      renderer.dispose();
    };
  }, [loadPreset, updateTubeGeometry, updateOpenTubeGeometry]);

  // Manejo de Interacción del Puntero
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !cameraRef.current || !sceneRef.current) return;

      const rect = canvas.getBoundingClientRect();
      mouseNorm.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNorm.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseNorm, cameraRef.current);

      // 1. Raycast a las esferas
      const sphereMeshes = Array.from(spheresMapRef.current.values()).map(r => r.mesh);
      const sphereHits = raycaster.intersectObjects(sphereMeshes, false);

      if (sphereHits.length > 0) {
        const clickedMesh = sphereHits[0].object as THREE.Mesh;
        const clickedId = clickedMesh.userData.sphereId as string;

        if (isConnectModeRef.current) {
          const currentSelected = selectedSphereIdRef.current;

          if (!currentSelected) {
            selectSphere(clickedId);
          } else if (currentSelected === clickedId) {
            selectSphere(null);
          } else {
            toggleConnection(currentSelected, clickedId);
            selectSphere(clickedId);
          }
        } else {
          selectSphere(clickedId);
          draggingSphereIdRef.current = clickedId;

          if (controlsRef.current) {
            controlsRef.current.enabled = false;
          }

          dragPlane.constant = -clickedMesh.position.y;
        }
        return;
      }

      // 2. Click to Spawn en suelo
      if (clickToSpawnModeRef.current && floorMeshRef.current) {
        const floorHits = raycaster.intersectObject(floorMeshRef.current, false);
        if (floorHits.length > 0) {
          const hitPoint = floorHits[0].point;
          spawnSphere([hitPoint.x, 1.2, hitPoint.z]);
          return;
        }
      }

      // 3. Deseleccionar si hace clic al vacío
      if (!draggingSphereIdRef.current) {
        selectSphere(null);
      }
    },
    [raycaster, mouseNorm, dragPlane, selectSphere, toggleConnection, spawnSphere]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !cameraRef.current || !sceneRef.current) return;

      const rect = canvas.getBoundingClientRect();
      mouseNorm.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNorm.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Si estamos arrastrando una esfera:
      if (draggingSphereIdRef.current) {
        raycaster.setFromCamera(mouseNorm, cameraRef.current);
        const didIntersect = raycaster.ray.intersectPlane(
          dragPlane,
          groundIntersectionPoint
        );
        if (didIntersect) {
          const runtime = spheresMapRef.current.get(draggingSphereIdRef.current);
          if (runtime) {
            const clampedX = Math.max(-12, Math.min(12, groundIntersectionPoint.x));
            const clampedZ = Math.max(-12, Math.min(12, groundIntersectionPoint.z));

            runtime.mesh.position.x = clampedX;
            runtime.mesh.position.z = clampedZ;
            runtime.data.position = [clampedX, runtime.baseY, clampedZ];

            // Actualizar tubos conectados
            tubesMapRef.current.forEach(tube => {
              if (
                tube.data.sphereAId === runtime.data.id ||
                tube.data.sphereBId === runtime.data.id
              ) {
                updateTubeGeometry(tube);
              }
            });

            // Actualizar tubos libres sin nodo
            openTubesMapRef.current.forEach(openTube => {
              if (openTube.data.sphereId === runtime.data.id) {
                updateOpenTubeGeometry(openTube);
              }
            });
          }
        }
        return;
      }

      // Hover feedback sobre nodos
      raycaster.setFromCamera(mouseNorm, cameraRef.current);
      const sphereMeshes = Array.from(spheresMapRef.current.values()).map(r => r.mesh);
      const hits = raycaster.intersectObjects(sphereMeshes, false);

      if (hits.length > 0) {
        canvas.style.cursor = isConnectModeRef.current ? 'crosshair' : 'grab';
      } else {
        canvas.style.cursor = clickToSpawnModeRef.current ? 'cell' : 'default';
      }
    },
    [raycaster, mouseNorm, dragPlane, groundIntersectionPoint, updateTubeGeometry, updateOpenTubeGeometry]
  );

  const handlePointerUp = useCallback(() => {
    if (draggingSphereIdRef.current) {
      draggingSphereIdRef.current = null;
      if (controlsRef.current) {
        controlsRef.current.enabled = true;
      }
    }
  }, []);

  return {
    // Métodos de control interactivo de esferas y tubos inter-nodo
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

    // Métodos de control para Tubos Libres Sin Nodo (cortos y largos)
    addOpenTubeToSphere,
    removeOpenTube,
    toggleOpenTubeLength,

    // Handlers de puntero
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,

    // Modos
    setConnectMode: (active: boolean) => {
      isConnectModeRef.current = active;
    },
    setClickToSpawnMode: (active: boolean) => {
      clickToSpawnModeRef.current = active;
    },
  };
}
