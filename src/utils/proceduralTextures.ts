import * as THREE from 'three';
import { ButtonTextureType } from '../types/buttons3d';

/**
 * Generador de texturas procedurales 2D en alta resolución convertidas a THREE.CanvasTexture.
 * Cero dependencias externas y carga ultra-rápida.
 */

// Cache de texturas generadas para reutilizar memoria GPU
const textureCache = new Map<string, THREE.CanvasTexture>();

export function getProceduralTexture(type: ButtonTextureType, accentColor: string): THREE.CanvasTexture {
  const cacheKey = `${type}_${accentColor}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  switch (type) {
    case 'carbonFiber':
      paintCarbonFiber(ctx, canvas.width, canvas.height);
      break;
    case 'brushedTitanium':
      paintBrushedTitanium(ctx, canvas.width, canvas.height);
      break;
    case 'cyberCircuit':
      paintCyberCircuit(ctx, canvas.width, canvas.height, accentColor);
      break;
    case 'marbleGold':
      paintMarbleGold(ctx, canvas.width, canvas.height);
      break;
    case 'frostedGlass':
      paintFrostedGlass(ctx, canvas.width, canvas.height, accentColor);
      break;
    case 'arcadeJelly':
      paintArcadeJelly(ctx, canvas.width, canvas.height, accentColor);
      break;
    case 'hologramGlitch':
      paintHologramGlitch(ctx, canvas.width, canvas.height, accentColor);
      break;
    default:
      paintCarbonFiber(ctx, canvas.width, canvas.height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;

  textureCache.set(cacheKey, texture);
  return texture;
}

// 1. Textura de Fibra de Carbono (Carbon Fiber Twill 2x2 Weave)
function paintCarbonFiber(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#101216';
  ctx.fillRect(0, 0, w, h);

  const tileSize = 32;
  for (let y = 0; y < h; y += tileSize) {
    for (let x = 0; x < w; x += tileSize) {
      const isEven = ((x / tileSize) + (y / tileSize)) % 2 === 0;

      // Hilos de carbono orientados a 45 o 135 grados
      const grad = ctx.createLinearGradient(
        x,
        y,
        isEven ? x + tileSize : x,
        isEven ? y + tileSize : y + tileSize
      );

      if (isEven) {
        grad.addColorStop(0, '#1c1f26');
        grad.addColorStop(0.5, '#323742');
        grad.addColorStop(1, '#15171d');
      } else {
        grad.addColorStop(0, '#262a33');
        grad.addColorStop(0.5, '#181b20');
        grad.addColorStop(1, '#333845');
      }

      ctx.fillStyle = grad;
      ctx.fillRect(x, y, tileSize, tileSize);

      // Micro-filamentos
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let i = 0; i < tileSize; i += 4) {
        ctx.beginPath();
        if (isEven) {
          ctx.moveTo(x + i, y);
          ctx.lineTo(x, y + i);
        } else {
          ctx.moveTo(x + tileSize - i, y);
          ctx.lineTo(x + tileSize, y + i);
        }
        ctx.stroke();
      }
    }
  }

  // Viñeta circular suave para bisel
  const radGrad = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.5);
  radGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
  radGrad.addColorStop(0.8, 'rgba(0, 0, 0, 0.15)');
  radGrad.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, w, h);
}

// 2. Textura de Titanio Cepillado (Brushed Titanium Radial)
function paintBrushedTitanium(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#6b7280';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;

  // Anillos concéntricos de micro-cepillado al torno
  for (let r = 5; r < w * 0.6; r += 1.5) {
    const alpha = 0.05 + Math.sin(r * 0.8) * 0.04 + Math.random() * 0.03;
    const isLight = Math.random() > 0.5;
    ctx.strokeStyle = isLight ? `rgba(255, 255, 255, ${alpha})` : `rgba(30, 35, 45, ${alpha})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Reflejo anisotrópico angular en forma de aspas de luz
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 2) {
    const flare = ctx.createRadialGradient(cx, cy, 20, cx, cy, w * 0.5);
    flare.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    flare.addColorStop(0.4, 'rgba(255, 255, 255, 0.12)');
    flare.addColorStop(1, 'rgba(0, 0, 0, 0.35)');

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle + 0.35);
    ctx.fillStyle = flare;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, w * 0.5, -0.4, 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

