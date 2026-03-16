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
  profile: "#64748b",
};

// Çok detaylı, Mantar tarzı ikonlar
const NavIcon = ({ path, color }: { path: string; color: string }) => {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-7 h-7">
      <defs>
        <filter id={`glow-${path}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id={`grad-${path}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="1"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.5"/>
        </linearGradient>
      </defs>

      {/* Keşif - Kozmik Pusula */}
      {path === "/insight" && (
        <g filter={`url(#glow-${path})`}>
          <circle cx="32" cy="32" r="28" stroke={color} strokeWidth="2" fill="none"/>
          <circle cx="32" cy="32" r="20" stroke={color} strokeWidth="1" strokeDasharray="4 2" fill="none" opacity="0.7"/>
          <circle cx="32" cy="32" r="12" stroke={color} strokeWidth="1.5" fill="none"/>
          {/* Işınlar */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <line key={i} x1="32" y1="4" x2="32" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round" transform={`rotate(${angle} 32 32)`}/>
          ))}
          {/* Yıldızlar köşelerde */}
          <circle cx="8" cy="8" r="3" fill={color}/>
          <circle cx="56" cy="8" r="3" fill={color}/>
          <circle cx="8" cy="56" r="3" fill={color}/>
          <circle cx="56" cy="56" r="3" fill={color}/>
          {/* Merkez */}
          <circle cx="32" cy="32" r="8" fill={color}/>
          <circle cx="32" cy="32" r="4" fill="#0a0a1a"/>
          <circle cx="32" cy="32" r="2" fill={color}/>
        </g>
      )}

      {/* Eğitim - Bilgelik Piramidi */}
      {path === "/edu" && (
        <g filter={`url(#glow-${path})`}>
          <path d="M32 6L6 30l26 16 26-16L32 6z" stroke={color} strokeWidth="2" fill={`${color}15`} strokeLinejoin="round"/>
          <path d="M6 46l26 16 26-16" stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round"/>
          <path d="M6 30l26 16 26-16" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
          {/* Işık efekti */}
          <path d="M32 6v8" stroke={color} strokeWidth="3" strokeLinecap="round"/>
          <circle cx="32" cy="20" r="4" fill={color} opacity="0.8"/>
          <motion.circle cx="32" cy="20" r="6" stroke={color} strokeWidth="1" fill="none"
            animate={{ r: [6, 10, 6], opacity: [0.8, 0.2, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </g>
      )}

      {/* Meditasyon - Bilinç */}
      {path === "/meditation" && (
        <g filter={`url(#glow-${path})`}>
          <circle cx="32" cy="32" r="26" stroke={color} strokeWidth="2" fill="none"/>
          <circle cx="32" cy="32" r="18" stroke={color} strokeWidth="1" strokeDasharray="3 3" fill="none" opacity="0.7"/>
          <circle cx="32" cy="32" r="10" stroke={color} strokeWidth="1.5" fill={`${color}20`}/>
          {/* Işınlar */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <motion.line key={i} x1="32" y1="6" x2="32" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" transform={`rotate(${angle} 32 32)`}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
          {/* Merkez */}
          <circle cx="32" cy="32" r="6" fill={color}/>
          <circle cx="32" cy="32" r="3" fill="#0a0a1a"/>
          <motion.circle cx="32" cy="32" r="10" stroke={color} strokeWidth="1" fill="none"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </g>
      )}

      {/* Rüyalar - Ay ve Yıldızlar */}
      {path === "/dreams" && (
        <g filter={`url(#glow-${path})`}>
          {/* Ay */}
          <path d="M48 12c0 14-12 26-26 26S-2 26 12 12 0-2 22 12" stroke={color} strokeWidth="2.5" fill={`${color}15`} strokeLinecap="round"/>
          <path d="M48 12c0 14-12 26-26 26S-2 26 12 12 0-2 22 12" stroke={color} strokeWidth="1" fill="none" strokeDasharray="2 2" opacity="0.5"/>
          {/* Yıldızlar */}
          <motion.path d="M12 8l2 4 4.5.5-3.5 3.5.5L12 20l-4-.5 3.5-3.5-.5L8 12l2-4z" fill={color}
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.path d="M52 48l1.5 3 3.5.5-2.5 2.5.5L52 58l-4-.5 2.5-2.5-.5L48 51l1.5-3z" fill={color}
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
          <circle cx="8" cy="40" r="2" fill={color} opacity="0.7"/>
          <circle cx="56" cy="20" r="1.5" fill={color} opacity="0.6"/>
        </g>
      )}

      {/* Karmik - Kalp ve Bağ */}
      {path === "/karmic-match" && (
        <g filter={`url(#glow-${path})`}>
          <path d="M32 16c0 0-20 12-20 28 0 10 8 18 20 18s20-8 20-18c0-16-20-28-20-28z" stroke={color} strokeWidth="2" fill={`${color}15`} strokeLinejoin="round"/>
          <path d="M32 32c-4-4-12-4-12 0s4 12 12 12 12-4 12-12" stroke={color} strokeWidth="1.5" fill="none"/>
          {/* Çevre daire */}
          <circle cx="32" cy="32" r="24" stroke={color} strokeWidth="0.5" strokeDasharray="3 5" opacity="0.4"/>
          {/* Işınlar */}
          {[0, 90, 180, 270].map((angle, i) => (
            <motion.line key={i} x1="32" y1="56" x2="32" y2="60" stroke={color} strokeWidth="1.5" strokeLinecap="round" transform={`rotate(${angle} 32 32)`}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </g>
      )}

      {/* Sinastri - İki ruh */}
      {path === "/synastry" && (
        <g filter={`url(#glow-${path})`}>
          {/* Sol ruh */}
          <circle cx="22" cy="32" r="14" stroke={color} strokeWidth="2" fill={`${color}10`}/>
          <circle cx="22" cy="32" r="6" fill={color}/>
          <circle cx="22" cy="32" r="3" fill="#0a0a1a"/>
          {/* Sağ ruh */}
          <circle cx="42" cy="32" r="14" stroke={color} strokeWidth="2" fill={`${color}10`}/>
          <circle cx="42" cy="32" r="6" fill={color}/>
          <circle cx="42" cy="32" r="3" fill="#0a0a1a"/>
          {/* Bağlantı */}
          <path d="M36 32h4" stroke={color} strokeWidth="3" strokeLinecap="round"/>
          {/* Yaylar */}
          <path d="M8 18c-4-6 0-12 8-12s12 6 8 12" stroke={color} strokeWidth="1.5" fill="none"/>
          <path d="M56 46c4 6 0 12-8 12s-12-6-8-12" stroke={color} strokeWidth="1.5" fill="none"/>
          <motion.circle cx="22" cy="32" r="18" stroke={color} strokeWidth="0.5" fill="none"
            animate={{ r: [18, 20, 18], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </g>
      )}

      {/* Salonlar - Hücre */}
      {path === "/chambers" && (
        <g filter={`url(#glow-${path})`}>
          <circle cx="32" cy="32" r="26" stroke={color} strokeWidth="2" fill="none"/>
          <circle cx="32" cy="32" r="18" stroke={color} strokeWidth="1.5" fill={`${color}10`}/>
          <circle cx="32" cy="32" r="10" stroke={color} strokeWidth="1" fill="none"/>
          {/* Köşe detayları */}
          <circle cx="12" cy="12" r="2" fill={color}/>
          <circle cx="52" cy="12" r="2" fill={color}/>
          <circle cx="12" cy="52" r="2" fill={color}/>
          <circle cx="52" cy="52" r="2" fill={color}/>
          {/* Işınlar */}
          <path d="M32 6v6M32 52v6M6 32h6M52 32h6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
          {/* Merkez */}
          <motion.circle cx="32" cy="32" r="4" fill={color}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </g>
      )}

      {/* Ben - Kişi */}
      {path === "/whoami" && (
        <g filter={`url(#glow-${path})`}>
          {/* Kafa */}
          <circle cx="32" cy="18" r="12" stroke={color} strokeWidth="2" fill={`${color}15`}/>
          {/* Gözler */}
          <circle cx="27" cy="16" r="2" fill={color}/>
          <circle cx="37" cy="16" r="2" fill={color}/>
          {/* Gülümseme */}
          <path d="M27 22q5 4 10 0" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          {/* Vücut */}
          <path d="M32 30v16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <path d="M20 56c0-8 6-12 12-12s12 4 12 12" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
          {/* Işık efekti */}
          <motion.circle cx="32" cy="6" r="3" fill={color} opacity="0.8"
            animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </g>
      )}

      {/* Premium - Taç */}
      {path === "/premium" && (
        <g filter={`url(#glow-${path})`}>
          <path d="M32 8L12 26l20 16 20-16L32 8z" stroke={color} strokeWidth="2" fill={`${color}15`} strokeLinejoin="round"/>
          <path d="M12 40l20 16 20-16" stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round"/>
          <path d="M12 52l20 16 20-16" stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round"/>
          {/* Taç ucu */}
          <path d="M32 8V4" stroke={color} strokeWidth="3" strokeLinecap="round"/>
          <motion.circle cx="32" cy="4" r="3" fill={color}
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          {/* Kenar taşları */}
          <circle cx="12" cy="26" r="3" fill={color}/>
          <circle cx="52" cy="26" r="3" fill={color}/>
          <circle cx="32" cy="56" r="3" fill={color}/>
        </g>
      )}

      {/* Profil - Dünya */}
      {path === "/profile" && (
        <g filter={`url(#glow-${path})`}>
          <circle cx="32" cy="32" r="26" stroke={color} strokeWidth="2" fill="none"/>
          <circle cx="32" cy="32" r="18" stroke={color} strokeWidth="1" fill={`${color}10`}/>
          {/* Boylamlar */}
          <ellipse cx="32" cy="32" rx="8" ry="26" stroke={color} strokeWidth="1" fill="none"/>
          <ellipse cx="32" cy="32" rx="18" ry="5" stroke={color} strokeWidth="0.5" fill="none" opacity="0.6"/>
          <ellipse cx="32" cy="32" rx="18" ry="12" stroke={color} strokeWidth="0.5" fill="none" opacity="0.4"/>
          {/* Enlemler */}
          <path d="M6 32h52" stroke={color} strokeWidth="0.5"/>
          <path d="M10 20h44" stroke={color} strokeWidth="0.5" opacity="0.6"/>
          <path d="M10 44h44" stroke={color} strokeWidth="0.5" opacity="0.6"/>
          {/* Merkez */}
          <circle cx="32" cy="32" r="4" fill={color}/>
          <circle cx="32" cy="32" r="2" fill="#0a0a1a"/>
        </g>
      )}

      {/* Ev - Ana sayfa */}
      {path === "/dashboard" && (
        <g filter={`url(#glow-${path})`}>
          <path d="M10 24l22-16 22 16v20a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V24z" stroke={color} strokeWidth="2" fill={`${color}15`} strokeLinejoin="round"/>
          <path d="M22 30v12M42 30v12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <path d="M14 24V12a6 6 0 0 1 6-6h24a6 6 0 0 1 6 6v12" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Şimşek */}
          <motion.path d="M30 12l-4 8 8-8-4 8 8-8" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        </g>
      )}

      {/* Menu */}
      {path === "/menu" && (
        <g>
          {[14, 28, 42].map((y, i) => (
            <motion.line key={i} x1="12" y1={y} x2="52" y2={y} stroke={color} strokeWidth="3" strokeLinecap="round"
              animate={{ x1: [12, 14, 12], x2: [52, 50, 52] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </g>
      )}
    </svg>
  );
};

const menuItems = [
  { path: "/insight", label: "Keşif", description: "Natal harita analizi", color: COLORS.insight },
  { path: "/edu", label: "Eğitim", description: "Astroloji öğren", color: COLORS.edu },
  { path: "/meditation", label: "Meditasyon", description: "Nefes & frekans", color: COLORS.meditation },
  { path: "/dreams", label: "Rüyalar", description: "Rüya yorumu", color: COLORS.dreams },
  { path: "/karmic-match", label: "Karmik", description: "Karmik eş bulma", color: COLORS.karmic },
  { path: "/synastry", label: "Sinastri", description: "İlişki analizi", color: COLORS.synastry },
  { path: "/chambers", label: "Salonlar", description: "Ruh odaları", color: COLORS.chambers },
  { path: "/whoami", label: "Ben", description: "Kişisel analiz", color: COLORS.whoami },
  { path: "/premium", label: "Premium", description: "Üyelik", color: COLORS.premium },
  { path: "/profile", label: "Profil", description: "Ayarlar", color: COLORS.profile },
];

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

  const handleNavigate = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  const allNavItems = [
    { path: "/dashboard", label: "Ev", color: "#ffffff" },
    { path: "/karmic-match", label: "Karmik", color: COLORS.karmic },
    { path: "/chambers", label: "Salon", color: COLORS.chambers },
  ];

  const rightNavItems = [
    { path: "/meditation", label: "Meditasyon", color: COLORS.meditation },
    { path: "/dreams", label: "Rüyalar", color: COLORS.dreams },
    { path: "/menu", label: "Menü", color: "#ffffff" },
  ];

  const NavButton = ({ item }: { item: { path: string; label: string; color: string } }) => {
    const isActive = location.pathname === item.path || (item.path === "/menu" && menuOpen);
    
    return (
      <motion.button
        onClick={() => item.path === "/menu" ? setMenuOpen(!menuOpen) : handleNavigate(item.path)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="relative flex flex-col items-center justify-center w-14 h-14"
      >
        {isActive && item.path !== "/menu" && (
          <motion.div
            layoutId="navBg"
            className="absolute inset-0 rounded-xl"
            style={{ backgroundColor: `${item.color}15` }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
        
        <div className="relative z-10">
          <NavIcon path={item.path} color={isActive ? item.color : '#d4af37'} />
        </div>
        
        {isActive && item.path !== "/menu" && (
          <motion.div
            layoutId="navDot"
            className="absolute -bottom-1 w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}` }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
        
        <span className="text-[7px] mt-0.5 font-medium text-white/50">
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
                      className={`relative p-3.5 rounded-xl text-left transition-all flex items-center gap-3 ${
                        location.pathname === item.path ? "bg-white/15 border border-white/30" : "bg-white/5 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <div 
                        className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}
                      >
                        <NavIcon path={item.path} color={item.color} />
                      </div>
                      <div>
                        <span className="text-white font-medium text-sm block">{item.label}</span>
                        <span className="text-white/40 text-xs">{item.description}</span>
                      </div>
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

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30">
        <div 
          className="max-w-md mx-auto"
          style={{
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0) 0%, rgba(15, 23, 42, 0.92) 10%, rgba(15, 23, 42, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '24px 24px 0 0',
            boxShadow: '0 -12px 40px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="flex items-end justify-center h-16 px-1 pb-1">
            <div className="flex items-end gap-0 -mb-1">
              {allNavItems.map((item) => (
                <NavButton key={item.path} item={item} />
              ))}
            </div>

            {/* MANTAR - Label AŞAĞIDA */}
            <button onClick={() => navigate("/mentor")} className="relative mx-2" style={{ transform: 'translateY(-15px)' }}>
              <motion.div 
                whileHover={{ scale: 1.1 }} 
                whileTap={{ scale: 0.95 }} 
                className="relative"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                {/* Minimal parıltı */}
                <motion.div 
                  className="absolute inset-0 rounded-full"
                  animate={{ 
                    opacity: [0.3, 0.7, 0.3],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{ 
                    boxShadow: '0 0 15px rgba(234,179,8,0.4), 0 0 30px rgba(234,179,8,0.2)',
                    background: 'radial-gradient(circle, rgba(234,179,8,0.15) 0%, transparent 70%)'
                  }}
                />
                {/* Minik parıltılar */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-amber-300"
                    style={{ top: '20%', left: i === 1 ? '80%' : i === 2 ? '15%' : '50%' }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0.5, 1.2, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                  />
                ))}
                
                <div 
                  className={`h-11 w-11 rounded-full border-2 border-[#0f172a] shadow-[0_0_18px_rgba(234,179,8,0.4)] overflow-hidden ${isMantar ? 'ring-2 ring-amber-500/50 ring-offset-1 ring-offset-[#0f172a]' : ''}`}
                >
                  <img src={mantarImg} alt="MANTAR" className="h-full w-full object-cover" />
                </div>
                
                {/* Label AŞAĞIDA - Ezoterik altın */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-[#1a1a2e] text-[7px] font-bold px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(234,179,8,0.6)] tracking-wide whitespace-nowrap">
                  MANTAR
                </div>
              </motion.div>
            </button>

            <div className="flex items-end gap-0 -mb-1">
              {rightNavItems.map((item) => (
                <NavButton key={item.path} item={item} />
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
