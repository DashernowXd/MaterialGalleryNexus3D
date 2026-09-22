# Gestión de Estado y Flujo de Datos en React

Esta guía establece los criterios arquitectónicos para estructurar el estado en aplicaciones React, desde componentes individuales hasta arquitecturas a gran escala.

---

## 1. Clasificación Taxonómica del Estado

No todo el estado de una aplicación pertenece al mismo nivel ni debe manejarse con las mismas herramientas:

| Tipo de Estado | Descripción | Herramienta Recomendada | Ejemplo |
| :--- | :--- | :--- | :--- |
| **Estado Local (UI State)** | Pertenece y afecta exclusivamente a un componente o a sus hijos inmediatos. | `useState`, `useReducer` | Modal abierto/cerrado, acordeón, valor de input temporal |
| **Estado Elevado (Shared State)** | Compartido por 2 o más componentes hermanos. | Elevación de estado (*Lifting state up*) a ancestro común | Paginación y tabla de resultados |
| **Estado Global (App State)** | Necesario en múltiples ramas desconectadas del árbol de componentes. | React Context optimizado o `zustand` | Tema (Dark/Light), sesión de usuario, preferencias |
| **Estado del Servidor (Server Cache)** | Datos asíncronos que residen en una base de datos remota y están cacheados localmente. | TanStack Query (React Query), SWR | Lista de productos, perfil de usuario, órdenes |
| **Estado de URL** | La fuente de verdad reside en la barra de direcciones del navegador. | `react-router`, SearchParams nativos | Filtros, ordenamiento, tab actual |

---

## 2. Elevación de Estado (*Lifting State Up*)

Cuando dos componentes deben mantenerse sincronizados:
1. Elimina el estado de ambos componentes hijos.
2. Encuentra su ancestro común más cercano.
3. Coloca el estado en dicho ancestro y pasa los datos mediante `props` y las funciones modificadoras mediante callbacks.

---

## 3. Optimización de React Context (Evitar la "Tormenta de Re-renders")

Uno de los mayores fallos al usar React Context es colocar un objeto con múltiples valores y funciones en el mismo `Provider`. Cada vez que cualquier propiedad cambia, **todos los componentes consumidores se re-renderizan**, incluso si solo leían una función estática.

### ✅ Patrón Recomendado: Separación de Contextos (State Context + Dispatch Context)

```tsx
import { createContext, useContext, useReducer, useMemo, ReactNode } from 'react';

interface AuthState {
  user: { id: string; name: string } | null;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'LOGIN'; payload: { id: string; name: string } }
  | { type: 'LOGOUT' };

// Contextos separados
const AuthStateContext = createContext<AuthState | undefined>(undefined);
const AuthDispatchContext = createContext<React.Dispatch<AuthAction> | undefined>(undefined);

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN': return { user: action.payload, isAuthenticated: true };
    case 'LOGOUT': return { user: null, isAuthenticated: false };
    default: return state;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, { user: null, isAuthenticated: false });

  return (
    <AuthStateContext.Provider value={state}>
      <AuthDispatchContext.Provider value={dispatch}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
}

// Custom hooks con comprobación de contexto nulo
export function useAuthState() {
  const context = useContext(AuthStateContext);
  if (!context) throw new Error('useAuthState debe usarse dentro de AuthProvider');
  return context;
}

export function useAuthDispatch() {
  const context = useContext(AuthDispatchContext);
  if (!context) throw new Error('useAuthDispatch debe usarse dentro de AuthProvider');
  return context;
}
```

---

## 4. Estado de Servidor vs. Estado de Cliente

> [!WARNING]
> Guardar respuestas de API en un Context o Store global de Redux de forma manual es considerado hoy un antipatrón en React moderno.

### ¿Por qué utilizar librerías especializadas (TanStack Query / SWR)?
* Gestión automática de caché e invalidación.
* Reintentos automáticos tras fallo de red.
* Deduplicación de peticiones concurrentes.
* Estados de carga integrados (`isLoading`, `isError`, `isFetching`).
* Revalidación en foco de ventana o reconexión de red.
