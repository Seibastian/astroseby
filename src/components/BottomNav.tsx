import { useState } from "react";
import { Home, Menu, X, Compass, BookOpen, Heart, Users, Sparkles, Crown, User, MessageCircle, Star } from "lucide-react";
import mantarImg from "@/assets/mantar-avatar.png";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  { path: "/insight", icon: Compass, label: "Keşif", emoji: "🚀", color: "from-orange-500/20 to-amber-500/20" },
  { path: "/dreams", icon: BookOpen, label: "Rüyalar", emoji: "🌙", color: "from-purple-500/20 to-indigo-500/20" },
  { path: "/karmic-match", icon: Heart, label: "Karmik", emoji: "👥", color: "from-pink-500/20 to-rose-500/20" },
  { path: "/synastry", icon: Sparkles, label: "Sinastri", emoji: "💫", color: "from-blue-500/20 to-cyan-500/20" },
  { path: "/chambers", icon: Users, label: "Salonlar", emoji: "🏠", color: "from-green-500/20 to-emerald-500/20" },
  { path: "/whoami", icon: Star, label: "Ben Kimim?", emoji: "⭐", color: "from-yellow-500/20 to-orange-500/20" },
  { path: "/premium", icon: Crown, label: "Premium", emoji: "💎", color: "from-violet-500/20 to-purple-500/20" },
  { path: "/profile", icon: User, label: "Profil", emoji: "⚙️", color: "from-slate-500/20 to-zinc-500/20" },
];

const menuVariants = {
  hidden: { 
    y: "100%",
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    }
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: {
      duration: 0.2,
    }
  }
};

const itemVariants = {
  hidden: { 
    y: 20, 
    opacity: 0,
    scale: 0.9,
  },
  visible: { 
    y: 0, 
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    }
  }
};

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = location.pathname === "/dashboard";
  const isMantar = location.pathname === "/mentor";

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Menu Panel */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-card via-card to-card/95 rounded-t-3xl shadow-2xl border-t border-border/50"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 20px)" }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <motion.div 
                className="w-12 h-1.5 bg-muted-foreground/30 rounded-full"
                whileHover={{ scale: 1.1 }}
              />
            </div>

            {/* Header */}
            <div className="px-6 pb-4">
              <h2 className="text-lg font-display text-foreground">Keşfet</h2>
              <p className="text-xs text-muted-foreground">AstraCastra'nın tüm özellikleri</p>
            </div>

            {/* Menu Grid */}
            <div className="px-4 pb-6">
              <div className="grid grid-cols-4 gap-3">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.button
                      key={item.path}
                      variants={itemVariants}
                      onClick={() => {
                        navigate(item.path);
                        setMenuOpen(false);
                      }}
                      className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all"
                    >
                      <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg ${
                        isActive ? "ring-2 ring-primary" : "hover:scale-105"
                      }`}>
                        <span className="text-2xl">{item.emoji}</span>
                      </div>
                      <span className="text-xs font-medium">{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {/* Ev Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/dashboard")}
            className={`flex flex-col items-center gap-1 px-4 transition-all ${
              isHome ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <motion.div 
              animate={{ scale: isHome ? 1.1 : 1 }}
              className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-all ${
                isHome ? "bg-primary/20 shadow-lg shadow-primary/20" : "bg-muted/50"
              }`}
            >
              <Home className="h-6 w-6" />
            </motion.div>
            <span className="text-[10px] font-medium">Ev</span>
          </motion.button>

          {/* MANTAR Button - Hero */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/mentor")}
            className="flex flex-col items-center gap-1 -mt-8"
          >
            <motion.div 
              animate={{ 
                scale: isMantar ? 1.15 : 1,
                y: isMantar ? -2 : 0,
              }}
              whileHover={{ scale: 1.05 }}
              className={`h-16 w-16 rounded-full border-4 border-background shadow-2xl overflow-hidden ${
                isMantar ? "ring-4 ring-primary ring-offset-2 ring-offset-background" : ""
              }`}
            >
              <img 
                src={mantarImg} 
                alt="MANTAR"
                className="h-full w-full object-cover"
              />
            </motion.div>
            <span className="text-[10px] font-bold text-primary">MANTAR</span>
          </motion.button>

          {/* Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex flex-col items-center gap-1 px-4 transition-all ${
              menuOpen ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <motion.div 
              animate={{ scale: menuOpen ? 1.1 : 1, rotate: menuOpen ? 90 : 0 }}
              className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-all ${
                menuOpen ? "bg-primary/20 shadow-lg shadow-primary/20" : "bg-muted/50"
              }`}
            >
              {menuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </motion.div>
            <span className="text-[10px] font-medium">Menü</span>
          </motion.button>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
