import * as THREE from 'three';

export type CardThemeId = 'obsidian' | 'gold' | 'cyberpunk' | 'platinum';

export interface CardThemeConfig {
  id: CardThemeId;
  name: string;
  tagline: string;
  baseColor: string;
  accentColor: string;
  foilColor: string;
  roughness: number;
  metalness: number;
  rimColor: string;
  ambientColor: string;
}

export const CARD_THEMES: Record<CardThemeId, CardThemeConfig> = {
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Black',
    tagline: 'Titanio mate aeroespacial con acento cian frío',
    baseColor: '#1a2233',
    accentColor: '#06b6d4',
    foilColor: '#f1f5f9',
    roughness: 0.32,
    metalness: 0.45,
    rimColor: '#38bdf8',
    ambientColor: '#3a4860',
  },
  gold: {
    id: 'gold',
    name: 'Royal Gold',
    tagline: 'Aleación bañada en oro de 24K con reflejo cálido',
    baseColor: '#2d220e',
    accentColor: '#f59e0b',
    foilColor: '#fef08a',
    roughness: 0.28,
    metalness: 0.5,
    rimColor: '#fbbf24',
    ambientColor: '#4d3a1c',
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Neon Cyber',
    tagline: 'Acabado iridiscente prisma con halo magenta y ultravioleta',
    baseColor: '#26143c',
    accentColor: '#ec4899',
    foilColor: '#f0abfc',
    roughness: 0.26,
    metalness: 0.46,
    rimColor: '#f43f5e',
    ambientColor: '#40245a',
  },
  platinum: {
    id: 'platinum',
    name: 'Pure Platinum',
    tagline: 'Platino cepillado pulido con brillo especular neutro',
    baseColor: '#363e4e',
    accentColor: '#cbd5e1',
    foilColor: '#ffffff',
    roughness: 0.25,
    metalness: 0.52,
    rimColor: '#e2e8f0',
    ambientColor: '#424c5e',
  },
};

/**
 * Genera textura 2D procedural para el ANVERSO de la tarjeta
 */
