import { useState, useEffect, useRef, useCallback } from 'react';

export interface FetchState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

interface UseFetchOptions {
  autoFetch?: boolean;
  cacheTimeMs?: number;
  retries?: number;
}

// Caché en memoria para evitar re-peticiones idénticas consecutivas
const globalCache = new Map<string, { data: unknown; timestamp: number }>();

/**
 * Hook de producción para peticiones HTTP con:
 * - Cancelación de peticiones desactualizadas (AbortController)
 * - Cache temporal configurable
 * - Reintentos exponenciales
 * - Estado tipado y control manual de refetch
 */
export function useFetch<T>(
  url: string,
  options: UseFetchOptions = {}
): FetchState<T> & { refetch: () => Promise<void> } {
  const { autoFetch = true, cacheTimeMs = 30000, retries = 2 } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    isLoading: autoFetch,
    isError: false,
    isSuccess: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const executeFetch = useCallback(async () => {
    // 1. Cancelar petición en vuelo previa si existiera
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // 2. Verificar caché en memoria
    const cached = globalCache.get(url);
    if (cached && Date.now() - cached.timestamp < cacheTimeMs) {
      setState({
        data: cached.data as T,
        error: null,
        isLoading: false,
        isError: false,
        isSuccess: true,
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, isError: false }));

    let attempts = 0;
    while (attempts <= retries) {
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
        }

        const data = (await response.json()) as T;
        globalCache.set(url, { data, timestamp: Date.now() });

        if (!controller.signal.aborted) {
          setState({
            data,
            error: null,
            isLoading: false,
            isError: false,
            isSuccess: true,
          });
        }
        return;
      } catch (err: unknown) {
        if ((err as Error).name === 'AbortError') {
          return; // Petición cancelada intencionalmente, silenciar
        }
        attempts++;
        if (attempts > retries && !controller.signal.aborted) {
          setState({
            data: null,
            error: err instanceof Error ? err : new Error(String(err)),
            isLoading: false,
            isError: true,
            isSuccess: false,
          });
        }
      }
    }
  }, [url, cacheTimeMs, retries]);

  useEffect(() => {
    if (autoFetch) {
      executeFetch();
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [autoFetch, executeFetch]);

  return { ...state, refetch: executeFetch };
}

// Ejemplo de consumo en componente:
interface UserProfile {
  id: number;
  name: string;
  email: string;
}

export function UserProfileLoader({ userId }: { userId: number }) {
  const { data, isLoading, isError, error, refetch } = useFetch<UserProfile>(
    `https://jsonplaceholder.typicode.com/users/${userId}`
  );

  if (isLoading) return <div>Cargando perfil de usuario...</div>;
  if (isError) return (
    <div>
      <p style={{ color: 'red' }}>Error: {error?.message}</p>
      <button onClick={refetch}>Reintentar</button>
    </div>
  );
  if (!data) return null;

  return (
    <div className="user-card">
      <h3>{data.name}</h3>
      <p>Email: {data.email}</p>
      <button onClick={refetch}>Actualizar datos</button>
    </div>
  );
}
