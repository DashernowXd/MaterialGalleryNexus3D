import React, { createContext, useContext, useState, ReactNode, KeyboardEvent } from 'react';

// 1. Contexto interno del componente compuesto
interface TabsContextType {
  activeTab: string;
  setActiveTab: (id: string) => void;
  baseId: string;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Los subcomponentes de Tabs deben estar contenidos dentro de <Tabs>');
  }
  return context;
}

// 2. Componente Raíz
interface TabsProps {
  defaultTab: string;
  children: ReactNode;
  idPrefix?: string;
}

export function Tabs({ defaultTab, children, idPrefix = 'tabs' }: TabsProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, baseId: idPrefix }}>
      <div className="tabs-container">{children}</div>
    </TabsContext.Provider>
  );
}

// 3. Contenedor de lista de botones de pestañas
export function TabList({ children, ariaLabel }: { children: ReactNode; ariaLabel?: string }) {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const tabs = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const currentIndex = tabs.findIndex(tab => tab === document.activeElement);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
    if (e.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') nextIndex = 0;
    if (e.key === 'End') nextIndex = tabs.length - 1;

    if (nextIndex !== currentIndex) {
      e.preventDefault();
      tabs[nextIndex].focus();
      tabs[nextIndex].click();
    }
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel || 'Sección de pestañas'}
      onKeyDown={handleKeyDown}
      style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0' }}
    >
      {children}
    </div>
  );
}

// 4. Pestaña individual (Tab)
interface TabProps {
  id: string;
  children: ReactNode;
}

export function Tab({ id, children }: TabProps) {
  const { activeTab, setActiveTab, baseId } = useTabsContext();
  const isSelected = activeTab === id;

  return (
    <button
      role="tab"
      id={`${baseId}-tab-${id}`}
      aria-controls={`${baseId}-panel-${id}`}
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
      onClick={() => setActiveTab(id)}
      style={{
        padding: '8px 16px',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        fontWeight: isSelected ? 'bold' : 'normal',
        borderBottom: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
        color: isSelected ? '#1d4ed8' : '#64748b',
      }}
    >
      {children}
    </button>
  );
}

// 5. Panel de contenido correspondiente
interface TabPanelProps {
  id: string;
  children: ReactNode;
}

export function TabPanel({ id, children }: TabPanelProps) {
  const { activeTab, baseId } = useTabsContext();
  const isSelected = activeTab === id;

  if (!isSelected) return null;

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${id}`}
      aria-labelledby={`${baseId}-tab-${id}`}
      tabIndex={0}
      style={{ padding: '16px 0' }}
    >
      {children}
    </div>
  );
}

// Vinculación para uso con notación de punto
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

// 6. Demostración de consumo
export function TabsDemo() {
  return (
    <Tabs defaultTab="perfil">
      <Tabs.List ariaLabel="Configuración de cuenta">
        <Tabs.Tab id="perfil">Perfil</Tabs.Tab>
        <Tabs.Tab id="seguridad">Seguridad</Tabs.Tab>
        <Tabs.Tab id="notificaciones">Notificaciones</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel id="perfil">
        <h3>Información del Perfil</h3>
        <p>Edita tu nombre y datos personales aquí.</p>
      </Tabs.Panel>

      <Tabs.Panel id="seguridad">
        <h3>Ajustes de Seguridad</h3>
        <p>Configura tu autenticación de dos factores.</p>
      </Tabs.Panel>

      <Tabs.Panel id="notificaciones">
        <h3>Preferencias de Alertas</h3>
        <p>Elige qué notificaciones deseas recibir por correo.</p>
      </Tabs.Panel>
    </Tabs>
  );
}
