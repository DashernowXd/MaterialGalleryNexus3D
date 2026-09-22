# Guía Avanzada de Hooks y Ciclo de Vida en React

Esta guía profundiza en el modelo mental de los Hooks de React, sus reglas innegociables y cómo evitar los errores más comunes de la industria.

---

## 1. El Catálogo Completo de Hooks Esenciales

### `useState(initialState)`
Almacena estado reactivo local en el componente.
```tsx
const [query, setQuery] = useState<string>('');

// Si el estado inicial requiere un cálculo pesado, usa inicialización perezosa (lazy init):
const [rows, setRows] = useState(() => computeInitialComplexData());

// Al actualizar basado en el estado anterior, usa siempre la función updater:
setCount(prev => prev + 1);
```

### `useReducer(reducer, initialArg, init?)`
Alternativa superior a `useState` cuando la lógica de estado es compleja, involucra múltiples subvalores o cuando el próximo estado depende del anterior en múltiples ramas de lógica.
```tsx
type Action = { type: 'increment' } | { type: 'decrement' } | { type: 'reset'; payload: number };

function counterReducer(state: { count: number }, action: Action) {
  switch (action.type) {
    case 'increment': return { count: state.count + 1 };
    case 'decrement': return { count: state.count - 1 };
    case 'reset': return { count: action.payload };
    default: return state;
  }
}
```

### `useRef(initialValue)`
Mantiene un valor mutable que **persiste entre renderizados sin detonar un nuevo re-render** al modificarse.
* **Uso 1**: Referencia directa a nodos del DOM (`<input ref={inputRef} />`).
* **Uso 2**: Almacenar IDs de temporizadores (`setInterval`), valores anteriores o banderas mutables.

### `useMemo(calculateValue, dependencies)`
Memoriza el resultado de una computación costosa entre renders.
```tsx
const filteredList = useMemo(() => {
  return bigDataList.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
}, [bigDataList, filter]);
```

> [!TIP]
> No uses `useMemo` para operaciones triviales (como formatear una fecha o filtrar un array de 10 elementos). El costo de mantener el array de dependencias en memoria supera la ganancia computacional.

### `useCallback(fn, dependencies)`
Memoriza una **definición de función** entre renders para evitar que componentes hijos optimizados con `React.memo` se re-rendericen innecesariamente por cambios en la referencia de la función.
```tsx
const handleItemSelect = useCallback((id: string) => {
  setSelectedId(id);
}, []); // Referencia estable
```

---

## 2. Cuándo NO debes usar `useEffect`

Uno de los errores más graves en React es el sobreuso o mal uso de `useEffect`.

### Caso 1: Transformar datos para renderizado
* ❌ **Antipatrón**: Guardar en un estado derivado con `useEffect`:
  ```tsx
  const [fullName, setFullName] = useState('');
  useEffect(() => {
    setFullName(firstName + ' ' + lastName);
  }, [firstName, lastName]);
  ```
* ✅ **Correcto**: Calcula la variable directamente durante el render:
  ```tsx
  const fullName = `${firstName} ${lastName}`;
  ```

### Caso 2: Manejar interacciones del usuario
* ❌ **Antipatrón**: Cambiar un estado que detona un efecto para enviar un formulario o hacer fetch:
  ```tsx
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    if (submitted) postData(form);
  }, [submitted]);
  ```
* ✅ **Correcto**: Ejecuta la acción directamente dentro del `handleSubmit`:
  ```tsx
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await postData(form);
  };
  ```

### Caso 3: Sincronización externa con Cleanup obligatorio
* Cuando `useEffect` sí es necesario (ej. `addEventListener`, WebSockets, suscripciones), la función de limpieza (*cleanup*) es obligatoria para prevenir fugas de memoria (*memory leaks*):
  ```tsx
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  ```

---

## 3. Hooks de Concurrencia (React 18/19)

### `useTransition()`
Permite marcar actualizaciones de estado como **no urgentes**, manteniendo la interfaz receptiva durante operaciones pesadas de renderizado.
```tsx
const [isPending, startTransition] = useTransition();

function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  // Input responde instantáneamente
  setText(e.target.value);

  // Renderizado pesado de lista de 5000 elementos ocurre en segundo plano
  startTransition(() => {
    setDeferredQuery(e.target.value);
  });
}
```

### `useId()`
Genera identificadores únicos estables tanto en el cliente como en el servidor (SSR), ideal para emparejar etiquetas `<label htmlFor={id}>` con `<input id={id}>` cumpliendo estándares de accesibilidad WCAG.

---

## 4. Diseño de Custom Hooks Profesionales

Un Custom Hook encapsula lógica con estado reutilizable.

### Convenciones de Diseño:
1. Siempre debe iniciar con el prefijo `use` (`useWindowSize`, `useDebounce`, `useLocalStorage`).
2. Retorna una tupla `[value, setter]` si se asemeja a `useState`, o un objeto `{ data, error, isLoading, refetch }` si expone múltiples propiedades.
3. Asegura el tipado genérico en TypeScript.
