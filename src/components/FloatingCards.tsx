import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

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
    preview: "♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♓",
    shortcuts: ["Burçlar", "Gezegenler", "Evler", "Midheaven"],
    symbols: ["☉", "☽", "☿", "♀", "♂", "♃", "♄", "⛢", "♆"],
  },
  {
    id: "edu",
    title: "Eğitim",
    subtitle: "Astroloji Okulu",
    description: "Kozmik bilgeliği öğren",
    path: "/edu",
    color: COLORS.edu,
    layout: "wide",
    preview: "📚 6 Modül • Quiz • Sertifika",
    shortcuts: ["Burç 101", "Gezegenler", "Evler", "Aspktler"],
    symbols: ["📖", "✦", "🎓", "🏅"],
  },
  {
    id: "meditation",
    title: "Meditasyon",
    subtitle: "Nefes & Frekans",
    description: "Kozmik titreşimlerle sakinleş",
    path: "/meditation",
    color: COLORS.meditation,
    layout: "square",
    preview: "🎵 432Hz • 528Hz • 396Hz",
    shortcuts: ["Nefes", "Frekans", "Gözler Kapalı", "Binaural"],
    symbols: ["🧘", "🌊", "🔊", "✨"],
  },
  {
    id: "dreams",
    title: "Rüyalar",
    subtitle: "Rüya Yorumu",
    description: "Bilinçaltının mesajlarını çöz",
    path: "/dreams",
    color: COLORS.dreams,
    layout: "tall",
    preview: "🔮 Rüya Günlüğü • Tarot",
    shortcuts: ["Yorum", "Semboller", "Tarot", "Niyet"],
    symbols: ["🌙", "💫", "🕯️", "🔮"],
  },
  {
    id: "karmic",
    title: "Karmik",
    subtitle: "Eş Bulma",
    description: "Kadersel bağların sırları",
    path: "/karmic-match",
    color: COLORS.karmic,
    layout: "wide",
    preview: "♂️ × ♀️ Karma Skoru: 94%",
    shortcuts: ["Karma", "Reinkarnasyon", "Soulmate", "Twin Flame"],
    symbols: ["∞", "💕", "🕯️", "⚧"],
  },
  {
    id: "synastry",
    title: "Sinastri",
    subtitle: "İlişki Analizi",
    description: "İki kalbin uyumu",
    path: "/synastry",
    color: COLORS.synastry,
    layout: "square",
    preview: "❤️ Uyum: 87% • Karşıt Burçlar",
    shortcuts: ["Karşıt", "Trigon", "Kare", "Sextile"],
    symbols: ["♥", "♉", "♎", "✨"],
  },
  {
    id: "chambers",
    title: "Salonlar",
    subtitle: "Ruh Odaları",
    description: "İç dünyana yolculuk",
    path: "/chambers",
    color: COLORS.chambers,
    layout: "tall",
    preview: "🏛️ 12 Oda • Gizli Geçitler",
    shortcuts: ["Kalp", "Para", "Aşk", "Kariyer"],
    symbols: ["🏰", "🗝️", "🚪", "💎"],
  },
  {
    id: "whoami",
    title: "Ben",
    subtitle: "Kişisel Analiz",
    description: "Gerçek beni keşfet",
    path: "/whoami",
    color: COLORS.whoami,
    layout: "small",
    preview: "✨ DNA Haritası • Güçlü Yön",
    shortcuts: ["Güçlü Yön", "Gölge", "Amaç", "Değer"],
    symbols: ["🪞", "🌟", "🎭", "💫"],
  },
  {
    id: "premium",
    title: "Premium",
    subtitle: "Üyelik",
    description: "Sınırsız kozmik güç",
    path: "/premium",
    color: COLORS.premium,
    layout: "featured",
    preview: "👑 VIP • Sınırsız Analiz",
    shortcuts: ["Detaylı Analiz", "Canlı Burç", "Sohbet", "API"],
    symbols: ["👑", "💎", "⚡", "🌟"],
  },
  {
    id: "profile",
    title: "Profil",
    subtitle: "Ayarlar",
    description: "Kişiselleştir deneyimini",
    path: "/profile",
    color: COLORS.profile,
    layout: "small",
    preview: "⚙️ Bildirimler • Tema",
    shortcuts: ["Bildirim", "Tema", "Dil", "Veri"],
    symbols: ["🔧", "🎨", "🌐", "💾"],
  },
];

