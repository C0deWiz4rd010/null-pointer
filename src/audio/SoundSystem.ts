class SoundSystem {
  private ctx: AudioContext | null = null;

  private muted = false;

  init(): void {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      // Audio not available
    }
  }

  get isMuted(): boolean { return this.muted; }

  toggleMute(): void { this.muted = !this.muted; }

  private beep(freq: number, type: OscillatorType, duration: number, vol = 0.12): void {
    if (!this.ctx || this.muted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Ignore audio errors
    }
  }

  private sequence(notes: Array<[number, OscillatorType, number, number?]>, spacing = 80): void {
    notes.forEach(([freq, type, dur, vol], i) => {
      setTimeout(() => this.beep(freq, type, dur, vol), i * spacing);
    });
  }

  playCardPlay(): void {
    this.beep(660, 'square', 0.06, 0.1);
  }

  playHit(): void {
    this.beep(140, 'sawtooth', 0.09, 0.18);
    setTimeout(() => this.beep(100, 'sawtooth', 0.05, 0.08), 30);
  }

  playHeal(): void {
    this.beep(880, 'sine', 0.08, 0.09);
    setTimeout(() => this.beep(1100, 'sine', 0.1, 0.07), 60);
  }

  playEndTurn(): void {
    this.beep(330, 'square', 0.05, 0.08);
  }

  playEnemyDeath(): void {
    this.sequence([
      [440, 'square', 0.05],
      [660, 'square', 0.05],
      [880, 'square', 0.12],
    ], 70);
  }

  playVictory(): void {
    this.sequence([
      [523, 'square', 0.12, 0.18],
      [659, 'square', 0.12, 0.18],
      [784, 'square', 0.12, 0.18],
      [1047, 'square', 0.2, 0.22],
    ], 130);
  }

  playDefeat(): void {
    this.sequence([
      [440, 'sawtooth', 0.18, 0.2],
      [330, 'sawtooth', 0.18, 0.18],
      [220, 'sawtooth', 0.22, 0.18],
      [110, 'sawtooth', 0.3, 0.2],
    ], 170);
  }

  playRelicPick(): void {
    this.sequence([
      [880, 'sine', 0.08, 0.12],
      [1100, 'sine', 0.08, 0.1],
      [1320, 'sine', 0.14, 0.12],
    ], 90);
  }

  playError(): void {
    this.beep(80, 'square', 0.08, 0.25);
  }

  playPhaseTwo(): void {
    this.sequence([
      [220, 'sawtooth', 0.1, 0.2],
      [330, 'square', 0.1, 0.2],
      [220, 'sawtooth', 0.1, 0.2],
      [440, 'sawtooth', 0.2, 0.25],
    ], 100);
  }
}

export const soundSystem = new SoundSystem();
