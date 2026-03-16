import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import mantarImg from "@/assets/mantar-avatar.png";

const COLORS = {
  insight: "#f97316",    
  edu: "#8b5cf6",         
  meditation: "#06b6d4",  
  dreams: "#a855f7",     
  karmic: "#ec4899",     
  synastry: "#3b82f6",   
  chambers: "#22c55e",    
  whoami: "#eab308",     
  premium: "#7c3aed",     
};

const navItems = [
  { path: "/insight", label: "Keşif", color: COLORS.insight },
  { path: "/edu", label: "Eğitim", color: COLORS.edu },
];

const rightNavItems = [
  { path: "/meditation", label: "Rezonans", color: COLORS.meditation },
  { path: "/dreams", label: "Rüyalar", color: COLORS.dreams },
];

const menuItems = [
  { path: "/insight", label: "Keşif", description: "Natal harita analizi", color: COLORS.insight },
  { path: "/edu", label: "Eğitim", description: "Astroloji öğren", color: COLORS.edu },
  { path: "/meditation", label: "Rezonans", description: "Nefes & frekans", color: COLORS.meditation },
  { path: "/dreams", label: "Rüyalar", description: "Rüya yorumu", color: COLORS.dreams },
  { path: "/karmic-match", label: "Karmik", description: "Karmik eş bulma", color: COLORS.karmic },
  { path: "/synastry", label: "Sinastri", description: "İlişki analizi", color: COLORS.synastry },
  { path: "/chambers", label: "Salonlar", description: "Ruh odaları", color: COLORS.chambers },
  { path: "/whoami", label: "Ben", description: "Kişisel analiz", color: COLORS.whoami },
  { path: "/premium", label: "Premium", description: "Üyelik", color: COLORS.premium },
  { path: "/profile", label: "Profil", description: "Ayarlar", color: "#64748b" },
];

const NavIcon = ({ path, color }: { path: string; color: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" className="w-5 h-5">
    {path === "/insight" && <><circle cx="12" cy="12" r="10" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" /><circle cx="12" cy="12" r="3" /></>}
    {path === "/edu" && <><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></>}
    {path === "/meditation" && <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /><circle cx="12" cy="12" r="2" /></>}
    {path === "/dreams" && <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3" /></>}
    {path === "/dashboard" && <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>}
  </svg>
);

const menuVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { staggerChildren: 0.03, delayChildren: 0.05 } },
  exit: { opacity: 0, scale: 0.95 },
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isMantar = location.pathname === "/mentor";
  const isHome = location.pathname === "/dashboard";

  const handleNavigate = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  const NavButton = ({ item }: { item: { path: string; label: string; color: string } }) => {
    const isActive = location.pathname === item.path;
    
    return (
      <motion.button
        onClick={() => handleNavigate(item.path)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex flex-col items-center justify-center px-2 py-1 rounded-xl transition-all"
      >
        {isActive && (
          <motion.div
            layoutId="navBg"
            className="absolute inset-0 rounded-xl"
            style={{ backgroundColor: `${item.color}15` }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
        <div className="relative z-10">
          <NavIcon path={item.path} color={isActive ? item.color : '#ffffff55'} />
        </div>
        {isActive && (
          <motion.div
            layoutId="navGlow"
            className="absolute -bottom-1 w-1 h-1 rounded-full"
            style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
        <span className={`text-[8px] mt-0.5 font-medium ${isActive ? 'text-white' : 'text-white/40'}`}>
          {item.label}
        </span>
      </motion.button>
    );
  };

  return (
    <>
      {/* Full Screen Overlay Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-xl z-40"
              onClick={() => setMenuOpen(false)}
            />
            
            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-50 flex flex-col"
              style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(30, 27, 75, 0.95) 0%, rgba(5, 5, 10, 0.99) 100%)' }}
            >
              <div className="flex items-center justify-between p-6 pt-14">
                <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-display text-white tracking-wider">
                  ASTRA<span className="text-purple-400">CASTRA</span>
                </motion.h2>
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setMenuOpen(false)} className="p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-2">
                <div className="grid grid-cols-2 gap-3">
                  {menuItems.map((item) => (
                    <motion.button
                      key={item.path}
                      variants={itemVariants}
                      onClick={() => handleNavigate(item.path)}
                      className={`relative p-4 rounded-2xl text-left transition-all ${
                        location.pathname === item.path ? "bg-white/15 border border-white/30" : "bg-white/5 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                        <span className="text-white font-medium text-sm">{item.label}</span>
                      </div>
                      <span className="text-white/40 text-xs">{item.description}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="p-6 text-center">
                <p className="text-white/20 text-xs">✦ Kozmik Yolculuğun Devam Ediyor ✦</p>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation - Glassmorphism */}
      <nav className="fixed bottom-0 left-0 right-0 z-30">
        <div 
          className="max-w-md mx-auto"
          style={{
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0) 0%, rgba(15, 23, 42, 0.92) 10%, rgba(15, 23, 42, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '24px 24px 0 0',
            boxShadow: '0 -12px 40px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="flex items-center justify-between h-16 px-1">
            {/* Left - Home + Nav Items (no gap) */}
            <div className="flex items-center">
              <NavButton item={{ path: "/dashboard", label: "Ev", color: "#ffffff" }} />
              {navItems.map((item) => (
                <NavButton key={item.path} item={item} />
              ))}
            </div>

            {/* MANTAR - CENTER (PROTECTED) */}
            <button onClick={() => navigate("/mentor")} className="relative -mt-7">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="relative">
                {isMantar && <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-40 blur-lg" />}
                <div className={`h-14 w-14 rounded-full border-3 border-[#0f172a] shadow-[0_0_25px_rgba(168,85,247,0.3)] overflow-hidden ${isMantar ? 'ring-2 ring-purple-500/40 ring-offset-1 ring-offset-[#0f172a]' : ''}`}>
                  <img src={mantarImg} alt="MANTAR" className="h-full w-full object-cover" />
                </div>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full shadow-md tracking-wide whitespace-nowrap">
                  MANTAR
                </div>
              </motion.div>
            </button>

            {/* Right - Nav Items + Menu (no gap) */}
            <div className="flex items-center">
              {rightNavItems.map((item) => (
                <NavButton key={item.path} item={item} />
              ))}
              {/* Menu */}
              <button onClick={() => setMenuOpen(!menuOpen)} className="flex flex-col items-center justify-center px-2 py-1 rounded-xl">
                <div className="text-white/40 hover:text-white transition-colors">
                  {menuOpen ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
                  )}
                </div>
                <span className="text-[8px] mt-0.5 font-medium text-white/40">Menü</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
