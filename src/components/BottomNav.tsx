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

// Detaylı, alengirli ezoterik ikonlar
const NavIcon = ({ path, color }: { path: string; color: string }) => {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-5 h-5">
      {/* Keşif - Kozmik Pusula - Çok detaylı */}
      {path === "/insight" && (
        <g>
          <circle cx="24" cy="24" r="20" stroke={color} strokeWidth="1.5" />
          <circle cx="24" cy="24" r="14" stroke={color} strokeWidth="0.8" strokeDasharray="2 2" />
          <circle cx="24" cy="24" r="8" stroke={color} strokeWidth="1" />
          {/* Yıldızlar */}
          <circle cx="24" cy="6" r="2" fill={color} />
          <circle cx="24" cy="42" r="2" fill={color} />
          <circle cx="6" cy="24" r="2" fill={color} />
          <circle cx="42" cy="24" r="2" fill={color} />
          {/* Çapraz çizgiler */}
          <path d="M24 8v6M24 34v6M8 24h6M34 24h6" stroke={color} strokeWidth="1" strokeLinecap="round" />
          {/* Merkez nokta */}
          <circle cx="24" cy="24" r="4" fill={color} />
          <circle cx="24" cy="24" r="2" fill="#0a0a1a" />
        </g>
      )}

      {/* Eğitim - Piramit/Bilgelik */}
      {path === "/edu" && (
        <g>
          <path d="M24 6L6 22l18 11 18-11L24 6z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M6 33l18 11 18-11" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M6 22l18 11 18-11" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
          {/* Gölge efekti */}
          <path d="M24 17v20" stroke={color} strokeWidth="0.8" strokeDasharray="2 2" opacity="0.5" />
          {/* Parlama */}
          <circle cx="24" cy="14" r="3" fill={color} opacity="0.6" />
        </g>
      )}

      {/* Meditasyon - Zihin/Bilinç */}
      {path === "/meditation" && (
        <g>
          <circle cx="24" cy="24" r="18" stroke={color} strokeWidth="1.5" />
          <circle cx="24" cy="24" r="12" stroke={color} strokeWidth="1" />
          <circle cx="24" cy="24" r="6" stroke={color} strokeWidth="0.8" strokeDasharray="3 3" />
          {/* Işınlar */}
          <path d="M24 6v4M24 38v4M6 24h4M38 24h4" stroke={color} strokeWidth="1" strokeLinecap="round" />
          {/* Merkez */}
          <circle cx="24" cy="24" r="3" fill={color} />
          <motion.circle cx="24" cy="24" r="5" stroke={color} strokeWidth="0.5" fill="none" 
            animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0.3, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </g>
      )}

      {/* Rüyalar - Ay/Yıldızlar */}
      {path === "/dreams" && (
        <g>
          {/* Ay */}
          <path d="M36 10c0 10-8 18-18 18-10 0-18-8-18-18 0 10 8 18 18 18 2 0 4-0.5 6-1" stroke={color} strokeWidth="1.5" fill="none" />
          <path d="M36 10c0 10-8 18-18 18-10 0-18-8-18-18 0 10 8 18 18 18 2 0 4-0.5 6-1" stroke={color} strokeWidth="3" fill={`${color}20`} />
          {/* Yıldızlar */}
          <motion.path d="M10 8l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" fill={color}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.path d="M38 36l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" fill={color}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
          <circle cx="8" cy="30" r="1.5" fill={color} opacity="0.7" />
          <circle cx="40" cy="14" r="1" fill={color} opacity="0.7" />
        </g>
      )}

      {/* Karmik - Kalp/Bağlantı */}
      {path === "/karmic-match" && (
        <g>
          <path d="M38 12c0 12-10 20-22 20-6 0-12-4-16-10-4-6-4-14 4-20 8-6 18-6 26 0 8-6 10 8 8 10" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
          {/* İç detay */}
          <path d="M24 18c-2-2-6-2-8 0s-2 6 0 8c2 2 6 2 8 0" stroke={color} strokeWidth="1" fill="none" />
          {/* Çevre çizgiler */}
          <circle cx="24" cy="24" r="18" stroke={color} strokeWidth="0.5" strokeDasharray="2 4" opacity="0.5" />
        </g>
      )}

      {/* Sinastry - İki ruh */}
      {path === "/synastry" && (
        <g>
          {/* Sol daire */}
          <circle cx="18" cy="24" r="10" stroke={color} strokeWidth="1.5" />
          <circle cx="18" cy="24" r="4" fill={color} />
          {/* Sağ daire */}
          <circle cx="30" cy="24" r="10" stroke={color} strokeWidth="1.5" />
          <circle cx="30" cy="24" r="4" fill={color} />
          {/* Bağlantı */}
          <path d="M28 24h4" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <circle cx="26" cy="22" r="1" fill={color} />
          <circle cx="26" cy="26" r="1" fill={color} />
          {/* Yaylar */}
          <path d="M8 14c-2-4 2-8 6-8s6 4 4 8" stroke={color} strokeWidth="1" fill="none" />
          <path d="M40 34c2 4-2 8-6 8s-6-4-4-8" stroke={color} strokeWidth="1" fill="none" />
        </g>
      )}

      {/* Salonlar - Hücre */}
      {path === "/chambers" && (
        <g>
          <circle cx="24" cy="24" r="20" stroke={color} strokeWidth="1.5" />
          <circle cx="24" cy="24" r="14" stroke={color} strokeWidth="1" />
          <circle cx="24" cy="24" r="8" stroke={color} strokeWidth="1" />
          {/* Işınlar */}
          <path d="M24 4v4M24 40v4M4 24h4M40 24h4" stroke={color} strokeWidth="1" strokeLinecap="round" />
          {/* Köşeler */}
          <path d="M10 10l2 2M38 38l-2-2M10 38l2-2M38 10l-2 2" stroke={color} strokeWidth="0.8" strokeLinecap="round" />
          <motion.circle cx="24" cy="24" r="3" fill={color} 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </g>
      )}

      {/* Ben - Kişisel */}
      {path === "/whoami" && (
        <g>
          {/* Kafa */}
          <circle cx="24" cy="14" r="8" stroke={color} strokeWidth="1.5" />
          {/* Gözler */}
          <circle cx="21" cy="12" r="1.5" fill={color} />
          <circle cx="27" cy="12" r="1.5" fill={color} />
          {/* Göz bebekleri */}
          <circle cx="21" cy="12" r="0.5" fill="#0a0a1a" />
          <circle cx="27" cy="12" r="0.5" fill="#0a0a1a" />
          {/* Gülümseme */}
          <path d="M20 17q2 3 4 0" stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" />
          {/* Vücut */}
          <path d="M24 22v10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M16 42c0-5 4-8 8-8s8 3 8 8" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Kafa üstü ışık */}
          <motion.circle cx="24" cy="6" r="2" fill={color} opacity="0.6"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </g>
      )}

      {/* Premium - Taç */}
      {path === "/premium" && (
        <g>
          <path d="M24 8L10 20l14 10 14-10L24 8z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
          <path d="M10 28l14 10 14-10" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
          <path d="M10 34l14 10 14-10" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
          {/* Taç ucu */}
          <path d="M24 8v-4" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <motion.circle cx="24" cy="4" r="2" fill={color}
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          {/* Kenar taşlar */}
          <circle cx="10" cy="20" r="2" fill={color} />
          <circle cx="38" cy="20" r="2" fill={color} />
          <circle cx="24" cy="38" r="2" fill={color} />
        </g>
      )}

      {/* Profil - Ayarlar/Dünya */}
      {path === "/profile" && (
        <g>
          <circle cx="24" cy="24" r="18" stroke={color} strokeWidth="1.5" />
          <circle cx="24" cy="24" r="12" stroke={color} strokeWidth="1" />
          {/* Boylamlar */}
          <ellipse cx="24" cy="24" rx="6" ry="18" stroke={color} strokeWidth="0.8" fill="none" />
          <ellipse cx="24" cy="24" rx="12" ry="4" stroke={color} strokeWidth="0.8" fill="none" />
          {/* Enlemler */}
          <path d="M6 24h36" stroke={color} strokeWidth="0.5" />
          <path d="M9 16h30" stroke={color} strokeWidth="0.5" />
          <path d="M9 32h30" stroke={color} strokeWidth="0.5" />
          {/* Merkez */}
          <circle cx="24" cy="24" r="2" fill={color} />
        </g>
      )}

      {/* Ev - Ana sayfa */}
      {path === "/dashboard" && (
        <g>
          <path d="M8 18l16-12 16 12v14a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V18z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M16 22v8M32 22v8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M12 18V8a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v10" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          {/* Şimşek/Enerji */}
          <motion.path d="M22 8l-2 6 4-4-2 6 4-4-2 6" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </g>
      )}

      {/* Menu */}
      {path === "/menu" && (
        <g>
          <path d="M8 14h32" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M8 24h32" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M8 34h32" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
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
    { path: "/insight", label: "Keşif", color: COLORS.insight },
    { path: "/edu", label: "Eğitim", color: COLORS.edu },
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
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="relative flex flex-col items-center justify-center w-14 h-14"
      >
        {isActive && item.path !== "/menu" && (
          <motion.div
            layoutId="navBg"
            className="absolute inset-0 rounded-xl"
            style={{ backgroundColor: `${item.color}12` }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
        
        <div className="relative z-10">
          <NavIcon path={item.path} color={isActive ? item.color : '#ffffff55'} />
        </div>
        
        {isActive && item.path !== "/menu" && (
          <motion.div
            layoutId="navDot"
            className="absolute -bottom-1 w-1 h-1 rounded-full"
            style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }}
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
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${item.color}15`, border: `1px solid ${item.color}25` }}
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
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '24px 24px 0 0',
            boxShadow: '0 -12px 40px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="flex items-end justify-center h-16 px-1 pb-1">
            <div className="flex items-end gap-0.5 -mb-1">
              {allNavItems.map((item) => (
                <NavButton key={item.path} item={item} />
              ))}
            </div>

            {/* MANTAR */}
            <button onClick={() => navigate("/mentor")} className="relative mx-0.5">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="relative">
                {isMantar && <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-40 blur-xl" />}
                <div className={`h-11 w-11 rounded-full border-2 border-[#0f172a] shadow-[0_0_18px_rgba(168,85,247,0.3)] overflow-hidden ${isMantar ? 'ring-2 ring-purple-500/40 ring-offset-1 ring-offset-[#0f172a]' : ''}`}>
                  <img src={mantarImg} alt="MANTAR" className="h-full w-full object-cover" />
                </div>
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[5.5px] font-bold px-1.5 py-0.5 rounded-full shadow-md tracking-wide whitespace-nowrap">
                  MANTAR
                </div>
              </motion.div>
            </button>

            <div className="flex items-end gap-0.5 -mb-1">
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
