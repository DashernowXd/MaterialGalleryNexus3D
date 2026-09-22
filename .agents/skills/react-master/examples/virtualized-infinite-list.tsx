import React, { useState, useEffect, useRef, memo } from 'react';

interface ListItem {
  id: string;
  title: string;
  category: string;
}

// 1. Componente de fila optimizado con React.memo para evitar re-renders en scroll
const RowItem = memo(function RowItem({ item }: { item: ListItem }) {
  return (
    <div
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <span>{item.title}</span>
      <span style={{ fontSize: '12px', color: '#888' }}>{item.category}</span>
    </div>
  );
});

const PAGE_SIZE = 20;

/**
 * Patrón de Infinite Scroll de Alto Rendimiento utilizando IntersectionObserver
 * - Utiliza un "sentinel" al final de la lista.
 * - Desconecta observadores previos para evitar fugas de memoria.
 * - Evita re-renderizar ítems pasados gracias a React.memo.
 */
export function VirtualizedInfiniteList() {
  const [items, setItems] = useState<ListItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Simulación de carga asíncrona de página
  const loadMoreItems = async (pageNumber: number) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600)); // Latencia simulada

    const newItems: ListItem[] = Array.from({ length: PAGE_SIZE }, (_, idx) => {
      const id = (pageNumber - 1) * PAGE_SIZE + idx + 1;
      return {
        id: `item-${id}`,
        title: `Elemento número ${id}`,
        category: id % 2 === 0 ? 'Finanzas' : 'Tecnología',
      };
    });

    setItems(prev => [...prev, ...newItems]);
    setIsLoading(false);

    if (pageNumber >= 5) {
      setHasMore(false); // Límite artificial para el demo
    }
  };

  useEffect(() => {
    loadMoreItems(page);
  }, [page]);

  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setPage(prev => prev + 1);
        }
      },
      { rootMargin: '200px' } // Pre-cargar antes de llegar al fondo exacto
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
      observer.disconnect();
    };
  }, [hasMore, isLoading]);

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', border: '1px solid #ccc', borderRadius: 8 }}>
      <h3 style={{ padding: '12px 16px', margin: 0, background: '#f8fafc', borderBottom: '1px solid #ccc' }}>
        Feed Infinito Optimizado
      </h3>

      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {items.map(item => (
          <RowItem key={item.id} item={item} />
        ))}

        {/* Elemento centinela para disparar la carga de la siguiente página */}
        <div ref={sentinelRef} style={{ height: 20 }} />

        {isLoading && (
          <div style={{ textAlign: 'center', padding: 12, color: '#666' }}>
            Cargando más elementos...
          </div>
        )}

        {!hasMore && (
          <div style={{ textAlign: 'center', padding: 12, color: '#999', fontSize: 13 }}>
            Has llegado al final del catálogo.
          </div>
        )}
      </div>
    </div>
  );
}
