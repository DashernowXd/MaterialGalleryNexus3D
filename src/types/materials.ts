import * as THREE from 'three';

export type GeometryType = 'sphere' | 'torusKnot' | 'icosahedron' | 'dodecahedron' | 'roundedBox' | 'torus' | 'creditCard';

export type EnvironmentPreset = 'studio' | 'cyberpunk' | 'sunset' | 'deepSpace';

export interface MaterialUniforms {
  uTime: { value: number };
  uMouse: { value: THREE.Vector2 };
  uMouse3D: { value: THREE.Vector3 };
  uMouseVelocity: { value: number };
  uHover: { value: number };
  uClickPulse: { value: number };
  uClickPosition: { value: THREE.Vector3 };
  uColor: { value: THREE.Color };
  uSecondaryColor: { value: THREE.Color };
  uRoughness: { value: number };
  uMetalness: { value: number };
  uDistortion: { value: number };
  uSpeed: { value: number };
  uWireframe: { value: number };
  [key: string]: THREE.IUniform;
}

export interface MaterialDefinition {
  id: string;
  name: string;
  category: 'Fluido' | 'Holograma' | 'Energía' | 'Óptico' | 'Orgánico' | 'Mineral';
  description: string;
  color: string;
  secondaryColor: string;
  roughness: number;
  metalness: number;
  distortion: number;
  speed: number;
  badge: string;
  createMaterial: (uniforms: MaterialUniforms) => THREE.Material;
}

export interface MaterialParameters {
  roughness: number;
  metalness: number;
  distortion: number;
  speed: number;
  color: string;
  secondaryColor: string;
  wireframe: boolean;
}
