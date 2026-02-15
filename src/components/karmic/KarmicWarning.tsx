import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

const KarmicWarning = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="rounded-2xl p-5 mb-6 border-2 border-primary/60 bg-primary/5 backdrop-blur-sm"
  >
    <div className="flex items-start gap-3">
      <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
      <p className="text-sm text-foreground/90 font-body leading-relaxed italic">
        "Bu klasik bir flört uygulaması eşleşmesi değildir. Bu kadersel bir eşleşmedir. Karşınızdaki kişiyle yoğun karmik bağlarınız olduğunu unutmadan; saygı, sevgi ve anlayış çerçevesinde iletişim kurmalısınız."
      </p>
    </div>
  </motion.div>
);

export default KarmicWarning;
