import * as THREE from 'three';

export type DraggableShapeType = 'sphere' | 'cube' | 'octahedron' | 'torus' | 'icosahedron';

export interface DraggableFigureConfig {
  id: string;
  name: string;
  shape: DraggableShapeType;
  color: string;
  glowColor: string;
  baseScale: number;
  lightIntensity: number; // Intensidad de luz tenue por defecto
  lightDistance: number;
  roughness: number;
  metalness: number;
  transmission: number;
}

export interface DraggableFigureRuntime {
  id: string;
  config: DraggableFigureConfig;
  group: THREE.Group;
  mesh: THREE.Mesh;
  light: THREE.PointLight;
  glowHalo: THREE.Mesh;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  targetPos: THREE.Vector3;
  radius: number;
  isHovered: boolean;
  isDragged: boolean;
  isGrounded: boolean;
  hoverElevation: number;
  rotationSpeed: THREE.Vector3;
}
