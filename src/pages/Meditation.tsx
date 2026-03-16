import { useState, useEffect, useRef } from "react";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Volume2, VolumeX, Wind, Radio } from "lucide-react";
import { startFrequency, playBreathGuide, stopAudio, FREQUENCIES } from "@/lib/audio";

const BREATHING_PATTERNS = [
  { name: "7-7-7", nameTr: "Astral Dengeleme", inhale: 7, hold: 7, exhale: 7 },
  { name: "4-7-4", nameTr: "Sakinleştirici", inhale: 4, hold: 7, exhale: 4 },
  { name: "3-6-3", nameTr: "Akış", inhale: 3, hold: 6, exhale: 3 },
  { name: "6-6-6", nameTr: "Güneş Nefesi", inhale: 6, hold: 6, exhale: 6 },
];

const EsotericSymbol = ({ phase }: { phase: "inhale" | "hold" | "exhale" }) => {
  if (phase === "inhale") {
    // Sol Invoke - Rising sun / Divine light
    return (
      <svg viewBox="0 0 100 100" className="w-20 h-20">
        <defs>
          <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="35" fill="url(#sunGrad)" opacity="0.9" />
        <circle cx="50" cy="50" r="25" fill="none" stroke="#fef3c7" strokeWidth="1" opacity="0.6" />
        <circle cx="50" cy="50" r="18" fill="none" stroke="#fef3c7" strokeWidth="0.5" opacity="0.4" />
        {/* Solar rays */}
        {[...Array(8)].map((_, i) => (
          <line
            key={i}
            x1="50" y1="10" x2="50" y2="20"
            stroke="#fbbf24"
            strokeWidth="2"
            transform={`rotate(${i * 45} 50 50)`}
            opacity="0.7"
          />
        ))}
      </svg>
    );
  }
  
  if (phase === "hold") {
    // Tree of Life - Kabbalistic symbol
    return (
      <svg viewBox="0 0 100 100" className="w-20 h-20">
        <defs>
          <linearGradient id="treeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
        </defs>
        {/* Tree trunk */}
        <path d="M50 85 L50 55" stroke="#065f46" strokeWidth="3" strokeLinecap="round" />
        {/* Sephiroth circles */}
        <circle cx="50" cy="30" r="6" fill="url(#treeGrad)" opacity="0.8" />
        <circle cx="35" cy="42" r="5" fill="url(#treeGrad)" opacity="0.7" />
        <circle cx="65" cy="42" r="5" fill="url(#treeGrad)" opacity="0.7" />
        <circle cx="28" cy="58" r="4" fill="url(#treeGrad)" opacity="0.6" />
        <circle cx="72" cy="58" r="4" fill="url(#treeGrad)" opacity="0.6" />
        <circle cx="50" cy="55" r="8" fill="url(#treeGrad)" opacity="0.9" />
        {/* Connecting paths */}
        <path d="M50 30 L35 42 M50 30 L65 42 M35 42 L28 58 M65 42 L72 58 M35 42 L50 55 M65 42 L50 55" 
          stroke="#065f46" strokeWidth="1.5" fill="none" opacity="0.5" />
        {/* Crown */}
        <circle cx="50" cy="22" r="3" fill="#34d399" opacity="0.8" />
      </svg>
    );
  }
  
  // Exhale - Crescent Moon with Mystical Glow
  return (
    <svg viewBox="0 0 100 100" className="w-20 h-20">
      <defs>
        <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
      {/* Moon glow */}
      <circle cx="50" cy="50" r="30" fill="#4c1d95" opacity="0.3" />
      {/* Crescent */}
      <path 
        d="M65 25 A25 25 0 1 1 65 75 A18 18 0 1 0 65 25" 
        fill="url(#moonGrad)" 
      />
      {/* Stars around moon */}
      <circle cx="25" cy="30" r="1.5" fill="#c4b5fd" opacity="0.8" />
      <circle cx="20" cy="50" r="1" fill="#c4b5fd" opacity="0.6" />
      <circle cx="30" cy="70" r="1.2" fill="#c4b5fd" opacity="0.7" />
      {/* Third eye */}
      <circle cx="55" cy="45" r="3" fill="#a78bfa" opacity="0.9" />
    </svg>
  );
};

