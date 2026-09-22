import * as THREE from 'three';
import { GLSL_NOISE_SNIPPET } from '../../utils/math';
import { MaterialUniforms } from '../../types/materials';

export function createPlasmaMaterial(uniforms: MaterialUniforms): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms,
    wireframe: uniforms.uWireframe.value > 0.5,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uDistortion;
      uniform float uSpeed;
      uniform vec3 uMouse3D;
      uniform float uClickPulse;

      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;
      varying float vNoise;

      ${GLSL_NOISE_SNIPPET}

      void main() {
        vNormal = normal;
        vec3 pos = position;

        float t = uTime * uSpeed * 1.5;
        // Ruido fractal 3D de alta turbulencia
        float n1 = snoise(pos * 1.8 + vec3(0.0, t, 0.0));
        float n2 = snoise(pos * 3.5 - vec3(t * 0.8, 0.0, t * 0.5));
        float totalNoise = (n1 * 0.7 + n2 * 0.3) * uDistortion;

        // Atracción sutil hacia el cursor
        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        float distToMouse = distance(worldPos.xyz, uMouse3D);
        float mouseAttract = smoothstep(2.0, 0.0, distToMouse) * 0.25;

        // Pulso explosivo de clic
        float clickExplosion = uClickPulse * 0.4 * snoise(pos * 5.0 + t * 4.0);

        pos += normal * (totalNoise * 0.35 + mouseAttract + clickExplosion);

        vNoise = totalNoise;
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
      uniform float uMouseVelocity;
      uniform float uClickPulse;

      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;
      varying float vNoise;

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);

        float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 2.5);

        // Influencia del cursor: calienta el plasma a blanco/dorado
        float distToMouse = distance(vWorldPosition, uMouse3D);
        float mouseHeat = (1.0 - smoothstep(0.1, 2.2, distToMouse)) * (1.0 + uMouseVelocity * 2.0);

        // Capas de color de plasma: Núcleo -> Superficie -> Borde corona
        vec3 coreColor = mix(uColor, vec3(1.0, 0.9, 0.4), clamp(vNoise * 1.5 + 0.5, 0.0, 1.0));
        vec3 coronaColor = mix(uSecondaryColor, vec3(1.0, 1.0, 1.0), fresnel);

        vec3 plasma = mix(coreColor, coronaColor, fresnel * 0.8 + 0.2);
        plasma += vec3(1.0, 0.8, 0.3) * mouseHeat * 1.2;
        plasma += vec3(1.0, 0.95, 0.8) * uClickPulse * 2.5;

        gl_FragColor = vec4(plasma, 1.0);
      }
    `
  });
}
