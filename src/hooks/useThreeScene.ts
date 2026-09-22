import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GeometryType, EnvironmentPreset, MaterialDefinition, MaterialParameters, MaterialUniforms } from '../types/materials';
import { createGeometry } from '../utils/geometries';
import { createDefaultUniforms, syncMaterialParameters } from '../materials/materialRegistry';

interface UseThreeSceneProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  selectedMaterial: MaterialDefinition;
  materialParams: MaterialParameters;
  geometryType: GeometryType;
  environmentPreset: EnvironmentPreset;
  onFrameUpdate?: (delta: number) => void;
}

export function useThreeScene({
  canvasRef,
  selectedMaterial,
  materialParams,
  geometryType,
  environmentPreset,
  onFrameUpdate,
}: UseThreeSceneProps) {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const mainMeshRef = useRef<THREE.Mesh | null>(null);
  const pointerLightRef = useRef<THREE.PointLight | null>(null);
  const uniformsRef = useRef<MaterialUniforms | null>(null);
  const lightsGroupRef = useRef<THREE.Group | null>(null);
  const onFrameUpdateRef = useRef(onFrameUpdate);
  const initialSetupRef = useRef({ geometryType, selectedMaterial, materialParams });

  useEffect(() => {
    onFrameUpdateRef.current = onFrameUpdate;
  }, [onFrameUpdate]);

  // 1. Inicialización principal de la escena Three.js
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Crear Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#090a10');
    scene.fog = new THREE.FogExp2('#090a10', 0.04);
    sceneRef.current = scene;

    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.8, 7.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    // OrbitControls para inspección fluida
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // No descender bajo el suelo
    controls.minDistance = 3.5;
    controls.maxDistance = 18.0;
    controlsRef.current = controls;

    // Grupo para luces del entorno
    const lightsGroup = new THREE.Group();
    scene.add(lightsGroup);
    lightsGroupRef.current = lightsGroup;

    // Luz puntual interactiva vinculada al cursor del ratón
    const pointerLight = new THREE.PointLight('#ffffff', 2.0, 10, 2);
    pointerLight.position.set(0, 0, 2.5);
    scene.add(pointerLight);
    pointerLightRef.current = pointerLight;

    // Suelo con cuadrícula reflectante para recibir sombras de pelotas y objeto
    const floorGeo = new THREE.PlaneGeometry(40, 40);
    const floorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0d111a'),
      roughness: 0.4,
      metalness: 0.8,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Cuadrícula cyberpunk auxiliar en el suelo
    const gridHelper = new THREE.GridHelper(36, 36, '#3b82f6', '#1e293b');
    gridHelper.position.y = -1.99;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.45;
    scene.add(gridHelper);

    // Malla principal con el material activo
    const uniforms = createDefaultUniforms();
    uniformsRef.current = uniforms;

    const initialGeo = createGeometry(initialSetupRef.current.geometryType);
    const initialMat = initialSetupRef.current.selectedMaterial.createMaterial(uniforms);
    syncMaterialParameters(uniforms, initialSetupRef.current.materialParams, initialMat);

    const mainMesh = new THREE.Mesh(initialGeo, initialMat);
    mainMesh.castShadow = true;
    mainMesh.receiveShadow = true;
    scene.add(mainMesh);
    mainMeshRef.current = mainMesh;

    // Manejo de redimensionado mediante ResizeObserver
    const handleResize = () => {
      if (!canvas || !renderer || !camera) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);

    // Loop de animación gestionado por Three.js
    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Actualizar tiempo en shader
      if (uniformsRef.current) {
        uniformsRef.current.uTime.value = elapsedTime;
      }

      // Rotación pasiva suave del objeto principal
      if (mainMeshRef.current) {
        mainMeshRef.current.rotation.y += delta * 0.12;
      }

      controls.update();

      // Callback frame update (físicas, cursor lerp)
      if (onFrameUpdateRef.current) {
        onFrameUpdateRef.current(delta);
      }

      renderer.render(scene, camera);
    });

    // Limpieza estricta de memoria WebGL al desmontar
    return () => {
      resizeObserver.disconnect();
      renderer.setAnimationLoop(null);
      controls.dispose();

      floorGeo.dispose();
      floorMat.dispose();

      // Desechar mallas y geometrías
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(m => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      renderer.dispose();
    };
  }, [canvasRef]);

  // 2. Actualizar luces según preset ambiental
  useEffect(() => {
    const lightsGroup = lightsGroupRef.current;
    if (!lightsGroup) return;

    // Limpiar luces anteriores
    while (lightsGroup.children.length > 0) {
      const child = lightsGroup.children[0];
      lightsGroup.remove(child);
    }

    switch (environmentPreset) {
      case 'cyberpunk': {
        const amb = new THREE.AmbientLight('#180c30', 1.2);
        const lightPink = new THREE.DirectionalLight('#ec4899', 3.0);
        lightPink.position.set(5, 6, 4);
        lightPink.castShadow = true;

        const lightCyan = new THREE.DirectionalLight('#06b6d4', 3.0);
        lightCyan.position.set(-5, 3, -3);

        lightsGroup.add(amb, lightPink, lightCyan);
        break;
      }
      case 'sunset': {
        const amb = new THREE.AmbientLight('#2a1208', 1.5);
        const sun = new THREE.DirectionalLight('#f97316', 3.5);
        sun.position.set(6, 4, 5);
        sun.castShadow = true;

        const fill = new THREE.DirectionalLight('#818cf8', 1.2);
        fill.position.set(-4, 2, -4);

        lightsGroup.add(amb, sun, fill);
        break;
      }
      case 'deepSpace': {
        const amb = new THREE.AmbientLight('#050714', 1.0);
        const starLight = new THREE.DirectionalLight('#e0e7ff', 2.0);
        starLight.position.set(2, 8, 3);
        starLight.castShadow = true;

        const rim = new THREE.DirectionalLight('#6366f1', 2.5);
        rim.position.set(-3, -2, -5);

        lightsGroup.add(amb, starLight, rim);
        break;
      }
      case 'studio':
      default: {
        const amb = new THREE.AmbientLight('#111827', 2.0);
        const keyLight = new THREE.DirectionalLight('#ffffff', 2.8);
        keyLight.position.set(4, 7, 5);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;

        const fillLight = new THREE.DirectionalLight('#93c5fd', 1.5);
        fillLight.position.set(-5, 3, 2);

        const rimLight = new THREE.DirectionalLight('#a78bfa', 1.8);
        rimLight.position.set(0, -3, -5);

        lightsGroup.add(amb, keyLight, fillLight, rimLight);
        break;
      }
    }
  }, [environmentPreset]);

  // 3. Actualizar material activo cuando cambia la selección
  useEffect(() => {
    const mesh = mainMeshRef.current;
    if (!mesh || !uniformsRef.current) return;

    const oldMat = mesh.material;
    const newMat = selectedMaterial.createMaterial(uniformsRef.current);
    syncMaterialParameters(uniformsRef.current, materialParams, newMat);

    mesh.material = newMat;

    if (Array.isArray(oldMat)) {
      oldMat.forEach(m => m.dispose());
    } else {
      oldMat.dispose();
    }
  }, [selectedMaterial, materialParams]);

  // 4. Actualizar parámetros en vivo del material
  useEffect(() => {
    const mesh = mainMeshRef.current;
    if (!mesh || !uniformsRef.current) return;
    syncMaterialParameters(uniformsRef.current, materialParams, mesh.material as THREE.Material);
  }, [materialParams]);

  // 5. Actualizar geometría activa
  useEffect(() => {
    const mesh = mainMeshRef.current;
    if (!mesh) return;

    const oldGeo = mesh.geometry;
    mesh.geometry = createGeometry(geometryType);
    oldGeo.dispose();
  }, [geometryType]);

  const resetCamera = useCallback(() => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 0.8, 7.2);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, []);

  return {
    sceneRef,
    cameraRef,
    rendererRef,
    mainMeshRef,
    pointerLightRef,
    uniformsRef,
    resetCamera,
  };
}
