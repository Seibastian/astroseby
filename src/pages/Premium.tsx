import StarField from "@/components/StarField";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Crown, Sparkles, Shield, Infinity } from "lucide-react";

const benefits = [
  { icon: Infinity, title: "Unlimited AI Analyses", desc: "No daily limits on Cosmic Dream Synthesis" },
  { icon: Shield, title: "Ad-Free Experience", desc: "Enjoy AstroDream without interruptions" },
  { icon: Sparkles, title: "Detailed Reports", desc: "Extended natal chart & planetary transit readings" },
];

const Premium = () => (
  <div className="min-h-screen pb-24 relative">
    <StarField />
    <div className="relative z-10 px-4 pt-8 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <Crown className="h-12 w-12 text-primary mx-auto mb-3" />
        <h1 className="text-3xl font-display gold-shimmer">Go Premium</h1>
        <p className="text-muted-foreground mt-2">Unlock the full cosmic experience</p>
      </motion.div>

      <div className="space-y-4 mb-8">
        {benefits.map((b, i) => (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-xl p-4 flex items-center gap-4"
          >
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <b.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-sm text-foreground">{b.title}</h3>
              <p className="text-xs text-muted-foreground">{b.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-2xl p-6 text-center"
      >
        <p className="text-3xl font-display text-primary mb-1">$4.99</p>
        <p className="text-xs text-muted-foreground mb-4">per month</p>
        <Button className="w-full font-display text-lg py-6">
          Subscribe Now ✨
        </Button>
        <p className="text-xs text-muted-foreground mt-3">Cancel anytime. 7-day free trial.</p>
      </motion.div>
    </div>
    <BottomNav />
  </div>
);

export default Premium;
