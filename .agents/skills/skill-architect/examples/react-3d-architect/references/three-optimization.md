# Guía de Optimización de Memoria GPU y Draw Calls en Three.js

Referencia técnica profunda para la skill `react-3d-architect`.

---

## 1. Reglas de Gestión de Memoria WebGL

Three.js delega la gestión de texturas y geometrías a WebGL, las cuales se alojan en la memoria VRAM de la GPU. El Garbage Collector de JavaScript NO libera estos recursos de forma automática.

### Disposición Manual de Geometrías y Materiales

```typescript
useEffect(() => {
  return () => {
    // Al desmontar el componente:
    geometry.dispose();
    material.dispose();
    texture.dispose();
  };
}, [geometry, material, texture]);
```

---

## 2. Reducción de Draw Calls con InstancedMesh

Cuando se renderizan más de 50 objetos que comparten la misma geometría y material:

```tsx
import { useRef, useLayoutEffect } from 'react';
import { InstancedMesh, Object3D } from 'three';

const dummy = new Object3D();

export function ParticleField({ count = 500 }) {
  const meshRef = useRef<InstancedMesh>(null!);

  useLayoutEffect(() => {
    for (let i = 0; i < count; i++) {
      dummy.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshBasicMaterial color="#38bdf8" />
    </instancedMesh>
  );
}
```
