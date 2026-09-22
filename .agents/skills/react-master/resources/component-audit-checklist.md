# Checklist de Auditoría de Calidad para Componentes React (12 Puntos)

Utiliza este checklist para validar rigurosamente cualquier componente nuevo o refactorizado antes de integrarlo a producción.

---

### 1. Inmutabilidad y Estado
- [ ] ¿Se evita cualquier mutación directa de `state` o `props` (`.push()`, `.splice()`, mutación de propiedades de objeto)?
- [ ] ¿Las actualizaciones que dependen del estado anterior utilizan la función updater (`setCount(c => c + 1)`)?

### 2. Pureza e Idempotencia
- [ ] ¿La función del componente es pura durante el renderizado (sin llamadas a APIs, sin alterar variables globales, sin modificar el DOM directamente fuera de efectos)?

### 3. Uso Riguroso de Hooks
- [ ] ¿Los hooks están declarados estrictamente en el nivel superior de la función (sin `if`, sin bucles)?
- [ ] ¿Se evitan usos redundantes de `useEffect` para calcular valores que podrían calcularse en línea durante el render?
- [ ] ¿Todos los `useEffect` con suscripciones, timers o listeners de ventanas incluyen su respectiva función de limpieza (*cleanup*)?

### 4. Renderizado de Listas y Claves
- [ ] ¿Todos los `.map()` utilizan una propiedad `key` única, estable y determinista (evitando `index` en listas mutables/reordenables)?

### 5. Rendimiento y Renders Innecesarios
- [ ] ¿Se evita declarar funciones de componentes dentro de otros componentes?
- [ ] ¿Se previenen dependencias de objetos/arrays recreados en cada render dentro de `useEffect`?
- [ ] ¿Se justifica el uso de `useMemo` / `useCallback` en cálculos verdaderamente costosos en lugar de añadirlos por hábito?

### 6. Accesibilidad (a11y) y Tipado
- [ ] ¿Los botones e inputs interactivos cuentan con etiquetas semánticas (`aria-label`, `<label htmlFor="...">`)?
- [ ] ¿Las interfaces de TypeScript están tipadas explícitamente sin caer en `any`?
- [ ] ¿Los elementos interactivos son operables vía teclado (foco visible, soporte para `Enter` y `Espacio`)?
