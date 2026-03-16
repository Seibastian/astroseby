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

const CARD_DATA = [
  {
    id: "insight",
    title: "Keşif",
    subtitle: "Natal Harita",
    description: "Gezegenlerin konumunu keşfet",
    path: "/insight",
    color: COLORS.insight,
    layout: "large",
    preview: "♈ ♉ ♊ ♋ ♌ ♍",
    shortcuts: ["Burçlar", "Gezegenler", "Evler"],
  },
  {
    id: "edu",
    title: "Eğitim",
    subtitle: "Astroloji Okulu",
    description: "Kozmik bilgeliği öğren",
    path: "/edu",
    color: COLORS.edu,
    layout: "wide",
    preview: "6 Modül • Quiz • Sertifika",
    shortcuts: ["Burç 101", "Gezegenler", "Evler", "Aspktler"],
  },
  {
    id: "meditation",
    title: "Meditasyon",
    subtitle: "Nefes & Frekans",
    description: "Kozmik titreşimlerle sakinleş",
    path: "/meditation",
    color: COLORS.meditation,
    layout: "square",
    preview: "432Hz • 528Hz • Binaural",
    shortcuts: ["Nefes", "Frekans", "Gözler Kapalı"],
  },
  {
    id: "dreams",
    title: "Rüyalar",
    subtitle: "Rüya Yorumu",
    description: "Bilinçaltının mesajlarını çöz",
    path: "/dreams",
    color: COLORS.dreams,
    layout: "tall",
    preview: "🔮 Rüya Günlüğü",
    shortcuts: ["Yorum", "Semboller", "Tarot"],
  },
  {
    id: "karmic",
    title: "Karmik",
    subtitle: "Eş Bulma",
    description: "Kadersel bağların sırları",
    path: "/karmic-match",
    color: COLORS.karmic,
    layout: "wide",
    preview: "♂️ × ♀️ Karma Skoru",
    shortcuts: ["Karma", "Reinkarnasyon", "Soulmate"],
  },
  {
    id: "synastry",
    title: "Sinastri",
    subtitle: "İlişki Analizi",
    description: "İki kalbin uyumu",
    path: "/synastry",
    color: COLORS.synastry,
    layout: "square",
    preview: "❤️ Uyum: 87%",
    shortcuts: ["Karşıt", "Trigon", "Kare"],
  },
  {
    id: "chambers",
    title: "Salonlar",
    subtitle: "Ruh Odaları",
    description: "İç dünyana yolculuk",
    path: "/chambers",
    color: COLORS.chambers,
    layout: "tall",
    preview: "🏛️ 12 Oda",
    shortcuts: ["Kalp", "Para", "Aşk", "Kariyer"],
  },
  {
    id: "whoami",
    title: "Ben",
    subtitle: "Kişisel Analiz",
    description: "Gerçek beni keşfet",
    path: "/whoami",
    color: COLORS.whoami,
    layout: "small",
    preview: "✨ DNA Haritası",
    shortcuts: ["Güçlü Yön", "Gölge", "Amaç"],
  },
  {
    id: "premium",
    title: "Premium",
    subtitle: "Üyelik",
    description: "Sınırsız kozmik güç",
    path: "/premium",
    color: COLORS.premium,
    layout: "featured",
    preview: "👑 VIP",
    shortcuts: ["Detaylı Analiz", "Canlı Burç", "Sohbet"],
  },
  {
    id: "profile",
    title: "Profil",
    subtitle: "Ayarlar",
    description: "Kişiselleştir deneyimini",
    path: "/profile",
    color: COLORS.profile,
    layout: "small",
    preview: "⚙️",
    shortcuts: ["Bildirim", "Tema", "Dil"],
  },
];

