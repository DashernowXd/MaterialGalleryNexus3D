import React from 'react';
import { CardThemeId, CARD_THEMES, CardThemeConfig } from '../utils/cardTextureGenerator';
import {
  ShieldCheck,
  Cpu,
  Radio,
  Sparkles,
  RotateCw,
  RotateCcw,
  CheckCircle2,
  Weight,
  Layers,
  Zap,
} from 'lucide-react';

interface CreditCardFlyerProps {
  activeThemeId: CardThemeId;
  onSelectTheme: (themeId: CardThemeId) => void;
  isFlipped: boolean;
  onToggleFlip: () => void;
  onResetView: () => void;
}

export const CreditCardFlyer: React.FC<CreditCardFlyerProps> = ({
  activeThemeId,
  onSelectTheme,
  isFlipped,
  onToggleFlip,
  onResetView,
}) => {
  return (
    <aside className="credit-card-flyer-panel" aria-label="Ficha Técnica y Personalización Titanium Prime">
      {/* Encabezado del Flyer */}
      <div className="flyer-header">
        <div className="flyer-badge-row">
          <span className="flyer-badge highlight">
            <Sparkles size={12} className="text-cyan" aria-hidden="true" />
            FLYER DE PRODUCTO
          </span>
          <span className="flyer-badge">ISO/IEC 7810 ID-1</span>
        </div>
        <h1 className="flyer-title">TITANIUM // PRIME</h1>
        <p className="flyer-tagline">
          Tarjeta metálica física de alta gama con chip criptográfico y acabado de silueta reflectante.
        </p>
      </div>

      <div className="flyer-scrollable-content">
        {/* Selector de Temas e Iluminación */}
        <section className="flyer-section" aria-label="Selección de tema de acabado y atmósfera lumínica">
          <div className="flyer-section-header">
            <Layers size={14} className="text-cyan" aria-hidden="true" />
            <h2>Acabado & Tema de Iluminación</h2>
          </div>
          <p className="flyer-subtext">
            Selecciona la atmósfera luminosa para resaltar el bisel y contorno de la tarjeta en el render.
          </p>

          <div className="card-themes-grid" role="group" aria-label="Temas de textura y bisel">
            {(Object.values(CARD_THEMES) as CardThemeConfig[]).map(theme => {
              const isSelected = theme.id === activeThemeId;
              return (
                <button
                  key={theme.id}
                  type="button"
                  className={`theme-selector-card ${isSelected ? 'active' : ''}`}
                  onClick={() => onSelectTheme(theme.id)}
                  aria-pressed={isSelected}
                  aria-label={`Acabado ${theme.name}: ${theme.tagline}`}
                >
                  <div className="theme-card-top">
                    <span
                      className="theme-orb"
                      aria-hidden="true"
                      style={{
                        backgroundColor: theme.accentColor,
                        boxShadow: `0 0 10px ${theme.rimColor}90`,
                      }}
                    />
                    <span className="theme-name">{theme.name}</span>
                    {isSelected && <CheckCircle2 size={14} className="check-icon text-cyan" aria-label="Activo" />}
                  </div>
                  <span className="theme-desc">{theme.tagline}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Ficha Técnica / Especificaciones Físicas */}
        <section className="flyer-section" aria-label="Especificaciones físicas y de ingeniería">
          <div className="flyer-section-header">
            <Cpu size={14} className="text-cyan" aria-hidden="true" />
            <h2>Especificaciones de Ingeniería</h2>
          </div>

          <div className="specs-grid">
            <div className="spec-card">
              <span className="spec-label">Aleación Base</span>
              <span className="spec-val">Titanio Grado 5</span>
              <span className="spec-detail">Ti-6Al-4V aeroespacial</span>
            </div>

            <div className="spec-card">
              <span className="spec-label">Peso Físico</span>
              <span className="spec-val">
                <Weight size={12} className="inline-icon" aria-hidden="true" /> 18.2 gramos
              </span>
              <span className="spec-detail">3x peso de PVC estándar</span>
            </div>

            <div className="spec-card">
              <span className="spec-label">Microchip EMV</span>
              <span className="spec-val">Secure Enclave 64-bit</span>
              <span className="spec-detail">Criptografía cuántica</span>
            </div>

            <div className="spec-card">
              <span className="spec-label">Interfaz NFC</span>
              <span className="spec-val">Dual 13.56 MHz</span>
              <span className="spec-detail">Antena perimetral interna</span>
            </div>
          </div>
        </section>

        {/* Características y Ventajas del Producto */}
        <section className="flyer-section" aria-label="Ventajas y puntos clave">
          <div className="flyer-section-header">
            <ShieldCheck size={14} className="text-cyan" aria-hidden="true" />
            <h2>Puntos Clave del Producto</h2>
          </div>

          <ul className="perks-list">
            <li className="perk-item">
              <div className="perk-icon-wrapper" aria-hidden="true">
                <Zap size={14} className="text-amber" />
              </div>
              <div className="perk-content">
                <strong>Diseño Universal y Neutral</strong>
                <p>Sin logotipos de bancos predefinidos; concebida para tokenización de activos universales.</p>
              </div>
            </li>

            <li className="perk-item">
              <div className="perk-icon-wrapper" aria-hidden="true">
                <Radio size={14} className="text-cyan" />
              </div>
              <div className="perk-content">
                <strong>Bisel CNC de Corte Diamantado</strong>
                <p>Cantos biselados al milímetro que capturan destellos angulares con iluminación de silueta.</p>
              </div>
            </li>

            <li className="perk-item">
              <div className="perk-icon-wrapper" aria-hidden="true">
                <ShieldCheck size={14} className="text-pink" />
              </div>
              <div className="perk-content">
                <strong>Resistencia Incomparable</strong>
                <p>Inmune a la flexión accidental, calor extremo, corrosión y desgaste por fricción diaria.</p>
              </div>
            </li>
          </ul>
        </section>
      </div>

      {/* Botones de Acción Rápida en la Base */}
      <div className="flyer-footer" role="toolbar" aria-label="Controles de manipulación de la tarjeta">
        <button
          type="button"
          className="flyer-action-btn primary"
          onClick={onToggleFlip}
          title="Alternar entre la cara frontal y la cara trasera"
          aria-label={isFlipped ? 'Voltear tarjeta 3D para ver anverso frontal' : 'Voltear tarjeta 3D para ver reverso posterior'}
        >
          <RotateCw size={15} aria-hidden="true" />
          <span>{isFlipped ? 'Ver Anverso (Front)' : 'Ver Reverso (Back)'}</span>
        </button>

        <button
          type="button"
          className="flyer-action-btn secondary"
          onClick={onResetView}
          title="Centrar y resetear posición orbital"
          aria-label="Restablecer posición y ángulo original de la cámara"
        >
          <RotateCcw size={15} aria-hidden="true" />
          <span>Reset Cam</span>
        </button>
      </div>
    </aside>
  );
};
