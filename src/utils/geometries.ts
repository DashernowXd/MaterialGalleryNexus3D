import * as THREE from 'three';
import { GeometryType } from '../types/materials';

/**
 * Genera una geometría precisa de tarjeta de crédito con esquinas redondeadas (ISO/IEC 7810 ID-1)
 */
export function createCreditCardGeometry(
  width = 3.2,
  height = 2.02,
  radius = 0.16,
  depth = 0.04
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const w = width;
  const h = height;
  const r = radius;

  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.012,
    bevelThickness: 0.012,
  };

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.center();
  return geo;
}

export function createGeometry(type: GeometryType): THREE.BufferGeometry {
  switch (type) {
    case 'sphere':
      // Esfera de alta densidad para permitir deformaciones suaves por vértice
      return new THREE.SphereGeometry(1.6, 96, 96);
    case 'torusKnot':
      return new THREE.TorusKnotGeometry(1.1, 0.38, 160, 32);
    case 'icosahedron':
      return new THREE.IcosahedronGeometry(1.6, 24);
    case 'dodecahedron':
      return new THREE.DodecahedronGeometry(1.6, 16);
    case 'roundedBox':
      return new THREE.BoxGeometry(2.0, 2.0, 2.0, 48, 48, 48);
    case 'torus':
      return new THREE.TorusGeometry(1.3, 0.5, 64, 96);
    case 'creditCard':
      return createCreditCardGeometry();
    default:
      return new THREE.SphereGeometry(1.6, 96, 96);
  }
}
