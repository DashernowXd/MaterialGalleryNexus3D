import * as THREE from 'three';
import { MaterialUniforms } from '../../types/materials';

export function createHolographicMaterial(uniforms: MaterialUniforms): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    wireframe: uniforms.uWireframe.value > 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uMouse3D;
      uniform float uMouseVelocity;
      uniform float uClickPulse;
      uniform float uDistortion;

      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;
      varying float vGlitch;

      void main() {
        vNormal = normal;
        vec3 pos = position;

        // Glitch en franjas horizontales activado por clics o movimiento rápido del cursor
        float glitchBand = step(0.92, sin(pos.y * 30.0 + uTime * 15.0));
        float glitchFactor = glitchBand * (uClickPulse * 0.4 + uMouseVelocity * 0.2) * uDistortion;
        pos.x += glitchFactor * sin(uTime * 40.0);
        pos.z += glitchFactor * cos(uTime * 35.0);

        vGlitch = glitchFactor;
        vPosition = pos;
        vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform vec3 uSecondaryColor;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform vec3 uMouse3D;
      uniform float uClickPulse;

      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;
      varying float vGlitch;

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);

        // Borde brillante Fresnel
        float fresnel = pow(1.0 - abs(dot(viewDir, normal)), 2.2);

        // Líneas de barrido holográfico (scanlines)
        float scanline = sin(vPosition.y * 45.0 - uTime * 6.0) * 0.5 + 0.5;
        scanline = pow(scanline, 1.8);

        // Cuadrícula digital
        float gridX = step(0.04, fract(vPosition.x * 4.0));
        float gridY = step(0.04, fract(vPosition.y * 4.0));
        float gridZ = step(0.04, fract(vPosition.z * 4.0));
        float gridPattern = 1.0 - (gridX * gridY * gridZ);

        // Proximidad al cursor: ilumina el área cercana
        float distToMouse = distance(vWorldPosition, uMouse3D);
        float mouseGlow = 1.0 - smoothstep(0.2, 2.5, distToMouse);

        // Composición de color holográfico cian/magenta/neón
        vec3 baseColor = mix(uColor, uSecondaryColor, sin(vPosition.y * 3.0 + uTime * 2.0) * 0.5 + 0.5);
        vec3 glow = baseColor * (fresnel * 2.0 + scanline * 0.6 + gridPattern * 0.8 + mouseGlow * 1.5);
        glow += vec3(0.3, 0.7, 1.0) * (uClickPulse * 2.0 + vGlitch * 4.0);

        float alpha = clamp(fresnel * 0.8 + scanline * 0.35 + mouseGlow * 0.4 + uClickPulse * 0.5, 0.15, 0.95);

        gl_FragColor = vec4(glow, alpha);
      }
    `
  });
}