export function createCardFrontTexture(theme: CardThemeConfig): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 646; // Ratio ISO/IEC 7810 ID-1 (1.586)
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  const { width, height } = canvas;

  // 1. Fondo base degradado metálico cepillado de alta luminosidad
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  if (theme.id === 'gold') {
    bgGrad.addColorStop(0, '#2b1f0c');
    bgGrad.addColorStop(0.4, '#483516');
    bgGrad.addColorStop(0.7, '#382810');
    bgGrad.addColorStop(1, '#231808');
  } else if (theme.id === 'cyberpunk') {
    bgGrad.addColorStop(0, '#291340');
    bgGrad.addColorStop(0.5, '#1b2c52');
    bgGrad.addColorStop(1, '#34123f');
  } else if (theme.id === 'platinum') {
    bgGrad.addColorStop(0, '#3e4758');
    bgGrad.addColorStop(0.5, '#566175');
    bgGrad.addColorStop(1, '#384150');
  } else {
    // Obsidian
    bgGrad.addColorStop(0, '#162032');
    bgGrad.addColorStop(0.45, '#26344d');
    bgGrad.addColorStop(0.8, '#1b273b');
    bgGrad.addColorStop(1, '#131c2c');
  }

  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Patrón de líneas cepilladas finas (brushed metal)
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i < height; i += 3) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(width, i);
    ctx.stroke();
  }
  ctx.restore();

  // 3. Guilloché de seguridad geométrico
  ctx.save();
  ctx.strokeStyle = `${theme.accentColor}18`;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    for (let x = 0; x < width; x += 15) {
      const y = height * 0.45 + Math.sin((x * 0.015) + i) * 60 + Math.cos(x * 0.008) * 30;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();

  // 4. Borde perimetral sutil
  ctx.strokeStyle = `${theme.foilColor}22`;
  ctx.lineWidth = 4;
  ctx.strokeRect(28, 28, width - 56, height - 56);

  // 5. Emblema Genérico de Lujo en la esquina superior izquierda
  ctx.save();
  ctx.fillStyle = theme.foilColor;
  ctx.font = 'bold 36px "Inter", sans-serif';
  ctx.fillText('TITANIUM // PRIME', 60, 95);

  ctx.font = '500 16px "Inter", sans-serif';
  ctx.fillStyle = `${theme.foilColor}80`;
  ctx.letterSpacing = '3px';
  ctx.fillText('CRYPTOGRAPHIC ASSET CARD', 60, 125);
  ctx.restore();

  // 6. Chip EMV dorado/platino realista
  const chipX = 90;
  const chipY = 220;
  const chipW = 145;
  const chipH = 115;
  const chipR = 12;

  // Fondo chip
  const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
  if (theme.id === 'gold') {
    chipGrad.addColorStop(0, '#fef08a');
    chipGrad.addColorStop(0.5, '#eab308');
    chipGrad.addColorStop(1, '#ca8a04');
  } else {
    chipGrad.addColorStop(0, '#f1f5f9');
    chipGrad.addColorStop(0.5, '#cbd5e1');
    chipGrad.addColorStop(1, '#94a3b8');
  }

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(chipX, chipY, chipW, chipH, chipR);
  ctx.fillStyle = chipGrad;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#00000040';
  ctx.stroke();

  // Líneas divisorias de contacto del microchip
  ctx.strokeStyle = '#00000055';
  ctx.lineWidth = 2.5;

  // Ranuras horizontales
  ctx.beginPath();
  ctx.moveTo(chipX, chipY + chipH * 0.35);
  ctx.lineTo(chipX + chipW, chipY + chipH * 0.35);
  ctx.moveTo(chipX, chipY + chipH * 0.65);
  ctx.lineTo(chipX + chipW, chipY + chipH * 0.65);

  // Ranuras verticales
  ctx.moveTo(chipX + chipW * 0.35, chipY);
  ctx.lineTo(chipX + chipW * 0.35, chipY + chipH);
  ctx.moveTo(chipX + chipW * 0.65, chipY);
  ctx.lineTo(chipX + chipW * 0.65, chipY + chipH);
  ctx.stroke();

  // Orbe central del chip
  ctx.beginPath();
  ctx.arc(chipX + chipW / 2, chipY + chipH / 2, 14, 0, Math.PI * 2);
  ctx.fillStyle = '#00000025';
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 7. Icono Contactless NFC
  const nfcX = 270;
  const nfcY = 275;
  ctx.save();
  ctx.strokeStyle = `${theme.foilColor}bb`;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  for (let r = 16; r <= 38; r += 7) {
    ctx.beginPath();
    ctx.arc(nfcX, nfcY, r, -Math.PI * 0.35, Math.PI * 0.35, false);
    ctx.stroke();
  }
  ctx.restore();

  // 8. Número de tarjeta grabado (Embossed Foil)
  ctx.save();
  ctx.font = '600 44px "Courier New", monospace';
  ctx.fillStyle = theme.foilColor;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;
  ctx.fillText('4580   9201   3384   7190', 60, 430);
  ctx.restore();

  // 9. Datos de vigencia y titular
  ctx.save();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = `${theme.foilColor}90`;
  ctx.font = '500 15px "Inter", sans-serif';
  ctx.fillText('VALID THRU', 60, 480);
  ctx.fillStyle = theme.foilColor;
  ctx.font = 'bold 22px "Courier New", monospace';
  ctx.fillText('12 / 32', 170, 482);

  ctx.fillStyle = theme.foilColor;
  ctx.font = 'bold 26px "Inter", sans-serif';
  ctx.fillText('VALUED CLIENT', 60, 545);
  ctx.restore();

  // 10. Holograma de seguridad abstracto en la esquina inferior derecha
  const holoX = width - 155;
  const holoY = height - 165;
  const holoR = 48;

  const holoGrad = ctx.createRadialGradient(holoX, holoY, 4, holoX, holoY, holoR);
  holoGrad.addColorStop(0, '#f472b6');
  holoGrad.addColorStop(0.35, '#38bdf8');
  holoGrad.addColorStop(0.7, '#34d399');
  holoGrad.addColorStop(1, '#a78bfa');

  ctx.save();
  ctx.beginPath();
  ctx.arc(holoX, holoY, holoR, 0, Math.PI * 2);
  ctx.fillStyle = holoGrad;
  ctx.globalAlpha = 0.75;
  ctx.fill();
  ctx.globalAlpha = 1.0;
  ctx.lineWidth = 2;
  ctx.strokeStyle = `${theme.foilColor}80`;
  ctx.stroke();

  // Patrón geométrico interno del holograma
  ctx.strokeStyle = '#ffffff90';
  ctx.lineWidth = 1.5;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    ctx.beginPath();
    ctx.moveTo(holoX + Math.cos(a) * 10, holoY + Math.sin(a) * 10);
    ctx.lineTo(holoX + Math.cos(a) * holoR, holoY + Math.sin(a) * holoR);
    ctx.stroke();
  }
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  return texture;
}

