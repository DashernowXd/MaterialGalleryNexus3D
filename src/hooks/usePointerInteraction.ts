import { useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { MaterialUniforms } from '../types/materials';
import { PhysicsBall } from '../types/physics';
import { soundSynth } from '../utils/audioSynth';

interface UsePointerInteractionProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | null>;
  mainMeshRef: React.MutableRefObject<THREE.Mesh | null>;
  pointerLightRef: React.MutableRefObject<THREE.PointLight | null>;
  uniformsRef: React.MutableRefObject<MaterialUniforms | null>;
  ballsRef?: React.MutableRefObject<PhysicsBall[]>;
  onSpawnBall: (pos?: THREE.Vector3, vel?: THREE.Vector3) => void;
}

export function usePointerInteraction({
  canvasRef,
  cameraRef,
  mainMeshRef,
  pointerLightRef,
  uniformsRef,
  ballsRef,
  onSpawnBall,
}: UsePointerInteractionProps) {
  const mouseNormRef = useMemo(() => ({ current: new THREE.Vector2(0, 0) }), []);
  const targetMouse3D = useMemo(() => ({ current: new THREE.Vector3(0, 0, 2.5) }), []);
  const currentMouse3D = useMemo(() => ({ current: new THREE.Vector3(0, 0, 2.5) }), []);
  const lastMousePos = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const mouseVelocity = useRef<number>(0);
  const isHoveredRef = useRef<boolean>(false);
  const raycaster = useMemo(() => ({ current: new THREE.Raycaster() }), []);

  // Estado para el arrastre de pelotas
  const draggedBallRef = useRef<PhysicsBall | null>(null);
  const dragPlaneRef = useMemo(() => ({ current: new THREE.Plane() }), []);
  const dragOffsetRef = useMemo(() => ({ current: new THREE.Vector3() }), []);
  const lastDragPos = useMemo(() => ({ current: new THREE.Vector3() }), []);
  const instantDragVelocity = useMemo(() => ({ current: new THREE.Vector3() }), []);
  const lastDragTime = useRef<number>(0);

  /**
   * Manejador de movimiento del cursor
   */
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const camera = cameraRef.current;
      if (!canvas || !camera) return;

      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      mouseNormRef.current.set(x, y);

      // Calcular velocidad del cursor
      const now = performance.now();
      const dt = Math.max((now - lastMousePos.current.time) / 1000, 0.001);
      const dist = Math.hypot(x - lastMousePos.current.x, y - lastMousePos.current.y);
      const instantVelocity = dist / dt;
      mouseVelocity.current = THREE.MathUtils.lerp(mouseVelocity.current, instantVelocity, 0.3);

      lastMousePos.current = { x, y, time: now };
      raycaster.current.setFromCamera(mouseNormRef.current, camera);

      // 1. Si estamos arrastrando una pelota activa
      if (draggedBallRef.current) {
        const ball = draggedBallRef.current;
        const intersectPoint = new THREE.Vector3();

        if (raycaster.current.ray.intersectPlane(dragPlaneRef.current, intersectPoint)) {
          const dragDt = Math.max((now - lastDragTime.current) / 1000, 0.001);
          const moveDelta = new THREE.Vector3().subVectors(intersectPoint, lastDragPos.current);
          const vel = moveDelta.divideScalar(dragDt);
          instantDragVelocity.current.lerp(vel, 0.45);

          lastDragPos.current.copy(intersectPoint);
          lastDragTime.current = now;

          const desiredPos = new THREE.Vector3().subVectors(intersectPoint, dragOffsetRef.current);
          desiredPos.y = Math.max(desiredPos.y, -2.0 + ball.radius);

          ball.position.copy(desiredPos);
          ball.mesh.position.copy(desiredPos);
          ball.velocity.set(0, 0, 0);
        }

        canvas.style.cursor = 'grabbing';
        return;
      }

      // 2. Si hay pelotas en la escena, evaluar hover sobre ellas
      if (ballsRef?.current && ballsRef.current.length > 0) {
        const ballMeshes = ballsRef.current.map(b => b.mesh);
        const ballIntersects = raycaster.current.intersectObjects(ballMeshes, false);
        if (ballIntersects.length > 0) {
          canvas.style.cursor = 'grab';
          return;
        }
      }

      // 3. Raycast contra el objeto principal si no hay pelota bajo el cursor
      const mesh = mainMeshRef.current;
      if (mesh) {
        const intersects = raycaster.current.intersectObject(mesh, false);

        if (intersects.length > 0) {
          isHoveredRef.current = true;
          targetMouse3D.current.copy(intersects[0].point);
          canvas.style.cursor = 'crosshair';
        } else {
          isHoveredRef.current = false;
          // Si no golpea la malla, proyectar sobre el plano frontal
          const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
          const planeIntersect = new THREE.Vector3();
          raycaster.current.ray.intersectPlane(planeZ, planeIntersect);
          targetMouse3D.current.copy(planeIntersect);
          canvas.style.cursor = 'default';
        }
      }
    },
    [canvasRef, cameraRef, mainMeshRef, ballsRef]
  );

  /**
   * Manejador de clic (disparo de pelota o agarre de pelota existente)
   */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      // Ignorar clics secundarios si no es botón izquierdo
      if (e.button !== 0) return;

      const canvas = canvasRef.current;
      const camera = cameraRef.current;
      const mesh = mainMeshRef.current;
      const uniforms = uniformsRef.current;
      if (!canvas || !camera) return;

      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const pointer = new THREE.Vector2(x, y);

      raycaster.current.setFromCamera(pointer, camera);

      // 1. Evaluar si se hizo clic en una pelota física existente para arrastrarla
      if (ballsRef?.current && ballsRef.current.length > 0) {
        const ballMeshes = ballsRef.current.map(b => b.mesh);
        const ballIntersects = raycaster.current.intersectObjects(ballMeshes, false);

        if (ballIntersects.length > 0) {
          const hit = ballIntersects[0];
          const hitMesh = hit.object;
          const foundBall = ballsRef.current.find(b => b.mesh === hitMesh);

          if (foundBall) {
            draggedBallRef.current = foundBall;
            foundBall.isDragged = true;

            const cameraDir = new THREE.Vector3();
            camera.getWorldDirection(cameraDir).negate();
            dragPlaneRef.current.setFromNormalAndCoplanarPoint(cameraDir, hit.point);
            dragOffsetRef.current.subVectors(hit.point, foundBall.position);

            lastDragPos.current.copy(hit.point);
            lastDragTime.current = performance.now();
            instantDragVelocity.current.set(0, 0, 0);

            canvas.style.cursor = 'grabbing';
            soundSynth.playGrabSound();
            return; // Se atrapó una pelota, omitir shockwave
          }
        }
      }

      // 2. Si no es una pelota existente, proceder con clic estándar (deformación + soltar nueva pelota)
      let clickWorldPos = currentMouse3D.current.clone();

      if (mesh) {
        const intersects = raycaster.current.intersectObject(mesh, false);
        if (intersects.length > 0) {
          clickWorldPos = intersects[0].point.clone();
        }
      }

      // Activar pulso de choque en el shader del material
      if (uniforms) {
        uniforms.uClickPulse.value = 1.0;
        uniforms.uClickPosition.value.copy(clickWorldPos);
      }

      // Efecto sonoro de shockwave
      soundSynth.playShockwaveSound();

      // Soltar pelota con impulso desde la posición del puntero
      const dropDirection = new THREE.Vector3(
        (Math.random() - 0.5) * 3.0,
        2.5 + Math.random() * 2.0,
        (Math.random() - 0.5) * 3.0
      );
      onSpawnBall(clickWorldPos, dropDirection);
    },
    [canvasRef, cameraRef, mainMeshRef, uniformsRef, ballsRef, onSpawnBall]
  );

  /**
   * Manejador de soltar el clic (liberar pelota arrastrada con inercia)
   */
  const handlePointerUp = useCallback(() => {
    if (draggedBallRef.current) {
      const ball = draggedBallRef.current;
      ball.isDragged = false;

      const throwImpulse = instantDragVelocity.current.clone();
      throwImpulse.clampLength(0, 14);
      ball.velocity.copy(throwImpulse);

      soundSynth.playThrowSound(throwImpulse.length() / 4);
      draggedBallRef.current = null;

      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'default';
      }
    }
  }, [canvasRef]);

  /**
   * Actualización suave en el loop de animación
   */
  const updatePointerState = useCallback(
    (delta: number) => {
      const uniforms = uniformsRef.current;

      // Suavizado de posición 3D (lerp)
      currentMouse3D.current.lerp(targetMouse3D.current, delta * 12.0);

      // Decaimiento de velocidad
      mouseVelocity.current *= Math.pow(0.92, delta * 60);

      // Sincronizar luz puntual que sigue al puntero
      if (pointerLightRef.current) {
        pointerLightRef.current.position.set(
          currentMouse3D.current.x,
          currentMouse3D.current.y,
          currentMouse3D.current.z + 1.2
        );
        pointerLightRef.current.intensity = isHoveredRef.current ? 3.0 : 1.5;
      }

      // Sincronizar mallas con rotación sutil orientada al cursor (magnetic tilt)
      if (mainMeshRef.current) {
        const targetRotX = -mouseNormRef.current.y * 0.25;
        const targetRotY = mouseNormRef.current.x * 0.35;
        mainMeshRef.current.rotation.x = THREE.MathUtils.lerp(mainMeshRef.current.rotation.x, targetRotX, delta * 4.0);
        mainMeshRef.current.rotation.y = THREE.MathUtils.lerp(mainMeshRef.current.rotation.y, targetRotY, delta * 4.0);
      }

      // Actualizar uniformes del shader
      if (uniforms) {
        uniforms.uMouse.value.copy(mouseNormRef.current);
        uniforms.uMouse3D.value.copy(currentMouse3D.current);
        uniforms.uMouseVelocity.value = mouseVelocity.current;
        uniforms.uHover.value = THREE.MathUtils.lerp(
          uniforms.uHover.value,
          isHoveredRef.current ? 1.0 : 0.0,
          delta * 8.0
        );

        // Decaimiento de onda de choque tras el clic
        if (uniforms.uClickPulse.value > 0.001) {
          uniforms.uClickPulse.value = Math.max(0, uniforms.uClickPulse.value - delta * 1.8);
        }
      }
    },
    [pointerLightRef, mainMeshRef, uniformsRef]
  );

  return {
    handlePointerMove,
    handlePointerDown,
    handlePointerUp,
    updatePointerState,
  };
}
