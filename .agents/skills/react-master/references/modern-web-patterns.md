# Patrones Modernos de Arquitectura Web en React

Esta referencia cubre patrones avanzados de diseño de componentes para crear interfaces escalables, reutilizables y altamente mantenibles.

---

## 1. Patrón de Componentes Compuestos (*Compound Components*)

Permite a múltiples componentes trabajar juntos manteniendo un estado implícito compartido a través de React Context, otorgando máxima flexibilidad al desarrollador consumidor para ordenar el marcado.

### Ejemplo conceptual:
```tsx
<Menu>
  <Menu.Button>Acciones</Menu.Button>
  <Menu.List>
    <Menu.Item onSelect={handleEdit}>Editar</Menu.Item>
    <Menu.Item onSelect={handleDelete}>Eliminar</Menu.Item>
  </Menu.List>
</Menu>
```
*Ventaja*: El consumidor no necesita pasar props de visibilidad, índice activo o manejadores a través de múltiples niveles intermedios.

---

## 2. Componentes Polimórficos (Prop `as`)

Permiten que un componente estilizado o accesible cambie su elemento HTML subyacente sin perder estilos ni tipado TypeScript:

```tsx
type AsProp<C extends React.ElementType> = {
  as?: C;
};

type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);

type PolymorphicComponentProps<
  C extends React.ElementType,
  Props = {}
> = React.PropsWithChildren<Props & AsProp<C>> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;

export function Button<C extends React.ElementType = 'button'>({
  as,
  children,
  ...props
}: PolymorphicComponentProps<C>) {
  const Component = as || 'button';
  return <Component className="btn-primary" {...props}>{children}</Component>;
}

// Uso:
<Button as="a" href="/login">Ir a login</Button>
<Button as="button" onClick={handleClick}>Enviar</Button>
```

---

## 3. Límites de Error (*Error Boundaries*)

Los errores de JavaScript dentro del renderizado no deben romper toda la aplicación. Un Error Boundary captura excepciones en su subárbol y muestra una UI de respaldo (*fallback*).

```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  fallback: ReactNode;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
```

---

## 4. Carga Perezosa (*Lazy Loading*) y Suspense

Para optimizar el tamaño del bundle inicial y acelerar el First Contentful Paint (FCP):

```tsx
import { lazy, Suspense } from 'react';

// Carga bajo demanda únicamente cuando el usuario navegue o active la sección
const HeavyAnalyticsDashboard = lazy(() => import('./HeavyAnalyticsDashboard'));

export function App() {
  return (
    <Suspense fallback={<div className="loading-spinner">Cargando métricas...</div>}>
      <HeavyAnalyticsDashboard />
    </Suspense>
  );
}
```
