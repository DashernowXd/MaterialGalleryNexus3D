import * as THREE from 'three';
import { MaterialDefinition, MaterialUniforms, MaterialParameters } from '../types/materials';
import { createLiquidMercuryMaterial } from './shaders/liquidMercuryShader';
import { createHolographicMaterial } from './shaders/holographicShader';
import { createPlasmaMaterial } from './shaders/plasmaShader';
import { createPrismaticGlassMaterial } from './shaders/prismaticGlassShader';
import { createBioluminescentMaterial } from './shaders/bioluminescentShader';
import { createMagmaMaterial } from './shaders/magmaShader';

export const MATERIAL_CATALOG: MaterialDefinition[] = [
  {
    id: 'liquid-mercury',
    name: 'Líquido Mercurio',
    category: 'Fluido',
    description: 'Deformación ferrofluídica por ondas de superficie que responden al cursor y ondas de choque al hacer clic.',
    color: '#3b82f6',
    secondaryColor: '#60a5fa',
    roughness: 0.1,
    metalness: 0.95,
    distortion: 1.2,
    speed: 1.0,
    badge: 'Ferrofluido',
    createMaterial: createLiquidMercuryMaterial,
  },
  {
    id: 'cyber-hologram',
    name: 'Cyber Holograma',
    category: 'Holograma',
    description: 'Shader holográfico con scanlines, efecto Fresnel translúcido y glitch digital activado por clics.',
    color: '#06b6d4',
    secondaryColor: '#ec4899',
    roughness: 0.2,
    metalness: 0.8,
    distortion: 1.0,
    speed: 1.2,
    badge: 'Glitch FX',
    createMaterial: createHolographicMaterial,
  },
  {
    id: 'plasma-core',
    name: 'Núcleo de Plasma',
    category: 'Energía',
    description: 'Turbulencia energética con simplex noise 3D. Se calienta e inflama ante la proximidad del puntero.',
    color: '#8b5cf6',
    secondaryColor: '#f59e0b',
    roughness: 0.3,
    metalness: 0.5,
    distortion: 1.5,
    speed: 1.4,
    badge: 'Ruido 3D',
    createMaterial: createPlasmaMaterial,
  },
  {
    id: 'prismatic-glass',
    name: 'Cristal Prismático',
    category: 'Óptico',
    description: 'Refracción translúcida con dispersión espectral de arcoíris y destellos cáusticos según el ángulo del cursor.',
    color: '#38bdf8',
    secondaryColor: '#f43f5e',
    roughness: 0.05,
    metalness: 0.1,
    distortion: 0.8,
    speed: 0.8,
    badge: 'Dispersión',
    createMaterial: createPrismaticGlassMaterial,
  },
  {
    id: 'bioluminescent',
    name: 'Bioluminiscencia',
    category: 'Orgánico',
    description: 'Superficie celular viva con venas sinápticas que se excitan e iluminan al pasar el cursor por encima.',
    color: '#10b981',
    secondaryColor: '#22d3ee',
    roughness: 0.4,
    metalness: 0.2,
    distortion: 1.1,
    speed: 0.9,
    badge: 'Bio-Glow',
    createMaterial: createBioluminescentMaterial,
  },
  {
    id: 'volcanic-magma',
    name: 'Magma Volcánico',
    category: 'Mineral',
    description: 'Corteza basáltica con fracturas de lava incandescente que se abren e intensifican térmicamente con el puntero.',
    color: '#ef4444',
    secondaryColor: '#fbbf24',
    roughness: 0.7,
    metalness: 0.3,
    distortion: 1.3,
    speed: 1.1,
    badge: 'Térmico',
    createMaterial: createMagmaMaterial,
  },
];

/**
 * Crea las uniformes iniciales estándar compartidas por todos los materiales
 */
export function createDefaultUniforms(): MaterialUniforms {
  return {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uMouse3D: { value: new THREE.Vector3(0, 0, 0) },
    uMouseVelocity: { value: 0 },
    uHover: { value: 0 },
    uClickPulse: { value: 0 },
    uClickPosition: { value: new THREE.Vector3(0, 0, 0) },
    uColor: { value: new THREE.Color('#3b82f6') },
    uSecondaryColor: { value: new THREE.Color('#60a5fa') },
    uRoughness: { value: 0.1 },
    uMetalness: { value: 0.95 },
    uDistortion: { value: 1.2 },
    uSpeed: { value: 1.0 },
    uWireframe: { value: 0.0 },
  };
}

/**
 * Sincroniza las uniformes con los parámetros modificados por el usuario
 */
export function syncMaterialParameters(
  uniforms: MaterialUniforms,
  params: MaterialParameters,
  material: THREE.Material
) {
  uniforms.uRoughness.value = params.roughness;
  uniforms.uMetalness.value = params.metalness;
  uniforms.uDistortion.value = params.distortion;
  uniforms.uSpeed.value = params.speed;
  uniforms.uColor.value.set(params.color);
  uniforms.uSecondaryColor.value.set(params.secondaryColor);
  uniforms.uWireframe.value = params.wireframe ? 1.0 : 0.0;

  if ('wireframe' in material) {
    (material as { wireframe: boolean }).wireframe = params.wireframe;
  }
}
