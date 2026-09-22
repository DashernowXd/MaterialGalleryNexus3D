import * as THREE from 'three';
import { MaterialUniforms } from '../../types/materials';

export function createPrismaticGlassMaterial(uniforms: MaterialUniforms): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    wireframe: uniforms.uWireframe.value > 0.5,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uMouse3D;
      uniform float uDistortion;
      uniform float uClickPulse;

      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;
      varying vec3 vRefractR;
      varying vec3 vRefractG;
      varying vec3 vRefractB;

      void main() {
        vNormal = normal;
        vec3 pos = position;

        // Vibración elástica al hacer clic
        float wobble = sin(pos.y * 10.0 + uTime * 20.0) * uClickPulse * 0.15;
        pos += normal * wobble;

        vPosition = pos;
        vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;

        vec3 worldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
        vec3 worldViewDir = normalize(vWorldPosition - cameraPosition);

        // Dispersión cromática con índices de refracción ligeramente distintos para R, G y B
        vRefractR = refract(worldViewDir, worldNormal, 0.65);
        vRefractG = refract(worldViewDir, worldNormal, 0.67);
        vRefractB = refract(worldViewDir, worldNormal, 0.69);

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform vec3 uSecondaryColor;
      uniform float uRoughness;
      uniform float uTime;
      uniform vec3 uMouse3D;
      uniform float uClickPulse;

      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;
      varying vec3 vRefractR;
      varying vec3 vRefractG;
      varying vec3 vRefractB;

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);

        // Fresnel de vidrio
        float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 2.8);

        // Luz de seguimiento del cursor
        vec3 lightDir = normalize(uMouse3D - vWorldPosition);
        vec3 halfDir = normalize(lightDir + viewDir);
        float spec = pow(max(dot(normal, halfDir), 0.0), 64.0);

        // Refracción con descomposición de luz de arcoíris (dispersión cáustica)
        vec3 colorR = mix(vec3(1.0, 0.1, 0.2), uColor, vRefractR.y * 0.5 + 0.5);
        vec3 colorG = mix(vec3(0.1, 1.0, 0.4), uSecondaryColor, vRefractG.y * 0.5 + 0.5);
        vec3 colorB = mix(vec3(0.1, 0.4, 1.0), vec3(0.9, 0.95, 1.0), vRefractB.y * 0.5 + 0.5);

        vec3 dispersion = vec3(colorR.r, colorG.g, colorB.b) * 0.7;

        vec3 glassColor = mix(dispersion, vec3(1.0, 1.0, 1.0), fresnel * 0.6);
        glassColor += vec3(1.0, 1.0, 1.0) * spec * 2.2;
        glassColor += uSecondaryColor * uClickPulse * 1.5;

        float alpha = clamp(0.35 + fresnel * 0.6 + spec * 0.5 + uClickPulse * 0.3, 0.2, 0.95);

        gl_FragColor = vec4(glassColor, alpha);
      }
    `
  });
}
