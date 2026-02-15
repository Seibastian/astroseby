import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import SporeField from "@/components/SporeField";
import { motion } from "framer-motion";
import { Mail, Lock, Star } from "lucide-react";
import { TR } from "@/lib/i18n";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success(TR.auth.checkEmail);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <SporeField />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm glass-card rounded-2xl p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <Star className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-display gold-shimmer">{TR.auth.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{TR.auth.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder={TR.auth.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-muted/50 border-border"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder={TR.auth.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 bg-muted/50 border-border"
              required
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full font-display" disabled={loading}>
            {loading ? "..." : isLogin ? TR.auth.loginButton : TR.auth.signupButton}
          </Button>
        </form>

        <div className="mt-6 space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">{TR.auth.or}</span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => handleOAuth("google")}>
            {TR.auth.googleLogin}
          </Button>
          <Button variant="outline" className="w-full opacity-50 cursor-not-allowed" disabled>
            {TR.auth.facebookLogin}
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? TR.auth.newUser : TR.auth.existingUser}{" "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline">
            {isLogin ? TR.auth.signUp : TR.auth.signIn}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
