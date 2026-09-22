import { useEffect } from 'react';

interface DocumentMetadataOptions {
  title: string;
  description?: string;
}

/**
 * Hook idiomático de React 19 para sincronizar el título y metadatos del documento
 * con el estado de navegación activo, mejorando SEO dinámico y accesibilidad.
 */
export function useDocumentMetadata({ title, description }: DocumentMetadataOptions): void {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    let metaDesc = document.querySelector('meta[name="description"]');
    const previousDescription = metaDesc ? metaDesc.getAttribute('content') : null;

    if (description) {
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }

    return () => {
      document.title = previousTitle;
      if (previousDescription && metaDesc) {
        metaDesc.setAttribute('content', previousDescription);
      }
    };
  }, [title, description]);
}
