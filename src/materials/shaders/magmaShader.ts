import * as THREE from 'three';
import { GLSL_NOISE_SNIPPET } from '../../utils/math';
import { MaterialUniforms } from '../../types/materials';

export function createMagmaMaterial(uniforms: MaterialUniforms): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms,
    wireframe: uniforms.uWireframe.value > 0.5,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uSpeed;
      uniform float uDistortion;
      uniform vec3 uMouse3D;
      uniform float uClickPulse;

      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;
      varying float vCracks;

      ${GLSL_NOISE_SNIPPET}

      void main() {
        vNormal = normal;
        vec3 pos = position;

        float t = uTime * uSpeed * 0.5;
        // Grietas volcánicas procedimentales
        float crack = abs(snoise(pos * 3.5));
        vCracks = crack;

        // Movimiento de placas tectónicas
        float plateShift = snoise(pos * 1.5 + vec3(t * 0.2)) * 0.12 * uDistortion;

        // Pulso por clic
        float shock = uClickPulse * 0.25 * sin(length(pos) * 8.0 - uTime * 15.0);

        pos += normal * (plateShift + shock);

        vPosition = pos;
        vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform vec3 uSecondaryColor;
      uniform float uTime;
      uniform vec3 uMouse3D;
      uniform float uClickPulse;

      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;
      varying float vCracks;

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);

        // Corteza de basalto oscura
        vec3 basalt = vec3(0.04, 0.04, 0.05);

        // Canales de lava fundida
        float lavaFlow = sin(vPosition.y * 6.0 - uTime * 4.0 + vPosition.x * 4.0) * 0.5 + 0.5;
        float heat = 1.0 - smoothstep(0.0, 0.35, vCracks);

        // Proximidad al cursor: calienta el magma
        float distToMouse = distance(vWorldPosition, uMouse3D);
        float mouseThermal = (1.0 - smoothstep(0.1, 2.0, distToMouse)) * 2.0;

        // Colores de magma incandescente (rojo -> naranja -> amarillo incandescente)
        vec3 lavaCore = mix(uColor, uSecondaryColor, heat);
        lavaCore = mix(lavaCore, vec3(1.0, 0.95, 0.7), mouseThermal * 0.5 + uClickPulse);

        vec3 surface = mix(basalt, lavaCore * (2.0 + mouseThermal), heat);

        gl_FragColor = vec4(surface, 1.0);
      }
    `
  });
}
