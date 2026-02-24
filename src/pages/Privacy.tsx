import { motion } from "framer-motion";
import { Shield, Star } from "lucide-react";
import SporeField from "@/components/SporeField";

const Privacy = () => {
  return (
    <div className="min-h-screen py-12 px-4 relative">
      <SporeField />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto glass-card rounded-2xl p-8 relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <Star className="h-6 w-6 text-gold" />
          <h1 className="text-2xl font-display gold-shimmer">MANTAR / AstraCastra Gizlilik Politikası</h1>
        </div>

        <div className="space-y-6 text-sm text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Veri Toplama</h2>
            <p>
              MANTAR / AstraCastra olarak, size en iyi deneyimi sunmak için minimal düzeyde veri topluyoruz. 
              Topladığımız veriler şunlardır: e-posta adresi, doğum tarihi ve saati (natal harita hesaplaması için), 
              rüya kayıtları ve kozmik tercihler.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Verilerin Kullanımı</h2>
            <p>
              Doğum haritanızı hesaplamak, size kişiselleştirilmiş astroloji analizleri sunmak, 
              yapay zeka destekli mentorluk hizmeti sağlamak ve uygulama deneyiminizi iyileştirmek için kullanırız.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Veri Güvenliği</h2>
            <p>
              Verileriniz Supabase güvenli altyapısında saklanmaktadır. Kişisel verileriniz asla 
              üçüncü taraflarla paylaşılmaz veya satılmaz.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Çerezler</h2>
            <p>
              Uygulama, temel işlevsellik için gerekli olmayan çerezler kullanmaz.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. İletişim</h2>
            <p>
              Gizlilik politikamız hakkında sorularınız varsa, bizimle iletişime geçebilirsiniz.
            </p>
          </section>

          <p className="text-xs text-muted-foreground pt-4 border-t border-border">
            Son güncelleme: Şubat 2026
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Privacy;
