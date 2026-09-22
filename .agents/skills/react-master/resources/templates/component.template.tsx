import React, { ReactNode } from 'react';
// import styles from './{{COMPONENT_NAME}}.module.css';

export interface {{COMPONENT_NAME}}Props {
  /** Título principal del componente */
  title: string;
  /** Elementos hijos opcionales */
  children?: ReactNode;
  /** Clase CSS adicional para personalización externa */
  className?: string;
  /** Callback opcional de acción principal */
  onAction?: () => void;
}

/**
 * Componente: {{COMPONENT_NAME}}
 * Estándar de diseño idiomático en React con TypeScript.
 */
export function {{COMPONENT_NAME}}({
  title,
  children,
  className = '',
  onAction,
}: {{COMPONENT_NAME}}Props) {
  return (
    <div className={`{{COMPONENT_KEBAB}} ${className}`.trim()}>
      <header className="{{COMPONENT_KEBAB}}__header">
        <h2>{title}</h2>
      </header>

      {children && (
        <main className="{{COMPONENT_KEBAB}}__content">
          {children}
        </main>
      )}

      {onAction && (
        <footer className="{{COMPONENT_KEBAB}}__footer">
          <button type="button" onClick={onAction}>
            Ejecutar Acción
          </button>
        </footer>
      )}
    </div>
  );
}

export default {{COMPONENT_NAME}};
