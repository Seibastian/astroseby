import { useState, useRef } from "react";
import { Home, Menu, X, Compass, BookOpen, Heart, Users, Sparkles, Crown, User, MessageCircle, Star, Wind, GraduationCap } from "lucide-react";
import mantarImg from "@/assets/mantar-avatar.png";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  { path: "/insight", label: "Keşif", icon: Compass, color: "bg-orange-500" },
  { path: "/edu", label: "Eğitim", icon: GraduationCap, color: "bg-indigo-500" },
  { path: "/meditation", label: "Meditasyon", icon: Wind, color: "bg-cyan-500" },
  { path: "/dreams", label: "Rüyalar", icon: BookOpen, color: "bg-purple-500" },
  { path: "/karmic-match", label: "Karmik", icon: Heart, color: "bg-pink-500" },
  { path: "/synastry", label: "Sinastri", icon: Sparkles, color: "bg-blue-500" },
  { path: "/chambers", label: "Salonlar", icon: Users, color: "bg-green-500" },
  { path: "/whoami", label: "Ben", icon: Star, color: "bg-yellow-500" },
  { path: "/premium", label: "Premium", icon: Crown, color: "bg-violet-500" },
  { path: "/profile", label: "Profil", icon: User, color: "bg-slate-500" },
];

const sidebarVariants = {
  hidden: {
    x: "100%",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    }
  },
  visible: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { x: 50, opacity: 0 },
  visible: { x: 0, opacity: 1 }
};

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const isHome = location.pathname === "/dashboard";
  const isMantar = location.pathname === "/mentor";

  const handleNavigate = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={sidebarRef}
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed top-0 right-0 bottom-0 w-[280px] bg-card border-l border-border z-50 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-display text-foreground">Menü</h2>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-2 overflow-y-auto h-[calc(100%-70px)]">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <motion.button
                    key={item.path}
                    variants={itemVariants}
                    onClick={() => handleNavigate(item.path)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-30">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {/* Home Button */}
          <button
            onClick={() => navigate("/dashboard")}
            className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition-all ${
              isHome ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <Home className="h-6 w-6" />
            <span className="text-[10px] font-medium">Ev</span>
          </button>

          {/* MANTAR Button - Hero */}
          <button
            onClick={() => navigate("/mentor")}
            className="flex flex-col items-center justify-center -mt-6"
          >
            <div className={`relative transition-transform hover:scale-105 ${isMantar ? "scale-110" : ""}`}>
              <div className={`h-16 w-16 rounded-full border-4 border-background shadow-xl overflow-hidden ${
                isMantar ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
              }`}>
                <img 
                  src={mantarImg} 
                  alt="MANTAR"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-full">
                MANTAR
              </div>
            </div>
          </button>

          {/* Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition-all ${
              menuOpen ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {menuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
            <span className="text-[10px] font-medium">Menü</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
