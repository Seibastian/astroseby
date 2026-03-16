export type FrequencyType = {
  hz: number;
  name: string;
  nameTr: string;
  description: string;
  binaural: number;
};

export const FREQUENCIES: FrequencyType[] = [
  { 
    hz: 432, 
    name: "Universe", 
    nameTr: "Kozmik Uyum", 
    description: "Evrensel şifa ve spiritüel denge",
    binaural: 4
  },
  { 
    hz: 528, 
    name: "DNA Repair", 
    nameTr: "DNA Onarım", 
    description: "Hücresel şifa ve mucize tonu",
    binaural: 6
  },
  { 
    hz: 396, 
    name: "Liberation", 
    nameTr: "Özgürleşme", 
    description: "Korku ve suçluluktan kurtulma",
    binaural: 5
  },
  { 
    hz: 417, 
    name: "Change", 
    nameTr: "Dönüşüm", 
    description: "Değişimi kolaylaştırma vepozitiflik",
    binaural: 5
  },
  { 
    hz: 285, 
    name: "Healing", 
    nameTr: "Doku Şifası", 
    description: "Fiziksel şifa ve enerji temizliği",
    binaural: 3
  },
];

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let hzOscillator: OscillatorNode | null = null;
let binauralOscillator: OscillatorNode | null = null;

export const initAudio = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

export const startFrequency = (hz: number = 432, binauralHz: number = 4) => {
  try {
    const ctx = initAudio();
    if (ctx.state === "suspended") ctx.resume();

    masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);

    // Main Hz tone
    hzOscillator = ctx.createOscillator();
    hzOscillator.type = "sine";
    hzOscillator.frequency.value = hz;
    
    const hzGain = ctx.createGain();
    hzGain.gain.value = 0.3;
    
    hzOscillator.connect(hzGain);
    hzGain.connect(masterGain);
    hzOscillator.start();

    // Binaural beat - opposite ear
    binauralOscillator = ctx.createOscillator();
    binauralOscillator.type = "sine";
    binauralOscillator.frequency.value = hz + binauralHz;
    
    const binauralGain = ctx.createGain();
    binauralGain.gain.value = 0.3;
    
    binauralOscillator.connect(binauralGain);
    binauralGain.connect(masterGain);
    binauralOscillator.start();

    // Gentle fade in
    masterGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 2);
  } catch (e) {
    console.log("Audio error:", e);
  }
};

export const playBreathGuide = (phase: "inhale" | "hold" | "exhale") => {
  if (!audioContext || audioContext.state === "suspended") return;
  
  const ctx = audioContext;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(ctx.destination);

  const osc = ctx.createOscillator();
  osc.type = "sine";
  
  if (phase === "inhale") {
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(330, ctx.currentTime + 4);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.5);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 3.5);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 4);
  } else if (phase === "hold") {
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.5);
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 6.5);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 7);
  } else {
    osc.frequency.setValueAtTime(330, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(180, ctx.currentTime + 4);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.5);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 3.5);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 4);
  }
  
  osc.connect(gain);
  osc.start();
  osc.stop(ctx.currentTime + 8);
};

export const stopAudio = () => {
  if (masterGain && audioContext) {
    masterGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
  }
  setTimeout(() => {
    hzOscillator?.stop();
    binauralOscillator?.stop();
    hzOscillator = null;
    binauralOscillator = null;
    masterGain = null;
  }, 1100);
};
