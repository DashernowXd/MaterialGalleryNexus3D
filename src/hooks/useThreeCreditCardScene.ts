import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CardThemeId, CARD_THEMES, createCardFrontTexture, createCardBackTexture } from '../utils/cardTextureGenerator';
import { createCreditCardGeometry } from '../utils/geometries';
import { soundSynth } from '../utils/audioSynth';

interface UseThreeCreditCardSceneProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  activeThemeId: CardThemeId;
}

export function useThreeCreditCardScene({
  canvasRef,
  activeThemeId,
}: UseThreeCreditCardSceneProps) {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cardGroupRef = useRef<THREE.Group | null>(null);
  const frontMeshRef = useRef<THREE.Mesh | null>(null);
  const backMeshRef = useRef<THREE.Mesh | null>(null);
  const coreMeshRef = useRef<THREE.Mesh | null>(null);
  const lightsGroupRef = useRef<THREE.Group | null>(null);
  const silhouettePointLightRef = useRef<THREE.PointLight | null>(null);

  // Estado de rotación e inclinación
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const targetRotationY = useRef<number>(0);
  const currentRotationY = useRef<number>(0);
  const mouseNorm = useMemo(() => ({ current: new THREE.Vector2(0, 0) }), []);
  const isHovered = useRef<boolean>(false);
  const initialThemeRef = useRef(activeThemeId);

  // Inicialización de la escena 3D
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#07090e');
    scene.fog = new THREE.FogExp2('#07090e', 0.008);
    sceneRef.current = scene;

    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    camera.position.set(0, 0.2, 5.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.48;
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 3.0;
    controls.maxDistance = 10.0;
    controls.maxPolarAngle = Math.PI / 1.85;
    controlsRef.current = controls;

    // Grupo contenedor de luces
    const lightsGroup = new THREE.Group();
    scene.add(lightsGroup);
    lightsGroupRef.current = lightsGroup;

    // Suelo reflectante para sombras de la tarjeta
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#040508'),
      roughness: 0.35,
      metalness: 0.8,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.65;
    floor.receiveShadow = true;
    scene.add(floor);

    // ==========================================
    // CONSTRUCCIÓN DEL MODELO 3D DE LA TARJETA
    // ==========================================
    const cardGroup = new THREE.Group();
    cardGroup.position.set(0, 0.15, 0);
    scene.add(cardGroup);
    cardGroupRef.current = cardGroup;

    const theme = CARD_THEMES[initialThemeRef.current] || CARD_THEMES.obsidian;

    // 1. Núcleo metálico perimetral (Bisel y cantos maquinados CNC)
    const coreGeo = createCreditCardGeometry(3.38, 2.13, 0.15, 0.038);
    const coreMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(theme.baseColor),
      roughness: 0.25,
      metalness: 0.95,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.castShadow = true;
    coreMesh.receiveShadow = true;
    cardGroup.add(coreMesh);
    coreMeshRef.current = coreMesh;

    // 2. Anverso (Cara frontal con texturas de alta resolución)
    const frontTex = createCardFrontTexture(theme);
    const faceGeo = new THREE.PlaneGeometry(3.34, 2.09, 32, 32);
    const frontMat = new THREE.MeshPhysicalMaterial({
      map: frontTex,
      roughness: theme.roughness,
      metalness: theme.metalness,
      clearcoat: 0.65,
      clearcoatRoughness: 0.2,
      reflectivity: 0.85,
      emissive: new THREE.Color(theme.accentColor),
      emissiveIntensity: 0.1,
    });
    const frontMesh = new THREE.Mesh(faceGeo, frontMat);
    frontMesh.position.z = 0.021;
    frontMesh.castShadow = true;
    cardGroup.add(frontMesh);
    frontMeshRef.current = frontMesh;

    // 3. Reverso (Cara trasera con banda magnética y panel de firma)
    const backTex = createCardBackTexture(theme);
    const backMat = new THREE.MeshPhysicalMaterial({
      map: backTex,
      roughness: theme.roughness + 0.05,
      metalness: theme.metalness * 0.9,
      clearcoat: 0.45,
      clearcoatRoughness: 0.25,
      emissive: new THREE.Color(theme.accentColor),
      emissiveIntensity: 0.08,
    });
    const backMesh = new THREE.Mesh(faceGeo, backMat);
    backMesh.position.z = -0.021;
    backMesh.rotation.y = Math.PI; // Invertir cara trasera
    backMesh.castShadow = true;
    cardGroup.add(backMesh);
    backMeshRef.current = backMesh;

    // 4. Luz puntual interactiva de silueta vinculada al cursor (más brillante y de mayor radio)
    const silPointLight = new THREE.PointLight(theme.rimColor, 3.2, 8.0, 2);
    silPointLight.position.set(0, 0, 2.5);
    scene.add(silPointLight);
    silhouettePointLightRef.current = silPointLight;

    // ResizeObserver
    const handleResize = () => {
      if (!canvas || !renderer || !camera) return;
      const nw = canvas.clientWidth;
      const nh = canvas.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh, false);
    };

    const resizeObs = new ResizeObserver(handleResize);
    resizeObs.observe(canvas);

    // Loop de animación gestionado por Three.js
    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Suavizado de giro 180° con resorte
      currentRotationY.current = THREE.MathUtils.lerp(
        currentRotationY.current,
        targetRotationY.current,
        delta * 9.0
      );

      // Inclinación magnética hacia el cursor (Magnetic Tilt)
      if (cardGroupRef.current) {
        const tiltX = -mouseNorm.current.y * 0.35;
        const tiltY = mouseNorm.current.x * 0.45;

        // Flotación sutil en el aire
        const levitation = Math.sin(elapsed * 1.5) * 0.04;
        cardGroupRef.current.position.y = 0.15 + levitation;

        cardGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          cardGroupRef.current.rotation.x,
          tiltX,
          delta * 6.0
        );

        // Giro base (flip) + tilt dinámico del ratón
        cardGroupRef.current.rotation.y = currentRotationY.current + tiltY;

        // Balanceo suave en Z
        const tiltZ = -mouseNorm.current.x * 0.1;
        cardGroupRef.current.rotation.z = THREE.MathUtils.lerp(
          cardGroupRef.current.rotation.z,
          tiltZ,
          delta * 5.0
        );
      }

      // Sincronizar luz puntual de silueta con la posición del cursor
      if (silhouettePointLightRef.current) {
        silhouettePointLightRef.current.position.x = mouseNorm.current.x * 2.5;
        silhouettePointLightRef.current.position.y = mouseNorm.current.y * 1.8 + 0.2;
      }

      controls.update();
      renderer.render(scene, camera);
    });

    return () => {
      resizeObs.disconnect();
      renderer.setAnimationLoop(null);
      controls.dispose();

      floorGeo.dispose();
      faceGeo.dispose();
      coreGeo.dispose();
      floorMat.dispose();
      coreMat.dispose();
      frontMat.dispose();
      backMat.dispose();

      scene.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });

      renderer.dispose();
    };
  }, [canvasRef]);

  // Actualizar iluminación según el tema activo
  useEffect(() => {
    const lightsGroup = lightsGroupRef.current;
    if (!lightsGroup) return;

    while (lightsGroup.children.length > 0) {
      lightsGroup.remove(lightsGroup.children[0]);
    }

    const theme = CARD_THEMES[activeThemeId] || CARD_THEMES.obsidian;

    // 1. Luz ambiental de estudio rica para mantener visibles los detalles impresos
    const amb = new THREE.AmbientLight(theme.ambientColor, 2.6);
    lightsGroup.add(amb);

    // 2. Luz cenital frontal clave (Softbox Key Frontal)
    const frontKey = new THREE.DirectionalLight('#ffffff', 4.2);
    frontKey.position.set(1.5, 3.5, 5.0);
    frontKey.castShadow = true;
    frontKey.shadow.mapSize.width = 1024;
    frontKey.shadow.mapSize.height = 1024;
    lightsGroup.add(frontKey);

    // 3. Luz clave trasera (para cuando la tarjeta se voltea 180°)
    const backKey = new THREE.DirectionalLight('#ffffff', 4.0);
    backKey.position.set(-1.5, 3.5, -5.0);
    lightsGroup.add(backKey);

    // 4. Luz de relleno lateral frontal (suaviza sombras y añade brillo especular)
    const frontFill = new THREE.DirectionalLight(theme.foilColor, 2.5);
    frontFill.position.set(-3.8, 1.2, 4.0);
    lightsGroup.add(frontFill);

    // 5. Luz de relleno lateral trasera
    const backFill = new THREE.DirectionalLight(theme.foilColor, 2.2);
    backFill.position.set(3.8, 1.2, -4.0);
    lightsGroup.add(backFill);

    // 6. Luz de silueta izquierda (destaca el bisel lateral izquierdo)
    const rimLeft = new THREE.DirectionalLight(theme.rimColor, 4.2);
    rimLeft.position.set(-5.5, 2.5, 0);
    lightsGroup.add(rimLeft);

    // 7. Luz de silueta derecha (destaca el bisel lateral derecho)
    const rimRight = new THREE.DirectionalLight(theme.accentColor, 4.2);
    rimRight.position.set(5.5, 2.5, 0);
    lightsGroup.add(rimRight);

    // 8. Luz cenital superior para el chaflán perimetral
    const topLight = new THREE.DirectionalLight('#ffffff', 2.8);
    topLight.position.set(0, 5.5, 0.5);
    lightsGroup.add(topLight);

    // Actualizar color e intensidad de la luz puntual que sigue al cursor
    if (silhouettePointLightRef.current) {
      silhouettePointLightRef.current.color.set(theme.rimColor);
      silhouettePointLightRef.current.intensity = 3.6;
      silhouettePointLightRef.current.distance = 8.5;
    }

    // Actualizar texturas y materiales de las caras con emisión suave
    if (frontMeshRef.current) {
      const oldMat = frontMeshRef.current.material as THREE.MeshPhysicalMaterial;
      if (oldMat.map) oldMat.map.dispose();

      const newTex = createCardFrontTexture(theme);
      frontMeshRef.current.material = new THREE.MeshPhysicalMaterial({
        map: newTex,
        roughness: theme.roughness,
        metalness: theme.metalness,
        clearcoat: 0.65,
        clearcoatRoughness: 0.2,
        reflectivity: 0.85,
        emissive: new THREE.Color(theme.accentColor),
        emissiveIntensity: 0.1,
      });
      oldMat.dispose();
    }

    if (backMeshRef.current) {
      const oldMat = backMeshRef.current.material as THREE.MeshPhysicalMaterial;
      if (oldMat.map) oldMat.map.dispose();

      const newTex = createCardBackTexture(theme);
      backMeshRef.current.material = new THREE.MeshPhysicalMaterial({
        map: newTex,
        roughness: theme.roughness + 0.05,
        metalness: theme.metalness * 0.9,
        clearcoat: 0.45,
        clearcoatRoughness: 0.25,
        emissive: new THREE.Color(theme.accentColor),
        emissiveIntensity: 0.08,
      });
      oldMat.dispose();
    }

    if (coreMeshRef.current) {
      const coreMat = coreMeshRef.current.material as THREE.MeshStandardMaterial;
      coreMat.color.set(theme.baseColor);
    }
  }, [activeThemeId]);

  // Manejador de movimiento del cursor para tilt magnético
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    mouseNorm.current.set(x, y);
    isHovered.current = true;
  }, [canvasRef]);

  const handlePointerLeave = useCallback(() => {
    mouseNorm.current.set(0, 0);
    isHovered.current = false;
  }, []);

  /**
   * Voltear la tarjeta 180° suavemente (Anverso / Reverso)
   */
  const toggleFlip = useCallback(() => {
    const next = !isFlipped;
    targetRotationY.current = next ? Math.PI : 0;
    soundSynth.playMechanicalClick(false, 1.25);
    setIsFlipped(next);
  }, [isFlipped]);

  /**
   * Resetear la vista y orientación de la cámara
   */
  const resetCamera = useCallback(() => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 0.2, 5.2);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
      targetRotationY.current = 0;
      setIsFlipped(false);
    }
  }, []);

  return {
    isFlipped,
    toggleFlip,
    resetCamera,
    handlePointerMove,
    handlePointerLeave,
  };
}
