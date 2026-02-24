import { motion } from "framer-motion";
import { Scale, Star } from "lucide-react";
import SporeField from "@/components/SporeField";

const Terms = () => {
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
          <Scale className="h-8 w-8 text-primary" />
          <Star className="h-6 w-6 text-gold" />
          <h1 className="text-2xl font-display gold-shimmer">MANTAR / AstraCastra Hizmet Şartları</h1>
        </div>

        <div className="space-y-6 text-sm text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Kabul</h2>
            <p>
              MANTAR / AstraCastra uygulamasını kullanarak bu hizmet şartlarını kabul etmiş sayılırsınız. 
              Bu şartları kabul etmiyorsanız, lütfen uygulamayı kullanmayın.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Hizmet Kapsamı</h2>
            <p>
              MANTAR / AstraCastra, doğum haritası hesaplaması, rüya analizi, yapay zeka destekli 
              mentorluk ve kozmik danışmanlık hizmetleri sunar. Bu hizmetler eğitim ve kişisel gelişim 
              amaçlıdır.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Sorumluluk Reddi</h2>
            <p>
              Sunulan astroloji ve rüya analizleri yalnızca rehberlik amaçlıdır. 
              Herhangi bir tıbbi, hukuki veya finansal karar için profesyonel danışmanlık yerine geçmez. 
              Kullanıcı kendi sorumluluğunda hareket etmelidir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Kullanıcı Yükümlülükleri</h2>
            <p>
              Uygulamayı yasadışı amaçlarla kullanmamayı, başkalarının haklarını ihlal etmemeyi 
              ve hizmetleri kötüye kullanmamayı kabul edersiniz.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Fikri Mülkiyet</h2>
            <p>
              Uygulamanın tüm içeriği, tasarımı ve kodları MANTAR / AstraCastra'ya aittir. 
              İzin alınmadan çoğaltılması yasaktır.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Değişiklikler</h2>
            <p>
              Bu hizmet şartlarını zaman zaman güncelleyebiliriz. Güncel versiyonu her zaman 
              bu sayfada bulabilirsiniz.
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

export default Terms;
