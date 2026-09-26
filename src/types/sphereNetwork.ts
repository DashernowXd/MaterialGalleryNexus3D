import * as THREE from 'three';

export type SphereColorPreset =
  | '#06b6d4' // Cyan Neón
  | '#ec4899' // Rosa Eléctrico
  | '#a855f7' // Púrpura Plasma
  | '#3b82f6' // Azul Hiperión
  | '#10b981' // Esmeralda Láser
  | '#f59e0b' // Ámbar Solar
  | '#f43f5e' // Rubí Fusión
  | '#ffffff'; // Blanco Estelar

export type OpenTubeLengthType = 'short' | 'long';

export interface NetworkOpenTubeData {
  id: string;
  sphereId: string;
  lengthType: OpenTubeLengthType;
  length: number;
  direction: [number, number, number]; // Vector unitario en 3D
  color: string;
  createdAt: number;
}

export interface NetworkOpenTubeRuntime {
  data: NetworkOpenTubeData;
  group: THREE.Group;
  cylinderMesh: THREE.Mesh;
  glowMesh: THREE.Mesh;
  baseCap: THREE.Mesh;
  tipCap: THREE.Mesh;
  tipLight: THREE.PointLight;
  material: THREE.ShaderMaterial;
  glowMaterial: THREE.MeshBasicMaterial;
}

export interface NetworkSphereData {
  id: string;
  name: string;
  position: [number, number, number];
  color: string;
  radius: number;
  connections: string[]; // IDs de esferas conectadas
  openTubes: NetworkOpenTubeData[]; // Tubos libres sin nodo (cortos o largos)
  createdAt: number;
}

export interface NetworkSphereRuntime {
  data: NetworkSphereData;
  mesh: THREE.Mesh;
  haloMesh: THREE.Mesh;
  selectionRing: THREE.Mesh;
  pointLight: THREE.PointLight;
  isHovered: boolean;
  isSelected: boolean;
  isConnected: boolean;
  baseY: number;
  pulsePhase: number;
}

export interface NetworkTubeData {
  id: string;
  sphereAId: string;
  sphereBId: string;
  colorA: string;
  colorB: string;
  powerFlow: number; // 0.0 a 1.0
  active: boolean;
}

export interface NetworkTubeRuntime {
  data: NetworkTubeData;
  group: THREE.Group;
  cylinderMesh: THREE.Mesh;
  glowMesh: THREE.Mesh;
  capA: THREE.Mesh;
  capB: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
  glowMaterial: THREE.ShaderMaterial | THREE.MeshBasicMaterial;
  length: number;
}

export type NetworkPreset =
  | 'constellation'
  | 'ring'
  | 'cube'
  | 'triangle'
  | 'atom'
  | 'binaryCluster';

export interface NetworkSettings {
  tubeThickness: number;
  energySpeed: number;
  glowIntensity: number;
  autoConnectRange: number;
  showFloorGrid: boolean;
  enableDynamicLights: boolean;
  soundEnabled: boolean;
}

export interface NetworkTelemetry {
  totalSpheres: number;
  illuminatedSpheres: number;
  totalConnections: number; // Tubos inter-esferas
  totalOpenTubes: number; // Tubos libres sin nodo
  energyFlowRate: number; // En MegaWatts simulados
  coveragePercent: number;
}
