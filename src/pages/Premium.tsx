import SporeField from "@/components/SporeField";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Crown, Sparkles, Shield, Infinity } from "lucide-react";
import { TR } from "@/lib/i18n";

const benefits = [
  { icon: Infinity, title: TR.premium.unlimitedAI, desc: TR.premium.unlimitedAIDesc },
  { icon: Shield, title: TR.premium.adFree, desc: TR.premium.adFreeDesc },
  { icon: Sparkles, title: TR.premium.detailedReports, desc: TR.premium.detailedReportsDesc },
];

const Premium = () => (
  <div className="min-h-screen pb-24 relative">
    <SporeField />
    <div className="relative z-10 px-4 pt-8 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <Crown className="h-12 w-12 text-primary mx-auto mb-3" />
        <h1 className="text-3xl font-display gold-shimmer">{TR.premium.title}</h1>
        <p className="text-muted-foreground mt-2">{TR.premium.subtitle}</p>
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
        <p className="text-3xl font-display text-primary mb-1">{TR.premium.price}</p>
        <p className="text-xs text-muted-foreground mb-4">{TR.premium.perMonth}</p>
        <Button className="w-full font-display text-lg py-6">
          {TR.premium.subscribe}
        </Button>
        <p className="text-xs text-muted-foreground mt-3">{TR.premium.trial}</p>
      </motion.div>
    </div>
    <BottomNav />
  </div>
);

export default Premium;
