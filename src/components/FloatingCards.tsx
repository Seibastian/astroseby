import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

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

const GOLD_COLOR = "#d4af37";

const CARD_BACKGROUNDS: Record<string, { gradient: string; icon: React.ReactNode }> = {
  "/insight": {
    gradient: "linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(15, 23, 42, 0.9) 50%, rgba(249, 115, 22, 0.1) 100%)",
  },
  "/edu": {
    gradient: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(15, 23, 42, 0.9) 50%, rgba(139, 92, 246, 0.1) 100%)",
  },
  "/meditation": {
    gradient: "linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(15, 23, 42, 0.9) 50%, rgba(6, 182, 212, 0.1) 100%)",
  },
  "/dreams": {
    gradient: "linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(15, 23, 42, 0.9) 50%, rgba(168, 85, 247, 0.1) 100%)",
  },
  "/karmic-match": {
    gradient: "linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(15, 23, 42, 0.9) 50%, rgba(236, 72, 153, 0.1) 100%)",
  },
  "/synastry": {
    gradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(15, 23, 42, 0.9) 50%, rgba(59, 130, 246, 0.1) 100%)",
  },
  "/chambers": {
    gradient: "linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(15, 23, 42, 0.9) 50%, rgba(34, 197, 94, 0.1) 100%)",
  },
  "/whoami": {
    gradient: "linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(15, 23, 42, 0.9) 50%, rgba(234, 179, 8, 0.1) 100%)",
  },
  "/premium": {
    gradient: "linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(15, 23, 42, 0.9) 50%, rgba(124, 58, 237, 0.15) 100%)",
  },
  "/profile": {
    gradient: "linear-gradient(135deg, rgba(100, 116, 139, 0.15) 0%, rgba(15, 23, 42, 0.9) 50%, rgba(100, 116, 139, 0.1) 100%)",
  },
};

