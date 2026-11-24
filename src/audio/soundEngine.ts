class FilmSoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  private ensureContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public playTone(freq: number, duration = 0.14, type: OscillatorType = 'triangle', volume = 0.08) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playFilmShutter() {
    this.playTone(130, 0.12, 'sawtooth', 0.06);
    setTimeout(() => this.playTone(220, 0.18, 'triangle', 0.05), 45);
  }

  public playChoiceLock() {
    this.playTone(392, 0.09, 'triangle', 0.07);
    setTimeout(() => this.playTone(587.33, 0.16, 'sine', 0.07), 70);
  }

  public playCharacterSwitch() {
    this.playTone(180, 0.14, 'sine', 0.08);
    setTimeout(() => this.playTone(270, 0.14, 'triangle', 0.07), 60);
    setTimeout(() => this.playTone(405, 0.22, 'sine', 0.06), 120);
  }

  public playCanPop() {
    this.playTone(880, 0.05, 'square', 0.04);
    setTimeout(() => this.playTone(520, 0.15, 'sine', 0.06), 40);
  }

  public playStoveIgnite() {
    this.playTone(110, 0.24, 'sawtooth', 0.05);
    setTimeout(() => this.playTone(320, 0.18, 'triangle', 0.04), 80);
  }

  public playNepaSwitch(powerOn: boolean) {
    if (powerOn) {
      this.playTone(240, 0.12, 'sine', 0.07);
      setTimeout(() => this.playTone(480, 0.18, 'sine', 0.06), 60);
    } else {
      this.playTone(320, 0.1, 'sawtooth', 0.05);
      setTimeout(() => this.playTone(120, 0.22, 'triangle', 0.06), 70);
    }
  }

  public playRadarPing() {
    this.playTone(1046.5, 0.18, 'sine', 0.05);
  }
}

export const soundEngine = new FilmSoundEngine();
