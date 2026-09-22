import{s as Z,j as e}from"./index-D00Ap9mM.js";import{r}from"./vendor-react-DF2_WQ0e.js";import{S as K,D as ue,A as de,C as L,V as D,a as ie,b as me,F as ve,P as pe,W as fe,c as he,d as ye,G as xe,e as ge,f as be,M as J,g as ae,h as we,i as Ce,j as ee,k as H,R as Me,l as se,m as oe,n as Pe,o as je}from"./vendor-three-cqS2HJ9d.js";import{O as Se,u as De}from"./useDocumentMetadata-DGVyiOpS.js";import{c as ne}from"./geometries-D6WXLAx8.js";import{c as Ne}from"./vendor-confetti-oQXWb4Lk.js";import{P as ze,b as ke,c as Re,B as Te,d as Ge,S as We,E as Ee,e as Be,f as Fe,Z as Ae,T as Ve,g as Le,h as Ie,M as _e,i as Oe}from"./vendor-icons-C3cIlbnm.js";function $(a,u){return a+Math.random()*(u-a)}const Q=`
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute( permute( permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                  dot(p2,x2), dot(p3,x3) ) );
  }
`;function $e(a){return new K({uniforms:a,wireframe:a.uWireframe.value>.5,vertexShader:`
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

      ${Q}

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
    `,fragmentShader:`
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
    `})}function He(a){return new K({uniforms:a,transparent:!0,wireframe:a.uWireframe.value>.5,depthWrite:!1,blending:de,side:ue,vertexShader:`
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
    `,fragmentShader:`
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
    `})}function qe(a){return new K({uniforms:a,wireframe:a.uWireframe.value>.5,vertexShader:`
      uniform float uTime;
      uniform float uDistortion;
      uniform float uSpeed;
      uniform vec3 uMouse3D;
      uniform float uClickPulse;

      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;
      varying float vNoise;

      ${Q}

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
    `,fragmentShader:`
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
    `})}function Ue(a){return new K({uniforms:a,transparent:!0,wireframe:a.uWireframe.value>.5,vertexShader:`
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
    `,fragmentShader:`
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
    `})}function Xe(a){return new K({uniforms:a,wireframe:a.uWireframe.value>.5,vertexShader:`
      uniform float uTime;
      uniform float uSpeed;
      uniform float uDistortion;
      uniform vec3 uMouse3D;
      uniform float uClickPulse;

      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;
      varying float vCell;

      ${Q}

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
    `,fragmentShader:`
      uniform vec3 uColor;
      uniform vec3 uSecondaryColor;
      uniform float uTime;
      uniform vec3 uMouse3D;
      uniform float uClickPulse;

      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;
      varying float vCell;

      ${Q}

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
    `})}function Ye(a){return new K({uniforms:a,wireframe:a.uWireframe.value>.5,vertexShader:`
      uniform float uTime;
      uniform float uSpeed;
      uniform float uDistortion;
      uniform vec3 uMouse3D;
      uniform float uClickPulse;

      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;
      varying float vCracks;

      ${Q}

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
    `,fragmentShader:`
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
    `})}const U=[{id:"liquid-mercury",name:"Líquido Mercurio",category:"Fluido",description:"Deformación ferrofluídica por ondas de superficie que responden al cursor y ondas de choque al hacer clic.",color:"#3b82f6",secondaryColor:"#60a5fa",roughness:.1,metalness:.95,distortion:1.2,speed:1,badge:"Ferrofluido",createMaterial:$e},{id:"cyber-hologram",name:"Cyber Holograma",category:"Holograma",description:"Shader holográfico con scanlines, efecto Fresnel translúcido y glitch digital activado por clics.",color:"#06b6d4",secondaryColor:"#ec4899",roughness:.2,metalness:.8,distortion:1,speed:1.2,badge:"Glitch FX",createMaterial:He},{id:"plasma-core",name:"Núcleo de Plasma",category:"Energía",description:"Turbulencia energética con simplex noise 3D. Se calienta e inflama ante la proximidad del puntero.",color:"#8b5cf6",secondaryColor:"#f59e0b",roughness:.3,metalness:.5,distortion:1.5,speed:1.4,badge:"Ruido 3D",createMaterial:qe},{id:"prismatic-glass",name:"Cristal Prismático",category:"Óptico",description:"Refracción translúcida con dispersión espectral de arcoíris y destellos cáusticos según el ángulo del cursor.",color:"#38bdf8",secondaryColor:"#f43f5e",roughness:.05,metalness:.1,distortion:.8,speed:.8,badge:"Dispersión",createMaterial:Ue},{id:"bioluminescent",name:"Bioluminiscencia",category:"Orgánico",description:"Superficie celular viva con venas sinápticas que se excitan e iluminan al pasar el cursor por encima.",color:"#10b981",secondaryColor:"#22d3ee",roughness:.4,metalness:.2,distortion:1.1,speed:.9,badge:"Bio-Glow",createMaterial:Xe},{id:"volcanic-magma",name:"Magma Volcánico",category:"Mineral",description:"Corteza basáltica con fracturas de lava incandescente que se abren e intensifican térmicamente con el puntero.",color:"#ef4444",secondaryColor:"#fbbf24",roughness:.7,metalness:.3,distortion:1.3,speed:1.1,badge:"Térmico",createMaterial:Ye}];function Ze(){return{uTime:{value:0},uMouse:{value:new ie(0,0)},uMouse3D:{value:new D(0,0,0)},uMouseVelocity:{value:0},uHover:{value:0},uClickPulse:{value:0},uClickPosition:{value:new D(0,0,0)},uColor:{value:new L("#3b82f6")},uSecondaryColor:{value:new L("#60a5fa")},uRoughness:{value:.1},uMetalness:{value:.95},uDistortion:{value:1.2},uSpeed:{value:1},uWireframe:{value:0}}}function re(a,u,i){a.uRoughness.value=u.roughness,a.uMetalness.value=u.metalness,a.uDistortion.value=u.distortion,a.uSpeed.value=u.speed,a.uColor.value.set(u.color),a.uSecondaryColor.value.set(u.secondaryColor),a.uWireframe.value=u.wireframe?1:0,"wireframe"in i&&(i.wireframe=u.wireframe)}function Ke({canvasRef:a,selectedMaterial:u,materialParams:i,geometryType:C,environmentPreset:c,onFrameUpdate:m}){const W=r.useRef(null),T=r.useRef(null),t=r.useRef(null),B=r.useRef(null),R=r.useRef(null),A=r.useRef(null),y=r.useRef(null),N=r.useRef(null),w=r.useRef(m),O=r.useRef({geometryType:C,selectedMaterial:u,materialParams:i});r.useEffect(()=>{w.current=m},[m]),r.useEffect(()=>{const d=a.current;if(!d)return;const v=new me;v.background=new L("#090a10"),v.fog=new ve("#090a10",.04),W.current=v;const s=d.clientWidth||window.innerWidth,g=d.clientHeight||window.innerHeight,f=new pe(45,s/g,.1,100);f.position.set(0,.8,7.2),T.current=f;const b=new fe({canvas:d,antialias:!0,powerPreference:"high-performance",alpha:!1});b.setSize(s,g,!1),b.setPixelRatio(Math.min(window.devicePixelRatio,2)),b.shadowMap.enabled=!0,b.shadowMap.type=he,b.toneMapping=ye,b.toneMappingExposure=1.1,t.current=b;const G=new Se(f,d);G.enableDamping=!0,G.dampingFactor=.05,G.maxPolarAngle=Math.PI/2+.05,G.minDistance=3.5,G.maxDistance=18,B.current=G;const M=new xe;v.add(M),N.current=M;const n=new ge("#ffffff",2,10,2);n.position.set(0,0,2.5),v.add(n),A.current=n;const P=new be(40,40),o=new J({color:new L("#0d111a"),roughness:.4,metalness:.8}),p=new ae(P,o);p.rotation.x=-Math.PI/2,p.position.y=-2,p.receiveShadow=!0,v.add(p);const l=new we(36,36,"#3b82f6","#1e293b");l.position.y=-1.99,l.material.transparent=!0,l.material.opacity=.45,v.add(l);const S=Ze();y.current=S;const E=ne(O.current.geometryType),I=O.current.selectedMaterial.createMaterial(S);re(S,O.current.materialParams,I);const F=new ae(E,I);F.castShadow=!0,F.receiveShadow=!0,v.add(F),R.current=F;const V=()=>{if(!d||!b||!f)return;const h=d.clientWidth,x=d.clientHeight;f.aspect=h/x,f.updateProjectionMatrix(),b.setSize(h,x,!1)},j=new ResizeObserver(V);j.observe(d);const z=new Ce;return b.setAnimationLoop(()=>{const h=z.getDelta(),x=z.getElapsedTime();y.current&&(y.current.uTime.value=x),R.current&&(R.current.rotation.y+=h*.12),G.update(),w.current&&w.current(h),b.render(v,f)}),()=>{j.disconnect(),b.setAnimationLoop(null),G.dispose(),P.dispose(),o.dispose(),v.traverse(h=>{h instanceof ae&&(h.geometry.dispose(),Array.isArray(h.material)?h.material.forEach(x=>x.dispose()):h.material.dispose())}),b.dispose()}},[a]),r.useEffect(()=>{const d=N.current;if(d){for(;d.children.length>0;){const v=d.children[0];d.remove(v)}switch(c){case"cyberpunk":{const v=new ee("#180c30",1.2),s=new H("#ec4899",3);s.position.set(5,6,4),s.castShadow=!0;const g=new H("#06b6d4",3);g.position.set(-5,3,-3),d.add(v,s,g);break}case"sunset":{const v=new ee("#2a1208",1.5),s=new H("#f97316",3.5);s.position.set(6,4,5),s.castShadow=!0;const g=new H("#818cf8",1.2);g.position.set(-4,2,-4),d.add(v,s,g);break}case"deepSpace":{const v=new ee("#050714",1),s=new H("#e0e7ff",2);s.position.set(2,8,3),s.castShadow=!0;const g=new H("#6366f1",2.5);g.position.set(-3,-2,-5),d.add(v,s,g);break}case"studio":default:{const v=new ee("#111827",2),s=new H("#ffffff",2.8);s.position.set(4,7,5),s.castShadow=!0,s.shadow.mapSize.width=2048,s.shadow.mapSize.height=2048;const g=new H("#93c5fd",1.5);g.position.set(-5,3,2);const f=new H("#a78bfa",1.8);f.position.set(0,-3,-5),d.add(v,s,g,f);break}}}},[c]),r.useEffect(()=>{const d=R.current;if(!d||!y.current)return;const v=d.material,s=u.createMaterial(y.current);re(y.current,i,s),d.material=s,Array.isArray(v)?v.forEach(g=>g.dispose()):v.dispose()},[u,i]),r.useEffect(()=>{const d=R.current;!d||!y.current||re(y.current,i,d.material)},[i]),r.useEffect(()=>{const d=R.current;if(!d)return;const v=d.geometry;d.geometry=ne(C),v.dispose()},[C]);const q=r.useCallback(()=>{T.current&&B.current&&(T.current.position.set(0,.8,7.2),B.current.target.set(0,0,0),B.current.update())},[]);return{sceneRef:W,cameraRef:T,rendererRef:t,mainMeshRef:R,pointerLightRef:A,uniformsRef:y,resetCamera:q}}function Je({canvasRef:a,cameraRef:u,mainMeshRef:i,pointerLightRef:C,uniformsRef:c,ballsRef:m,onSpawnBall:W}){const T=r.useMemo(()=>({current:new ie(0,0)}),[]),t=r.useMemo(()=>({current:new D(0,0,2.5)}),[]),B=r.useMemo(()=>({current:new D(0,0,2.5)}),[]),R=r.useRef({x:0,y:0,time:0}),A=r.useRef(0),y=r.useRef(!1),N=r.useMemo(()=>({current:new Me}),[]),w=r.useRef(null),O=r.useMemo(()=>({current:new se}),[]),q=r.useMemo(()=>({current:new D}),[]),d=r.useMemo(()=>({current:new D}),[]),v=r.useMemo(()=>({current:new D}),[]),s=r.useRef(0),g=r.useCallback(M=>{const n=a.current,P=u.current;if(!n||!P)return;const o=n.getBoundingClientRect(),p=(M.clientX-o.left)/o.width*2-1,l=-((M.clientY-o.top)/o.height)*2+1;T.current.set(p,l);const S=performance.now(),E=Math.max((S-R.current.time)/1e3,.001),F=Math.hypot(p-R.current.x,l-R.current.y)/E;if(A.current=oe.lerp(A.current,F,.3),R.current={x:p,y:l,time:S},N.current.setFromCamera(T.current,P),w.current){const j=w.current,z=new D;if(N.current.ray.intersectPlane(O.current,z)){const h=Math.max((S-s.current)/1e3,.001),k=new D().subVectors(z,d.current).divideScalar(h);v.current.lerp(k,.45),d.current.copy(z),s.current=S;const _=new D().subVectors(z,q.current);_.y=Math.max(_.y,-2+j.radius),j.position.copy(_),j.mesh.position.copy(_),j.velocity.set(0,0,0)}n.style.cursor="grabbing";return}if(m?.current&&m.current.length>0){const j=m.current.map(h=>h.mesh);if(N.current.intersectObjects(j,!1).length>0){n.style.cursor="grab";return}}const V=i.current;if(V){const j=N.current.intersectObject(V,!1);if(j.length>0)y.current=!0,t.current.copy(j[0].point),n.style.cursor="crosshair";else{y.current=!1;const z=new se(new D(0,0,1),0),h=new D;N.current.ray.intersectPlane(z,h),t.current.copy(h),n.style.cursor="default"}}},[a,u,i,m]),f=r.useCallback(M=>{if(M.button!==0)return;const n=a.current,P=u.current,o=i.current,p=c.current;if(!n||!P)return;const l=n.getBoundingClientRect(),S=(M.clientX-l.left)/l.width*2-1,E=-((M.clientY-l.top)/l.height)*2+1,I=new ie(S,E);if(N.current.setFromCamera(I,P),m?.current&&m.current.length>0){const j=m.current.map(h=>h.mesh),z=N.current.intersectObjects(j,!1);if(z.length>0){const h=z[0],x=h.object,k=m.current.find(_=>_.mesh===x);if(k){w.current=k,k.isDragged=!0;const _=new D;P.getWorldDirection(_).negate(),O.current.setFromNormalAndCoplanarPoint(_,h.point),q.current.subVectors(h.point,k.position),d.current.copy(h.point),s.current=performance.now(),v.current.set(0,0,0),n.style.cursor="grabbing",Z.playGrabSound();return}}}let F=B.current.clone();if(o){const j=N.current.intersectObject(o,!1);j.length>0&&(F=j[0].point.clone())}p&&(p.uClickPulse.value=1,p.uClickPosition.value.copy(F)),Z.playShockwaveSound();const V=new D((Math.random()-.5)*3,2.5+Math.random()*2,(Math.random()-.5)*3);W(F,V)},[a,u,i,c,m,W]),b=r.useCallback(()=>{if(w.current){const M=w.current;M.isDragged=!1;const n=v.current.clone();n.clampLength(0,14),M.velocity.copy(n),Z.playThrowSound(n.length()/4),w.current=null,a.current&&(a.current.style.cursor="default")}},[a]),G=r.useCallback(M=>{const n=c.current;if(B.current.lerp(t.current,M*12),A.current*=Math.pow(.92,M*60),C.current&&(C.current.position.set(B.current.x,B.current.y,B.current.z+1.2),C.current.intensity=y.current?3:1.5),i.current){const P=-T.current.y*.25,o=T.current.x*.35;i.current.rotation.x=oe.lerp(i.current.rotation.x,P,M*4),i.current.rotation.y=oe.lerp(i.current.rotation.y,o,M*4)}n&&(n.uMouse.value.copy(T.current),n.uMouse3D.value.copy(B.current),n.uMouseVelocity.value=A.current,n.uHover.value=oe.lerp(n.uHover.value,y.current?1:0,M*8),n.uClickPulse.value>.001&&(n.uClickPulse.value=Math.max(0,n.uClickPulse.value-M*1.8)))},[C,i,c]);return{handlePointerMove:g,handlePointerDown:f,handlePointerUp:b,updatePointerState:G}}const Y={gravity:-22,airResistance:.992,restitution:.74,floorLevel:-2,boundaryRadius:7,maxBalls:75};function Qe({sceneRef:a,activeMaterialColor:u}){const[i,C]=r.useState(0),[c,m]=r.useState(0),[W,T]=r.useState("matchCurrent"),[t,B]=r.useState(Y.gravity),[R,A]=r.useState(Y.restitution),y=r.useRef([]),N=r.useRef(null);r.useEffect(()=>(N.current=new Pe(.35,24,24),()=>{N.current&&N.current.dispose()}),[]);const w=r.useCallback((s,g)=>{switch(s){case"chrome":return new J({color:new L("#d1d5db"),metalness:.98,roughness:.08});case"golden":return new J({color:new L("#f59e0b"),metalness:.95,roughness:.15});case"crystalGlass":return new je({color:new L("#38bdf8"),metalness:.1,roughness:.05,transmission:.85,thickness:.8,transparent:!0,opacity:.9});case"neonGlow":{const f=["#ec4899","#06b6d4","#10b981","#a855f7","#f43f5e","#3b82f6"],b=f[Math.floor(Math.random()*f.length)];return new J({color:new L(b),emissive:new L(b),emissiveIntensity:.7,roughness:.2,metalness:.4})}case"matchCurrent":default:{const f=new L(g);return new J({color:f,emissive:f.clone().multiplyScalar(.25),roughness:.18,metalness:.85})}}},[]),O=r.useCallback((s,g)=>{const f=a.current;if(!f||!N.current)return;if(y.current.length>=Y.maxBalls){const l=y.current.shift();l&&(f.remove(l.mesh),Array.isArray(l.mesh.material)?l.mesh.material.forEach(S=>S.dispose()):l.mesh.material.dispose())}const b=$(.28,.42),G=b/.35,M=w(W,u),n=new ae(N.current,M);n.scale.set(G,G,G),n.castShadow=!0,n.receiveShadow=!0;const P=s?new D(s.x+$(-.3,.3),Math.max(s.y+1.2,2.5),s.z+$(-.3,.3)):new D($(-1.5,1.5),$(3.5,5.5),$(-1.5,1.5));n.position.copy(P),f.add(n);const o=g?g.clone():new D($(-1.8,1.8),$(-1,1),$(-1.8,1.8)),p={id:Math.random().toString(36).substring(2,9),mesh:n,position:P,velocity:o,radius:b,mass:b*2.5,bounciness:R+$(-.06,.06),color:new L(u),trailColor:new L(u),materialType:W,age:0,maxAge:45,isGrounded:!1,bounceCount:0};y.current.push(p),Z.playDropSound(1/G),C(l=>{const S=l+1;return S%25===0&&Ne({particleCount:50,spread:60,origin:{y:.8}}),S}),m(y.current.length)},[a,u,W,R,w]),q=r.useCallback(s=>{if(!a.current)return;const f=y.current,b=Math.min(s,.05),G=t,M=Y.floorLevel,n=Y.boundaryRadius;for(let P=0;P<f.length;P++){const o=f[P];if(o.isDragged){o.mesh.position.copy(o.position);continue}o.velocity.y+=G*b,o.velocity.multiplyScalar(Math.pow(Y.airResistance,b*60)),o.position.addScaledVector(o.velocity,b);const p=M+o.radius;if(o.position.y<=p){o.position.y=p;const E=Math.abs(o.velocity.y);E>.45?(o.velocity.y=E*o.bounciness,o.velocity.x*=.88,o.velocity.z*=.88,o.bounceCount++,Z.playBounceSound(E),o.mesh.scale.set(o.radius/.35*1.25,o.radius/.35*.75,o.radius/.35*1.25)):(o.velocity.y=0,o.velocity.x*=.94,o.velocity.z*=.94,o.isGrounded=!0)}const l=o.radius/.35;if(o.mesh.scale.lerp(new D(l,l,l),b*10),Math.sqrt(o.position.x*o.position.x+o.position.z*o.position.z)>n-o.radius){const E=Math.atan2(o.position.z,o.position.x);o.position.x=Math.cos(E)*(n-o.radius),o.position.z=Math.sin(E)*(n-o.radius),o.velocity.x*=-.7,o.velocity.z*=-.7}o.mesh.position.copy(o.position),o.mesh.rotation.x+=o.velocity.z*b*2,o.mesh.rotation.z-=o.velocity.x*b*2}for(let P=0;P<f.length;P++)for(let o=P+1;o<f.length;o++){const p=f[P],l=f[o],S=l.position.x-p.position.x,E=l.position.y-p.position.y,I=l.position.z-p.position.z,F=S*S+E*E+I*I,V=p.radius+l.radius;if(F<V*V&&F>1e-4){const j=Math.sqrt(F),z=S/j,h=E/j,x=I/j,k=(V-j)*.5;p.position.x-=z*k,p.position.y-=h*k,p.position.z-=x*k,l.position.x+=z*k,l.position.y+=h*k,l.position.z+=x*k;const _=l.velocity.x-p.velocity.x,le=l.velocity.y-p.velocity.y,ce=l.velocity.z-p.velocity.z,te=_*z+le*h+ce*x;if(te<0){const X=-1.518*te*.5;p.velocity.x-=X*z,p.velocity.y-=X*h,p.velocity.z-=X*x,l.velocity.x+=X*z,l.velocity.y+=X*h,l.velocity.z+=X*x}}}},[a,t]),d=r.useCallback(()=>{const s=a.current;s&&(y.current.forEach(g=>{s.remove(g.mesh),Array.isArray(g.mesh.material)?g.mesh.material.forEach(f=>f.dispose()):g.mesh.material.dispose()}),y.current=[],m(0))},[a]),v=r.useCallback(()=>{C(0)},[]);return{totalDropped:i,activeBallCount:c,ballStyle:W,setBallStyle:T,gravity:t,setGravity:B,restitution:R,setRestitution:A,spawnBall:O,updatePhysics:q,clearBalls:d,resetCounter:v,ballsRef:y}}const eo=({selectedMaterial:a,onSelectMaterial:u})=>{const i=c=>{c.id!==a.id&&(Z.playMaterialSwitchSound(),u(c))},C=(c,m)=>{(c.key==="Enter"||c.key===" ")&&(c.preventDefault(),i(m))};return e.jsxs("aside",{className:"gallery-container","aria-label":"Galería interactiva de materiales procedimentales",children:[e.jsxs("div",{className:"gallery-header",children:[e.jsx(ze,{size:16,className:"text-cyan","aria-hidden":"true"}),e.jsx("h2",{children:"Galería de Materiales Interactivos"})]}),e.jsx("div",{className:"gallery-cards-list",role:"listbox","aria-label":"Catálogo de materiales 3D",children:U.map(c=>{const m=c.id===a.id;return e.jsxs("div",{className:`material-card ${m?"active":""}`,onClick:()=>i(c),role:"option","aria-selected":m,"aria-label":`Material ${c.name}, categoría ${c.category}. ${c.description}`,tabIndex:0,onKeyDown:W=>C(W,c),children:[e.jsxs("div",{className:"card-top",children:[e.jsx("div",{className:"color-orb","aria-hidden":"true",style:{background:`linear-gradient(135deg, ${c.color}, ${c.secondaryColor})`,boxShadow:`0 0 12px ${c.color}80`}}),e.jsx("span",{className:"material-category",children:c.category}),e.jsx("span",{className:"material-badge",children:c.badge}),m&&e.jsx(ke,{size:16,className:"check-icon","aria-label":"Seleccionado actualmente"})]}),e.jsx("h3",{className:"material-title",children:c.name}),e.jsx("p",{className:"material-description",children:c.description})]},c.id)})})]})},oo=({geometryType:a,environmentPreset:u,params:i,onSelectGeometry:C,onSelectEnvironment:c,onChangeParams:m})=>{const W=[{id:"sphere",label:"Esfera"},{id:"torusKnot",label:"Nudo"},{id:"icosahedron",label:"Icosaedro"},{id:"dodecahedron",label:"Dodecaedro"},{id:"roundedBox",label:"Cubo"},{id:"torus",label:"Toroide"},{id:"creditCard",label:"Tarjeta"}],T=[{id:"studio",label:"Estudio"},{id:"cyberpunk",label:"Cyberpunk"},{id:"sunset",label:"Sunset"},{id:"deepSpace",label:"Espacio"}];return e.jsxs("aside",{className:"inspector-container","aria-label":"Inspector de Parámetros de Escena y Materiales",children:[e.jsxs("div",{className:"inspector-header",children:[e.jsx(Re,{size:16,className:"text-cyan","aria-hidden":"true"}),e.jsx("h2",{children:"Inspector de Escena y Material"})]}),e.jsxs("div",{className:"inspector-sections",children:[e.jsxs("section",{className:"inspector-section","aria-label":"Selección de geometría 3D",children:[e.jsxs("div",{className:"section-title",children:[e.jsx(Te,{size:14,"aria-hidden":"true"}),e.jsx("span",{children:"Malla 3D"})]}),e.jsx("div",{className:"button-grid",role:"group","aria-label":"Geometrías disponibles",children:W.map(t=>e.jsx("button",{type:"button",className:`grid-btn ${a===t.id?"active":""}`,onClick:()=>C(t.id),"aria-pressed":a===t.id,"aria-label":`Geometría: ${t.label}`,children:t.label},t.id))})]}),e.jsxs("section",{className:"inspector-section","aria-label":"Selección de iluminación de entorno",children:[e.jsxs("div",{className:"section-title",children:[e.jsx(Ge,{size:14,"aria-hidden":"true"}),e.jsx("span",{children:"Ambiente y Luces"})]}),e.jsx("div",{className:"button-grid",role:"group","aria-label":"Entornos de iluminación disponibles",children:T.map(t=>e.jsx("button",{type:"button",className:`grid-btn ${u===t.id?"active":""}`,onClick:()=>c(t.id),"aria-pressed":u===t.id,"aria-label":`Entorno lumínico: ${t.label}`,children:t.label},t.id))})]}),e.jsxs("section",{className:"inspector-section","aria-label":"Parámetros del shader procedural",children:[e.jsxs("div",{className:"section-title",children:[e.jsx(We,{size:14,"aria-hidden":"true"}),e.jsx("span",{children:"Propiedades del Shader"})]}),e.jsxs("div",{className:"control-field",children:[e.jsxs("div",{className:"field-header",children:[e.jsx("span",{id:"label-distortion",children:"Deformación / Ondas"}),e.jsx("span",{children:i.distortion.toFixed(2)})]}),e.jsx("input",{type:"range",min:0,max:3,step:.05,value:i.distortion,"aria-labelledby":"label-distortion","aria-label":"Deformación de ondas del shader","aria-valuemin":0,"aria-valuemax":3,"aria-valuenow":i.distortion,onChange:t=>m({distortion:Number(t.target.value)})})]}),e.jsxs("div",{className:"control-field",children:[e.jsxs("div",{className:"field-header",children:[e.jsx("span",{id:"label-speed",children:"Velocidad de Flujo"}),e.jsx("span",{children:i.speed.toFixed(2)})]}),e.jsx("input",{type:"range",min:.1,max:3,step:.05,value:i.speed,"aria-labelledby":"label-speed","aria-label":"Velocidad de flujo de animación del shader","aria-valuemin":.1,"aria-valuemax":3,"aria-valuenow":i.speed,onChange:t=>m({speed:Number(t.target.value)})})]}),e.jsxs("div",{className:"control-field",children:[e.jsxs("div",{className:"field-header",children:[e.jsx("span",{id:"label-roughness",children:"Rugosidad (Roughness)"}),e.jsx("span",{children:i.roughness.toFixed(2)})]}),e.jsx("input",{type:"range",min:0,max:1,step:.02,value:i.roughness,"aria-labelledby":"label-roughness","aria-label":"Rugosidad de la superficie del material","aria-valuemin":0,"aria-valuemax":1,"aria-valuenow":i.roughness,onChange:t=>m({roughness:Number(t.target.value)})})]}),e.jsxs("div",{className:"control-field",children:[e.jsxs("div",{className:"field-header",children:[e.jsx("span",{id:"label-metalness",children:"Metalicidad (Metalness)"}),e.jsx("span",{children:i.metalness.toFixed(2)})]}),e.jsx("input",{type:"range",min:0,max:1,step:.02,value:i.metalness,"aria-labelledby":"label-metalness","aria-label":"Metalicidad reflectante del material","aria-valuemin":0,"aria-valuemax":1,"aria-valuenow":i.metalness,onChange:t=>m({metalness:Number(t.target.value)})})]}),e.jsxs("div",{className:"colors-row",children:[e.jsxs("div",{className:"color-field",children:[e.jsx("label",{htmlFor:"input-color-pri",children:"Primario"}),e.jsx("input",{id:"input-color-pri",type:"color",value:i.color,"aria-label":"Color primario del shader",onChange:t=>m({color:t.target.value})})]}),e.jsxs("div",{className:"color-field",children:[e.jsx("label",{htmlFor:"input-color-sec",children:"Secundario"}),e.jsx("input",{id:"input-color-sec",type:"color",value:i.secondaryColor,"aria-label":"Color secundario de acento del shader",onChange:t=>m({secondaryColor:t.target.value})})]})]}),e.jsxs("div",{className:"toggle-field",children:[e.jsxs("div",{className:"toggle-label",children:[e.jsx(Ee,{size:14,"aria-hidden":"true"}),e.jsx("span",{id:"label-wireframe",children:"Modo Wireframe"})]}),e.jsxs("label",{className:"switch",htmlFor:"input-toggle-wireframe",children:[e.jsx("input",{id:"input-toggle-wireframe",type:"checkbox",checked:i.wireframe,"aria-labelledby":"label-wireframe","aria-label":"Alternar visualización de malla alámbrica wireframe",onChange:t=>m({wireframe:t.target.checked})}),e.jsx("span",{className:"slider round","aria-hidden":"true"})]})]})]})]})]})},ao=({totalDropped:a,activeBalls:u,ballStyle:i,gravity:C,restitution:c,onDropBall:m,onDropBurst:W,onClearBalls:T,onResetCounter:t,onSelectBallStyle:B,onChangeGravity:R,onChangeRestitution:A})=>{const[y,N]=r.useState(!1);return e.jsxs("section",{className:"ball-counter-hud","aria-label":"Panel de Control y Físicas de Pelotas 3D",children:[e.jsxs("div",{className:"counter-display",role:"region","aria-label":"Marcador digital de pelotas",children:[e.jsxs("div",{className:"counter-label-group",children:[e.jsx("span",{className:"counter-badge",children:"SIMULADOR FÍSICO 3D"}),e.jsx("span",{className:"counter-title",children:"Pelotas Lanzadas"})]}),e.jsx("div",{className:"counter-number-wrapper",children:e.jsx("span",{className:"counter-number",role:"status","aria-live":"polite","aria-atomic":"true","aria-label":`${a} pelotas lanzadas en total`,children:a},a)}),e.jsxs("div",{className:"counter-meta",children:[e.jsxs("div",{className:"meta-item",children:[e.jsx("span",{className:"meta-dot live","aria-hidden":"true"}),e.jsxs("span",{"aria-label":`${u} pelotas activas en pantalla`,children:[u," en escena"]})]}),e.jsxs("button",{type:"button",className:"mini-text-btn",onClick:t,title:"Reiniciar contador a 0","aria-label":"Reiniciar contador de pelotas a cero",children:[e.jsx(Be,{size:12,"aria-hidden":"true"}),e.jsx("span",{children:"Reset"})]})]})]}),e.jsxs("div",{className:"hud-actions-row",role:"toolbar","aria-label":"Acciones de lanzamiento y físicas",children:[e.jsxs("button",{type:"button",className:"btn-launch-ball",onClick:m,id:"btn-drop-ball","aria-label":"Soltar una pelota 3D en el escenario",children:[e.jsx(Fe,{size:18,className:"icon-pulse fill-current","aria-hidden":"true"}),e.jsx("span",{className:"btn-text",children:"SOLTAR PELOTA"})]}),e.jsxs("button",{type:"button",className:"btn-burst",onClick:()=>W(5),title:"Soltar ráfaga de 5 pelotas","aria-label":"Soltar ráfaga rápida de 5 pelotas 3D",children:[e.jsx(Ae,{size:16,"aria-hidden":"true"}),e.jsx("span",{children:"x5"})]}),e.jsx("button",{type:"button",className:"btn-icon-clear",onClick:T,title:"Limpiar pelotas del suelo","aria-label":"Limpiar y eliminar todas las pelotas del escenario",disabled:u===0,children:e.jsx(Ve,{size:16,"aria-hidden":"true"})}),e.jsx("button",{type:"button",className:`btn-icon-toggle ${y?"active":""}`,onClick:()=>N(!y),title:"Ajustar gravedad y rebote","aria-label":"Configurar parámetros físicos de gravedad y rebote","aria-expanded":y,children:e.jsx(Le,{size:16,"aria-hidden":"true"})})]}),e.jsx("div",{className:"hud-ball-styles",role:"group","aria-label":"Selector de acabado de pelotas",children:e.jsxs("div",{className:"style-chips",children:[e.jsx("span",{className:"chips-label",children:"Estilo:"}),[{id:"matchCurrent",label:"Material"},{id:"neonGlow",label:"Neón"},{id:"chrome",label:"Cromo"},{id:"golden",label:"Oro"},{id:"crystalGlass",label:"Cristal"}].map(w=>e.jsxs("button",{type:"button",className:`chip-btn ${i===w.id?"active":""}`,onClick:()=>B(w.id),"aria-pressed":i===w.id,"aria-label":`Estilo de material para pelota: ${w.label}`,children:[e.jsx(Ie,{size:11,"aria-hidden":"true"}),e.jsx("span",{children:w.label})]},w.id))]})}),y&&e.jsxs("div",{className:"physics-popup",role:"region","aria-label":"Ajustes de variables de física",children:[e.jsxs("div",{className:"slider-group",children:[e.jsxs("div",{className:"field-header",children:[e.jsx("span",{id:"label-gravity",children:"Gravedad"}),e.jsxs("span",{children:[Math.abs(C).toFixed(0)," m/s²"]})]}),e.jsx("input",{type:"range",min:-40,max:-5,step:1,value:C,"aria-labelledby":"label-gravity","aria-label":"Fuerza de aceleración de gravedad","aria-valuemin":-40,"aria-valuemax":-5,"aria-valuenow":C,onChange:w=>R(Number(w.target.value))})]}),e.jsxs("div",{className:"slider-group",children:[e.jsxs("div",{className:"field-header",children:[e.jsx("span",{id:"label-restitution",children:"Elasticidad (Rebote)"}),e.jsxs("span",{children:[(c*100).toFixed(0),"%"]})]}),e.jsx("input",{type:"range",min:.2,max:.95,step:.02,value:c,"aria-labelledby":"label-restitution","aria-label":"Coeficiente de restitución elástica de rebote","aria-valuemin":.2,"aria-valuemax":.95,"aria-valuenow":c,onChange:w=>A(Number(w.target.value))})]})]}),e.jsx("div",{className:"hud-hint","aria-hidden":"true",children:e.jsx("span",{children:"💡 Clic en cualquier punto del 3D para lanzar una pelota allí"})})]})},ro=({canvasRef:a,onPointerMove:u,onPointerDown:i,onPointerUp:C})=>e.jsxs("div",{className:"canvas-container",children:[e.jsx("canvas",{ref:a,className:"webgl-canvas",role:"img","aria-label":"Lienzo interactivo 3D: renderizado de mallas con shaders procedurales y simulación de físicas",tabIndex:0,onPointerMove:u,onPointerDown:i,onPointerUp:C,children:e.jsx("p",{children:"Tu navegador no soporta Canvas WebGL. Se muestra una escena interactiva 3D con deformación de materiales y simulación de pelotas físicas."})}),e.jsxs("div",{className:"viewport-overlay-hint","aria-hidden":"true",children:[e.jsxs("div",{className:"hint-pill",children:[e.jsx(_e,{size:14,className:"text-cyan animate-bounce","aria-hidden":"true"}),e.jsx("span",{children:"Clic: Deforma material & suelta pelota"})]}),e.jsxs("div",{className:"hint-pill",children:[e.jsx(Oe,{size:14,className:"text-pink animate-pulse","aria-hidden":"true"}),e.jsx("span",{children:"Arrastra pelotas directamente para lanzarlas"})]})]})]});function mo(){De({title:"Nexus3D // Estudio de Materiales Interactivos & Simulador Físico",description:"Experimenta con shaders procedurales dinámicos, simulación de físicas de gravedad y colisión, y catálogo interactivo de materiales Three.js."});const a=r.useRef(null),[u,i]=r.useState(U[0]),[C,c]=r.useState({roughness:U[0].roughness,metalness:U[0].metalness,distortion:U[0].distortion,speed:U[0].speed,color:U[0].color,secondaryColor:U[0].secondaryColor,wireframe:!1}),[m,W]=r.useState("sphere"),[T,t]=r.useState("studio"),B=r.useCallback(x=>{i(x),c({roughness:x.roughness,metalness:x.metalness,distortion:x.distortion,speed:x.speed,color:x.color,secondaryColor:x.secondaryColor,wireframe:!1})},[]),R=r.useCallback(x=>{c(k=>({...k,...x}))},[]),A=r.useRef(null),y=r.useRef(null),N=r.useCallback(x=>{y.current&&y.current(x),A.current&&A.current(x)},[]),{sceneRef:w,cameraRef:O,mainMeshRef:q,pointerLightRef:d,uniformsRef:v}=Ke({canvasRef:a,selectedMaterial:u,materialParams:C,geometryType:m,environmentPreset:T,onFrameUpdate:N}),{totalDropped:s,activeBallCount:g,ballStyle:f,setBallStyle:b,gravity:G,setGravity:M,restitution:n,setRestitution:P,spawnBall:o,updatePhysics:p,clearBalls:l,resetCounter:S,ballsRef:E}=Qe({sceneRef:w,activeMaterialColor:C.color});r.useEffect(()=>{A.current=p},[p]);const{handlePointerMove:I,handlePointerDown:F,handlePointerUp:V,updatePointerState:j}=Je({canvasRef:a,cameraRef:O,mainMeshRef:q,pointerLightRef:d,uniformsRef:v,ballsRef:E,onSpawnBall:(x,k)=>o(x,k)});r.useEffect(()=>{y.current=j},[j]);const z=r.useCallback(()=>{o(new D((Math.random()-.5)*1.5,4+Math.random(),(Math.random()-.5)*1.5),new D((Math.random()-.5)*2,-1,(Math.random()-.5)*2))},[o]),h=r.useCallback(x=>{for(let k=0;k<x;k++)setTimeout(()=>{o(new D((Math.random()-.5)*2.5,4.5+Math.random()*1.5,(Math.random()-.5)*2.5),new D((Math.random()-.5)*3.5,-.5+Math.random()*1.5,(Math.random()-.5)*3.5))},k*65)},[o]);return e.jsxs("main",{className:"main-viewport",children:[e.jsx(ro,{canvasRef:a,onPointerMove:I,onPointerDown:F,onPointerUp:V}),e.jsx(eo,{selectedMaterial:u,onSelectMaterial:B}),e.jsx(oo,{geometryType:m,environmentPreset:T,params:C,onSelectGeometry:W,onSelectEnvironment:t,onChangeParams:R}),e.jsx(ao,{totalDropped:s,activeBalls:g,ballStyle:f,gravity:G,restitution:n,onDropBall:z,onDropBurst:h,onClearBalls:l,onResetCounter:S,onSelectBallStyle:b,onChangeGravity:M,onChangeRestitution:P})]})}export{mo as MaterialsStudioView};
