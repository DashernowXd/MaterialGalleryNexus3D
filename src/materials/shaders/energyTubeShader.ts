import * as THREE from 'three';

export interface EnergyTubeUniforms {
  [uniform: string]: THREE.IUniform;
  uTime: { value: number };
  uSpeed: { value: number };
  uColorA: { value: THREE.Color };
  uColorB: { value: THREE.Color };
  uGlowIntensity: { value: number };
  uPulseFrequency: { value: number };
}

export function createEnergyTubeMaterial(
  colorA: string,
  colorB: string,
  speed: number = 2.5,
  glowIntensity: number = 1.5
): THREE.ShaderMaterial {
  const uniforms: EnergyTubeUniforms = {
    uTime: { value: 0 },
    uSpeed: { value: speed },
    uColorA: { value: new THREE.Color(colorA) },
    uColorB: { value: new THREE.Color(colorB) },
    uGlowIntensity: { value: glowIntensity },
    uPulseFrequency: { value: 3.0 },
  };

  return new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uSpeed;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform float uGlowIntensity;
      uniform float uPulseFrequency;

      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        // 1. Gradiente suave a lo largo del tubo entre Esfera A y Esfera B
        vec3 baseColor = mix(uColorA, uColorB, clamp(vUv.y, 0.0, 1.0));

        // 2. Ondas de impulsos de energía viajando a alta velocidad
        float phase = vUv.y * uPulseFrequency - uTime * uSpeed;
        float pulse1 = sin(phase * 6.2831853);
        pulse1 = pow(clamp(pulse1 * 0.5 + 0.5, 0.0, 1.0), 3.5);

        // Segundo pulso desfasado para dinamismo continuo
        float phase2 = vUv.y * (uPulseFrequency * 1.6) - uTime * (uSpeed * 1.4);
        float pulse2 = sin(phase2 * 6.2831853);
        pulse2 = pow(clamp(pulse2 * 0.5 + 0.5, 0.0, 1.0), 4.0) * 0.5;

        float combinedPulse = pulse1 + pulse2;

        // 3. Efecto Fresnel para borde hiper-luminoso
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        float fresnel = 1.0 - abs(dot(normal, viewDir));
        fresnel = pow(clamp(fresnel, 0.0, 1.0), 1.8);

        // 4. Núcleo central blanco brillante en el pico del pulso
        vec3 coreWhite = vec3(1.0, 1.0, 1.0) * (combinedPulse * 0.65);

        // 5. Composición de energía fotónica
        vec3 finalColor = (baseColor * (0.6 + combinedPulse * 2.2 + fresnel * 1.8) + coreWhite) * uGlowIntensity;
        float alpha = clamp(0.45 + combinedPulse * 0.45 + fresnel * 0.4, 0.0, 1.0);

        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
  });
}
