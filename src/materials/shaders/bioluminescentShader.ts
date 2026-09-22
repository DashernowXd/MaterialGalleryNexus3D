import * as THREE from 'three';
import { GLSL_NOISE_SNIPPET } from '../../utils/math';
import { MaterialUniforms } from '../../types/materials';

export function createBioluminescentMaterial(uniforms: MaterialUniforms): THREE.ShaderMaterial {
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
      varying float vCell;

      ${GLSL_NOISE_SNIPPET}

      void main() {
        vNormal = normal;
        vec3 pos = position;

        float t = uTime * uSpeed * 0.6;
        // Ondulación celular lenta (respiración biológica)
        float breathing = sin(t * 2.0) * 0.04;
        float cellular = snoise(pos * 2.5 + vec3(0.0, t, 0.0));

        vCell = cellular;

        // Atracción del tejido vivo hacia el cursor
        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        float distToMouse = distance(worldPos.xyz, uMouse3D);
        float pull = smoothstep(2.0, 0.2, distToMouse) * 0.15;

        // Pulso por clic
        float heartbeat = uClickPulse * 0.2 * sin(length(pos) * 12.0 - uTime * 20.0);

        pos += normal * (breathing + cellular * 0.08 * uDistortion + pull + heartbeat);

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
      varying float vCell;

      ${GLSL_NOISE_SNIPPET}

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);

        // Subsurface scattering simulado
        float sss = pow(max(dot(-viewDir, normal), 0.0), 2.0);

        // Vetas bioluminiscentes (sinapsis neuronales / venas orgánicas)
        float veinNoise = snoise(vPosition * 8.0 + vec3(0.0, uTime * 0.5, 0.0));
        float vein = smoothstep(0.4, 0.7, veinNoise);

        // Proximidad al cursor: excita la bioluminiscencia
        float distToMouse = distance(vWorldPosition, uMouse3D);
        float excitation = smoothstep(2.4, 0.1, distToMouse) * 2.0;

        // Pulso orgánico periódico
        float pulse = sin(uTime * 3.0 + vPosition.y * 5.0) * 0.5 + 0.5;

        vec3 skin = mix(uColor * 0.25, uColor, sss * 0.5 + 0.5);
        vec3 veinGlow = uSecondaryColor * (vein * 2.5 + pulse * 0.8 + excitation + uClickPulse * 3.0);

        vec3 finalColor = skin + veinGlow;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
  });
}
