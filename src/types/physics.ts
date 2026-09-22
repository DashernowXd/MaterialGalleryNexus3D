import * as THREE from 'three';

export interface PhysicsBall {
  id: string;
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  radius: number;
  mass: number;
  bounciness: number;
  color: THREE.Color;
  trailColor: THREE.Color;
  materialType: string;
  age: number;
  maxAge: number;
  isGrounded: boolean;
  bounceCount: number;
  isDragged?: boolean;
}

export interface PhysicsWorldConfig {
  gravity: number;
  airResistance: number;
  restitution: number; // rebote general
  floorLevel: number;
  boundaryRadius: number;
  maxBalls: number;
}

export type BallMaterialStyle = 'matchCurrent' | 'neonGlow' | 'chrome' | 'golden' | 'crystalGlass' | 'random';
