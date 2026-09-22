import { useState, useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { PhysicsBall, PhysicsWorldConfig, BallMaterialStyle } from '../types/physics';
import { soundSynth } from '../utils/audioSynth';
import { randomRange } from '../utils/math';

interface UsePhysicsBallsProps {
  sceneRef: React.MutableRefObject<THREE.Scene | null>;
  activeMaterialColor: string;
}

const DEFAULT_CONFIG: PhysicsWorldConfig = {
  gravity: -22.0,
  airResistance: 0.992,
  restitution: 0.74,
  floorLevel: -2.0,
  boundaryRadius: 7.0,
  maxBalls: 75,
};

export function usePhysicsBalls({ sceneRef, activeMaterialColor }: UsePhysicsBallsProps) {
  const [totalDropped, setTotalDropped] = useState<number>(0);
  const [activeBallCount, setActiveBallCount] = useState<number>(0);
  const [ballStyle, setBallStyle] = useState<BallMaterialStyle>('matchCurrent');
  const [gravity, setGravity] = useState<number>(DEFAULT_CONFIG.gravity);
  const [restitution, setRestitution] = useState<number>(DEFAULT_CONFIG.restitution);

  const ballsRef = useRef<PhysicsBall[]>([]);
  const ballGeometryRef = useRef<THREE.SphereGeometry | null>(null);

  // Inicializar geometría compartida para optimizar memoria GPU
  useEffect(() => {
    ballGeometryRef.current = new THREE.SphereGeometry(0.35, 24, 24);

    return () => {
      if (ballGeometryRef.current) {
        ballGeometryRef.current.dispose();
      }
    };
  }, []);

  // Generador de materiales de pelotas
  const createBallMaterial = useCallback(
    (style: BallMaterialStyle, baseColorHex: string): THREE.Material => {
      switch (style) {
        case 'chrome':
          return new THREE.MeshStandardMaterial({
            color: new THREE.Color('#d1d5db'),
            metalness: 0.98,
            roughness: 0.08,
          });
        case 'golden':
          return new THREE.MeshStandardMaterial({
            color: new THREE.Color('#f59e0b'),
            metalness: 0.95,
            roughness: 0.15,
          });
        case 'crystalGlass':
          return new THREE.MeshPhysicalMaterial({
            color: new THREE.Color('#38bdf8'),
            metalness: 0.1,
            roughness: 0.05,
            transmission: 0.85,
            thickness: 0.8,
            transparent: true,
            opacity: 0.9,
          });
        case 'neonGlow': {
          const neonColors = ['#ec4899', '#06b6d4', '#10b981', '#a855f7', '#f43f5e', '#3b82f6'];
          const pickedColor = neonColors[Math.floor(Math.random() * neonColors.length)];
          return new THREE.MeshStandardMaterial({
            color: new THREE.Color(pickedColor),
            emissive: new THREE.Color(pickedColor),
            emissiveIntensity: 0.7,
            roughness: 0.2,
            metalness: 0.4,
          });
        }
        case 'matchCurrent':
        default: {
          const c = new THREE.Color(baseColorHex);
          return new THREE.MeshStandardMaterial({
            color: c,
            emissive: c.clone().multiplyScalar(0.25),
            roughness: 0.18,
            metalness: 0.85,
          });
        }
      }
    },
    []
  );

  /**
   * Suelta una pelota 3D en la escena física
   */
  const spawnBall = useCallback(
    (customPosition?: THREE.Vector3, customVelocity?: THREE.Vector3) => {
      const scene = sceneRef.current;
      if (!scene || !ballGeometryRef.current) return;

      // Limitar cantidad máxima de pelotas activas para mantener 60 FPS
      if (ballsRef.current.length >= DEFAULT_CONFIG.maxBalls) {
        const oldest = ballsRef.current.shift();
        if (oldest) {
          scene.remove(oldest.mesh);
          if (Array.isArray(oldest.mesh.material)) {
            oldest.mesh.material.forEach(m => m.dispose());
          } else {
            oldest.mesh.material.dispose();
          }
        }
      }

      // Radio de la pelota con ligera variación
      const radius = randomRange(0.28, 0.42);
      const scale = radius / 0.35;

      const material = createBallMaterial(ballStyle, activeMaterialColor);
      const mesh = new THREE.Mesh(ballGeometryRef.current, material);
      mesh.scale.set(scale, scale, scale);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Posición de inicio: si se pasa punto del raycast, o caída desde el cielo
      const spawnPos = customPosition
        ? new THREE.Vector3(
            customPosition.x + randomRange(-0.3, 0.3),
            Math.max(customPosition.y + 1.2, 2.5),
            customPosition.z + randomRange(-0.3, 0.3)
          )
        : new THREE.Vector3(
            randomRange(-1.5, 1.5),
            randomRange(3.5, 5.5),
            randomRange(-1.5, 1.5)
          );

      mesh.position.copy(spawnPos);
      scene.add(mesh);

      // Velocidad inicial
      const vel = customVelocity
        ? customVelocity.clone()
        : new THREE.Vector3(
            randomRange(-1.8, 1.8),
            randomRange(-1.0, 1.0),
            randomRange(-1.8, 1.8)
          );

      const newBall: PhysicsBall = {
        id: Math.random().toString(36).substring(2, 9),
        mesh,
        position: spawnPos,
        velocity: vel,
        radius,
        mass: radius * 2.5,
        bounciness: restitution + randomRange(-0.06, 0.06),
        color: new THREE.Color(activeMaterialColor),
        trailColor: new THREE.Color(activeMaterialColor),
        materialType: ballStyle,
        age: 0,
        maxAge: 45, // segundos
        isGrounded: false,
        bounceCount: 0,
      };

      ballsRef.current.push(newBall);

      // Sonido de disparo / lanzamiento
      soundSynth.playDropSound(1.0 / scale);

      // Incrementar contador reactivo
      setTotalDropped(prev => {
        const next = prev + 1;
        // Confetti en múltiplos de 25
        if (next % 25 === 0) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
          });
        }
        return next;
      });

      setActiveBallCount(ballsRef.current.length);
    },
    [sceneRef, activeMaterialColor, ballStyle, restitution, createBallMaterial]
  );

  /**
   * Actualización física frame a frame (Euler integration)
   */
  const updatePhysics = useCallback(
    (delta: number) => {
      const scene = sceneRef.current;
      if (!scene) return;

      const balls = ballsRef.current;
      const dt = Math.min(delta, 0.05); // cap para prevenir saltos de física
      const currentGravity = gravity;
      const floor = DEFAULT_CONFIG.floorLevel;
      const boundR = DEFAULT_CONFIG.boundaryRadius;

      for (let i = 0; i < balls.length; i++) {
        const ball = balls[i];

        if (ball.isDragged) {
          ball.mesh.position.copy(ball.position);
          continue;
        }

        // 1. Aplicar gravedad y resistencia del aire
        ball.velocity.y += currentGravity * dt;
        ball.velocity.multiplyScalar(Math.pow(DEFAULT_CONFIG.airResistance, dt * 60));

        // 2. Integrar posición
        ball.position.addScaledVector(ball.velocity, dt);

        // 3. Colisión con el suelo
        const minHeight = floor + ball.radius;
        if (ball.position.y <= minHeight) {
          ball.position.y = minHeight;
          const impactSpeed = Math.abs(ball.velocity.y);

          // Si tiene suficiente energía, rebotar
          if (impactSpeed > 0.45) {
            ball.velocity.y = impactSpeed * ball.bounciness;
            // Fricción horizontal con el suelo
            ball.velocity.x *= 0.88;
            ball.velocity.z *= 0.88;
            ball.bounceCount++;

            // Sonido de rebote
            soundSynth.playBounceSound(impactSpeed);

            // Squash & stretch elástico
            ball.mesh.scale.set(
              (ball.radius / 0.35) * 1.25,
              (ball.radius / 0.35) * 0.75,
              (ball.radius / 0.35) * 1.25
            );
          } else {
            // Reposo sobre el suelo
            ball.velocity.y = 0;
            ball.velocity.x *= 0.94;
            ball.velocity.z *= 0.94;
            ball.isGrounded = true;
          }
        }

        // Recuperar escala normal tras deformación
        const baseScale = ball.radius / 0.35;
        ball.mesh.scale.lerp(new THREE.Vector3(baseScale, baseScale, baseScale), dt * 10);

        // 4. Límites radiales (pared circular del mundo)
        const distFromCenter = Math.sqrt(ball.position.x * ball.position.x + ball.position.z * ball.position.z);
        if (distFromCenter > boundR - ball.radius) {
          const angle = Math.atan2(ball.position.z, ball.position.x);
          ball.position.x = Math.cos(angle) * (boundR - ball.radius);
          ball.position.z = Math.sin(angle) * (boundR - ball.radius);
          // Invertir componente radial de velocidad
          ball.velocity.x *= -0.7;
          ball.velocity.z *= -0.7;
        }

        // Sincronizar malla con la posición física y rotación de rodamiento
        ball.mesh.position.copy(ball.position);
        ball.mesh.rotation.x += ball.velocity.z * dt * 2.0;
        ball.mesh.rotation.z -= ball.velocity.x * dt * 2.0;
      }

      // 5. Colisión elástica entre pares de pelotas
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const b1 = balls[i];
          const b2 = balls[j];
          const dx = b2.position.x - b1.position.x;
          const dy = b2.position.y - b1.position.y;
          const dz = b2.position.z - b1.position.z;
          const distSq = dx * dx + dy * dy + dz * dz;
          const minDist = b1.radius + b2.radius;

          if (distSq < minDist * minDist && distSq > 0.0001) {
            const dist = Math.sqrt(distSq);
            const nx = dx / dist;
            const ny = dy / dist;
            const nz = dz / dist;

            // Separación para evitar solapamiento
            const overlap = (minDist - dist) * 0.5;
            b1.position.x -= nx * overlap;
            b1.position.y -= ny * overlap;
            b1.position.z -= nz * overlap;
            b2.position.x += nx * overlap;
            b2.position.y += ny * overlap;
            b2.position.z += nz * overlap;

            // Velocidad relativa
            const rvx = b2.velocity.x - b1.velocity.x;
            const rvy = b2.velocity.y - b1.velocity.y;
            const rvz = b2.velocity.z - b1.velocity.z;
            const velAlongNormal = rvx * nx + rvy * ny + rvz * nz;

            if (velAlongNormal < 0) {
              const impulse = -(1 + DEFAULT_CONFIG.restitution * 0.7) * velAlongNormal * 0.5;
              b1.velocity.x -= impulse * nx;
              b1.velocity.y -= impulse * ny;
              b1.velocity.z -= impulse * nz;
              b2.velocity.x += impulse * nx;
              b2.velocity.y += impulse * ny;
              b2.velocity.z += impulse * nz;
            }
          }
        }
      }
    },
    [sceneRef, gravity]
  );

  /**
   * Limpia todas las pelotas del escenario 3D
   */
  const clearBalls = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    ballsRef.current.forEach(ball => {
      scene.remove(ball.mesh);
      if (Array.isArray(ball.mesh.material)) {
        ball.mesh.material.forEach(m => m.dispose());
      } else {
        ball.mesh.material.dispose();
      }
    });

    ballsRef.current = [];
    setActiveBallCount(0);
  }, [sceneRef]);

  /**
   * Resetea el contador global de pelotas soltadas
   */
  const resetCounter = useCallback(() => {
    setTotalDropped(0);
  }, []);

  return {
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
  };
}
