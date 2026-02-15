import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { TR, trSign } from "@/lib/i18n";

const SIGNS = [
  "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces",
];

const ELEMENT_MAP: Record<string, string> = {
  Aries: "fire", Taurus: "earth", Gemini: "air", Cancer: "water",
  Leo: "fire", Virgo: "earth", Libra: "air", Scorpio: "water",
  Sagittarius: "fire", Capricorn: "earth", Aquarius: "air", Pisces: "water",
};

const ELEMENT_STYLES: Record<string, string> = {
  fire: "from-amber-900/40 to-orange-800/20 border-amber-600/40",
  earth: "from-emerald-900/40 to-stone-800/20 border-emerald-700/40",
  air: "from-slate-700/40 to-sky-900/20 border-sky-500/40",
  water: "from-blue-900/40 to-purple-900/20 border-indigo-500/40",
};

interface Props {
  mySunSign: string | null;
  onEnter: (sign: string) => void;
}

const ChamberGrid = ({ mySunSign, onEnter }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-3 gap-3"
    >
      {SIGNS.map((sign, i) => {
        const element = ELEMENT_MAP[sign];
        const isUnlocked = sign === mySunSign;
        const emoji = TR.signEmojis[sign] || "";
        const trName = trSign(sign);

        return (
          <motion.button
            key={sign}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => isUnlocked && onEnter(sign)}
            disabled={!isUnlocked}
            className={`relative rounded-2xl p-4 border bg-gradient-to-br transition-all flex flex-col items-center gap-1
              ${ELEMENT_STYLES[element]}
              ${isUnlocked
                ? "hover:scale-105 cursor-pointer ring-1 ring-primary/50 shadow-lg shadow-primary/10"
                : "opacity-40 cursor-not-allowed grayscale"
              }`}
          >
            <span className="text-2xl">{emoji}</span>
            <span className="text-xs font-display text-foreground">{trName}</span>
            {!isUnlocked && (
              <Lock className="absolute top-2 right-2 h-3 w-3 text-muted-foreground" />
            )}
          </motion.button>
        );
      })}

      {!mySunSign && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="col-span-3 glass-card rounded-2xl p-4 mt-4 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Salonlara erişim için önce doğum haritanı hesaplatmalısın.
          </p>
        </motion.div>
      )}

      {mySunSign && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="col-span-3 glass-card rounded-2xl p-4 mt-2"
        >
          <p className="text-xs text-muted-foreground text-center italic">
            Bu salonların frekansı seninle uyumlu değil. Sadece{" "}
            <span className="text-primary font-display">{trSign(mySunSign)}</span>{" "}
            ruhları kendi salonlarına girebilir.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ChamberGrid;
