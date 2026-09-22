import * as THREE from 'three';

export type ButtonTextureType =
  | 'carbonFiber'
  | 'brushedTitanium'
  | 'cyberCircuit'
  | 'frostedGlass'
  | 'marbleGold'
  | 'arcadeJelly'
  | 'hologramGlitch';

export type ButtonShape = 'round' | 'square' | 'pill' | 'hexagon';

export type ButtonBehavior = 'momentary' | 'toggle';

export interface Button3DConfig {
  id: string;
  name: string;
  tagline: string;
  textureType: ButtonTextureType;
  shape: ButtonShape;
  behavior: ButtonBehavior;
  primaryColor: string;
  glowColor: string;
  icon: string;
  pressDepth: number; // Profundidad de pulsación en unidades Three.js
  soundPitch: number;
}

export interface Button3DRuntime {
  config: Button3DConfig;
  baseMesh: THREE.Mesh;
  plungerMesh: THREE.Mesh;
  ringMesh: THREE.Mesh;
  group: THREE.Group;
  currentDepression: number; // 0 (reposo) a 1 (hundido al 100%)
  targetDepression: number;
  isHovered: boolean;
  isPressed: boolean;
  isToggled: boolean;
  clickCount: number;
}

export interface ButtonEventLog {
  id: string;
  buttonName: string;
  action: 'press' | 'release' | 'toggle_on' | 'toggle_off';
  timestamp: string;
  texture: string;
}
