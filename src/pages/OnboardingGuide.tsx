import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen, Heart, Users, Star, Crown, ChevronRight, X, Check } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Hoş Geldin",
    description: "Mantar / AstraCastra'ya hoş geldin. Doğum haritan ve rüyalarınla kendini keşfetmeye hazır mısın?",
    icon: Star,
    color: "from-primary to-gold",
  },
  {
    id: 2,
    title: "Doğum Haritan",
    description: "Gezegenlerin, burçların ve evlerinin haritasını gör. Herhangi bir gezegene tıklayarak detaylı açıklamaları oku.",
    icon: Sparkles,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 3,
    title: "Rüya Günlüğü",
    description: "Rüyalarını kaydet, sembolleri seç ve MANTAR'ın derin analizini oku. Ne kadar çok rüya kaydedersen o kadar net bir bilinçaltı haritası çıkar.",
    icon: BookOpen,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 4,
    title: "Karmik Eşleşme",
    description: "İlişkini astrolojik olarak analiz et. Uyumlu ve zorlu açıları gör, ilişkinin dinamiklerini keşfet.",
    icon: Heart,
    color: "from-rose-500 to-red-500",
  },
  {
    id: 5,
    title: "Premium",
    description: "Sinastri, detaylı raporlar ve daha fazlası için Premium'a geç. Tüm özelliklerin kilidini aç.",
    icon: Crown,
    color: "from-amber-500 to-yellow-500",
  },
  {
    id: 6,
    title: "MANTAR",
    description: "Her sayfadaki 'MANTAR'a Sor' butonuyla yapay zekadan destek al. Rüyalarını, haritanı veya hayatını yorumlat.",
    icon: Users,
    color: "from-green-500 to-emerald-500",
  },
];

const OnboardingGuide = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showAgain, setShowAgain] = useState(true);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      if (!showAgain) {
        localStorage.setItem("onboarding_complete", "true");
      }
      navigate("/dashboard");
    }
  };

  const handleSkip = () => {
    navigate("/dashboard");
  };

  const current = steps[currentStep];
  const Icon = current.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Skip button */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={handleSkip}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
          Atla
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center max-w-sm"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br ${current.color} flex items-center justify-center shadow-lg`}
            >
              <Icon className="h-12 w-12 text-white" />
            </motion.div>

            {/* Title */}
            <h1 className="text-3xl font-display gold-shimmer mb-4">
              {current.title}
            </h1>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed mb-8">
              {current.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom section */}
      <div className="p-6 space-y-4">
        {/* Don't show again checkbox */}
        {currentStep === steps.length - 1 && (
          <label className="flex items-center justify-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={!showAgain}
              onChange={(e) => setShowAgain(!e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
            Bir daha gösterme
          </label>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-4">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-gold text-primary-foreground font-display text-lg flex items-center justify-center gap-2"
        >
          {currentStep === steps.length - 1 ? "Başla" : "İleri"}
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default OnboardingGuide;
