import React from 'react';
import { GeometryType, EnvironmentPreset, MaterialParameters } from '../types/materials';
import { SlidersHorizontal, Sun, Box, Eye, Sparkles } from 'lucide-react';

interface InspectorPanelProps {
  geometryType: GeometryType;
  environmentPreset: EnvironmentPreset;
  params: MaterialParameters;
  onSelectGeometry: (geo: GeometryType) => void;
  onSelectEnvironment: (env: EnvironmentPreset) => void;
  onChangeParams: (newParams: Partial<MaterialParameters>) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  geometryType,
  environmentPreset,
  params,
  onSelectGeometry,
  onSelectEnvironment,
  onChangeParams,
}) => {
  const geometries: { id: GeometryType; label: string }[] = [
    { id: 'sphere', label: 'Esfera' },
    { id: 'torusKnot', label: 'Nudo' },
    { id: 'icosahedron', label: 'Icosaedro' },
    { id: 'dodecahedron', label: 'Dodecaedro' },
    { id: 'roundedBox', label: 'Cubo' },
    { id: 'torus', label: 'Toroide' },
    { id: 'creditCard', label: 'Tarjeta' },
  ];

  const environments: { id: EnvironmentPreset; label: string }[] = [
    { id: 'studio', label: 'Estudio' },
    { id: 'cyberpunk', label: 'Cyberpunk' },
    { id: 'sunset', label: 'Sunset' },
    { id: 'deepSpace', label: 'Espacio' },
  ];

  return (
    <aside className="inspector-container" aria-label="Inspector de Parámetros de Escena y Materiales">
      <div className="inspector-header">
        <SlidersHorizontal size={16} className="text-cyan" aria-hidden="true" />
        <h2>Inspector de Escena y Material</h2>
      </div>

      <div className="inspector-sections">
        {/* Selector de Geometría */}
        <section className="inspector-section" aria-label="Selección de geometría 3D">
          <div className="section-title">
            <Box size={14} aria-hidden="true" />
            <span>Malla 3D</span>
          </div>
          <div className="button-grid" role="group" aria-label="Geometrías disponibles">
            {geometries.map(geo => (
              <button
                key={geo.id}
                type="button"
                className={`grid-btn ${geometryType === geo.id ? 'active' : ''}`}
                onClick={() => onSelectGeometry(geo.id)}
                aria-pressed={geometryType === geo.id}
                aria-label={`Geometría: ${geo.label}`}
              >
                {geo.label}
              </button>
            ))}
          </div>
        </section>

        {/* Preset de Iluminación */}
        <section className="inspector-section" aria-label="Selección de iluminación de entorno">
          <div className="section-title">
            <Sun size={14} aria-hidden="true" />
            <span>Ambiente y Luces</span>
          </div>
          <div className="button-grid" role="group" aria-label="Entornos de iluminación disponibles">
            {environments.map(env => (
              <button
                key={env.id}
                type="button"
                className={`grid-btn ${environmentPreset === env.id ? 'active' : ''}`}
                onClick={() => onSelectEnvironment(env.id)}
                aria-pressed={environmentPreset === env.id}
                aria-label={`Entorno lumínico: ${env.label}`}
              >
                {env.label}
              </button>
            ))}
          </div>
        </section>

        {/* Parámetros del Material */}
        <section className="inspector-section" aria-label="Parámetros del shader procedural">
          <div className="section-title">
            <Sparkles size={14} aria-hidden="true" />
            <span>Propiedades del Shader</span>
          </div>

          <div className="control-field">
            <div className="field-header">
              <span id="label-distortion">Deformación / Ondas</span>
              <span>{params.distortion.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={3.0}
              step={0.05}
              value={params.distortion}
              aria-labelledby="label-distortion"
              aria-label="Deformación de ondas del shader"
              aria-valuemin={0}
              aria-valuemax={3.0}
              aria-valuenow={params.distortion}
              onChange={e => onChangeParams({ distortion: Number(e.target.value) })}
            />
          </div>

          <div className="control-field">
            <div className="field-header">
              <span id="label-speed">Velocidad de Flujo</span>
              <span>{params.speed.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={3.0}
              step={0.05}
              value={params.speed}
              aria-labelledby="label-speed"
              aria-label="Velocidad de flujo de animación del shader"
              aria-valuemin={0.1}
              aria-valuemax={3.0}
              aria-valuenow={params.speed}
              onChange={e => onChangeParams({ speed: Number(e.target.value) })}
            />
          </div>

          <div className="control-field">
            <div className="field-header">
              <span id="label-roughness">Rugosidad (Roughness)</span>
              <span>{params.roughness.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={1.0}
              step={0.02}
              value={params.roughness}
              aria-labelledby="label-roughness"
              aria-label="Rugosidad de la superficie del material"
              aria-valuemin={0}
              aria-valuemax={1.0}
              aria-valuenow={params.roughness}
              onChange={e => onChangeParams({ roughness: Number(e.target.value) })}
            />
          </div>

          <div className="control-field">
            <div className="field-header">
              <span id="label-metalness">Metalicidad (Metalness)</span>
              <span>{params.metalness.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={1.0}
              step={0.02}
              value={params.metalness}
              aria-labelledby="label-metalness"
              aria-label="Metalicidad reflectante del material"
              aria-valuemin={0}
              aria-valuemax={1.0}
              aria-valuenow={params.metalness}
              onChange={e => onChangeParams({ metalness: Number(e.target.value) })}
            />
          </div>

          {/* Colores */}
          <div className="colors-row">
            <div className="color-field">
              <label htmlFor="input-color-pri">Primario</label>
              <input
                id="input-color-pri"
                type="color"
                value={params.color}
                aria-label="Color primario del shader"
                onChange={e => onChangeParams({ color: e.target.value })}
              />
            </div>
            <div className="color-field">
              <label htmlFor="input-color-sec">Secundario</label>
              <input
                id="input-color-sec"
                type="color"
                value={params.secondaryColor}
                aria-label="Color secundario de acento del shader"
                onChange={e => onChangeParams({ secondaryColor: e.target.value })}
              />
            </div>
          </div>

          {/* Wireframe */}
          <div className="toggle-field">
            <div className="toggle-label">
              <Eye size={14} aria-hidden="true" />
              <span id="label-wireframe">Modo Wireframe</span>
            </div>
            <label className="switch" htmlFor="input-toggle-wireframe">
              <input
                id="input-toggle-wireframe"
                type="checkbox"
                checked={params.wireframe}
                aria-labelledby="label-wireframe"
                aria-label="Alternar visualización de malla alámbrica wireframe"
                onChange={e => onChangeParams({ wireframe: e.target.checked })}
              />
              <span className="slider round" aria-hidden="true" />
            </label>
          </div>
        </section>
      </div>
    </aside>
  );
};
