/* ============================================================
   VELVET TASK — Audio FX Synthesizer (Persona 5 aesthetic)
   Synthesized via Web Audio API (Zero external assets needed)
   ============================================================ */

class VelvetAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setEnabled(val) {
    this.enabled = Boolean(val);
  }

  createNoiseBuffer(duration = 0.25) {
    const ctx = this.ensureContext();
    if (!ctx) return null;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // 1. TARGET ELIMINATED: Persona 5 "Critical Strike / Slash" impact
  playEliminated(isRankUp = false) {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Component A: Sharp Blade Slash (Filtered White Noise)
    const noiseBuffer = this.createNoiseBuffer(0.2);
    if (noiseBuffer) {
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(6500, now);
      bandpass.frequency.exponentialRampToValueAtTime(800, now + 0.18);
      bandpass.Q.setValueAtTime(3.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.7, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);

      noiseSource.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + 0.2);
    }

    // Component B: Punchy Impact Thump (Heavy Kick)
    const kickOsc = ctx.createOscillator();
    const kickGain = ctx.createGain();
    kickOsc.type = 'sine';
    kickOsc.frequency.setValueAtTime(180, now + 0.02);
    kickOsc.frequency.exponentialRampToValueAtTime(38, now + 0.22);

    kickGain.gain.setValueAtTime(0.001, now);
    kickGain.gain.setValueAtTime(0.85, now + 0.02);
    kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    kickOsc.connect(kickGain);
    kickGain.connect(ctx.destination);
    kickOsc.start(now + 0.02);
    kickOsc.stop(now + 0.25);

    // Component C: Steel Resonant Gleam (Harmonic chime chord)
    [880, 1318.5, 1760].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + 0.03);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.setValueAtTime(0.18 / (i + 1), now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + 0.03);
      osc.stop(now + 0.44);
    });

    // If Rank Up, follow up with fanfare after 0.22s
    if (isRankUp) {
      setTimeout(() => this.playRankUp(), 220);
    }
  }

  // 2. RANK UP FANFARE: Bright Ascending Arpeggio
  playRankUp() {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Pentatonic/Heroic fanfare chord: F#4 -> A#4 -> C#5 -> F#5
    const notes = [370.0, 466.16, 554.37, 739.99];
    notes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, noteTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.setValueAtTime(0.22, noteTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.42);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.44);
    });
  }

  // 3. MAX BOND JINGLE: Dramatic Royal Victory Chime
  playMaxBond() {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [
      { f: 523.25, t: 0 },    // C5
      { f: 659.25, t: 0.09 }, // E5
      { f: 783.99, t: 0.18 }, // G5
      { f: 987.77, t: 0.27 }, // B5
      { f: 1046.5, t: 0.38 }  // C6 (held longer)
    ];

    notes.forEach((n, idx) => {
      const noteTime = now + n.t;
      const isLast = idx === notes.length - 1;
      const duration = isLast ? 0.9 : 0.35;

      const osc = ctx.createOscillator();
      const subOsc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, noteTime);

      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(n.f * 2, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.setValueAtTime(isLast ? 0.35 : 0.22, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + duration);

      osc.connect(gain);
      subOsc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      subOsc.start(noteTime);
      osc.stop(noteTime + duration + 0.02);
      subOsc.stop(noteTime + duration + 0.02);
    });
  }

  // 4. VELVET ROOM BELL: Ethereal Mystical Bell
  playVelvetBell() {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Harmonic bell partials (A3 based: 220Hz, 440Hz, 660Hz, 880Hz, 1320Hz)
    const partials = [
      { ratio: 1, gain: 0.28, decay: 1.4 },
      { ratio: 2.02, gain: 0.2, decay: 1.1 },
      { ratio: 3.01, gain: 0.14, decay: 0.8 },
      { ratio: 4.25, gain: 0.09, decay: 0.6 },
      { ratio: 5.4, gain: 0.05, decay: 0.4 },
    ];

    const baseFreq = 220; // Velvet A
    partials.forEach(p => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * p.ratio, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.setValueAtTime(p.gain, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + p.decay + 0.05);
    });
  }

  // 5. SIGN CONTRACT: Deep Gavel / Contract Seal Stamp
  playContractSeal() {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Low sub thud
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(95, now);
    subOsc.frequency.exponentialRampToValueAtTime(25, now + 0.35);

    subGain.gain.setValueAtTime(0.85, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.4);

    // Ink stamp resonance
    const strikeOsc = ctx.createOscillator();
    const strikeGain = ctx.createGain();
    strikeOsc.type = 'triangle';
    strikeOsc.frequency.setValueAtTime(440, now);
    strikeOsc.frequency.exponentialRampToValueAtTime(110, now + 0.15);

    strikeGain.gain.setValueAtTime(0.4, now);
    strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    strikeOsc.connect(strikeGain);
    strikeGain.connect(ctx.destination);
    strikeOsc.start(now);
    strikeOsc.stop(now + 0.22);

    // Follow up with bell
    setTimeout(() => this.playVelvetBell(), 180);
  }

  // 6. ADD TARGET: Snappy Tactical Confirmation
  playAddTarget() {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    [480, 720].forEach((freq, i) => {
      const t = now + i * 0.045;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.setValueAtTime(0.24, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.1);
    });
  }

  // 7. DELETE TARGET: Paper Discard / Descending Whoosh
  playDelete() {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const noiseBuffer = this.createNoiseBuffer(0.18);
    if (noiseBuffer) {
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(1800, now);
      lowpass.frequency.exponentialRampToValueAtTime(150, now + 0.17);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.45, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      noiseSource.connect(lowpass);
      lowpass.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + 0.18);
    }
  }

  // 8. FILTER / TAB CLICK: Crisp UI Click
  playClick() {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(920, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.035);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // 9. SOUND TOGGLE: Quick confirmation chirp
  playToggleChirp(isOn) {
    if (!this.enabled && !isOn) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    if (isOn) {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
    } else {
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.08);
    }

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }
}

// Global instance
window.velvetAudio = new VelvetAudio();
