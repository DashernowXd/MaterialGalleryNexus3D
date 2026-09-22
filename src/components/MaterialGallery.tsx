import React from 'react';
import { MaterialDefinition } from '../types/materials';
import { MATERIAL_CATALOG } from '../materials/materialRegistry';
import { soundSynth } from '../utils/audioSynth';
import { Palette, CheckCircle2 } from 'lucide-react';

interface MaterialGalleryProps {
  selectedMaterial: MaterialDefinition;
  onSelectMaterial: (material: MaterialDefinition) => void;
}

export const MaterialGallery: React.FC<MaterialGalleryProps> = ({
  selectedMaterial,
  onSelectMaterial,
}) => {
  const handleSelect = (mat: MaterialDefinition) => {
    if (mat.id !== selectedMaterial.id) {
      soundSynth.playMaterialSwitchSound();
      onSelectMaterial(mat);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, mat: MaterialDefinition) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(mat);
    }
  };

  return (
    <aside className="gallery-container" aria-label="Galería interactiva de materiales procedimentales">
      <div className="gallery-header">
        <Palette size={16} className="text-cyan" aria-hidden="true" />
        <h2>Galería de Materiales Interactivos</h2>
      </div>

      <div className="gallery-cards-list" role="listbox" aria-label="Catálogo de materiales 3D">
        {MATERIAL_CATALOG.map(mat => {
          const isSelected = mat.id === selectedMaterial.id;
          return (
            <div
              key={mat.id}
              className={`material-card ${isSelected ? 'active' : ''}`}
              onClick={() => handleSelect(mat)}
              role="option"
              aria-selected={isSelected}
              aria-label={`Material ${mat.name}, categoría ${mat.category}. ${mat.description}`}
              tabIndex={0}
              onKeyDown={e => handleKeyDown(e, mat)}
            >
              <div className="card-top">
                <div
                  className="color-orb"
                  aria-hidden="true"
                  style={{
                    background: `linear-gradient(135deg, ${mat.color}, ${mat.secondaryColor})`,
                    boxShadow: `0 0 12px ${mat.color}80`,
                  }}
                />
                <span className="material-category">{mat.category}</span>
                <span className="material-badge">{mat.badge}</span>
                {isSelected && <CheckCircle2 size={16} className="check-icon" aria-label="Seleccionado actualmente" />}
              </div>

              <h3 className="material-title">{mat.name}</h3>
              <p className="material-description">{mat.description}</p>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
