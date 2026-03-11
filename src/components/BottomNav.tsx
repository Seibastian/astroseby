import { useState } from "react";
import { Home, Menu, X, Compass, BookOpen, Heart, Users, Sparkles, Crown, User, MessageCircle, Star, ChevronUp } from "lucide-react";
import mantarImg from "@/assets/mantar-avatar.png";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const menuItems = [
  { path: "/insight", icon: Compass, label: "Keşif", emoji: "🚀" },
  { path: "/dreams", icon: BookOpen, label: "Rüyalar", emoji: "🌙" },
  { path: "/mentor", icon: MessageCircle, label: "MANTAR", emoji: "🧠", isMantar: true },
  { path: "/karmic-match", icon: Heart, label: "Karmik", emoji: "👥" },
  { path: "/synastry", icon: Sparkles, label: "Sinastri", emoji: "💫" },
  { path: "/chambers", icon: Users, label: "Salonlar", emoji: "🏠" },
  { path: "/whoami", icon: Star, label: "Ben Kimim?", emoji: "⭐" },
  { path: "/premium", icon: Crown, label: "Premium", emoji: "💎" },
  { path: "/profile", icon: User, label: "Profil", emoji: "⚙️" },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = location.pathname === "/dashboard";

  return (
    <>
      {/* Menu Panel - Slides up from bottom */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}
      
      <motion.div
        initial={false}
        animate={{ 
          y: menuOpen ? 0 : "100%",
        }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-14 left-0 right-0 z-50 bg-card border-t border-border rounded-t-3xl max-w-lg mx-auto"
        style={{ maxHeight: "70vh", overflow: "auto" }}
      >
        <div className="p-4">
          <button 
            onClick={() => setMenuOpen(false)}
            className="w-full flex justify-center py-2"
          >
            <ChevronUp className="h-6 w-6 text-muted-foreground" />
          </button>
          
          <div className="grid grid-cols-3 gap-3">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMenuOpen(false);
                  }}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                    isActive 
                      ? "bg-primary/20 text-primary" 
                      : "hover:bg-muted"
                  }`}
                >
                  {item.isMantar ? (
                    <img 
                      src={mantarImg} 
                      alt={item.label}
                      className={`h-8 w-8 rounded-full ${isActive ? "ring-2 ring-primary" : ""}`}
                    />
                  ) : (
                    <span className="text-2xl">{item.emoji}</span>
                  )}
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          <button
            onClick={() => navigate("/dashboard")}
            className={`flex flex-col items-center gap-1 px-8 py-2 transition-all ${
              isHome ? "text-primary scale-110" : "text-muted-foreground"
            }`}
          >
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
              isHome ? "bg-primary/20" : "bg-muted"
            }`}>
              <Home className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-medium">Ev</span>
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex flex-col items-center gap-1 px-8 py-2 transition-all ${
              !isHome || menuOpen ? "text-primary scale-110" : "text-muted-foreground"
            }`}
          >
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
              !isHome || menuOpen ? "bg-primary/20" : "bg-muted"
            }`}>
              {menuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </div>
            <span className="text-[10px] font-medium">Menü</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
