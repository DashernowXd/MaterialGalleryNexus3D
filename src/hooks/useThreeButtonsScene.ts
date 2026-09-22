import { useEffect, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Button3DConfig, Button3DRuntime, ButtonEventLog } from '../types/buttons3d';
import { BUTTONS_3D_CATALOG } from '../materials/buttonsCatalog';
import { getProceduralTexture } from '../utils/proceduralTextures';
import { soundSynth } from '../utils/audioSynth';
import { useDraggableFigures } from './useDraggableFigures';

interface UseThreeButtonsSceneProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onButtonPress: (log: ButtonEventLog) => void;
  onSelectButtonFocus?: (btn: Button3DConfig) => void;
}

export function useThreeButtonsScene({
  canvasRef,
  onButtonPress,
  onSelectButtonFocus,
}: UseThreeButtonsSceneProps) {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const buttonsRuntimeRef = useRef<Map<string, Button3DRuntime>>(new Map());
  const raycaster = useMemo(() => ({ current: new THREE.Raycaster() }), []);
  const mouseNorm = useMemo(() => ({ current: new THREE.Vector2(-999, -999) }), []);
  const hoveredButtonId = useRef<string | null>(null);
  const pressedButtonId = useRef<string | null>(null);
  const updateFiguresRef = useRef<((delta: number) => void) | null>(null);

  // Hook de gestión física e interactiva de figuras 3D arrastrables
  const {
    activeFiguresCount,
    dimLightEnabled,
    spawnFigure,
    clearFigures,
    resetFigures,
    toggleDimLighting,
    handleFigurePointerDown,
    handleFigurePointerMove,
    handleFigurePointerUp,
    updateFigures,
  } = useDraggableFigures({
    sceneRef,
    canvasRef,
  });

  useEffect(() => {
    updateFiguresRef.current = updateFigures;
  }, [updateFigures]);

  // Inicialización de la escena de botones
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#080b12');
    scene.fog = new THREE.FogExp2('#080b12', 0.045);
    sceneRef.current = scene;

    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
    camera.position.set(0, 4.5, 6.5);
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
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minDistance = 3.0;
    controls.maxDistance = 14.0;
    controlsRef.current = controls;

    // Luces de estudio táctil
    const ambLight = new THREE.AmbientLight('#1e2433', 1.8);
    scene.add(ambLight);

    const mainLight = new THREE.DirectionalLight('#ffffff', 2.8);
    mainLight.position.set(5, 8, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 25;
    mainLight.shadow.camera.left = -6;
    mainLight.shadow.camera.right = 6;
    mainLight.shadow.camera.top = 6;
    mainLight.shadow.camera.bottom = -6;
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight('#38bdf8', 1.5);
    rimLight.position.set(-6, 3, -4);
    scene.add(rimLight);

    const warmFill = new THREE.DirectionalLight('#f59e0b', 1.2);
    warmFill.position.set(4, -2, -3);
    scene.add(warmFill);

    // Consola / Tablero base donde se montan los botones
    const consoleGeo = new THREE.BoxGeometry(8.8, 0.4, 5.6);
    const consoleMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#111520'),
      roughness: 0.35,
      metalness: 0.75,
    });
    const consoleMesh = new THREE.Mesh(consoleGeo, consoleMat);
    consoleMesh.position.set(0, -0.2, 0);
    consoleMesh.receiveShadow = true;
    scene.add(consoleMesh);

    // Marco biselado decorativo con acabado de aluminio mecanizado
    const frameGeo = new THREE.BoxGeometry(9.1, 0.25, 5.9);
    const frameMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#334155'),
      roughness: 0.2,
      metalness: 0.9,
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.set(0, -0.28, 0);
    scene.add(frameMesh);

    // Suelo infinito de estudio
    const floorGeo = new THREE.PlaneGeometry(35, 35);
    const floorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#07080e'),
      roughness: 0.6,
      metalness: 0.5,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.42;
    floor.receiveShadow = true;
    scene.add(floor);

    // Generar la botonera 3D a partir del catálogo
    const catalog = BUTTONS_3D_CATALOG;
    const runtimeMap = new Map<string, Button3DRuntime>();

    // Disposición en cuadrícula 4 en fila frontal, 3 en fila trasera
    const positions = [
      new THREE.Vector3(-2.8, 0.0, 1.3),
      new THREE.Vector3(-0.9, 0.0, 1.3),
      new THREE.Vector3(0.9, 0.0, 1.3),
      new THREE.Vector3(2.8, 0.0, 1.3),
      new THREE.Vector3(-1.85, 0.0, -1.1),
      new THREE.Vector3(0.0, 0.0, -1.1),
      new THREE.Vector3(1.85, 0.0, -1.1),
    ];

    catalog.forEach((config, idx) => {
      const pos = positions[idx] || new THREE.Vector3(0, 0, 0);
      const group = new THREE.Group();
      group.position.copy(pos);

      // 1. Bisel / Housing del botón
      let baseGeo: THREE.BufferGeometry;
      if (config.shape === 'round' || config.shape === 'pill') {
        baseGeo = new THREE.CylinderGeometry(0.72, 0.78, 0.28, 48);
      } else if (config.shape === 'hexagon') {
        baseGeo = new THREE.CylinderGeometry(0.74, 0.8, 0.28, 6);
      } else {
        baseGeo = new THREE.BoxGeometry(1.4, 0.28, 1.4);
      }

      const bezelMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#1e293b'),
        roughness: 0.25,
        metalness: 0.9,
      });
      const baseMesh = new THREE.Mesh(baseGeo, bezelMat);
      baseMesh.position.y = 0.14;
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      group.add(baseMesh);

      // 2. Anillo LED indicador luminoso en la base
      const ringGeo = new THREE.TorusGeometry(0.68, 0.035, 16, 48);
      const ringMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(config.glowColor),
        emissive: new THREE.Color(config.glowColor),
        emissiveIntensity: 0.4,
        roughness: 0.2,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = 0.28;
      group.add(ringMesh);

      // 3. Émbolo interactivo (Plunger) del botón
      let plungerGeo: THREE.BufferGeometry;
      if (config.shape === 'round') {
        plungerGeo = new THREE.CylinderGeometry(0.6, 0.62, 0.24, 48);
      } else if (config.shape === 'hexagon') {
        plungerGeo = new THREE.CylinderGeometry(0.62, 0.64, 0.24, 6);
      } else if (config.shape === 'pill') {
        plungerGeo = new THREE.CylinderGeometry(0.58, 0.6, 0.24, 32);
      } else {
        plungerGeo = new THREE.BoxGeometry(1.15, 0.24, 1.15);
      }

      // Material con textura procedural de alta resolución
      const texture = getProceduralTexture(config.textureType, config.glowColor);
      let plungerMat: THREE.Material;

      if (config.textureType === 'frostedGlass') {
        plungerMat = new THREE.MeshPhysicalMaterial({
          map: texture,
          color: new THREE.Color(config.primaryColor),
          metalness: 0.05,
          roughness: 0.15,
          transmission: 0.75,
          thickness: 0.6,
          transparent: true,
          opacity: 0.88,
        });
      } else if (config.textureType === 'arcadeJelly') {
        plungerMat = new THREE.MeshPhysicalMaterial({
          map: texture,
          color: new THREE.Color(config.primaryColor),
          emissive: new THREE.Color(config.glowColor),
          emissiveIntensity: 0.3,
          roughness: 0.1,
          metalness: 0.1,
          transmission: 0.4,
          transparent: true,
        });
      } else {
        plungerMat = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: config.textureType === 'carbonFiber' ? 0.35 : 0.2,
          metalness: config.textureType === 'brushedTitanium' ? 0.95 : 0.6,
        });
      }

      const plungerMesh = new THREE.Mesh(plungerGeo, plungerMat);
      plungerMesh.position.y = 0.34;
      plungerMesh.castShadow = true;
      plungerMesh.receiveShadow = true;
      plungerMesh.userData = { buttonId: config.id };
      group.add(plungerMesh);

      scene.add(group);

      runtimeMap.set(config.id, {
        config,
        baseMesh,
        plungerMesh,
        ringMesh,
        group,
        currentDepression: 0,
        targetDepression: 0,
        isHovered: false,
        isPressed: false,
        isToggled: false,
        clickCount: 0,
      });
    });

    buttonsRuntimeRef.current = runtimeMap;

    // Manejador de redimensionado
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

    // Bucle de animación y física de resorte del émbolo gestionado por Three.js
    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();

      // Suavizado por resorte de la depresión de cada botón
      buttonsRuntimeRef.current.forEach(btn => {
        // Interpolar depresión con resorte
        btn.currentDepression = THREE.MathUtils.lerp(
          btn.currentDepression,
          btn.targetDepression,
          delta * 22.0
        );

        // Altura base del émbolo: 0.34
        // En hover se eleva ligeramente (+0.04)
        // Al presionarse baja según pressDepth
        const hoverElev = btn.isHovered && !btn.isPressed ? 0.04 : 0.0;
        const pressDrop = btn.currentDepression * btn.config.pressDepth;
        btn.plungerMesh.position.y = 0.34 + hoverElev - pressDrop;

        // Brillo del anillo LED
        const ringMat = btn.ringMesh.material as THREE.MeshStandardMaterial;
        const targetGlow = btn.isToggled ? 2.5 : btn.isHovered ? 1.4 : 0.35;
        ringMat.emissiveIntensity = THREE.MathUtils.lerp(ringMat.emissiveIntensity, targetGlow, delta * 12.0);
      });

      // Actualizar figuras 3D arrastrables (física, iluminación tenue, rebote)
      if (updateFiguresRef.current) {
        updateFiguresRef.current(delta);
      }

      controls.update();
      renderer.render(scene, camera);
    });

    return () => {
      resizeObs.disconnect();
      renderer.setAnimationLoop(null);
      controls.dispose();

      consoleGeo.dispose();
      frameGeo.dispose();
      floorGeo.dispose();
      consoleMat.dispose();
      frameMat.dispose();
      floorMat.dispose();

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

  // Manejador de movimiento del ratón para hover sobre los botones 3D y arrastre de figuras
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const camera = cameraRef.current;
    if (!canvas || !camera) return;

    // Si una figura 3D está siendo arrastrada o capturó hover
    if (handleFigurePointerMove(e, camera)) {
      if (hoveredButtonId.current) {
        const prevBtn = buttonsRuntimeRef.current.get(hoveredButtonId.current);
        if (prevBtn) prevBtn.isHovered = false;
        hoveredButtonId.current = null;
      }
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    mouseNorm.current.set(x, y);

    raycaster.current.setFromCamera(mouseNorm.current, camera);

    // Obtener todos los émbolos
    const plungerMeshes: THREE.Mesh[] = [];
    buttonsRuntimeRef.current.forEach(btn => plungerMeshes.push(btn.plungerMesh));

    const intersects = raycaster.current.intersectObjects(plungerMeshes, false);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh;
      const hitBtnId = hitMesh.userData.buttonId as string;

      if (hoveredButtonId.current !== hitBtnId) {
        // Salir del anterior
        if (hoveredButtonId.current) {
          const prevBtn = buttonsRuntimeRef.current.get(hoveredButtonId.current);
          if (prevBtn) prevBtn.isHovered = false;
        }

        // Entrar al nuevo
        const curBtn = buttonsRuntimeRef.current.get(hitBtnId);
        if (curBtn) {
          curBtn.isHovered = true;
          canvas.style.cursor = 'pointer';
        }
        hoveredButtonId.current = hitBtnId;
      }
    } else {
      if (hoveredButtonId.current) {
        const prevBtn = buttonsRuntimeRef.current.get(hoveredButtonId.current);
        if (prevBtn) prevBtn.isHovered = false;
        hoveredButtonId.current = null;
        canvas.style.cursor = 'default';
      }
    }
  }, [canvasRef, handleFigurePointerMove]);

  // Manejador de clic hacia abajo (prioridad a arrastre de figuras, luego botones 3D)
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    const canvas = canvasRef.current;
    const camera = cameraRef.current;
    if (!canvas || !camera) return;

    // 1. Prioridad: Capturar y arrastrar figura 3D
    if (handleFigurePointerDown(e, camera, controlsRef.current)) {
      return;
    }

    // 2. Si no es una figura, verificar pulsación de botón 3D
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    const pointer = new THREE.Vector2(x, y);

    raycaster.current.setFromCamera(pointer, camera);

    const plungerMeshes: THREE.Mesh[] = [];
    buttonsRuntimeRef.current.forEach(btn => plungerMeshes.push(btn.plungerMesh));

    const intersects = raycaster.current.intersectObjects(plungerMeshes, false);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh;
      const hitBtnId = hitMesh.userData.buttonId as string;
      const btn = buttonsRuntimeRef.current.get(hitBtnId);

      if (btn) {
        pressedButtonId.current = hitBtnId;
        btn.isPressed = true;
        btn.targetDepression = 1.0;
        btn.clickCount += 1;

        // Sonido de clic mecánico
        soundSynth.playMechanicalClick(false, btn.config.soundPitch);

        // Lógica de toggle vs momentary
        if (btn.config.behavior === 'toggle') {
          btn.isToggled = !btn.isToggled;
          onButtonPress({
            id: Math.random().toString(36).substring(2, 8),
            buttonName: btn.config.name,
            action: btn.isToggled ? 'toggle_on' : 'toggle_off',
            timestamp: new Date().toLocaleTimeString(),
            texture: btn.config.textureType,
          });
        } else {
          onButtonPress({
            id: Math.random().toString(36).substring(2, 8),
            buttonName: btn.config.name,
            action: 'press',
            timestamp: new Date().toLocaleTimeString(),
            texture: btn.config.textureType,
          });
        }

        if (onSelectButtonFocus) {
          onSelectButtonFocus(btn.config);
        }
      }
    }
  }, [canvasRef, handleFigurePointerDown, onButtonPress, onSelectButtonFocus]);

  // Manejador de soltar clic (liberar émbolo con resorte y soltar figuras con impulso)
  const handlePointerUp = useCallback(() => {
    // Soltar figura 3D si estaba siendo arrastrada
    handleFigurePointerUp(controlsRef.current);

    if (pressedButtonId.current) {
      const btn = buttonsRuntimeRef.current.get(pressedButtonId.current);
      if (btn) {
        btn.isPressed = false;
        // Si es toggle y está activado, se queda en depresión parcial (0.55)
        if (btn.config.behavior === 'toggle' && btn.isToggled) {
          btn.targetDepression = 0.55;
        } else {
          btn.targetDepression = 0.0;
        }

        // Sonido de liberación mecánica
        soundSynth.playMechanicalClick(true, btn.config.soundPitch * 1.15);

        if (btn.config.behavior === 'momentary') {
          onButtonPress({
            id: Math.random().toString(36).substring(2, 8),
            buttonName: btn.config.name,
            action: 'release',
            timestamp: new Date().toLocaleTimeString(),
            texture: btn.config.textureType,
          });
        }
      }
      pressedButtonId.current = null;
    }
  }, [handleFigurePointerUp, onButtonPress]);

  // Centrar cámara en un botón seleccionado para inspeccionar su textura de cerca
  const focusOnButton = useCallback((buttonId: string) => {
    const btn = buttonsRuntimeRef.current.get(buttonId);
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (btn && camera && controls) {
      const targetPos = btn.group.position;
      controls.target.set(targetPos.x, targetPos.y + 0.3, targetPos.z);
      camera.position.set(targetPos.x, targetPos.y + 2.0, targetPos.z + 2.5);
      controls.update();
    }
  }, []);

  const resetView = useCallback(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (camera && controls) {
      controls.target.set(0, 0, 0);
      camera.position.set(0, 4.5, 6.5);
      controls.update();
    }
  }, []);

  return {
    handlePointerMove,
    handlePointerDown,
    handlePointerUp,
    focusOnButton,
    resetView,
    buttonsRuntimeRef,
    activeFiguresCount,
    dimLightEnabled,
    spawnFigure,
    clearFigures,
    resetFigures,
    toggleDimLighting,
  };
}
