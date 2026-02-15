import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import SporeField from "@/components/SporeField";
import BottomNav from "@/components/BottomNav";
import ChamberGrid from "@/components/chambers/ChamberGrid";
import ChamberChat from "@/components/chambers/ChamberChat";
import { motion, AnimatePresence } from "framer-motion";
import { Users } from "lucide-react";
import { TR, trSign } from "@/lib/i18n";

const SoulChambers = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [activeChamber, setActiveChamber] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single()
      .then(({ data }) => { if (data) setProfile(data); });
  }, [user]);

  if (!profile) return null;

  const mySunSign = profile.sun_sign; // e.g. "Capricorn"

  return (
    <div className="min-h-screen pb-32 relative">
      <SporeField />
      <div className="relative z-10 px-4 pt-8 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-display text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Ruh Ailesi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mySunSign
              ? `${trSign(mySunSign)} ${TR.signEmojis[mySunSign] || ""} salonuna hoş geldin`
              : "Doğum haritanı hesapla ve salonuna katıl"}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeChamber && mySunSign === activeChamber ? (
            <ChamberChat
              key="chat"
              chamberId={activeChamber}
              profile={profile}
              onBack={() => setActiveChamber(null)}
            />
          ) : (
            <ChamberGrid
              key="grid"
              mySunSign={mySunSign}
              onEnter={(sign) => setActiveChamber(sign)}
            />
          )}
        </AnimatePresence>
      </div>
      <BottomNav />
    </div>
  );
};

export default SoulChambers;
