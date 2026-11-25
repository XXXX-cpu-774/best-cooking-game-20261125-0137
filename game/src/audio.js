// All sound is synthesised with WebAudio: no audio files, no network, nothing
// to load. The first click or keypress unlocks the context; M mutes.

export function createSound() {
  let context = null;
  let muted = false;
  let sizzleNodes = null;

  function ensure() {
    if (context) {
      if (context.state === 'suspended') context.resume();
      return context;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    context = new AudioContext();
    return context;
  }

  function tone(frequency, duration, type, volume, when = 0, slideTo = 0) {
    if (muted) return;
    const ctx = ensure();
    if (!ctx) return;
    const start = ctx.currentTime + when;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (slideTo) oscillator.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.05);
  }

  return {
    unlock() {
      ensure();
    },
    toggleMute() {
      muted = !muted;
      if (muted) this.stopSizzle();
      return muted;
    },
    isMuted() {
      return muted;
    },
    click() {
      tone(620, 0.07, 'triangle', 0.12);
    },
    pick() {
      tone(520, 0.06, 'sine', 0.14);
      tone(780, 0.08, 'sine', 0.1, 0.05);
    },
    place() {
      tone(340, 0.08, 'triangle', 0.14, 0, 240);
    },
    grill() {
      tone(220, 0.12, 'sawtooth', 0.06, 0, 160);
      this.startSizzle();
    },
    ready() {
      tone(880, 0.12, 'sine', 0.14);
      tone(1174, 0.16, 'sine', 0.12, 0.1);
    },
    serve() {
      tone(660, 0.09, 'triangle', 0.16);
      tone(880, 0.09, 'triangle', 0.16, 0.08);
      tone(1320, 0.18, 'triangle', 0.16, 0.16);
    },
    coin() {
      tone(988, 0.07, 'square', 0.05);
      tone(1319, 0.14, 'square', 0.05, 0.06);
    },
    error() {
      tone(180, 0.22, 'sawtooth', 0.1, 0, 110);
    },
    burn() {
      tone(140, 0.3, 'sawtooth', 0.12, 0, 70);
    },
    tick() {
      tone(980, 0.05, 'sine', 0.08);
    },
    startSizzle() {
      if (muted || sizzleNodes) return;
      const ctx = ensure();
      if (!ctx) return;
      const length = ctx.sampleRate * 1;
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 3200;
      const gain = ctx.createGain();
      gain.gain.value = 0.025;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start();
      sizzleNodes = { source, gain };
    },
    stopSizzle() {
      if (!sizzleNodes) return;
      try {
        sizzleNodes.source.stop();
      } catch {
        // Already stopped.
      }
      sizzleNodes = null;
    },
  };
}