// Detaylı ikonlar - FloatingCards için (64x64 + glow efekti)
const CardIcon = ({ path, color }: { path: string; color: string }) => (
  <svg viewBox="0 0 64 64" fill="none" className="w-6 h-6">
    <defs>
      <filter id={`glow-fc-${path.replace('/', '')}`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g filter={`url(#glow-fc-${path.replace('/', '')})`} transform="scale(1.33) translate(-8, -8)">
    {/* Keşif */}
    {path === "/insight" && (
      <g>
        <circle cx="24" cy="24" r="20" stroke={color} strokeWidth="1.5" />
        <circle cx="24" cy="24" r="14" stroke={color} strokeWidth="0.8" strokeDasharray="2 2" />
        <circle cx="24" cy="24" r="8" stroke={color} strokeWidth="1" />
        <circle cx="24" cy="6" r="2" fill={color} />
        <circle cx="24" cy="42" r="2" fill={color} />
        <path d="M24 8v6M24 34v6M8 24h6M34 24h6" stroke={color} strokeWidth="1" strokeLinecap="round" />
        <circle cx="24" cy="24" r="4" fill={color} />
      </g>
    )}

    {/* Eğitim */}
    {path === "/edu" && (
      <g>
        <path d="M24 6L6 22l18 11 18-11L24 6z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M6 33l18 11 18-11" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M6 22l18 11 18-11" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="24" cy="14" r="3" fill={color} opacity="0.6" />
      </g>
    )}

    {/* Meditasyon */}
    {path === "/meditation" && (
      <g>
        <circle cx="24" cy="24" r="18" stroke={color} strokeWidth="1.5" />
        <circle cx="24" cy="24" r="12" stroke={color} strokeWidth="1" />
        <circle cx="24" cy="24" r="6" stroke={color} strokeWidth="0.8" strokeDasharray="3 3" />
        <path d="M24 6v4M24 38v4M6 24h4M38 24h4" stroke={color} strokeWidth="1" strokeLinecap="round" />
        <circle cx="24" cy="24" r="3" fill={color} />
        <motion.circle cx="24" cy="24" r="5" stroke={color} strokeWidth="0.5" fill="none" 
          animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0.3, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </g>
    )}

    {/* Rüyalar */}
    {path === "/dreams" && (
      <g>
        <path d="M36 10c0 10-8 18-18 18-10 0-18-8-18-18 0 10 8 18 18 18 2 0 4-0.5 6-1" stroke={color} strokeWidth="1.5" fill="none" />
        <path d="M36 10c0 10-8 18-18 18-10 0-18-8-18-18 0 10 8 18 18 18 2 0 4-0.5 6-1" stroke={color} strokeWidth="3" fill={`${color}20`} />
        <motion.path d="M10 8l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" fill={color}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.path d="M38 36l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" fill={color}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        />
      </g>
    )}

    {/* Karmik */}
    {path === "/karmic-match" && (
      <g>
        <path d="M38 12c0 12-10 20-22 20-6 0-12-4-16-10-4-6-4-14 4-20 8-6 18-6 26 0 8-6 10 8 8 10" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
        <path d="M24 18c-2-2-6-2-8 0s-2 6 0 8c2 2 6 2 8 0" stroke={color} strokeWidth="1" fill="none" />
        <circle cx="24" cy="24" r="18" stroke={color} strokeWidth="0.5" strokeDasharray="2 4" opacity="0.5" />
      </g>
    )}

    {/* Sinastri */}
    {path === "/synastry" && (
      <g>
        <circle cx="18" cy="24" r="10" stroke={color} strokeWidth="1.5" />
        <circle cx="18" cy="24" r="4" fill={color} />
        <circle cx="30" cy="24" r="10" stroke={color} strokeWidth="1.5" />
        <circle cx="30" cy="24" r="4" fill={color} />
        <path d="M28 24h4" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M8 14c-2-4 2-8 6-8s6 4 4 8" stroke={color} strokeWidth="1" fill="none" />
        <path d="M40 34c2 4-2 8-6 8s-6-4-4-8" stroke={color} strokeWidth="1" fill="none" />
      </g>
    )}

    {/* Salonlar */}
    {path === "/chambers" && (
      <g>
        <circle cx="24" cy="24" r="20" stroke={color} strokeWidth="1.5" />
        <circle cx="24" cy="24" r="14" stroke={color} strokeWidth="1" />
        <circle cx="24" cy="24" r="8" stroke={color} strokeWidth="1" />
        <path d="M24 4v4M24 40v4M4 24h4M40 24h4" stroke={color} strokeWidth="1" strokeLinecap="round" />
        <motion.circle cx="24" cy="24" r="3" fill={color} 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </g>
    )}

    {/* Ben */}
    {path === "/whoami" && (
      <g>
        <circle cx="24" cy="14" r="8" stroke={color} strokeWidth="1.5" />
        <circle cx="21" cy="12" r="1.5" fill={color} />
        <circle cx="27" cy="12" r="1.5" fill={color} />
        <path d="M20 17q2 3 4 0" stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M24 22v10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 42c0-5 4-8 8-8s8 3 8 8" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <motion.circle cx="24" cy="6" r="2" fill={color} opacity="0.6"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </g>
    )}

    {/* Premium */}
    {path === "/premium" && (
      <g>
        <path d="M24 8L10 20l14 10 14-10L24 8z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
        <path d="M10 28l14 10 14-10" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
        <path d="M10 34l14 10 14-10" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
        <path d="M24 8v-4" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <motion.circle cx="24" cy="4" r="2" fill={color}
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </g>
    )}

    {/* Profil */}
    {path === "/profile" && (
      <g>
        <circle cx="24" cy="24" r="18" stroke={color} strokeWidth="1.5" />
        <circle cx="24" cy="24" r="12" stroke={color} strokeWidth="1" />
        <ellipse cx="24" cy="24" rx="6" ry="18" stroke={color} strokeWidth="0.8" fill="none" />
        <circle cx="24" cy="24" r="2" fill={color} />
      </g>
      )}
    </g>
  </svg>
);

const FloatingCard = ({ title, description, path, color, delay = 0 }: { title: string; description: string; path: string; color: string; delay?: number }) => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const displayColor = isActive ? color : GOLD_COLOR;
  const bg = CARD_BACKGROUNDS[path] || CARD_BACKGROUNDS["/profile"];

  return (
    <motion.button
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: "easeOut" }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        setIsActive(true);
        navigate(path);
        setTimeout(() => setIsActive(false), 300);
      }}
      className="relative w-full p-3.5 rounded-xl text-left transition-all duration-200 overflow-hidden"
      style={{
        background: bg.gradient,
        backdropFilter: 'blur(12px)',
        border: `1px solid ${color}30`,
        boxShadow: isHovered ? `0 8px 30px rgba(0, 0, 0, 0.3), 0 0 20px ${color}20` : '0 8px 20px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* Arkaplan parlaması */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        animate={{ 
          opacity: isHovered ? [0.3, 0.5, 0.3] : [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{
          background: `radial-gradient(circle at 30% 50%, ${color}15 0%, transparent 60%)`,
        }}
      />
      
      {/* Yıldız parçacıkları */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 h-0.5 rounded-full"
          style={{
            top: `${20 + i * 15}%`,
            left: `${80 + i * 5}%`,
            backgroundColor: color,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.5, 0.5],
            y: [0, -10, -20],
          }}
          transition={{
            duration: 2 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}
      
      {/* Kenar çizgisi parlaması */}
      <motion.div 
        className="absolute inset-0 rounded-xl pointer-events-none"
        animate={{ 
          boxShadow: isHovered ? `inset 0 0 20px ${color}20, inset 0 0 40px ${color}10` : 'none',
        }}
        transition={{ duration: 0.3 }}
      />

      <div className="relative z-10 flex items-center gap-3">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: `${displayColor}15`,
            border: `1px solid ${displayColor}40`,
            boxShadow: `0 0 15px ${displayColor}30, inset 0 0 10px ${displayColor}10`,
          }}
        >
          <CardIcon path={path} color={displayColor} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium text-sm">{title}</h3>
          <p className="text-white/40 text-xs truncate">{description}</p>
        </div>

        <div style={{ color }} className="opacity-40">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </motion.button>
  );
};

export const QuickAccessCards = () => {
  const cards = [
    { title: "Keşif", description: "Natal harita analizi", path: "/insight", color: COLORS.insight },
    { title: "Eğitim", description: "Astroloji öğren", path: "/edu", color: COLORS.edu },
    { title: "Meditasyon", description: "Nefes & frekans", path: "/meditation", color: COLORS.meditation },
    { title: "Rüyalar", description: "Rüya yorumu", path: "/dreams", color: COLORS.dreams },
    { title: "Karmik", description: "Karmik eş bulma", path: "/karmic-match", color: COLORS.karmic },
    { title: "Sinastri", description: "İlişki analizi", path: "/synastry", color: COLORS.synastry },
    { title: "Salonlar", description: "Ruh odaları", path: "/chambers", color: COLORS.chambers },
    { title: "Ben", description: "Kişisel analiz", path: "/whoami", color: COLORS.whoami },
    { title: "Premium", description: "Üyelik", path: "/premium", color: COLORS.premium },
    { title: "Profil", description: "Ayarlar", path: "/profile", color: COLORS.profile },
  ];

  return (
    <div className="space-y-2">
      {cards.map((card, index) => (
        <FloatingCard key={card.path} {...card} delay={index * 0.05} />
      ))}
    </div>
  );
};

export default QuickAccessCards;
