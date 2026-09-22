import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Loader2 } from 'lucide-react';

// Carga perezosa (Code-Splitting) para optimizar el bundle inicial y el tiempo de carga en producción
const MaterialsStudioView = lazy(() =>
  import('./views/MaterialsStudioView').then(m => ({ default: m.MaterialsStudioView }))
);
const ButtonsStudioView = lazy(() =>
  import('./views/ButtonsStudioView').then(m => ({ default: m.ButtonsStudioView }))
);
const CreditCardStudioView = lazy(() =>
  import('./views/CreditCardStudioView').then(m => ({ default: m.CreditCardStudioView }))
);

/**
 * Fallback accesible y estilizado con microanimación para Suspense
 */
function ViewLoadingFallback() {
  return (
    <div
      className="view-loading-container"
      role="status"
      aria-live="polite"
      aria-label="Cargando entorno 3D interactivo"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'calc(100vh - 72px)',
        width: '100%',
        color: '#38bdf8',
        gap: '1rem',
      }}
    >
      <Loader2
        size={36}
        className="animate-spin"
        aria-hidden="true"
        style={{ filter: 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.6))' }}
      />
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.875rem',
          letterSpacing: '1px',
          color: '#94a3b8',
        }}
      >
        Iniciando motor WebGL & recursos 3D...
      </span>
    </div>
  );
}

export function App() {
  return (
    <HashRouter>
      <div className="app-layout">
        <Header />
        <Suspense fallback={<ViewLoadingFallback />}>
          <Routes>
            <Route path="/" element={<MaterialsStudioView />} />
            <Route path="/3d-buttons" element={<ButtonsStudioView />} />
            <Route path="/credit-card" element={<CreditCardStudioView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </HashRouter>
  );
}

export default App;
