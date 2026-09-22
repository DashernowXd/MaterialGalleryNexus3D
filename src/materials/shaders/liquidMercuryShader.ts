import * as THREE from 'three';
import { GLSL_NOISE_SNIPPET } from '../../utils/math';
import { MaterialUniforms } from '../../types/materials';

export function createLiquidMercuryMaterial(uniforms: MaterialUniforms): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms,
    wireframe: uniforms.uWireframe.value > 0.5,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uMouse3D;
      uniform float uMouseVelocity;
      uniform float uDistortion;
      uniform float uSpeed;
      uniform float uClickPulse;
      uniform vec3 uClickPosition;

      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;
      varying float vDisplacement;

      ${GLSL_NOISE_SNIPPET}

      void main() {
        vNormal = normal;
        vec3 pos = position;

        // Ruido orgánico continuo
        float t = uTime * uSpeed * 0.8;
        float noise = snoise(pos * (1.2 * uDistortion) + vec3(t, t * 0.5, t * 0.3));

        // Interacción del cursor: deformación magnética / repulsión hacia el punto 3D del cursor
        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        float distToMouse = distance(worldPos.xyz, uMouse3D);
        float mouseInfluence = smoothstep(2.5, 0.0, distToMouse) * (0.35 + uMouseVelocity * 0.5);

        // Onda expansiva de impacto al dar click
        float distToClick = distance(worldPos.xyz, uClickPosition);
        float waveRadius = (1.0 - uClickPulse) * 4.0;
        float clickRipple = sin((distToClick - waveRadius) * 8.0) * exp(-abs(distToClick - waveRadius) * 2.5) * uClickPulse * 0.4;

        // Desplazamiento total a lo largo de la normal
        float totalDisp = (noise * 0.25 * uDistortion) + (mouseInfluence * 0.3) + clickRipple;
        vDisplacement = totalDisp;

        pos += normal * totalDisp;
        vPosition = pos;
        vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform vec3 uSecondaryColor;
      uniform float uRoughness;
      uniform float uMetalness;
      uniform float uTime;
      uniform vec3 uMouse3D;

      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;
      varying float vDisplacement;

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);

        // Efecto Fresnel para reflejo metálico cromado
        float fBase = 1.0 - max(dot(viewDir, normal), 0.0);
        float fresnel = fBase * fBase * fBase;

        // Simulación de reflejo ambiental con degradado cromado
        vec3 refl = reflect(-viewDir, normal);
        vec3 chromeSky = mix(uSecondaryColor, vec3(0.95, 0.98, 1.0), smoothstep(-0.2, 0.8, refl.y));
        vec3 chromeGround = mix(vec3(0.08, 0.08, 0.12), uColor, smoothstep(-0.8, 0.2, refl.y));
        vec3 baseEnv = mix(chromeGround, chromeSky, step(0.0, refl.y));

        // Reflejo especular puntual reactivo a la luz del cursor
        vec3 lightDir = normalize(uMouse3D - vWorldPosition);
        vec3 halfDir = normalize(lightDir + viewDir);
        float spec = pow(max(dot(normal, halfDir), 0.0), 32.0 * (1.0 - uRoughness * 0.8));
        vec3 specularLight = vec3(1.0, 0.95, 0.9) * spec * (1.5 + vDisplacement * 2.0);

        // Mezcla de metales con aberración iridiscente sutil en bordes
        vec3 finalColor = mix(uColor * 0.3, baseEnv, uMetalness);
        finalColor += fresnel * uSecondaryColor * 1.4;
        finalColor += specularLight;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
  });
}
