# Guía Rápida Oficial de React (Quick Start)

> Documentación de referencia oficial adaptada de [react.dev](https://react.dev/learn). Cubre el 80% de los conceptos fundamentales utilizados en el desarrollo diario con React.

---

## 1. Creación y Anidado de Componentes

Las aplicaciones de React están construidas a partir de **componentes**. Un componente es una porción de la interfaz de usuario (UI) que tiene su propia lógica y apariencia. Puede ser tan pequeño como un botón o tan grande como una página entera.

Los componentes de React son funciones de JavaScript que retornan marcado (*markup*):

```jsx
function MyButton() {
  return (
    <button>Soy un botón</button>
  );
}
```

Una vez declarado `MyButton`, puedes anidarlo dentro de otro componente:

```jsx
export default function MyApp() {
  return (
    <div>
      <h1>Bienvenido a mi aplicación</h1>
      <MyButton />
    </div>
  );
}
```

> [!NOTE]
> Los nombres de componentes de React siempre deben comenzar con una letra **mayúscula** (`<MyButton />`), mientras que las etiquetas HTML nativas deben ser en **minúsculas** (`<button>`).

---

## 2. Escribir Marcado con JSX

La sintaxis de marcado mostrada arriba se llama **JSX**. Es opcional, pero la inmensa mayoría de proyectos React la utilizan por su ergonomía.

### Reglas estrictas de JSX:
1. **Etiquetas cerradas**: Todas las etiquetas deben cerrarse explícitamente, incluyendo etiquetas auto-cerradas como `<br />` o `<img />`.
2. **Un solo elemento raíz**: Un componente no puede retornar múltiples etiquetas JSX adyacentes sin un contenedor padre. Debes envolverlas en un `<div>...</div>` o en un Fragmento vacío `<>...</>`:

```jsx
function AboutPage() {
  return (
    <>
      <h1>Acerca de</h1>
      <p>Hola.<br />¿Cómo estás?</p>
    </>
  );
}
```

---

## 3. Agregar Estilos y Clases CSS

En React, especificas una clase CSS con el atributo `className`. Funciona de la misma manera que el atributo `class` de HTML:

```jsx
<img className="avatar" />
```

Luego defines las reglas en tu archivo CSS:

```css
/* En tu archivo CSS */
.avatar {
  border-radius: 50%;
}
```

---

## 4. Mostrar Datos e Interpolar Expresiones

JSX te permite incrustar código JavaScript dentro del marcado utilizando llaves `{}` (*curly braces*):

```jsx
return (
  <h1>{user.name}</h1>
);
```

También puedes "escapar a JavaScript" desde los atributos JSX, usando llaves en lugar de comillas:

```jsx
return (
  <img
    className="avatar"
    src={user.imageUrl}
    alt={'Foto de ' + user.name}
    style={{
      width: user.imageSize,
      height: user.imageSize
    }}
  />
);
```

> [!TIP]
> `style={{}}` no es una sintaxis especial de React, sino un objeto JavaScript `{ width: ... }` dentro de las llaves JSX `{}` de interpolación.

---

## 5. Renderizado Condicional

En React no hay una sintaxis especial para condiciones; utilizas las mismas herramientas de JavaScript estándar.

### Con declaración `if / else`:
```jsx
let content;
if (isLoggedIn) {
  content = <AdminPanel />;
} else {
  content = <LoginForm />;
}
return (
  <div>
    {content}
  </div>
);
```

### Con operador ternario (`? :`):
```jsx
<div>
  {isLoggedIn ? <AdminPanel /> : <LoginForm />}
</div>
```

### Con evaluación de corto circuito (`&&`):
```jsx
<div>
  {isLoggedIn && <AdminPanel />}
</div>
```

---

## 6. Renderizado de Listas

Para transformar colecciones de datos en elementos de UI, se utiliza el método de array `.map()`:

```jsx
const products = [
  { title: 'Col', id: 1 },
  { title: 'Ajo', id: 2 },
  { title: 'Manzana', id: 3 },
];

export default function ShoppingList() {
  const listItems = products.map(product =>
    <li key={product.id}>
      {product.title}
    </li>
  );

  return (
    <ul>{listItems}</ul>
  );
}
```

> [!IMPORTANT]
> Cada elemento en una lista debe tener una propiedad `key` única y estable entre sus hermanos (preferiblemente IDs de base de datos). React usa estas claves para identificar qué elementos fueron modificados, insertados o eliminados.

---

## 7. Respuesta a Eventos

Los manejadores de eventos se definen como funciones dentro de los componentes:

```jsx
function MyButton() {
  function handleClick() {
    alert('¡Hiciste clic!');
  }

  return (
    <button onClick={handleClick}>
      Haz clic aquí
    </button>
  );
}
```

> [!WARNING]
> Observa que `onClick={handleClick}` no tiene paréntesis al final. **No debes invocar la función** (`handleClick()`), solo debes **pasarla por referencia**.

---

## 8. Actualizar la Pantalla con Estado (`useState`)

Para que un componente "recuerde" información entre renderizados y actualice la pantalla, se utiliza el Hook `useState`:

```jsx
import { useState } from 'react';

function MyButton() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
  }

  return (
    <button onClick={handleClick}>
      Clickeado {count} veces
    </button>
  );
}
```

Si renderizas el mismo componente varias veces, cada instancia mantendrá su propio estado independiente.

---

## 9. Reglas de los Hooks

Las funciones que comienzan con `use` se denominan **Hooks** (`useState`, `useEffect`, etc.).
1. **Solo al nivel superior**: No invoques Hooks dentro de bucles, condiciones (`if`) ni funciones anidadas.
2. **Solo desde funciones React**: Invócalos únicamente dentro de Componentes Funcionales de React o dentro de tus propios Custom Hooks.

---

## 10. Compartir Datos entre Componentes (*Lifting State Up*)

Cuando dos o más componentes necesitan sincronizar su estado y actualizarse juntos, debes **elevar el estado (*lift state up*)** al ancestro común más cercano y pasarlo hacia abajo mediante **props**.

```jsx
import { useState } from 'react';

export default function MyApp() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
  }

  return (
    <div>
      <h1>Contadores que se actualizan juntos</h1>
      <MyButton count={count} onClick={handleClick} />
      <MyButton count={count} onClick={handleClick} />
    </div>
  );
}

function MyButton({ count, onClick }) {
  return (
    <button onClick={onClick}>
      Clickeado {count} veces
    </button>
  );
}
```