const AnimatedBackground = ({ color, id }: { color: string; id: string }) => {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: color,
            opacity: 0.3,
          }}
          animate={{
            y: [0, -30, -60],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
};

const FloatingSymbols = ({ symbols, color }: { symbols: string[]; color: string }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
    {symbols.map((symbol, i) => (
      <motion.div
        key={i}
        className="absolute text-2xl"
        style={{ 
          color,
          left: `${10 + (i * 25)}%`, 
          top: `${15 + (i % 3) * 25}%`,
          fontSize: `${16 + (i % 3) * 4}px`,
        }}
        animate={{
          y: [0, -8, 0],
          opacity: [0.2, 0.5, 0.2],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 3 + i * 0.5,
          repeat: Infinity,
          delay: i * 0.3,
        }}
      >
        {symbol}
      </motion.div>
    ))}
  </div>
);

const DetailedIcon = ({ id, color }: { id: string; color: string }) => {
  const icons: Record<string, React.ReactNode> = {
    insight: (
      <svg viewBox="0 0 64 64" className="w-16 h-16">
        <defs>
          <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <g filter={`url(#glow-${id})`}>
          <circle cx="32" cy="32" r="28" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" />
          <circle cx="32" cy="32" r="22" stroke={color} strokeWidth="1" fill="none" opacity="0.4" />
          <circle cx="32" cy="32" r="14" stroke={color} strokeWidth="0.8" fill="none" />
          <circle cx="32" cy="32" r="6" fill={color} opacity="0.8" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <motion.circle
              key={i}
              cx={32 + Math.cos((angle * Math.PI) / 180) * 22}
              cy={32 + Math.sin((angle * Math.PI) / 180) * 22}
              r="2"
              fill={color}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </g>
      </svg>
    ),
    edu: (
      <svg viewBox="0 0 64 64" className="w-16 h-16">
        <defs>
          <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <g filter={`url(#glow-${id})`}>
          <path d="M16 8h32v48H16z" stroke={color} strokeWidth="1.5" fill="none" />
          <path d="M22 8V4M42 8V4M22 56v-4M42 56v-4" stroke={color} strokeWidth="1.5" />
          <path d="M20 20h24M20 28h24M20 36h16" stroke={color} strokeWidth="1" opacity="0.6" />
          <motion.path d="M28 44l4 4 8-8" stroke={color} strokeWidth="2" fill="none"
            animate={{ pathLength: [0, 1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </g>
      </svg>
    ),
    meditation: (
      <svg viewBox="0 0 64 64" className="w-16 h-16">
        <defs>
          <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <g filter={`url(#glow-${id})`}>
          <circle cx="32" cy="32" r="26" stroke={color} strokeWidth="1.5" fill="none" />
          <motion.circle cx="32" cy="32" r="18" stroke={color} strokeWidth="1" fill="none"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.circle cx="32" cy="32" r="10" stroke={color} strokeWidth="0.5" fill="none"
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
          <circle cx="32" cy="32" r="4" fill={color} />
          <motion.circle cx="32" cy="32" r="28" stroke={color} strokeWidth="0.5" fill="none"
            animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </g>
      </svg>
    ),
    dreams: (
      <svg viewBox="0 0 64 64" className="w-16 h-16">
        <defs>
          <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <g filter={`url(#glow-${id})`}>
          <path d="M32 8c-12 0-20 14-20 28s8 20 20 20 20-6 20-20-8-28-20-28z" stroke={color} strokeWidth="1.5" fill="none" />
          <path d="M18 20l6 6 12-14" stroke={color} strokeWidth="1.5" fill="none" />
          <motion.path d="M8 12l2 2 4-2" stroke={color} strokeWidth="1" fill="none"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.path d="M50 42l2 4 4-2" stroke={color} strokeWidth="1" fill="none"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          />
          <motion.circle cx="16" cy="10" r="1.5" fill={color} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
          <motion.circle cx="52" cy="16" r="1" fill={color} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} />
          <motion.circle cx="48" cy="50" r="1.5" fill={color} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }} />
        </g>
      </svg>
    ),
    karmic: (
      <svg viewBox="0 0 64 64" className="w-16 h-16">
        <defs>
          <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <g filter={`url(#glow-${id})`}>
          <circle cx="20" cy="32" r="14" stroke={color} strokeWidth="1.5" fill="none" />
          <circle cx="44" cy="32" r="14" stroke={color} strokeWidth="1.5" fill="none" />
          <path d="M34 32h8" stroke={color} strokeWidth="2" />
          <motion.path d="M8 20c-4-6 0-12 8-12s8 6 4 12" stroke={color} strokeWidth="1" fill="none"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.path d="M56 44c4 6 0 12-8 12s-8-6-4-12" stroke={color} strokeWidth="1" fill="none"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </g>
      </svg>
    ),
    synastry: (
      <svg viewBox="0 0 64 64" className="w-16 h-16">
        <defs>
          <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <g filter={`url(#glow-${id})`}>
          <circle cx="20" cy="32" r="10" stroke={color} strokeWidth="1.5" fill="none" />
          <circle cx="44" cy="32" r="10" stroke={color} strokeWidth="1.5" fill="none" />
          <circle cx="20" cy="32" r="3" fill={color} />
          <circle cx="44" cy="32" r="3" fill={color} />
          <path d="M30 32l4 0" stroke={color} strokeWidth="2" />
          <motion.heart cx="32" cy="28" r="4" fill={color} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
        </g>
      </svg>
    ),
    chambers: (
      <svg viewBox="0 0 64 64" className="w-16 h-16">
        <defs>
          <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <g filter={`url(#glow-${id})`}>
          <rect x="8" y="8" width="48" height="48" rx="4" stroke={color} strokeWidth="1.5" fill="none" />
          <path d="M8 32h48M32 8v48" stroke={color} strokeWidth="1" opacity="0.5" />
          {[12, 28, 44].map((x, i) => (
            <motion.circle key={i} cx={x} cy={x} r="2" fill={color} animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} />
          ))}
          <motion.rect x="22" y="22" width="20" height="20" rx="2" stroke={color} strokeWidth="1" fill="none"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </g>
      </svg>
    ),
    whoami: (
      <svg viewBox="0 0 64 64" className="w-16 h-16">
        <defs>
          <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <g filter={`url(#glow-${id})`}>
          <circle cx="32" cy="20" r="14" stroke={color} strokeWidth="1.5" fill="none" />
          <circle cx="27" cy="17" r="2" fill={color} />
          <circle cx="37" cy="17" r="2" fill={color} />
          <path d="M27 24q5 6 10 0" stroke={color} strokeWidth="1.5" fill="none" />
          <motion.path d="M18 54c0-8 6-14 14-14s14 6 14 14" stroke={color} strokeWidth="1.5" fill="none"
            animate={{ d: "M18 54c0-8 6-14 14-14s14 6 14 14M18 54c0-6 6-10 14-10s14 4 14 10" }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.circle cx="32" cy="8" r="3" fill={color} animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
        </g>
      </svg>
    ),
    premium: (
      <svg viewBox="0 0 64 64" className="w-16 h-16">
        <defs>
          <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <g filter={`url(#glow-${id})`}>
          <motion.path d="M32 4l6 14 14 2-10 10 2 14-12-6-12 6 2-14L12 20l14-2z" stroke={color} strokeWidth="1.5" fill="none"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.circle cx="32" cy="32" r="4" fill={color} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
        </g>
      </svg>
    ),
    profile: (
      <svg viewBox="0 0 64 64" className="w-16 h-16">
        <defs>
          <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <g filter={`url(#glow-${id})`}>
          <circle cx="32" cy="32" r="26" stroke={color} strokeWidth="1.5" fill="none" />
          <circle cx="32" cy="32" r="18" stroke={color} strokeWidth="1" fill="none" opacity="0.5" />
          <circle cx="32" cy="24" r="8" stroke={color} strokeWidth="1" fill="none" />
          <path d="M20 54c0-8 5-14 12-14s12 6 12 14" stroke={color} strokeWidth="1" fill="none" />
          <motion.circle cx="32" cy="32" r="3" fill={color} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
        </g>
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
    large: "min-h-[220px]",
    featured: "min-h-[110px]",
    wide: "min-h-[110px]",
    tall: "min-h-[200px]",
    square: "min-h-[160px]",
    small: "min-h-[110px]",
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(card.path)}
      className={`relative rounded-2xl text-left transition-all duration-300 overflow-hidden ${layoutClasses[card.layout]} ${sizeClasses[card.layout]}`}
      style={{
        background: `linear-gradient(145deg, ${card.color}08 0%, rgba(10, 15, 30, 0.98) 30%, ${card.color}05 100%)`,
        backdropFilter: 'blur(16px)',
        border: `1px solid ${card.color}20`,
        boxShadow: isHovered 
          ? `0 20px 50px rgba(0, 0, 0, 0.5), 0 0 40px ${card.color}20, inset 0 0 30px ${card.color}08`
          : '0 10px 30px rgba(0, 0, 0, 0.3)',
      }}
    >
      <AnimatedBackground color={card.color} id={card.id} />
      <FloatingSymbols symbols={card.symbols} color={card.color} />

      {/* Glow efekti */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        animate={{ 
          opacity: isHovered ? [0.5, 0.7, 0.5] : [0.2, 0.3, 0.2],
        }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{
          background: `radial-gradient(circle at ${card.layout === 'wide' ? '80%' : '35%'} 30%, ${card.color}15 0%, transparent 60%)`,
        }}
      />

      {/* Kenar efekti */}
      <motion.div 
        className="absolute inset-0 rounded-2xl pointer-events-none border-2"
        animate={{ 
          borderColor: isHovered ? `${card.color}50` : `${card.color}15`,
          boxShadow: isHovered ? `inset 0 0 40px ${card.color}10, 0 0 20px ${card.color}15` : 'none',
        }}
        transition={{ duration: 0.3 }}
      />

      <div className="relative z-10 p-4 h-full flex flex-col justify-between">
        {/* Üst kısım - İkon ve Başlık */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${card.color}20 0%, ${card.color}08 100%)`,
                border: `1px solid ${card.color}40`,
                boxShadow: `0 0 20px ${card.color}25, inset 0 0 15px ${card.color}10`,
              }}
              animate={{ 
                scale: isHovered ? [1, 1.08, 1] : 1,
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <DetailedIcon id={card.id} color={card.color} />
            </motion.div>
            <div>
              <h3 className="text-white font-bold text-lg tracking-wide">{card.title}</h3>
              <p className="text-white/50 text-xs font-medium">{card.subtitle}</p>
            </div>
          </div>
          
          <motion.div 
            animate={{ scale: isHovered ? 1.2 : 1, rotate: isHovered ? 5 : 0 }}
            style={{ color: card.color }}
            className="opacity-60"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </motion.div>
        </div>

        {/* Orta kısım - Preview */}
        <motion.div 
          className="py-3 px-3 rounded-xl my-2 text-center"
          style={{ 
            background: `linear-gradient(135deg, ${card.color}10 0%, ${card.color}05 100%)`,
            border: `1px solid ${card.color}20`,
          }}
          animate={{ scale: isHovered ? 1.02 : 1 }}
        >
          <p className="text-white/70 text-xs font-medium tracking-wider">{card.preview}</p>
        </motion.div>

        {/* Alt kısım - Kısayollar */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {card.shortcuts.map((shortcut, i) => (
            <motion.span
              key={i}
              className="px-2.5 py-1.5 text-[10px] rounded-lg font-medium"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 + i * 0.03 }}
              whileHover={{ scale: 1.05 }}
              style={{
                background: `linear-gradient(135deg, ${card.color}15 0%, ${card.color}08 100%)`,
                color: card.color,
                border: `1px solid ${card.color}30`,
                boxShadow: isHovered ? `0 0 10px ${card.color}20` : 'none',
              }}
            >
              {shortcut}
            </motion.span>
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
