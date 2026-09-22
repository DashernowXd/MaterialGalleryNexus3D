/**
 * Sintetizador de audio procedural en tiempo real con Web Audio API.
 * Provee retroalimentación sonora sin dependencias de archivos externos pesados.
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Sonido al soltar una pelota (pop elástico / launch)
   */
  public playDropSound(pitchMultiplier = 1) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Pitch drop rápido
      const baseFreq = 380 * pitchMultiplier;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(120 * pitchMultiplier, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Ignorar errores menores de audio
    }
  }

  /**
   * Sonido al rebotar una pelota en el suelo
   * La frecuencia y volumen varían con la fuerza del impacto
   */
  public playBounceSound(impactForce: number) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Normalizar impacto
      const force = Math.min(Math.max(impactForce, 0.1), 2.0);
      const freq = 160 + force * 120;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);

      const vol = Math.min(0.18 * (force / 1.5), 0.25);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Ignorar
    }
  }

  /**
   * Sonido de clic sobre el objeto 3D o shockwave
   */
  public playShockwaveSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Oscilador de onda cuadrada filtrada
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.25);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(150, now + 0.25);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {
      // Ignorar
    }
  }

  /**
   * Sonido al cambiar de material en la galería
   */
  public playMaterialSwitchSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // Acorde C - E - G brillante
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0.08, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.16);
      });
    } catch {
      // Ignorar
    }
  }

  /**
   * Sonido de clic mecánico táctil para botones 3D (pulsación y liberación)
   */
  public playMechanicalClick(isRelease = false, pitch = 1.0) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const noiseNode = this.ctx.createBufferSource();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Ruido de impacto mecánico sutil (microswitch click)
      const bufferSize = this.ctx.sampleRate * 0.02;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      noiseNode.buffer = buffer;

      filter.type = isRelease ? 'highpass' : 'bandpass';
      filter.frequency.setValueAtTime((isRelease ? 1800 : 950) * pitch, now);

      osc.type = 'triangle';
      const baseFreq = (isRelease ? 440 : 280) * pitch;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(80 * pitch, now + 0.04);

      gain.gain.setValueAtTime(isRelease ? 0.12 : 0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      noiseNode.connect(filter);
      filter.connect(gain);
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      noiseNode.start(now);
      osc.start(now);
      osc.stop(now + 0.05);
      noiseNode.stop(now + 0.05);
    } catch {
      // Ignorar
    }
  }

  /**
   * Sonido háptico al agarrar una figura 3D (pitch sweep ascendente suave)
   */
  public playGrabSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.09);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.095);
    } catch {
      // Ignorar
    }
  }

  /**
   * Sonido al soltar/lanzar una figura 3D (pitch descendente elástico)
   */
  public playThrowSound(speed = 1.0) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const normalizedSpeed = Math.min(Math.max(speed, 0.5), 3.0);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(540 * normalizedSpeed, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Ignorar
    }
  }

  /**
   * Sonido al rebotar una figura de cristal/energía en la consola o suelo
   */
  public playFigureBounceSound(force: number) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const f = Math.min(Math.max(force, 0.1), 2.5);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440 + f * 180, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.1);

      gain.gain.setValueAtTime(Math.min(0.08 * f, 0.18), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.11);
    } catch {
      // Ignorar
    }
  }
}

export const soundSynth = new SoundSynthesizer();
