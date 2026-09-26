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

### 5. 🌐 Red de Esferas Lumínicas & Tubos Conductores (Nuevo)
- **Generador Dinámico de Esferas:** Creación libre en el espacio 3D o con clic directo en el suelo reflectante holográfico.
- **Conductores de Plasma Fotónico:** Conexión interactiva mediante tubos cilíndricos con shaders GLSL de pulsos de luz animados.
- **Tubos Libres Sin Nodo (Cortos y Largos):**
  - Posibilidad de acoplar tubos radiantes a cualquier esfera sin necesidad de un nodo de llegada.
  - Opciones de longitud: **Corto (~1.8m)** y **Largo (~5.2m)** con botón de alternancia en vivo.
  - Punta con electrodo terminal de chispa y `PointLight` localizada.
- **Respuesta Lumínica Instantánea:**
  - Las esferas aisladas permanecen en estado latente/dormido.
  - Al conectarles tubos (ya sea a otra esfera o tubos libres sin nodo), ¡se cierran los circuitos, se encienden al instante con halos fotónicos y proyectan luz dinámica real!
- **Modos de Interacción:** Alternancia fluida entre trazado de tubos táctil y arrastre/reposicionamiento espacial 3D con actualización geométrica en tiempo real.
- **Presets Geométricos:** Constelación Cuántica, Anillo de Resonancia, Triángulo de Plasma, Cubo Reticular y Átomo con Sondas.
- **Esferas Regulables de Tamaño Individual:**
  - Control de radio continuo desde `0.25m` (micro) hasta `1.40m` (titán).
  - Presets instantáneos en el Inspector: **Mini (0.35m)**, **Normal (0.55m)**, **Grande (0.85m)** y **Titán (1.20m)**.
  - Escalado geométrico de halos, anillos de selección y radio lumínico de PointLights con retroalimentación sonora tonal modulada por frecuencia.
- **Telemetría Energética:** Contador de nodos iluminados, tubos activos, tubos libres, potencia simulada en MegaWatts y cobertura de red.

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
