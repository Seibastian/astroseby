import { motion } from "framer-motion";

const MatchSearch = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16"
    >
      {/* Sacred Geometry - Flower of Life animation */}
      <div className="relative w-48 h-48 mb-8">
        {/* Central circle */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/40"
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Petal circles */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * 32;
          const y = Math.sin(rad) * 32;
          return (
            <motion.div
              key={angle}
              className="absolute w-24 h-24 rounded-full border border-primary/30"
              style={{
                left: `calc(50% - 48px + ${x}px)`,
                top: `calc(50% - 48px + ${y}px)`,
              }}
              animate={{
                scale: [0.9, 1.05, 0.9],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
            />
          );
        })}
        {/* Inner glow */}
        <motion.div
          className="absolute inset-8 rounded-full bg-primary/10"
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Center symbol */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-3xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            ✦
          </motion.span>
        </div>
      </div>

      <p className="font-display text-foreground text-sm animate-pulse">
        Evren senin için bir ruh arıyor...
      </p>
      <p className="text-xs text-muted-foreground mt-2">
        Kutsal geometri aktif
      </p>
    </motion.div>
  );
};

export default MatchSearch;
