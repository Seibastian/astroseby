import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const COLORS = {
  edu: "#8b5cf6",
  meditation: "#06b6d4",
  dreams: "#a855f7",
  karmic: "#ec4899",
};

interface FloatingCardProps {
  title: string;
  description: string;
  path: string;
  color: string;
  delay?: number;
}

const FloatingCard = ({ title, description, path, color, delay = 0 }: FloatingCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(path)}
      className="relative w-full p-4 rounded-2xl text-left transition-all duration-300"
      style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.7) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
      }}
    >
      {/* Glow on hover */}
      <div 
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        style={{
          background: `linear-gradient(135deg, ${color}10 0%, transparent 60%)`,
          border: `1px solid ${color}30`,
        }}
      />

      <div className="relative flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
            border: `1px solid ${color}25`,
          }}
        >
          {path === "/edu" && (
            <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" className="w-5 h-5">
              <circle cx="12" cy="12" r="10" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" /><circle cx="12" cy="12" r="3" />
            </svg>
          )}
          {path === "/meditation" && (
            <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" className="w-5 h-5">
              <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /><circle cx="12" cy="12" r="2" />
            </svg>
          )}
          {path === "/dreams" && (
            <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" className="w-5 h-5">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
          {path === "/karmic-match" && (
            <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" className="w-5 h-5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium text-sm">{title}</h3>
          <p className="text-white/45 text-xs truncate">{description}</p>
        </div>

        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" className="w-4 h-4 shrink-0 opacity-50">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </motion.button>
  );
};

export const QuickAccessCards = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Kozmik Navigasyon",
      description: "Astroloji eğitimini tamamla",
      path: "/edu",
      color: COLORS.edu,
    },
    {
      title: "Rezonans Meditasyonu",
      description: "Nefes ve frekansla bağlan",
      path: "/meditation",
      color: COLORS.meditation,
    },
    {
      title: "Rüya Keşfi",
      description: "Bilinçaltının dilini öğren",
      path: "/dreams",
      color: COLORS.dreams,
    },
    {
      title: "Karmik Eş",
      description: "Kadersel bağları keşfet",
      path: "/karmic-match",
      color: COLORS.karmic,
    },
  ];

  return (
    <div className="space-y-2">
      {cards.map((card, index) => (
        <FloatingCard key={card.path} {...card} delay={index * 0.08} />
      ))}
    </div>
  );
};

export default QuickAccessCards;
