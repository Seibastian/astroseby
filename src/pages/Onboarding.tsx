import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SporeField from "@/components/SporeField";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { User, CalendarDays, Clock, MapPin, ChevronRight, ChevronLeft } from "lucide-react";
import { TR } from "@/lib/i18n";

const steps = [
  { icon: User, label: TR.onboarding.name, field: "name" as const },
  { icon: CalendarDays, label: TR.onboarding.dateOfBirth, field: "date_of_birth" as const },
  { icon: Clock, label: TR.onboarding.birthTime, field: "birth_time" as const },
  { icon: MapPin, label: TR.onboarding.birthPlace, field: "birth_place" as const },
];

const getZodiacSign = (month: number, day: number): string => {
  const signs = [
    { sign: "Capricorn", end: [1, 19] }, { sign: "Aquarius", end: [2, 18] },
    { sign: "Pisces", end: [3, 20] }, { sign: "Aries", end: [4, 19] },
    { sign: "Taurus", end: [5, 20] }, { sign: "Gemini", end: [6, 20] },
    { sign: "Cancer", end: [7, 22] }, { sign: "Leo", end: [8, 22] },
    { sign: "Virgo", end: [9, 22] }, { sign: "Libra", end: [10, 22] },
    { sign: "Scorpio", end: [11, 21] }, { sign: "Sagittarius", end: [12, 21] },
    { sign: "Capricorn", end: [12, 31] },
  ];
  for (const s of signs) {
    if (month < s.end[0] || (month === s.end[0] && day <= s.end[1])) return s.sign;
  }
  return "Capricorn";
};

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ name: "", date_of_birth: "", birth_time: "", birth_place: "" });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const dob = new Date(data.date_of_birth);
      const sunSign = getZodiacSign(dob.getMonth() + 1, dob.getDate());

      const { error } = await supabase
        .from("profiles")
        .update({
          name: data.name,
          date_of_birth: data.date_of_birth,
          birth_time: data.birth_time || null,
          birth_place: data.birth_place,
          sun_sign: sunSign,
          onboarding_completed: true,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      // Calculate real planetary positions in the background
      fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calculate-natal-chart`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            user_id: user.id,
            date_of_birth: data.date_of_birth,
            birth_time: data.birth_time || null,
            birth_place: data.birth_place,
          }),
        }
      ).catch(console.error);

      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const currentStep = steps[step];
  const isLast = step === steps.length - 1;
  const canProceed = data[currentStep.field].trim() !== "";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <SporeField />
      <div className="w-full max-w-sm relative z-10">
        <div className="flex justify-center gap-3 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-all duration-500 ${
                i <= step ? "bg-primary scale-125" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="glass-card rounded-2xl p-8"
          >
            <div className="text-center mb-6">
              <currentStep.icon className="h-8 w-8 text-primary mx-auto mb-3" />
              <h2 className="text-xl font-display text-foreground">{currentStep.label}</h2>
            </div>

            {currentStep.field === "date_of_birth" ? (
              <Input
                type="date"
                value={data.date_of_birth}
                onChange={(e) => setData({ ...data, date_of_birth: e.target.value })}
                className="bg-muted/50 border-border text-center"
              />
            ) : currentStep.field === "birth_time" ? (
              <Input
                type="time"
                value={data.birth_time}
                onChange={(e) => setData({ ...data, birth_time: e.target.value })}
                className="bg-muted/50 border-border text-center"
              />
            ) : (
              <Input
                type="text"
                placeholder={currentStep.field === "name" ? TR.onboarding.namePlaceholder : TR.onboarding.birthPlacePlaceholder}
                value={data[currentStep.field]}
                onChange={(e) => setData({ ...data, [currentStep.field]: e.target.value })}
                className="bg-muted/50 border-border"
              />
            )}

            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                  <ChevronLeft className="h-4 w-4 mr-1" /> {TR.onboarding.back}
                </Button>
              )}
              <Button
                onClick={isLast ? handleFinish : () => setStep(step + 1)}
                disabled={!canProceed || loading}
                className="flex-1 font-display"
              >
                {loading ? "..." : isLast ? TR.onboarding.finish : TR.onboarding.next}
                {!isLast && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
