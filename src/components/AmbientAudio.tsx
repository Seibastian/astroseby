import { useState, useRef, useEffect, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * Generates a cosmic ambient drone using Web Audio API.
 * Combines low binaural-like tones with subtle noise for a mystical atmosphere.
 */
const AmbientAudio = () => {
  const [playing, setPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);

  const startAudio = useCallback(() => {
    if (audioCtxRef.current) return;

    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.15;
    masterGain.connect(ctx.destination);

    // Base tone - deep drone (left channel emphasis)
    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.value = 110; // A2 note
    const gain1 = ctx.createGain();
    gain1.gain.value = 0.3;
    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start();

    // Second tone - slight detuning for binaural effect (~7Hz theta)
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.value = 117; // 7Hz difference for theta waves
    const gain2 = ctx.createGain();
    gain2.gain.value = 0.25;
    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.start();

    // Sub-bass pad
    const osc3 = ctx.createOscillator();
    osc3.type = "sine";
    osc3.frequency.value = 55; // A1
    const gain3 = ctx.createGain();
    gain3.gain.value = 0.15;
    osc3.connect(gain3);
    gain3.connect(masterGain);
    osc3.start();

    // Gentle high shimmer
    const osc4 = ctx.createOscillator();
    osc4.type = "sine";
    osc4.frequency.value = 440;
    const gain4 = ctx.createGain();
    gain4.gain.value = 0.02;
    // Subtle LFO on the shimmer
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.1;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.01;
    lfo.connect(lfoGain);
    lfoGain.connect(gain4.gain);
    lfo.start();
    osc4.connect(gain4);
    gain4.connect(masterGain);
    osc4.start();

    nodesRef.current = [osc1, osc2, osc3, osc4, lfo, gain1, gain2, gain3, gain4, lfoGain, masterGain];
  }, []);

  const stopAudio = useCallback(() => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
      nodesRef.current = [];
    }
  }, []);

  const toggle = () => {
    if (playing) {
      stopAudio();
    } else {
      startAudio();
    }
    setPlaying(!playing);
  };

  useEffect(() => {
    return () => stopAudio();
  }, [stopAudio]);

  return (
    <button
      onClick={toggle}
      className="fixed top-4 right-4 z-50 p-2 rounded-full glass-card hover:border-primary/50 transition-all"
      title={playing ? "Sesi Kapat" : "Sesi Aç"}
    >
      {playing ? (
        <Volume2 className="h-5 w-5 text-primary animate-pulse" />
      ) : (
        <VolumeX className="h-5 w-5 text-muted-foreground" />
      )}
    </button>
  );
};

export default AmbientAudio;
