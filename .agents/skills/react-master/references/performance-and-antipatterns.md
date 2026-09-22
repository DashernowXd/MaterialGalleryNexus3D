# Catálogo de Antipatrones y Optimización de Rendimiento en React

Esta referencia documenta los errores más destructivos encontrados en código React de producción y las soluciones idiomáticas para mitigarlos.

---

## 1. Antipatrones Críticos y Cómo Corregirlos

### Antipatrón 1: Declarar Componentes dentro de Componentes
* ❌ **Problema**: Declarar una función de componente dentro del cuerpo de otro componente hace que en **cada render** se cree una nueva definición de tipo de componente. React destruye el subárbol del DOM y lo recrea desde cero, perdiendo foco de inputs, estado local y causando parpadeos.
```tsx
// ❌ PÉSIMO
function ParentComponent() {
  function SubItem({ text }: { text: string }) {
    return <span>{text}</span>;
  }
  return <div><SubItem text="Hola" /></div>;
}
```
* ✅ **Solución**: Declara los subcomponentes fuera, en el módulo superior, o extráelos a su propio archivo:
```tsx
// ✅ CORRECTO
function SubItem({ text }: { text: string }) {
  return <span>{text}</span>;
}

function ParentComponent() {
  return <div><SubItem text="Hola" /></div>;
}
```

---

### Antipatrón 2: Closures Obsoletos (*Stale Closures*)
* ❌ **Problema**: Al usar callbacks o timers (`setInterval`, `setTimeout`) sin dependencias completas o sin updater functions, el closure captura la variable de estado en el momento inicial y nunca lee el valor actualizado.
```tsx
// ❌ PÉSIMO: Siempre incrementa de 0 a 1 y se queda atascado
useEffect(() => {
  const timer = setInterval(() => {
    setCount(count + 1); // Lee el valor estancado de 'count'
  }, 1000);
  return () => clearInterval(timer);
}, []);
```
* ✅ **Solución**: Usa la función updater:
```tsx
// ✅ CORRECTO
useEffect(() => {
  const timer = setInterval(() => {
    setCount(prev => prev + 1); // Siempre lee el valor fresco más reciente
  }, 1000);
  return () => clearInterval(timer);
}, []);
```

---

### Antipatrón 3: Uso del Índice del Array como `key` en Listas Dinámicas
* ❌ **Problema**: Si la lista se reordena, se filtran elementos o se insertan en la parte superior, los inputs o elementos con estado interno mantendrán el estado del índice anterior, provocando bugs visuales graves e inconsistencias.
```tsx
// ❌ PÉSIMO
{items.map((item, index) => (
  <TaskItem key={index} task={item} />
))}
```
* ✅ **Solución**: Usa identificadores únicos inmutables:
```tsx
// ✅ CORRECTO
{items.map(item => (
  <TaskItem key={item.id} task={item} />
))}
```

---

### Antipatrón 4: Objetos o Funciones Inline como Dependencias de Efectos
* ❌ **Problema**: En JavaScript, `{}` !== `{}` y `() => {}` !== `() => {}`. Pasar un objeto literal dentro de las dependencias de `useEffect` causa un bucle infinito o re-ejecución continua en cada render.
```tsx
// ❌ PÉSIMO: 'options' tiene nueva referencia en cada render
function Component({ userId }: { userId: string }) {
  const options = { userId, mode: 'detailed' };

  useEffect(() => {
    fetchUserData(options);
  }, [options]); // Se ejecuta infinitamente
}
```
* ✅ **Solución**: Desestructura primitivos o mueve el objeto dentro del efecto:
```tsx
// ✅ CORRECTO
function Component({ userId }: { userId: string }) {
  useEffect(() => {
    const options = { userId, mode: 'detailed' };
    fetchUserData(options);
  }, [userId]); // Solo depende del primitivo estable
}
```

---

## 2. Diagnóstico de Rendimiento

### ¿Cuándo usar `React.memo`?
Usa `React.memo` **únicamente** cuando:
1. El componente se re-renderiza frecuentemente con exactamente las mismas props.
2. El costo computacional del renderizado del componente es pesado (cientos de nodos DOM o cálculos SVG/gráficos).
3. Sus props son primitivas o referencias estables mediante `useCallback` / `useMemo`.

> [!CAUTION]
> Envolver componentes pequeños y ligeros en `React.memo` añade sobrecarga de comparación superficial en cada ciclo sin generar beneficios medibles.