/**
 * Genera textura 2D procedural para el REVERSO de la tarjeta
 */
export function createCardBackTexture(theme: CardThemeConfig): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 646;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  const { width, height } = canvas;

  // 1. Fondo metálico con tono de alta visibilidad
  ctx.fillStyle =
    theme.id === 'gold'
      ? '#261b0a'
      : theme.id === 'platinum'
      ? '#384152'
      : theme.id === 'cyberpunk'
      ? '#24133b'
      : '#182438';
  ctx.fillRect(0, 0, width, height);

  // 2. Banda magnética oscura en la parte superior
  ctx.fillStyle = '#06070a';
  ctx.fillRect(0, 60, width, 120);

  // Brillo sutil de banda magnética
  const magGrad = ctx.createLinearGradient(0, 60, width, 180);
  magGrad.addColorStop(0, 'rgba(255, 255, 255, 0.03)');
  magGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
  magGrad.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
  ctx.fillStyle = magGrad;
  ctx.fillRect(0, 60, width, 120);

  // 3. Panel de firma blanco/grisáceo con marcas de seguridad
  const sigX = 60;
  const sigY = 240;
  const sigW = 620;
  const sigH = 80;

  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(sigX, sigY, sigW, sigH);

  // Rayas de seguridad en el panel de firma
  ctx.save();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  for (let s = sigX + 15; s < sigX + sigW; s += 20) {
    ctx.beginPath();
    ctx.moveTo(s, sigY);
    ctx.lineTo(s - 15, sigY + sigH);
    ctx.stroke();
  }

  // Firma simulada elegante
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(sigX + 40, sigY + 50);
  ctx.bezierCurveTo(sigX + 120, sigY + 15, sigX + 180, sigY + 70, sigX + 260, sigY + 35);
  ctx.bezierCurveTo(sigX + 340, sigY + 65, sigX + 420, sigY + 25, sigX + 500, sigY + 55);
  ctx.stroke();
  ctx.restore();

  // 4. Panel CVV a la derecha de la firma
  const cvvX = sigX + sigW + 20;
  const cvvY = sigY;
  const cvvW = 120;
  const cvvH = sigH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cvvX, cvvY, cvvW, cvvH);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.strokeRect(cvvX, cvvY, cvvW, cvvH);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'italic bold 28px "Courier New", monospace';
  ctx.fillText('942', cvvX + 32, cvvY + 50);

  ctx.fillStyle = `${theme.foilColor}80`;
  ctx.font = '500 13px "Inter", sans-serif';
  ctx.fillText('SECURITY CODE (CVV)', cvvX, cvvY - 10);

  // 5. Microtexto de seguridad y aviso legal genérico internacional
  ctx.fillStyle = `${theme.foilColor}70`;
  ctx.font = '400 13.5px "Inter", sans-serif';
  ctx.fillText('This cryptographic metal card is compliant with ISO/IEC 7810 ID-1 standard.', 60, 390);
  ctx.fillText('Proprietary titanium alloy. Tokenized dual-frequency NFC interface.', 60, 415);
  ctx.fillText('Authorized signature required. If found, return to nearest concierge center.', 60, 440);

  // 6. Logotipo técnico en la esquina inferior
  ctx.fillStyle = `${theme.foilColor}90`;
  ctx.font = 'bold 20px "Inter", sans-serif';
  ctx.fillText('NEXUS ARCHITECTURE // 64-BIT SECURE ENCLAVE', 60, 560);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  return texture;
}