const PreviewIcon = ({ id, color }: { id: string; color: string }) => {
  const icons: Record<string, React.ReactNode> = {
    insight: (
      <svg viewBox="0 0 48 48" className="w-10 h-10 opacity-60">
        <circle cx="24" cy="24" r="18" stroke={color} strokeWidth="1" fill="none" />
        <circle cx="24" cy="24" r="12" stroke={color} strokeWidth="0.5" fill="none" />
        <circle cx="24" cy="24" r="4" fill={color} />
      </svg>
    ),
    edu: (
      <svg viewBox="0 0 48 48" className="w-10 h-10 opacity-60">
        <path d="M12 8h24v32H12z" stroke={color} strokeWidth="1" fill="none" />
        <path d="M18 8V4M30 8V4M18 44v-4M30 44v-4" stroke={color} strokeWidth="1" />
        <path d="M16 18h16M16 24h16M16 30h10" stroke={color} strokeWidth="0.5" />
      </svg>
    ),
    meditation: (
      <svg viewBox="0 0 48 48" className="w-10 h-10 opacity-60">
        <circle cx="24" cy="24" r="16" stroke={color} strokeWidth="1" fill="none" />
        <circle cx="24" cy="24" r="8" stroke={color} strokeWidth="0.5" fill="none" />
        <circle cx="24" cy="24" r="2" fill={color} />
      </svg>
    ),
    dreams: (
      <svg viewBox="0 0 48 48" className="w-10 h-10 opacity-60">
        <path d="M24 6c-8 0-14 10-14 20s6 16 14 16 14-6 14-16-6-20-14-20z" stroke={color} strokeWidth="1" fill="none" />
        <path d="M14 14l4 4 6-8" stroke={color} strokeWidth="1" fill="none" />
      </svg>
    ),
    karmic: (
      <svg viewBox="0 0 48 48" className="w-10 h-10 opacity-60">
        <circle cx="18" cy="24" r="8" stroke={color} strokeWidth="1" fill="none" />
        <circle cx="30" cy="24" r="8" stroke={color} strokeWidth="1" fill="none" />
        <path d="M26 24h8" stroke={color} strokeWidth="1" />
      </svg>
    ),
    synastry: (
      <svg viewBox="0 0 48 48" className="w-10 h-10 opacity-60">
        <circle cx="16" cy="24" r="6" stroke={color} strokeWidth="1" fill="none" />
        <circle cx="32" cy="24" r="6" stroke={color} strokeWidth="1" fill="none" />
        <path d="M22 24l4 0l6 0" stroke={color} strokeWidth="1" />
        <path d="M16 14c0-6 6-8 8-8s8 2 8 8" stroke={color} strokeWidth="0.5" fill="none" />
      </svg>
    ),
    chambers: (
      <svg viewBox="0 0 48 48" className="w-10 h-10 opacity-60">
        <rect x="8" y="8" width="32" height="32" rx="4" stroke={color} strokeWidth="1" fill="none" />
        <path d="M8 24h32M24 8v32" stroke={color} strokeWidth="0.5" />
      </svg>
    ),
    whoami: (
      <svg viewBox="0 0 48 48" className="w-10 h-10 opacity-60">
        <circle cx="24" cy="16" r="8" stroke={color} strokeWidth="1" fill="none" />
        <path d="M14 40c0-6 4-10 10-10s10 4 10 10" stroke={color} strokeWidth="1" fill="none" />
      </svg>
    ),
    premium: (
      <svg viewBox="0 0 48 48" className="w-10 h-10 opacity-60">
        <path d="M24 4l6 12 14 2-10 10 2 14-12-6-12 6 2-14L4 18l14-2z" stroke={color} strokeWidth="1" fill="none" />
      </svg>
    ),
    profile: (
      <svg viewBox="0 0 48 48" className="w-10 h-10 opacity-60">
        <circle cx="24" cy="24" r="18" stroke={color} strokeWidth="1" fill="none" />
        <circle cx="24" cy="18" r="6" stroke={color} strokeWidth="1" fill="none" />
        <path d="M14 40c0-6 4-10 10-10s10 4 10 10" stroke={color} strokeWidth="1" fill="none" />
      </svg>
    ),
  };
  return <>{icons[id]}</>;
};

const MysticCard = ({ card, index }: { card: typeof CARD_DATA[0]; index: number }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  
  const layoutClasses: Record<string, string> = {
    large: "col-span-2 row-span-2",
    featured: "col-span-2",
    wide: "col-span-2",
    tall: "row-span-2",
    square: "",
    small: "",
  };

  const sizeClasses: Record<string, string> = {
    large: "min-h-[180px]",
    featured: "min-h-[100px]",
    wide: "min-h-[100px]",
    tall: "min-h-[160px]",
    square: "min-h-[140px]",
    small: "min-h-[100px]",
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(card.path)}
      className={`relative rounded-2xl text-left transition-all duration-300 overflow-hidden ${layoutClasses[card.layout]} ${sizeClasses[card.layout]}`}
      style={{
        background: `linear-gradient(135deg, ${card.color}12 0%, rgba(15, 23, 42, 0.95) 40%, ${card.color}08 100%)`,
        backdropFilter: 'blur(12px)',
        border: `1px solid ${card.color}25`,
        boxShadow: isHovered 
          ? `0 12px 40px rgba(0, 0, 0, 0.4), 0 0 30px ${card.color}15, inset 0 0 20px ${card.color}10`
          : '0 8px 24px rgba(0, 0, 0, 0.25)',
      }}
    >
      {/* Arkaplan glow */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        animate={{ 
          opacity: isHovered ? [0.4, 0.6, 0.4] : [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{
          background: `radial-gradient(circle at ${card.layout === 'wide' ? '70%' : '30%'} 50%, ${card.color}20 0%, transparent 60%)`,
        }}
      />

      {/* Kenar efekti */}
      <motion.div 
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{ 
          boxShadow: isHovered ? `inset 0 0 30px ${card.color}15, inset 0 0 60px ${card.color}08` : 'none',
        }}
        transition={{ duration: 0.3 }}
        style={{
          border: `1px solid ${card.color}${isHovered ? '40' : '20'}`,
        }}
      />

      <div className="relative z-10 p-4 h-full flex flex-col justify-between">
        {/* Üst kısım */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: `${card.color}15`,
                border: `1px solid ${card.color}30`,
                boxShadow: `0 0 15px ${card.color}20`,
              }}
            >
              <PreviewIcon id={card.id} color={card.color} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-base">{card.title}</h3>
              <p className="text-white/50 text-xs">{card.subtitle}</p>
            </div>
          </div>
          
          <motion.div 
            animate={{ scale: isHovered ? 1.1 : 1, opacity: isHovered ? 1 : 0.4 }}
            style={{ color: card.color }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </motion.div>
        </div>

        {/* Orta kısım - Preview */}
        <div 
          className="py-2 text-center rounded-lg my-2"
          style={{ 
            background: `${card.color}08`,
            border: `1px solid ${card.color}15`,
          }}
        >
          <p className="text-white/60 text-xs font-medium tracking-wider">{card.preview}</p>
        </div>

        {/* Alt kısım - Kısayollar */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {card.shortcuts.map((shortcut, i) => (
            <span
              key={i}
              className="px-2 py-1 text-[10px] rounded-md"
              style={{
                background: `${card.color}12`,
                color: `${card.color}aa`,
                border: `1px solid ${card.color}20`,
              }}
            >
              {shortcut}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  );
};

export const QuickAccessCards = () => {
  return (
    <div className="grid grid-cols-2 gap-3 pb-24">
      {CARD_DATA.map((card, index) => (
        <MysticCard key={card.id} card={card} index={index} />
      ))}
    </div>
  );
};

export default QuickAccessCards;
