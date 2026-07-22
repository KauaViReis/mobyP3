import { useState, useEffect, useRef } from 'react';

export function useSFX() {
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('mobyp3_sfx');
    if (saved !== null) setSfxEnabled(JSON.parse(saved));
  }, []);

  const toggleSFX = () => {
    setSfxEnabled(prev => {
      const next = !prev;
      localStorage.setItem('mobyp3_sfx', JSON.stringify(next));
      return next;
    });
  };

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playClick = () => {
    if (!sfxEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch {
      // Ignore if user hasn't interacted yet
    }
  };

  const playSuccess = () => {
    if (!sfxEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.07);

        gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + i * 0.07);
        osc.stop(ctx.currentTime + i * 0.07 + 0.12);
      });
    } catch {
      // Ignore
    }
  };

  const playError = () => {
    if (!sfxEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.setValueAtTime(100, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Ignore
    }
  };

  const playBootSound = () => {
    if (!sfxEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Camada 1: Sweep / Arpejo Grave Suave (Triangle Wave)
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();

      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(130.81, now); // Nota C3
      bassOsc.frequency.exponentialRampToValueAtTime(523.25, now + 0.35); // Sweep até C5

      bassGain.gain.setValueAtTime(0.01, now);
      bassGain.gain.linearRampToValueAtTime(0.18, now + 0.15);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      bassOsc.connect(bassGain);
      bassGain.connect(ctx.destination);

      bassOsc.start(now);
      bassOsc.stop(now + 0.65);

      // Camada 2: Chime / Ding Agudo de Confirmação (Sine Wave)
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(1046.50, now + 0.25); // C6
      chimeOsc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.35); // E6

      chimeGain.gain.setValueAtTime(0.001, now + 0.25);
      chimeGain.gain.linearRampToValueAtTime(0.22, now + 0.3);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(ctx.destination);

      chimeOsc.start(now + 0.25);
      chimeOsc.stop(now + 1.1);
    } catch {
      // Ignora restrições de autoplay caso o usuário não tenha interagido
    }
  };

  const playLoadingSound = () => {
    if (!sfxEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Efeito de escaneamento / leitura de disco retrô em 3 pings acelerados (Radar Pulse)
      [0, 0.1, 0.2].forEach((delay, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(620 + i * 140, now + delay);
        osc.frequency.exponentialRampToValueAtTime(880 + i * 160, now + delay + 0.05);

        gain.gain.setValueAtTime(0.001, now + delay);
        gain.gain.linearRampToValueAtTime(0.1, now + delay + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.07);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.07);
      });
    } catch {
      // Ignora erro
    }
  };

  return { sfxEnabled, toggleSFX, playClick, playSuccess, playError, playBootSound, playLoadingSound };
}
