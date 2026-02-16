import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { LogOut, User, CalendarDays, MapPin, Star, Moon, Sparkles, Save, Briefcase, Heart, Edit2 } from "lucide-react";
import { TR, trSign } from "@/lib/i18n";
import { toast } from "sonner";

const Profile = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ nickname: "", gender: "", profession: "", relationship_status: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      setProfile(data);
      if (data) {
        setForm({
          nickname: (data as any).nickname || "",
          gender: (data as any).gender || "",
          profession: (data as any).profession || "",
          relationship_status: (data as any).relationship_status || "",
        });
      }
    });
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        nickname: form.nickname || null,
        gender: form.gender || null,
        profession: form.profession || null,
        relationship_status: form.relationship_status || null,
      } as any)
      .eq("user_id", user.id);
    if (error) {
      toast.error("Profil güncellenemedi");
    } else {
      toast.success("Profil güncellendi ✨");
      setEditing(false);
      // Refresh
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      setProfile(data);
    }
    setSaving(false);
  };

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
    <div className="min-h-screen pb-24 relative theme-profile">
      {/* Slate blue background */}
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 30%, hsla(215, 40%, 18%, 0.4) 0%, transparent 70%), linear-gradient(to bottom, hsl(215 30% 6%), hsl(215 25% 4%))",
        }}
      />

      <div className="relative z-10 px-4 pt-8 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 border-2 border-primary/40">
            <User className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-xl font-display text-foreground">{profile.nickname || profile.name || TR.dashboard.stargazer}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </motion.div>

        {/* Basic info */}
        <div className="glass-card rounded-2xl p-5 mb-4 space-y-4">
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

        {/* Editable extra fields */}
        <div className="glass-card rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-sm text-foreground">{TR.profile.personalInfo}</h2>
            {!editing && (
              <button onClick={() => setEditing(true)} className="text-primary">
                <Edit2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{TR.profile.nickname}</label>
                <Input
                  value={form.nickname}
                  onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                  placeholder="Mantar sana nasıl hitap etsin?"
                  className="bg-muted/50 border-border text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{TR.profile.gender}</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full rounded-md bg-muted/50 border border-border p-2 text-sm text-foreground"
                >
                  <option value="">Belirtmek istemiyorum</option>
                  <option value="Kadın">Kadın</option>
                  <option value="Erkek">Erkek</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{TR.profile.profession}</label>
                <Input
                  value={form.profession}
                  onChange={(e) => setForm({ ...form, profession: e.target.value })}
                  placeholder="Mesleğin ne?"
                  className="bg-muted/50 border-border text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{TR.profile.relationship}</label>
                <select
                  value={form.relationship_status}
                  onChange={(e) => setForm({ ...form, relationship_status: e.target.value })}
                  className="w-full rounded-md bg-muted/50 border border-border p-2 text-sm text-foreground"
                >
                  <option value="">Belirtmek istemiyorum</option>
                  <option value="Bekar">Bekar</option>
                  <option value="İlişkide">İlişkide</option>
                  <option value="Evli">Evli</option>
                  <option value="Karmaşık">Karmaşık</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditing(false)} className="flex-1" size="sm">İptal</Button>
                <Button onClick={saveProfile} disabled={saving} className="flex-1" size="sm">
                  <Save className="h-3 w-3 mr-1" /> {saving ? "..." : "Kaydet"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">{TR.profile.nickname}</p>
                  <p className="text-sm text-foreground">{(profile as any).nickname || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">{TR.profile.profession}</p>
                  <p className="text-sm text-foreground">{(profile as any).profession || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Heart className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">{TR.profile.relationship}</p>
                  <p className="text-sm text-foreground">{(profile as any).relationship_status || "—"}</p>
                </div>
              </div>
            </div>
          )}
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
