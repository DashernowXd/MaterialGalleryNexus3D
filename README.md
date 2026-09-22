# Nexus3D // MaterialGalleryNexus3D

> **Laboratorio 3D Interactivo y Estudio de Shaders Procedurales con React 19 y Three.js (r174)**

🌐 **Demo en Vivo (GitHub Pages):** [https://dashernowxd.github.io/MaterialGalleryNexus3D/](https://dashernowxd.github.io/MaterialGalleryNexus3D/)

---

## 🌟 Características Principales

### 1. 🎨 Estudio de Materiales & Shaders Procedurales
- **Shaders GLSL Personalizados:**
  - `Holographic`: Refracción y resplandor dinámico con reactividad al cursor.
  - `Magma`: Ondas térmicas y grietas de calor incandescentes.
  - `Plasma`: Fluctuaciones electromagnéticas con velocidad de arrastre reactiva.
  - `Liquid Mercury`: Superficie fluida reflectante con atenuación Fresnel optimizada para GPU.
  - `Prismatic Glass`: Dispersión cromática y refracción interna con aberración de color.
  - `Bioluminescent`: Emisión de pulsos orgánicos luminosos en tiempo real.
- **Materiales PBR Estándar y Físicos:** Ajustes de rugosidad, metalicidad, wireframe, colorimetría e iluminación ambiental HDR.
- **Inspector de Geometrías:** Modos esfera, toroide, icosaedro, nudo toroidal y plano deformado.

### 2. 🕹️ Botonera 3D Háptica
- Elementos 3D interactivos con retroalimentación física:
  - Pulsador de impacto con compresión elástica y resplandor LED.
  - Interruptor basculante (Toggle Switch) con detección angular.
  - Perilla giratoria (Rotary Knob) con cálculo de torque radial.
- **Web Audio API:** Síntesis sonora procedural en tiempo real (clics mecánicos, resonancias de activación).

### 3. 💳 Visualizador de Tarjeta Titanium Prime
- Renderizado de tarjeta de crédito metálica con efecto mate de titanio y cepillado procedural.
- Inclinación magnética siguiendo la inercia del ratón/touch.
- Giro háptico de 180° para visualizar el reverso con chip y banda holográfica.

### 4. ⚡ Simulador de Físicas de Esferas
- Generación dinámica de esferas con simulación de gravedad, restitución y rebote elástico.
- Interacción de colisión con el puntero en el espacio tridimensional.

---

## 🚀 Tecnologías

- **React 19** (`react`, `react-dom`, `react-router-dom` con `HashRouter` para soporte nativo en GitHub Pages)
- **Three.js (r174)**: Renderizado WebGL 3D, búferes geométricos y shader materials
- **TypeScript**: Tipado estricto en todas las capas
- **Vite**: Bundler ultrarrápido con segmentación de chunks (`manualChunks`)
- **Web Audio API**: Síntesis de sonido estéreo sin dependencias externas de audio pesado
- **CSS3 Moderno**: Estética Cyberpunk/Glassmorphism con paleta oscura y diseño responsivo

---

## 💻 Desarrollo Local

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:5173/](http://localhost:5173/) en tu navegador.

3. **Compilar para producción:**
   ```bash
   npm run build
   ```

4. **Desplegar a GitHub Pages manualmente:**
   ```bash
   npm run deploy
   ```

---

## ⚙️ Despliegue Automatizado con GitHub Actions

El repositorio incluye un flujo CI/CD preconfigurado en `.github/workflows/deploy.yml`. Cada vez que se hace `git push` a la rama `main`, GitHub compila automáticamente el proyecto y lo despliega en GitHub Pages.

---

## 📄 Licencia

Distribuido bajo la Licencia MIT.