// 3. Textura de Circuito Cyber Neón (Cyberpunk Circuit PCB)
function paintCyberCircuit(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string) {
  // Fondo de placa de circuito oscuro mate
  ctx.fillStyle = '#0a0d14';
  ctx.fillRect(0, 0, w, h);

  // Cuadrícula sutil
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  const grid = 32;
  for (let x = 0; x < w; x += grid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += grid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Pistas de circuito conductoras con brillo
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.shadowColor = accent;
  ctx.shadowBlur = 12;

  const cx = w / 2;
  const cy = h / 2;

  // Centro de chip
  ctx.strokeRect(cx - 50, cy - 50, 100, 100);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.fillRect(cx - 45, cy - 45, 90, 90);

  // Ramas de circuito
  const branches = [
    [[cx - 50, cy - 25], [cx - 120, cy - 25], [cx - 160, cy - 80], [cx - 200, cy - 80]],
    [[cx + 50, cy - 25], [cx + 110, cy - 25], [cx + 150, cy - 70], [cx + 200, cy - 70]],
    [[cx - 25, cy + 50], [cx - 25, cy + 120], [cx - 70, cy + 170], [cx - 70, cy + 220]],
    [[cx + 25, cy + 50], [cx + 25, cy + 110], [cx + 80, cy + 160], [cx + 80, cy + 220]],
    [[cx - 50, cy + 25], [cx - 130, cy + 25], [cx - 180, cy + 60]],
    [[cx + 50, cy + 25], [cx + 120, cy + 25], [cx + 170, cy + 60]],
  ];

  branches.forEach(points => {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.stroke();

    // Pad terminal circular
    const last = points[points.length - 1];
    ctx.beginPath();
    ctx.arc(last[0], last[1], 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  });

  ctx.shadowBlur = 0; // reset
}

// 4. Textura de Mármol Cerámico con Vetas Doradas (Marble Gold)
function paintMarbleGold(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, w, h);

  // Fondo marmoleado suave
  for (let i = 0; i < 6; i++) {
    const grad = ctx.createLinearGradient(
      Math.random() * w,
      0,
      Math.random() * w,
      h
    );
    grad.addColorStop(0, 'rgba(226, 232, 240, 0.4)');
    grad.addColorStop(0.5, 'rgba(203, 213, 225, 0.25)');
    grad.addColorStop(1, 'rgba(241, 245, 249, 0.3)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  // Vetas minerales orgánicas oscuras
  ctx.lineWidth = 2.5;
  for (let k = 0; k < 4; k++) {
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.18)';
    ctx.beginPath();
    let x = Math.random() * w;
    let y = 0;
    ctx.moveTo(x, y);

    while (y < h) {
      y += 15 + Math.random() * 25;
      x += (Math.random() - 0.5) * 40;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Vetas de oro líquido brillante
  ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
  ctx.shadowBlur = 6;
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.8;

  for (let k = 0; k < 3; k++) {
    ctx.beginPath();
    let x = Math.random() * w;
    let y = 0;
    ctx.moveTo(x, y);

    while (y < h) {
      y += 20 + Math.random() * 30;
      x += (Math.random() - 0.48) * 35;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

// 5. Textura de Vidrio Esmerilado (Frosted Glass)
function paintFrostedGlass(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string) {
  const grad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.5);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
  grad.addColorStop(0.7, 'rgba(240, 249, 255, 0.45)');
  grad.addColorStop(1, accent);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Micro-grano esmerilado
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 35;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);
}

// 6. Textura Arcade Jelly (Botón de Recreativa Retro)
function paintArcadeJelly(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string) {
  const cx = w / 2;
  const cy = h / 2;

  // Cúpula abombada translúcida
  const radial = ctx.createRadialGradient(cx, cy - 30, 20, cx, cy, w * 0.48);
  radial.addColorStop(0, '#ffffff');
  radial.addColorStop(0.25, accent);
  radial.addColorStop(0.8, '#1e1b4b');
  radial.addColorStop(1, '#0f0e17');

  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, w, h);

  // Destello elíptico superior (reflejo de cúpula arcade)
  ctx.save();
  ctx.translate(cx, cy - w * 0.18);
  ctx.scale(1.0, 0.45);
  ctx.beginPath();
  ctx.arc(0, 0, w * 0.28, 0, Math.PI * 2);
  const specGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, w * 0.28);
  specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
  specGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.2)');
  specGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = specGrad;
  ctx.fill();
  ctx.restore();
}

// 7. Textura Hologram Glitch
function paintHologramGlitch(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string) {
  ctx.fillStyle = '#060913';
  ctx.fillRect(0, 0, w, h);

  // Scanlines horizontales
  ctx.fillStyle = accent;
  for (let y = 0; y < h; y += 6) {
    ctx.fillRect(0, y, w, 2);
  }

  // Franjas de glitch aleatorias
  for (let i = 0; i < 12; i++) {
    const gy = Math.random() * h;
    const gh = Math.random() * 14 + 4;
    const gx = Math.random() * w * 0.5;
    const gw = Math.random() * w * 0.7;

    ctx.fillStyle = i % 2 === 0 ? '#ec4899' : '#06b6d4';
    ctx.fillRect(gx, gy, gw, gh);
  }
}
