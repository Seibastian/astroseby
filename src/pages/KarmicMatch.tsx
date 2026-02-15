import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import SporeField from "@/components/SporeField";
import BottomNav from "@/components/BottomNav";
import KarmicWarning from "@/components/karmic/KarmicWarning";
import MatchSearch from "@/components/karmic/MatchSearch";
import MatchReveal from "@/components/karmic/MatchReveal";
import SoulChat from "@/components/karmic/SoulChat";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Heart, Sparkles } from "lucide-react";

const KarmicMatch = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [optedIn, setOptedIn] = useState(false);
  const [match, setMatch] = useState<any>(null);
  const [otherProfile, setOtherProfile] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single()
      .then(({ data }) => {
        if (data) {
          setProfile(data);
          setOptedIn(data.karmic_match_enabled || false);
        }
      });
  }, [user]);

  const toggleOptIn = async (checked: boolean) => {
    if (!user) return;
    setOptedIn(checked);
    const { error } = await supabase
      .from("profiles")
      .update({ karmic_match_enabled: checked } as any)
      .eq("user_id", user.id);
    if (error) {
      toast.error("Ayar güncellenemedi");
      setOptedIn(!checked);
    } else {
      toast.success(checked ? "Kadersel Tanışma aktif ✨" : "Kadersel Tanışma devre dışı");
    }
  };

  const findMatch = useCallback(async () => {
    if (!user || !optedIn) return;
    setSearching(true);
    setMatch(null);
    setOtherProfile(null);

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/karmic-match`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ user_id: user.id }),
        }
      );
      const data = await resp.json();
      if (resp.ok) {
        setMatch(data.match);
        setOtherProfile(data.other_profile);
      } else {
        toast.error(data.error || "Eşleşme bulunamadı");
      }
    } catch {
      toast.error("Bağlantı hatası");
    } finally {
      setSearching(false);
    }
  }, [user, optedIn]);

  const acceptDestiny = async () => {
    if (!match || !user) return;
    const isA = match.user_a === user.id;
    const updateField = isA ? { accepted_a: true } : { accepted_b: true };
    
    const { error } = await supabase
      .from("karmic_matches")
      .update(updateField)
      .eq("id", match.id);

    if (error) {
      toast.error("Kabul edilemedi");
      return;
    }

    const updated = { ...match, ...(isA ? { accepted_a: true } : { accepted_b: true }) };
    setMatch(updated);

    if (updated.accepted_a && updated.accepted_b) {
      setChatOpen(true);
      toast.success("İki ruh da kaderi kabul etti! Sohbet açılıyor... 💫");
    } else {
      toast.success("Kaderi kabul ettin. Diğer ruhun yanıtını bekliyorsun... 🌙");
    }
  };

  if (!profile) return null;

  const myAccepted = match ? (match.user_a === user?.id ? match.accepted_a : match.accepted_b) : false;
  const bothAccepted = match?.accepted_a && match?.accepted_b;

  return (
    <div className="min-h-screen pb-32 relative">
      <SporeField />
      <div className="relative z-10 px-4 pt-8 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-display text-foreground flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" /> Kadersel Tanışma
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Kozmik bağlarını keşfet</p>
        </motion.div>

        <KarmicWarning />

        {/* Opt-in Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-5 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-display text-foreground">Kadersel Tanışma Sistemi</p>
                <p className="text-xs text-muted-foreground">Eşleşme havuzuna katıl</p>
              </div>
            </div>
            <Switch checked={optedIn} onCheckedChange={toggleOptIn} />
          </div>
        </motion.div>

        {optedIn && !match && !searching && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <button
              onClick={findMatch}
              className="glass-card rounded-2xl px-8 py-4 border border-primary/40 hover:border-primary/80 transition-all group"
            >
              <Sparkles className="h-8 w-8 text-primary mx-auto mb-2 group-hover:animate-spin" />
              <p className="font-display text-foreground">Kadersel Eşleşmeni Bul</p>
              <p className="text-xs text-muted-foreground mt-1">Günde 1 eşleşme hakkın var</p>
            </button>
          </motion.div>
        )}

        {searching && <MatchSearch />}

        {match && otherProfile && !chatOpen && (
          <MatchReveal
            match={match}
            otherProfile={otherProfile}
            myProfile={profile}
            onAccept={acceptDestiny}
            accepted={myAccepted}
            bothAccepted={bothAccepted}
            onOpenChat={() => setChatOpen(true)}
          />
        )}

        {chatOpen && match && otherProfile && (
          <SoulChat
            matchId={match.id}
            otherProfile={otherProfile}
            myProfile={profile}
            onClose={() => setChatOpen(false)}
          />
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default KarmicMatch;