const Meditation = () => {
  const [step, setStep] = useState<"intro" | "breathing">("intro");
  const [selectedPattern, setSelectedPattern] = useState(0);
  const [selectedFrequency, setSelectedFrequency] = useState(0);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [sessionTime, setSessionTime] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [eyesClosed, setEyesClosed] = useState(false);
  
  const pattern = BREATHING_PATTERNS[selectedPattern];
  const frequency = FREQUENCIES[selectedFrequency];
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const breathTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const startBreathing = () => {
    setIsPlaying(true);
    setStep("breathing");
    setBreathPhase("inhale");
    setSessionTime(0);
    setCycleCount(0);
    if (soundEnabled) {
      startFrequency(frequency.hz, frequency.binaural);
    }
  };

  const endSession = () => {
    setIsPlaying(false);
    setStep("intro");
    setSessionTime(0);
    setEyesClosed(false);
    stopAudio();
    if (breathTimeoutRef.current) clearTimeout(breathTimeoutRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (!isPlaying || step !== "breathing") return;

    const runCycle = () => {
      setBreathPhase("inhale");
      if (soundEnabled) playBreathGuide("inhale");
      breathTimeoutRef.current = setTimeout(() => {
        setBreathPhase("hold");
        if (soundEnabled) playBreathGuide("hold");
        breathTimeoutRef.current = setTimeout(() => {
          setBreathPhase("exhale");
          if (soundEnabled) playBreathGuide("exhale");
          breathTimeoutRef.current = setTimeout(() => {
            setCycleCount(c => c + 1);
            runCycle();
          }, pattern.exhale * 1000);
        }, pattern.hold * 1000);
      }, pattern.inhale * 1000);
    };

    runCycle();
    return () => {
      if (breathTimeoutRef.current) clearTimeout(breathTimeoutRef.current);
    };
  }, [isPlaying, step, pattern]);

  useEffect(() => {
    if (cycleCount === 3 && isPlaying) {
      setEyesClosed(true);
      const timer = setTimeout(() => {
        setEyesClosed(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [cycleCount, isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getScale = () => {
    if (breathPhase === "inhale") return 1.6;
    if (breathPhase === "hold") return 1.6;
    return 1;
  };

  const getPhaseText = () => {
    if (breathPhase === "inhale") return "Nefes Al";
    if (breathPhase === "hold") return "Tut";
    return "Nefes Ver";
  };

  const getColor = () => {
    if (breathPhase === "inhale") return {
      bg: "from-amber-950/50 via-orange-950/30 to-amber-950/50",
      glow: "rgba(251, 191, 36, 0.5)",
      accent: "#fbbf24"
    };
    if (breathPhase === "hold") return {
      bg: "from-emerald-950/50 via-green-950/30 to-emerald-950/50",
      glow: "rgba(16, 185, 129, 0.5)",
      accent: "#10b981"
    };
    return {
      bg: "from-indigo-950/50 via-purple-950/30 to-indigo-950/50",
      glow: "rgba(139, 92, 246, 0.5)",
      accent: "#a78bfa"
    };
  };

  const color = getColor();

  return (
    <div className="min-h-screen pb-20 relative theme-insight overflow-hidden">
      {/* Esoteric color background */}
      <motion.div 
        className="fixed inset-0 z-0"
        animate={{
          background: step === "breathing" 
            ? `radial-gradient(ellipse at 50% 30%, ${color.glow} 0%, hsl(240 20% 5%) 60%)`
            : "radial-gradient(ellipse at 50% 0%, #1a1a3e 0%, #0a0a1a 50%, #05050a 100%)"
        }}
        transition={{ duration: 3 }}
      />

      {/* Mystical particles */}
      {step === "breathing" && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: color.accent,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 0.8, 0],
                y: [0, -100],
                x: [0, Math.random() * 40 - 20],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}

      {/* Eyes closed overlay */}
      <AnimatePresence>
        {eyesClosed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="fixed inset-0 z-40 bg-black flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  scaleY: [1, 0.1, 1],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className="w-32 h-32 mx-auto mb-6"
              >
                <svg viewBox="0 0 100 50" className="w-full h-full">
                  <path
                    d="M5 25 Q25 5 50 25 Q75 5 95 25"
                    fill="none"
                    stroke="#6d28d9"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <ellipse cx="30" cy="25" rx="8" ry="5" fill="#6d28d9" opacity="0.6" />
                  <ellipse cx="70" cy="25" rx="8" ry="5" fill="#6d28d9" opacity="0.6" />
                </svg>
              </motion.div>
              <p className="text-purple-300 text-lg font-light">
                Gözlerin kapalı...
              </p>
              <p className="text-purple-400/60 text-sm mt-2">
                Sadece sesi takip et
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 px-4 pt-8 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {step === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  rotate: { duration: 30, repeat: Infinity, ease: "linear" },
                  scale: { duration: 4, repeat: Infinity }
                }}
                className="inline-block mb-6"
              >
                <Sparkles className="w-16 h-16 text-amber-300" />
              </motion.div>
              
              <h1 className="text-3xl font-display text-white mb-4">
                Astral Rezonans
              </h1>

              <p className="text-indigo-200/70 text-sm mb-4 max-w-md mx-auto leading-relaxed">
                Bu alanda {frequency.hz}Hz frekansı ile ses veriyoruz — bu titreşim {frequency.description.toLowerCase()}. 
                Uyku ile uyanıklık arasındaki astral boyuta çekilirsiniz: önce bilinçaltı, ardından bilinçdışı.
                Sonrasında yön size aittir. Zihninizi susturup yenilenme için niyet edebilirsiniz. 
                Ya da bilinçaltı derinliklerinizi keşfetmek için niyet edebilirsiniz. 
                Bilinçdışı alanda, kolektif bilinçte gezintiye çıkabilirsiniz.
                Tüm bu deneyimler niyet ile gerçekleşir. Saf bir şekilde niyetinize odaklanırsanız istediğiniz deneyime ulaşırsınız.
                Nefes teknikleri ve frekanslar sizi bu deneyimlere hazır hale getirmek için ezoterik bilgilerden ilhamla tasarlandı.
              </p>

              <div className="bg-gradient-to-r from-indigo-900/50 via-purple-900/30 to-indigo-900/50 border border-indigo-500/30 rounded-xl px-4 py-4 mb-4">
                <p className="text-amber-300 text-sm mb-2 text-center">
                  {frequency.hz}Hz Frekans — {frequency.nameTr}
                </p>
                <p className="text-indigo-300/60 text-xs text-center">
                  {frequency.description}<br/>
                  Binaural Beat: {frequency.binaural}Hz<br/>
                  Niyetiniz yolculuğunuzu belirler
                </p>
              </div>

              <p className="text-amber-300/80 text-xs mb-6">
                ⏱️ Oturum süresi: 5-12 dakika önerilir
              </p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-amber-900/30 border border-amber-500/30 rounded-xl px-4 py-3 mb-6"
              >
                <p className="text-amber-200 text-sm">
                  🎧 Kulaklık takmanız önerilir
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                <p className="text-indigo-200/60 text-xs mb-3">Nefes Ritmi Seçin</p>
                <div className="flex gap-2 flex-wrap justify-center">
                  {BREATHING_PATTERNS.map((p, i) => (
                    <motion.button
                      key={p.name}
                      onClick={() => setSelectedPattern(i)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        selectedPattern === i 
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30" 
                          : "bg-white/10 text-indigo-200 hover:bg-white/20"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {p.name}
                    </motion.button>
                  ))}
                </div>
                <p className="text-indigo-200/50 text-xs mt-3">{pattern.nameTr}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mb-8"
              >
                <p className="text-indigo-200/60 text-xs mb-3">Frekans Seçin</p>
                <div className="flex gap-2 flex-wrap justify-center mb-3">
                  {FREQUENCIES.map((f, i) => (
                    <motion.button
                      key={f.hz}
                      onClick={() => setSelectedFrequency(i)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        selectedFrequency === i 
                          ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30" 
                          : "bg-white/10 text-indigo-200 hover:bg-white/20"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {f.hz}Hz
                    </motion.button>
                  ))}
                </div>
                <div className="bg-indigo-900/40 border border-indigo-500/30 rounded-lg px-3 py-2 text-left">
                  <p className="text-purple-300 text-sm font-medium">{frequency.nameTr}</p>
                  <p className="text-indigo-300/70 text-xs">{frequency.description}</p>
                  <p className="text-indigo-400/50 text-xs mt-1">Binaural: {frequency.binaural}Hz</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  onClick={startBreathing}
                  className="w-full h-14 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/30"
                >
                  <Wind className="w-5 h-5 mr-2" /> Rezonansı Başlat
                </Button>
              </motion.div>
            </motion.div>
          )}

          {step === "breathing" && (
            <motion.div
              key="breathing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              {!eyesClosed && (
                <>
                  <div className="flex justify-between items-center mb-8">
                    <button onClick={endSession} className="text-indigo-300 hover:text-white">
                      <X className="w-6 h-6" />
                    </button>
                    <p className="text-indigo-300 font-mono text-lg">{formatTime(sessionTime)}</p>
                    <button 
                      onClick={() => setSoundEnabled(!soundEnabled)} 
                      className="text-indigo-300 hover:text-white"
                    >
                      {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                    </button>
                  </div>

                  {/* Breathing Circle with Esoteric Symbol */}
                  <div className="relative h-80 flex items-center justify-center mb-8">
                {/* Outer mystical ring */}
                <motion.div
                  className="absolute w-72 h-72 rounded-full"
                  style={{
                    border: `1px solid ${color.accent}`,
                    opacity: 0.2,
                  }}
                  animate={{ 
                    rotate: 360,
                    scale: getScale() * 1.1
                  }}
                  transition={{ 
                    rotate: { duration: 60, repeat: Infinity, ease: "linear" },
                    duration: pattern[breathPhase] || 4
                  }}
                />
                
                {/* Outer glow */}
                <motion.div
                  className="absolute w-64 h-64 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${color.glow} 0%, transparent 70%)`,
                  }}
                  animate={{ scale: getScale() * 1.2 }}
                  transition={{ duration: pattern[breathPhase] || 4, ease: "easeInOut" }}
                />
                
                {/* Middle sacred geometry */}
                <motion.div
                  className="absolute w-48 h-48"
                  style={{
                    opacity: 0.3,
                  }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon 
                      points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" 
                      fill="none" 
                      stroke={color.accent} 
                      strokeWidth="1"
                    />
                    <polygon 
                      points="50,20 80,35 80,65 50,80 20,65 20,35" 
                      fill="none" 
                      stroke={color.accent} 
                      strokeWidth="0.5"
                      opacity="0.5"
                    />
                  </svg>
                </motion.div>
                
                {/* Main circle */}
                <motion.div
                  className="absolute w-36 h-36 rounded-full flex items-center justify-center"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${color.glow.replace('0.5', '0.8')}, ${color.glow.replace('0.5', '0.2')})`,
                    boxShadow: `0 0 50px ${color.glow}, inset 0 0 30px rgba(255,255,255,0.1)`,
                  }}
                  animate={{ 
                    scale: getScale(),
                    rotate: breathPhase === "hold" ? [0, 3, -3, 0] : 0,
                  }}
                  transition={{ 
                    duration: pattern[breathPhase] || 4, 
                    ease: "easeInOut",
                    rotate: { repeat: Infinity, duration: 2 }
                  }}
                >
                  <motion.div
                    key={breathPhase}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <EsotericSymbol phase={breathPhase} />
                  </motion.div>
                </motion.div>
              </div>
                </>
              )}

              {/* Phase text */}
              <motion.p
                key={breathPhase}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-light text-white mb-2"
              >
                {getPhaseText()}
              </motion.p>

              {/* Phase description */}
              <p className="text-indigo-300/60 text-sm mb-4">
                {breathPhase === "inhale" && "Kozmik ışığı için"}
                {breathPhase === "hold" && "Hayat ağacıyla bağlantı"}
                {breathPhase === "exhale" && "Ayın huzurunda"}
              </p>

              {/* Deep relaxation message after 3 cycles */}
              {cycleCount >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-500/30 rounded-xl px-4 py-3 mb-6"
                >
                  <p className="text-purple-200 text-sm">
                    ✨ Artık gözlerini kapatıp sadece sesi takip ederek devam edebilirsin
                  </p>
                  <p className="text-purple-300/60 text-xs mt-1">
                    Niyetinle rezonansa geç
                  </p>
                </motion.div>
              )}

              {/* Pattern info */}
              <p className="text-indigo-300/40 text-xs mb-8">
                {pattern.nameTr} • {pattern.inhale}-{pattern.hold}-{pattern.exhale}
              </p>

              <Button
                variant="outline"
                onClick={endSession}
                className="border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/20"
              >
                Oturumu Sonlandır
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
};

export default Meditation;
