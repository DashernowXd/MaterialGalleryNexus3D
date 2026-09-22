---
name: react-3d-architect
description: >-
  Architects, configures, and optimizes React Three Fiber (R3F) and Three.js 3D scenes.
  Use when creating 3D canvases, loading GLTF models, setting up lighting and cameras,
  or optimizing WebGL draw calls and GPU memory in React applications.
---

# React 3D Architect Skill (Ejemplo Canónico)

Guía de diseño, arquitectura y mejores prácticas para escenas interactivas en React con Three.js y React Three Fiber.

---

## 1. Principios de Renderizado en React 3D

1. **Aislamiento del Ciclo de Vida de React**: Nunca provoques re-renders de React para animaciones por fotograma (`60/120 FPS`). Usa exclusivamente el hook `useFrame` mutando refs directamente.
2. **Gestión de Recursos y Desecho (*Disposal*)**: Todo recurso WebGL (`BufferGeometry`, `Material`, `Texture`) debe liberarse explícitamente en el desmontaje de componentes para evitar memory leaks en GPU.
3. **Control Estricto de Draw Calls**: Agrupa geometrías idénticas mediante `InstancedMesh` en lugar de instanciar múltiples mallas individuales.

---

## 2. Patrón de Animación Idiomático

### ✅ Correcto (Mutación directa en `useFrame`)
```tsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

export function RotatingCube() {
  const meshRef = useRef<Mesh>(null!);

  useFrame((_, delta) => {
    meshRef.current.rotation.x += delta * 0.5;
    meshRef.current.rotation.y += delta * 0.7;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4f46e5" />
    </mesh>
  );
}
```

### ❌ Incorrecto (Estado de React en bucle de animación)
```tsx
// ANTIPATRÓN CRÍTICO: Provoca 60 re-renders de React por segundo y colapsa el Garbage Collector
const [rotation, setRotation] = useState(0);
useFrame((_, delta) => setRotation(r => r + delta));
```

---

## 3. Checklist de Verificación de Rendimiento

- [ ] ¿Los modelos GLTF están comprimidos con Draco o Meshopt (`gltf-pipeline` o `gltfjsx`)?
- [ ] ¿El pixel ratio está limitado a un máximo de 2 (`gl={{ powerPreference: 'high-performance' }}`)?
- [ ] ¿Se eliminaron texturas duplicadas y se usan mapas de baja resolución para dispositivos móviles?

---

## 4. Documentación de Soporte

* [Optimización de Memoria GPU y Draw Calls](./references/three-optimization.md)
