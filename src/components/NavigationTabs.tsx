import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, Radio, CreditCard, Share2 } from 'lucide-react';

export const NavigationTabs: React.FC = () => {
  return (
    <nav className="nav-tabs-container" aria-label="Navegación principal de estudios 3D">
      <NavLink
        to="/"
        className={({ isActive }) => `nav-tab-link ${isActive ? 'active' : ''}`}
        aria-label="Estudio 1: Materiales interactivos y contador con físicas"
        end
      >
        <Sparkles size={15} aria-hidden="true" />
        <span>Materiales & Contador</span>
        <span className="tab-pill" aria-hidden="true">Físicas</span>
      </NavLink>

      <NavLink
        to="/3d-buttons"
        className={({ isActive }) => `nav-tab-link ${isActive ? 'active' : ''}`}
        aria-label="Estudio 2: Botonera 3D táctil, texturas hápticas y figuras arrastrables"
      >
        <Radio size={15} aria-hidden="true" />
        <span>Botones 3D & Texturas</span>
        <span className="tab-pill" aria-hidden="true">Botonera</span>
      </NavLink>

      <NavLink
        to="/credit-card"
        className={({ isActive }) => `nav-tab-link ${isActive ? 'active' : ''}`}
        aria-label="Estudio 3: Tarjeta Titanium Prime 3D y flyer de producto"
      >
        <CreditCard size={15} aria-hidden="true" />
        <span>Tarjeta 3D & Flyer</span>
        <span className="tab-pill" aria-hidden="true">Titanium</span>
      </NavLink>

      <NavLink
        to="/network"
        className={({ isActive }) => `nav-tab-link ${isActive ? 'active' : ''}`}
        aria-label="Estudio 4: Red de esferas y tubos conductores con respuesta lumínica"
      >
        <Share2 size={15} aria-hidden="true" />
        <span>Red de Esferas & Tubos</span>
        <span className="tab-pill new" aria-hidden="true">Fotónica</span>
      </NavLink>
    </nav>
  );
};

