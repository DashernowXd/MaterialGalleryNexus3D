import { useState, useEffect, useCallback } from 'react';

export interface Use{{HOOK_NAME}}Options<T> {
  initialValue: T;
  enabled?: boolean;
}

export interface Use{{HOOK_NAME}}Return<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  reset: () => void;
}

/**
 * Custom Hook: use{{HOOK_NAME}}
 * Encapsula lógica reactiva reutilizable cumpliendo las reglas de Hooks.
 */
export function use{{HOOK_NAME}}<T>(options: Use{{HOOK_NAME}}Options<T>): Use{{HOOK_NAME}}Return<T> {
  const { initialValue, enabled = true } = options;
  const [value, setValue] = useState<T>(initialValue);

  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (!enabled) return;

    // TODO: Efecto de sincronización con recursos externos si aplica
    // const handler = () => { ... };
    // window.addEventListener('event', handler);

    return () => {
      // Cleanup obligatorio para suscripciones o listeners
      // window.removeEventListener('event', handler);
    };
  }, [enabled]);

  return {
    value,
    setValue,
    reset,
  };
}
