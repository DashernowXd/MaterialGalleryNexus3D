import * as THREE from 'three';
import { DraggableFigureConfig, DraggableFigureRuntime, DraggableShapeType } from '../types/draggableFigures';

export const FIGURE_PRESETS: Record<DraggableShapeType, Omit<DraggableFigureConfig, 'id'>> = {
  sphere: {
    name: 'Orbe de Plasma',
    shape: 'sphere',
    color: '#06b6d4',
    glowColor: '#38bdf8',
    baseScale: 1.0,
    lightIntensity: 1.2,
    lightDistance: 4.5,
    roughness: 0.1,
    metalness: 0.2,
    transmission: 0.65,
  },
  cube: {
    name: 'Cubo Cuántico',
    shape: 'cube',
    color: '#f59e0b',
    glowColor: '#fbbf24',
    baseScale: 1.0,
    lightIntensity: 1.15,
    lightDistance: 4.2,
    roughness: 0.2,
    metalness: 0.5,
    transmission: 0.3,
  },
  octahedron: {
    name: 'Cristal Estelar',
    shape: 'octahedron',
    color: '#ec4899',
    glowColor: '#f472b6',
    baseScale: 1.0,
    lightIntensity: 1.25,
    lightDistance: 4.5,
    roughness: 0.08,
    metalness: 0.15,
    transmission: 0.75,
  },
  torus: {
    name: 'Anillo Magnético',
    shape: 'torus',
    color: '#10b981',
    glowColor: '#34d399',
    baseScale: 1.0,
    lightIntensity: 1.1,
    lightDistance: 4.0,
    roughness: 0.18,
    metalness: 0.35,
    transmission: 0.45,
  },
  icosahedron: {
    name: 'Poliedro Cósmico',
    shape: 'icosahedron',
    color: '#8b5cf6',
    glowColor: '#a78bfa',
    baseScale: 1.0,
    lightIntensity: 1.3,
    lightDistance: 4.6,
    roughness: 0.12,
    metalness: 0.25,
    transmission: 0.6,
  },
};

/**
 * Crea una geometría basada en el tipo de figura
 */
export function createFigureGeometry(shape: DraggableShapeType): THREE.BufferGeometry {
  switch (shape) {
    case 'sphere':
      return new THREE.SphereGeometry(0.32, 32, 32);
    case 'cube':
      return new THREE.BoxGeometry(0.52, 0.52, 0.52);
    case 'octahedron':
      return new THREE.OctahedronGeometry(0.38, 0);
    case 'torus':
      return new THREE.TorusGeometry(0.32, 0.12, 18, 36);
    case 'icosahedron':
    default:
      return new THREE.IcosahedronGeometry(0.36, 0);
  }
}

/**
 * Radio aproximado de colisión y escala base para la física
 */
export function getFigureRadius(shape: DraggableShapeType): number {
  switch (shape) {
    case 'sphere':
      return 0.32;
    case 'cube':
      return 0.36; // Semidiagonal aproximada para apoyo seguro
    case 'octahedron':
      return 0.34;
    case 'torus':
      return 0.32;
    case 'icosahedron':
    default:
      return 0.35;
  }
}

/**
 * Ensambla la figura 3D completa: Grupo + Malla principal + Luz tenue puntual + Halo exterior
 */
export function createDraggableFigure(
  shape: DraggableShapeType = 'sphere',
  customPosition?: THREE.Vector3,
  customConfig?: Partial<DraggableFigureConfig>
): DraggableFigureRuntime {
  const id = `fig-${Math.random().toString(36).substring(2, 9)}`;
  const preset = FIGURE_PRESETS[shape] || FIGURE_PRESETS.sphere;
  const config: DraggableFigureConfig = {
    id,
    ...preset,
    ...customConfig,
  };

  const group = new THREE.Group();
  group.name = `draggable-${id}`;

  const radius = getFigureRadius(shape);
  const spawnPos = customPosition
    ? customPosition.clone()
    : new THREE.Vector3(
        (Math.random() - 0.5) * 4.0,
        1.2 + Math.random() * 0.8,
        (Math.random() - 0.5) * 2.2
      );

  group.position.copy(spawnPos);

  // 1. Malla principal con materiales físicos reflectantes y translúcidos
  const geometry = createFigureGeometry(shape);
  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(config.color),
    emissive: new THREE.Color(config.glowColor),
    emissiveIntensity: 0.38, // Iluminación tenue intrínseca base
    roughness: config.roughness,
    metalness: config.metalness,
    transmission: config.transmission,
    thickness: 0.5,
    transparent: true,
    opacity: 0.92,
    reflectivity: 0.9,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = { figureId: id, isDraggableFigure: true };
  group.add(mesh);

  // 2. Halo sutil exterior translúcido que incrementa la visibilidad
  const haloGeo = new THREE.SphereGeometry(radius * 1.22, 16, 16);
  const haloMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(config.glowColor),
    transparent: true,
    opacity: 0.12,
    wireframe: true,
    blending: THREE.AdditiveBlending,
  });
  const glowHalo = new THREE.Mesh(haloGeo, haloMat);
  glowHalo.userData = { figureId: id, isGlowHalo: true };
  group.add(glowHalo);

  // 3. Luz tenue puntual vinculada a la figura (ilumina tablero, botones y suelo)
  const light = new THREE.PointLight(
    new THREE.Color(config.glowColor),
    config.lightIntensity,
    config.lightDistance,
    2 // Atenuación cuadrática suave natural
  );
  light.position.set(0, 0, 0);
  group.add(light);

  const rotationSpeed = new THREE.Vector3(
    (Math.random() - 0.5) * 0.8,
    (Math.random() - 0.5) * 1.2,
    (Math.random() - 0.5) * 0.8
  );

  return {
    id,
    config,
    group,
    mesh,
    light,
    glowHalo,
    position: spawnPos.clone(),
    velocity: new THREE.Vector3(0, 0, 0),
    targetPos: spawnPos.clone(),
    radius,
    isHovered: false,
    isDragged: false,
    isGrounded: false,
    hoverElevation: 0,
    rotationSpeed,
  };
}
