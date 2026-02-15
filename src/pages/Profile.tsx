import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import SporeField from "@/components/SporeField";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { LogOut, User, CalendarDays, MapPin, Star, Moon, Sparkles } from "lucide-react";
import { TR, trSign } from "@/lib/i18n";

const Profile = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => setProfile(data));
  }, [user]);

  if (!profile) return null;

  const details = [
    { icon: User, label: TR.profile.name, value: profile.name || "—" },
    { icon: Star, label: TR.profile.sunSign, value: trSign(profile.sun_sign) },
    { icon: Moon, label: TR.profile.moonSign, value: trSign(profile.moon_sign) },
    { icon: Sparkles, label: TR.profile.risingSign, value: trSign(profile.rising_sign) },
    { icon: CalendarDays, label: TR.profile.dateOfBirth, value: profile.date_of_birth || "—" },
    { icon: MapPin, label: TR.profile.birthPlace, value: profile.birth_place || "—" },
  ];

  return (
    <div className="min-h-screen pb-24 relative">
      <SporeField />
      <div className="relative z-10 px-4 pt-8 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 border-2 border-primary/40">
            <User className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-xl font-display text-foreground">{profile.name || TR.dashboard.stargazer}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </motion.div>

        <div className="glass-card rounded-2xl p-5 mb-6 space-y-4">
          {details.map((d) => (
            <div key={d.label} className="flex items-center gap-3">
              <d.icon className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{d.label}</p>
                <p className="text-sm text-foreground">{d.value}</p>
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={signOut} className="w-full">
          <LogOut className="h-4 w-4 mr-2" /> {TR.profile.signOut}
        </Button>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;
