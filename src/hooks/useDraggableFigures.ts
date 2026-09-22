import { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DraggableFigureRuntime, DraggableShapeType } from '../types/draggableFigures';
import { createDraggableFigure } from '../utils/figureFactory';
import { soundSynth } from '../utils/audioSynth';

interface UseDraggableFiguresProps {
  sceneRef: React.MutableRefObject<THREE.Scene | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

// Dimensiones de la mesa de consola en la escena de botones
const DESK_BOUNDS = {
  minX: -4.4,
  maxX: 4.4,
  minZ: -2.8,
  maxZ: 2.8,
  deskY: 0.0,     // Altura superior de la mesa
  floorY: -0.42,  // Altura del suelo general
};

export function useDraggableFigures({ sceneRef, canvasRef }: UseDraggableFiguresProps) {
  const figuresRef = useRef<DraggableFigureRuntime[]>([]);
  const [activeFiguresCount, setActiveFiguresCount] = useState<number>(0);
  const [dimLightEnabled, setDimLightEnabled] = useState<boolean>(true);

  // Estado interno para el arrastre
  const draggedFigureRef = useRef<DraggableFigureRuntime | null>(null);
  const hoveredFigureRef = useRef<DraggableFigureRuntime | null>(null);
  const dragPlaneRef = useMemo(() => ({ current: new THREE.Plane() }), []);
  const dragOffsetRef = useMemo(() => ({ current: new THREE.Vector3() }), []);
  const raycasterRef = useMemo(() => ({ current: new THREE.Raycaster() }), []);
  const lastMouseWorldPos = useMemo(() => ({ current: new THREE.Vector3() }), []);
  const instantDragVelocity = useMemo(() => ({ current: new THREE.Vector3() }), []);
  const lastDragTime = useRef<number>(0);

  /**
   * Genera y añade una figura al escenario
   */
  const spawnFigure = useCallback(
    (shape: DraggableShapeType = 'sphere', customPos?: THREE.Vector3) => {
      const scene = sceneRef.current;
      if (!scene) return null;

      const figure = createDraggableFigure(shape, customPos);
      if (!dimLightEnabled) {
        figure.light.intensity = 0;
      }

      scene.add(figure.group);
      figuresRef.current.push(figure);
      setActiveFiguresCount(figuresRef.current.length);
      return figure;
    },
    [sceneRef, dimLightEnabled]
  );

  /**
   * Limpia todas las figuras activas
   */
  const clearFigures = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    figuresRef.current.forEach(fig => {
      scene.remove(fig.group);
      fig.mesh.geometry.dispose();
      if (Array.isArray(fig.mesh.material)) {
        fig.mesh.material.forEach(m => m.dispose());
      } else {
        fig.mesh.material.dispose();
      }
      fig.glowHalo.geometry.dispose();
      (fig.glowHalo.material as THREE.Material).dispose();
      fig.light.dispose();
    });

    figuresRef.current = [];
    draggedFigureRef.current = null;
    hoveredFigureRef.current = null;
    setActiveFiguresCount(0);
  }, [sceneRef]);

  /**
   * Resetea las figuras a la configuración inicial estética
   */
  const resetFigures = useCallback(() => {
    clearFigures();
    // 4 figuras bellamente distribuidas en el entorno
    spawnFigure('sphere', new THREE.Vector3(-3.2, 0.38, 0.4));
    spawnFigure('cube', new THREE.Vector3(3.2, 0.38, 0.4));
    spawnFigure('octahedron', new THREE.Vector3(-2.8, 0.42, -1.8));
    spawnFigure('torus', new THREE.Vector3(2.8, 0.42, -1.8));
    spawnFigure('icosahedron', new THREE.Vector3(0.0, 1.4, -2.2));
  }, [clearFigures, spawnFigure]);

  // Inicializar figuras por defecto al montar
  useEffect(() => {
    if (sceneRef.current && figuresRef.current.length === 0) {
      resetFigures();
    }
  }, [sceneRef, resetFigures]);

  /**
   * Alternar o configurar la iluminación tenue
   */
  const toggleDimLighting = useCallback(() => {
    setDimLightEnabled(prev => {
      const next = !prev;
      figuresRef.current.forEach(fig => {
        fig.light.intensity = next ? fig.config.lightIntensity : 0;
      });
      return next;
    });
  }, []);

  /**
   * Interceptar PointerDown para arrastre de figuras
   */
  const handleFigurePointerDown = useCallback(
    (
      e: React.PointerEvent<HTMLCanvasElement>,
      camera: THREE.PerspectiveCamera,
      controls: OrbitControls | null
    ): boolean => {
      if (e.button !== 0) return false;
      const canvas = canvasRef.current;
      if (!canvas) return false;

      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const mouse = new THREE.Vector2(x, y);

      raycasterRef.current.setFromCamera(mouse, camera);

      // Raycast contra todas las mallas de figuras arrastrables
      const meshes: THREE.Mesh[] = [];
      const meshToFigureMap = new Map<THREE.Mesh, DraggableFigureRuntime>();

      figuresRef.current.forEach(fig => {
        meshes.push(fig.mesh);
        meshToFigureMap.set(fig.mesh, fig);
      });

      const intersects = raycasterRef.current.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        const hit = intersects[0];
        const hitMesh = hit.object as THREE.Mesh;
        const figure = meshToFigureMap.get(hitMesh);

        if (figure) {
          draggedFigureRef.current = figure;
          figure.isDragged = true;

          // Crear plano de arrastre paralelo a la vista de la cámara pasando por el punto de contacto
          const cameraDir = new THREE.Vector3();
          camera.getWorldDirection(cameraDir).negate(); // Normal hacia la cámara
          dragPlaneRef.current.setFromNormalAndCoplanarPoint(cameraDir, hit.point);

          // Guardar offset para que el objeto no salte abruptamente
          dragOffsetRef.current.subVectors(hit.point, figure.group.position);

          // Desactivar controles de órbita mientras se arrastra
          if (controls) {
            controls.enabled = false;
          }

          canvas.style.cursor = 'grabbing';
          soundSynth.playGrabSound();

          lastMouseWorldPos.current.copy(hit.point);
          lastDragTime.current = performance.now();
          instantDragVelocity.current.set(0, 0, 0);

          return true; // Se consumió el evento de clic
        }
      }

      return false;
    },
    [canvasRef]
  );

  /**
   * Interceptar PointerMove para arrastre continuo y detección de hover
   */
  const handleFigurePointerMove = useCallback(
    (
      e: React.PointerEvent<HTMLCanvasElement>,
      camera: THREE.PerspectiveCamera
    ): boolean => {
      const canvas = canvasRef.current;
      if (!canvas) return false;

      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const mouse = new THREE.Vector2(x, y);

      raycasterRef.current.setFromCamera(mouse, camera);

      // 1. Si estamos arrastrando una figura activa
      if (draggedFigureRef.current) {
        const figure = draggedFigureRef.current;
        const intersectPoint = new THREE.Vector3();

        if (raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, intersectPoint)) {
          const now = performance.now();
          const dt = Math.max((now - lastDragTime.current) / 1000, 0.001);

          // Calcular velocidad de lanzamiento
          const moveDelta = new THREE.Vector3().subVectors(intersectPoint, lastMouseWorldPos.current);
          const vel = moveDelta.divideScalar(dt);
          instantDragVelocity.current.lerp(vel, 0.45);

          lastMouseWorldPos.current.copy(intersectPoint);
          lastDragTime.current = now;

          // Destino deseado con compensación de offset
          const desiredPos = new THREE.Vector3().subVectors(intersectPoint, dragOffsetRef.current);

          // Evitar que penetre bajo el suelo
          const minAllowedY = DESK_BOUNDS.floorY + figure.radius;
          desiredPos.y = Math.max(desiredPos.y, minAllowedY);

          // Lerp suave hacia la posición del cursor
          figure.group.position.lerp(desiredPos, 0.5);
          figure.position.copy(figure.group.position);
          figure.velocity.set(0, 0, 0);
        }

        canvas.style.cursor = 'grabbing';
        return true;
      }

      // 2. Si no estamos arrastrando, evaluar hover sobre figuras
      const meshes: THREE.Mesh[] = [];
      const meshToFigureMap = new Map<THREE.Mesh, DraggableFigureRuntime>();

      figuresRef.current.forEach(fig => {
        meshes.push(fig.mesh);
        meshToFigureMap.set(fig.mesh, fig);
      });

      const intersects = raycasterRef.current.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const figure = meshToFigureMap.get(hitMesh);

        if (figure) {
          if (hoveredFigureRef.current !== figure) {
            if (hoveredFigureRef.current) {
              hoveredFigureRef.current.isHovered = false;
            }
            figure.isHovered = true;
            hoveredFigureRef.current = figure;
          }
          canvas.style.cursor = 'grab';
          return true;
        }
      } else {
        if (hoveredFigureRef.current) {
          hoveredFigureRef.current.isHovered = false;
          hoveredFigureRef.current = null;
        }
      }

      return false;
    },
    [canvasRef]
  );

  /**
   * Finalizar arrastre al soltar el puntero (liberar con inercia y física de rebote)
   */
  const handleFigurePointerUp = useCallback(
    (controls: OrbitControls | null): boolean => {
      const canvas = canvasRef.current;

      if (draggedFigureRef.current) {
        const figure = draggedFigureRef.current;
        figure.isDragged = false;

        // Asignar velocidad de impulso basada en el arrastre
        const throwImpulse = instantDragVelocity.current.clone();
        // Limitar para evitar velocidades astronómicas
        throwImpulse.clampLength(0, 12);
        figure.velocity.copy(throwImpulse);

        soundSynth.playThrowSound(throwImpulse.length() / 4);

        if (controls) {
          controls.enabled = true;
        }

        draggedFigureRef.current = null;
        if (canvas) {
          canvas.style.cursor = hoveredFigureRef.current ? 'grab' : 'default';
        }

        return true;
      }

      return false;
    },
    [canvasRef]
  );

  /**
   * Bucle frame a frame: gravedad, colisión con tablero/suelo, inercia e iluminación dinámica
   */
  const updateFigures = useCallback(
    (delta: number) => {
      const dt = Math.min(delta, 0.05);

      figuresRef.current.forEach(fig => {
        const meshMat = fig.mesh.material as THREE.MeshPhysicalMaterial;

        // 1. Efectos visuales de iluminación tenue y hover
        const targetEmissive = fig.isDragged
          ? 0.95
          : fig.isHovered
          ? 0.72
          : 0.38;

        meshMat.emissiveIntensity = THREE.MathUtils.lerp(
          meshMat.emissiveIntensity,
          targetEmissive,
          dt * 14.0
        );

        if (dimLightEnabled) {
          const targetLightIntensity = fig.isDragged
            ? fig.config.lightIntensity * 2.2
            : fig.isHovered
            ? fig.config.lightIntensity * 1.5
            : fig.config.lightIntensity;

          fig.light.intensity = THREE.MathUtils.lerp(
            fig.light.intensity,
            targetLightIntensity,
            dt * 12.0
          );
        }

        // 2. Escala sutil reactiva en hover / drag
        const targetScale = fig.isDragged ? 1.12 : fig.isHovered ? 1.07 : 1.0;
        fig.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), dt * 10);

        // Halo pulsante exterior
        fig.glowHalo.rotation.y += dt * 0.4;
        fig.glowHalo.rotation.x += dt * 0.2;

        // Si está siendo arrastrado por el usuario, no se le aplica gravedad
        if (fig.isDragged) {
          fig.mesh.rotation.x += instantDragVelocity.current.z * dt * 0.5;
          fig.mesh.rotation.z -= instantDragVelocity.current.x * dt * 0.5;
          return;
        }

        // 3. Física de caída e inercia libre
        // Gravedad suave
        fig.velocity.y += -18.0 * dt;
        // Resistencia del aire
        fig.velocity.multiplyScalar(Math.pow(0.985, dt * 60));

        // Integrar posición
        fig.position.addScaledVector(fig.velocity, dt);

        // 4. Detección de suelo: Consola vs Suelo general
        const isOnDesk =
          fig.position.x >= DESK_BOUNDS.minX &&
          fig.position.x <= DESK_BOUNDS.maxX &&
          fig.position.z >= DESK_BOUNDS.minZ &&
          fig.position.z <= DESK_BOUNDS.maxZ;

        const surfaceLevel = isOnDesk ? DESK_BOUNDS.deskY : DESK_BOUNDS.floorY;
        const minHeight = surfaceLevel + fig.radius;

        if (fig.position.y <= minHeight) {
          fig.position.y = minHeight;
          const impactSpeed = Math.abs(fig.velocity.y);

          if (impactSpeed > 0.45) {
            fig.velocity.y = impactSpeed * 0.56; // Rebote elástico
            fig.velocity.x *= 0.86; // Fricción de contacto
            fig.velocity.z *= 0.86;

            if (impactSpeed > 0.8) {
              soundSynth.playFigureBounceSound(impactSpeed);
            }
          } else {
            fig.velocity.y = 0;
            fig.velocity.x *= 0.93;
            fig.velocity.z *= 0.93;
            fig.isGrounded = true;
          }
        }

        // 5. Límites perimetrales del mundo para que no se pierdan
        const maxDist = 9.0;
        const dist = Math.hypot(fig.position.x, fig.position.z);
        if (dist > maxDist) {
          const angle = Math.atan2(fig.position.z, fig.position.x);
          fig.position.x = Math.cos(angle) * maxDist;
          fig.position.z = Math.sin(angle) * maxDist;
          fig.velocity.x *= -0.5;
          fig.velocity.z *= -0.5;
        }

        // 6. Rotación autónoma y rodamiento
        fig.mesh.rotation.x += (fig.rotationSpeed.x + fig.velocity.z * 1.5) * dt;
        fig.mesh.rotation.y += fig.rotationSpeed.y * dt;
        fig.mesh.rotation.z += (fig.rotationSpeed.z - fig.velocity.x * 1.5) * dt;

        // Elevación levitatoria sutil en reposo
        const floatLevitation = fig.isHovered ? 0.08 : 0;
        fig.group.position.set(
          fig.position.x,
          fig.position.y + floatLevitation,
          fig.position.z
        );
      });
    },
    [dimLightEnabled]
  );

  return {
    figuresRef,
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
  };
}
