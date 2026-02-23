import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { NatalChartData } from "@/lib/astrology";
import { computeAspects, ASPECT_LABELS, type AspectInfo } from "./AnimatedNatalBackground";
import { trPlanet } from "@/lib/i18n";

interface Props {
  data: NatalChartData | null;
}

const ASPECT_COLORS: Record<string, string> = {
  trine: "text-blue-400",
  sextile: "text-teal-400",
  square: "text-red-400",
  opposition: "text-orange-400",
  conjunction: "text-amber-400",
};

const ASPECT_BG: Record<string, string> = {
  trine: "bg-blue-400/10 border-blue-400/20",
  sextile: "bg-teal-400/10 border-teal-400/20",
  square: "bg-red-400/10 border-red-400/20",
  opposition: "bg-orange-400/10 border-orange-400/20",
  conjunction: "bg-amber-400/10 border-amber-400/20",
};

const ASPECT_ICONS: Record<string, string> = {
  trine: "△",
  sextile: "⬡",
  square: "□",
  opposition: "☍",
  conjunction: "☌",
};

const ASPECT_DESCRIPTIONS: Record<string, string> = {
  conjunction: "Bu iki enerji birbirine kenetlenmiş — sanki aynı motorun iki dişlisi gibi çalışıyorlar. Bazen farkında bile olmadan bu gücü kullanıyorsun. Bazen de birbirine o kadar yakınlar ki hangisinin ne yaptığını ayırt edemiyorsun. Ama bir şey var: bu kavuşum, seni senden alıyor veya sana bir şey katıyor — ikisi de aynı anda.",
  
  trine: "Üçgen, astrolojideki en şanslı açılardan biri. İki gezegen arasında pürüzsüz bir akış var — sanki nehir yatağını bulmuş gibi. Birinde fazla olan, diğerinde eksik olabilir ama birbirlerini tamamlıyorlar. Bu açı çalışırken, zorlamadan akıp gidiyor. Sanki yeteneklerini kullanıyormuşsun gibi hissediyorsun — ve belki de öylesin.",
  
  sextile: "Altıgen, gizli bir fırsat penceresi. Bu açı çok güçlü değil ama potansiyel taşıyor — tıpkı tohumun toprağa düşmesi gibi, sadece biraz nem ve ışık gerek. Bu açının gücünü görmek için biraz çaba göstermen gerekebilir. Ama o fırsat orada, seni bekliyor.",
  
  square: "Kare, astrolojideki en zorlu açılardan biri. İki gezegen omuz omuza verip sana direnç gösteriyor — tıpkı bir kapıyı açmaya çalışırken diğer taraftan itilmesi gibi. Ama bekle, bu gerilim boşa değil. Bu açı seni harekete geçirir. Sıkıntı yaratır ama sıkıntıdan sonra büyüme gelir. Zorla büyümek istemezsen, bu açı seni zorlar.",
  
  opposition: "Karşıt açı, iki kutup arasında bir gerilim yaratır. Sanki iki farklı ses aynı anda şarkı söylemeye çalışıyor — bazen uyumlu, bazen kakofonik. Bu açı, başkalarını yansıtmanı sağlar. Senin göremediğin bir yönünü, karşındaki kişi veya durum sana gösterir. Bu bazen acıtır, bazen aydınlatır.",
};

const PLANET_DESCRIPTIONS: Record<string, string> = {
  Sun: "Yaşam enerjin, ego güneşin, varoluşun ışığı. İçindeki o yangın — o, güneşin ta kendisi.",
  Moon: "Bilinçaltının okyanusu, duygularının derinliği. Suyun altında ne var, bilir misin? Bazen sen bile bilmezsin.",
  Mercury: "Zihninin sesi, düşüncelerinin habercisi. Farkında olmadan binlerce düşünce geçiyor zihninden.",
  Venus: "Kalbinin dili, değerlerinin aynası. Sevgi nasıl hissettiriyor, sorusu senin için önemli.",
  Mars: "İçindeki savaşçı, dürtülerinin yakıtı. Bir şeyi istediğinde ne olur? Öne mi çıkarsın, yoksa geri mi çekilirsin?",
  Jupiter: "Genişleyen rüzgârın, inancının ufku. Nereye kadar büyüyebilirsin, biliyor musun?",
  Saturn: "Yapının kuralları, sınırlarının bekçisi. Zaman ne diyor, yaşlandıkça ne değişiyor?",
  Uranus: "Ani değişimler, beklenmedik kıvılcımlar. Bir gün her şey farklı olabilir — hazır mısın?",
  Neptune: "Rüyalarının okyanusu, sezgilerinin sisi. Gerçekle hayal arasındaki çizgi nerede?",
  Pluto: "Dönüşümün efendisi, ölüm ve doğuşun döngüsü. Eski ben öldüğünde yeni ben doğar.",
  Chiron: "İçindeki yara, ama aynı zamanda şifanın anahtarı. Acı çekmek bazen öğretir.",
  Lilith: "Bastırılmış arzunun, yasaklanmış isteğin. Neden korkuyorsun o sesin duyulmasından?",
  NorthNode: "Ruhunun gitmesi gereken yön, karmik çağrı. Geri kalmış bir hesap mı var?",
  SouthNode: "Geçmişten gelen alışkanlıklar, kolay gelen ama bırakman gereken şeyler. Geçmişin sana ne söylüyor?",
};

function getAspectDescription(type: string, p1: string, p2: string): string {
  const aspect = ASPECT_DESCRIPTIONS[type] || "";
  const p1Desc = PLANET_DESCRIPTIONS[p1] || p1;
  const p2Desc = PLANET_DESCRIPTIONS[p2] || p2;
  
  const combinations: Record<string, string> = {
    "Sun-Moon": "Güneş ve Ay arasındaki bu bağ, senin iç dünyan ile dış dünyan arasındaki köprüdür. Bazen kendinle barışık olursun, bazen de içindeki çatışma seni yorar. Bu açı, kim olduğunu ve nasıl hissettiğini doğrudan etkiler.",
    "Moon-Sun": "Güneş ve Ay arasındaki bu bağ, senin iç dünyan ile dış dünyan arasındaki köprüdür. Bazen kendinle barışık olursun, bazen de içindeki çatışma seni yorar. Bu açı, kim olduğunu ve nasıl hissettiğini doğrudan etkiler.",
    "Sun-Mars": "Güneş ve Mars birlikte çalıştığında, enerjin yüksek olur. Bir şeyi istediğinde peşine düşersin. Ama dikkat: öfke de bu enerjinin bir parçası. Yapıcı mı yıkıcı mı kullanırsın, senin elinde.",
    "Mars-Sun": "Güneş ve Mars birlikte çalıştığında, enerjin yüksek olur. Bir şeyi istediğinde peşine düşersin. Ama dikkat: öfke de bu enerjinin bir parçası. Yapıcı mı yıkıcı mı kullanırsın, senin elinde.",
    "Venus-Mars": "Venüs ve Mars arasındaki çekim, tutku ile sevgi arasındaki dansı temsil eder. Sevdiğin şeyi istemek — ve istediğin şeyi sevmek. Bu dengeyi bulmak, belki de en büyük öğrenmelerinden biri.",
    "Mars-Venus": "Venüs ve Mars arasındaki çekim, tutku ile sevgi arasındaki dansı temsil eder. Sevdiğin şeyi istemek — ve istediğin şeyi sevmek. Bu dengeyi bulmak, belki de en büyük öğrenmelerinden biri.",
    "Sun-Saturn": "Güneş ve Satürn arasındaki gerilim, ego ile yapı arasındaki savaşı gösterir. Bir yanda özgürlük, diğer yanda sorumluluk. Belki de en zor dersin: kurallarla yaşamayı öğrenmek.",
    "Saturn-Sun": "Güneş ve Satürn arasındaki gerilim, ego ile yapı arasındaki savaşı gösterir. Bir yanda özgürlük, diğer yanda sorumluluk. Belki de en zor dersin: kurallarla yaşamayı öğrenmek.",
    "Moon-Venus": "Ay ve Venüs birlikteyken, duyguların yumuşak ve şefkatli olur. Sevgiye açıksın, bağ kurmak istiyorsun. Ama dikkat: duygusal ihtiyaçların mı yoksa gerçek sevgi mi, bunu ayırt edebilir misin?",
    "Venus-Moon": "Ay ve Venüs birlikteyken, duyguların yumuşak ve şefkatli olur. Sevgiye açıksın, bağ kurmak istiyorsun. Ama dikkat: duygusal ihtiyaçların mı yoksa gerçek sevgi mi, bunu ayırt edebilir misin?",
    "Mercury-Jupiter": "Merkür ve Jüpiter bir araya geldiğinde, düşüncelerin genişler. Bir fikir bulutları dolaşırken, sen onu yakalayıp somutlaştırabilirsin. Bu açı, öğretmen ve öğrenci arasındaki köprüdür.",
    "Jupiter-Mercury": "Merkür ve Jüpiter bir araya geldiğinde, düşüncelerin genişler. Bir fikir bulutları dolaşırken, sen onu yakalayıp somutlaştırabilirsin. Bu açı, öğretmen ve öğrenci arasındaki köprüdür.",
    "Sun-Jupiter": "Güneş ve Jüpiter bir arada olduğunda, yaşam enerjin genişler. Sanki kanatların var ve uçuyormuşsun gibi hissediyorsun. Şans senin yanında mı, yoksa sen mi şansı yaratıyorsun?",
    "Jupiter-Sun": "Güneş ve Jüpiter bir arada olduğunda, yaşam enerjin genişler. Sanki kanatların var ve uçuyormuşsun gibi hissediyorsun. Şans senin yanında mı, yoksa sen mi şansı yaratıyorsun?",
    "Pluto-Sun": "Plüton ve Güneş arasındaki bu bağ, derin bir dönüşümü işaret eder. Kim olduğunu sorguladığın anlar, belki de en önemli anlardır. Eski ben ölür, yenisi doğar. Bu acıtır ama kaçılmaz.",
    "Sun-Pluto": "Plüton ve Güneş arasındaki bu bağ, derin bir dönüşümü işaret eder. Kim olduğunu sorguladığın anlar, belki de en önemli anlardır. Eski ben ölür, yenisi doğar. Bu acıtır ama kaçılmaz.",
    "Pluto-Moon": "Plüton ve Ay arasındaki bu bağ, bilinçaltında derin bir şeyler döngüyor. Bastırılmış duygular, çözülmemiş yaralar. Bunları görmezden gelmek işe yaramıyor. Yüzleşme zamanı mı?",
    "Moon-Pluto": "Plüton ve Ay arasındaki bu bağ, bilinçaltında derin bir şeyler döngüyor. Bastırılmış duygular, çözülmemiş yaralar. Bunları görmezden gelmek işe yaramıyor. Yüzleşme zamanı mı?",
    "Uranus-Moon": "Uranüs ve Ay arasındaki bu bağ, duygularında ani değişimler yaratır. Bazen her şey normalken, ansızın bir şey kıvılcımlanır. Bu beklenmedik duygusal patlamalar, seni şaşırtıyor mu?",
    "Moon-Uranus": "Uranüs ve Ay arasındaki bu bağ, duygularında ani değişimler yaratır. Bazen her şey normalken, ansızın bir şey kıvılcımlanır. Bu beklenmedik duygusal patlamalar, seni şaşırtıyor mu?",
    "Neptune-Moon": "Neptün ve Ay birlikteyken, gerçek ile hayal arasındaki çizgi bulanıklaşır. Rüyaların gerçek mi, gerçek bir rüya mı? Bu açı, sezgilerini dinlemek ister — ama bazen sezgi aldatıcı olabilir.",
    "Moon-Neptune": "Neptün ve Ay birlikteyken, gerçek ile hayal arasındaki çizgi bulanıklaşır. Rüyaların gerçek mi, gerçek bir rüya mı? Bu açı, sezgilerini dinlemek ister — ama bazen sezgi aldatıcı olabilir.",
    "Ascendant-Planets": "Yükseleninle bir gezegen arasındaki bu bağ, dış dünyaya nasıl göründüğünü etkiler. İnsanlar seni ilk gördüklerinde ne görüyor? Aslında kim olduğun mu, yoksa görünen kim mi?",
    "MC-Planets": "Kariyer eviyle bir gezegen arasındaki bu bağ, hayat yolunda nereye gittiğini gösterir. Kariyerinde bir dönüm noktası mı var? Yoksa yolunda mı ilerliyorsun?",
  };
  
  const key = `${p1}-${p2}`;
  const reverseKey = `${p2}-${p1}`;
  
  if (combinations[key]) return combinations[key];
  if (combinations[reverseKey]) return combinations[reverseKey];
  
  return `${aspect} ${p1Desc.toLowerCase()} ve ${p2Desc.toLowerCase()} arasındaki bu açı, ${p1} ve ${p2}'nin birlikte çalışma biçimini gösterir. ${aspect}`;
}

const AspectFeed = ({ data }: Props) => {
  const aspects = useMemo(() => {
    if (!data) return [];
    return computeAspects(data).sort((a, b) => a.orb - b.orb).slice(0, 8);
  }, [data]);

  const [selectedAspect, setSelectedAspect] = useState<AspectInfo | null>(null);

  if (aspects.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="font-display text-sm text-foreground flex items-center gap-2">
        <span className="text-primary">⟡</span> Aktif Aspektler
      </h3>
      <div className="grid grid-cols-1 gap-1.5">
        <AnimatePresence>
          {aspects.map((asp, i) => (
            <motion.div
              key={`${asp.p1Name}-${asp.p2Name}-${asp.type}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedAspect(asp)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs cursor-pointer transition-all hover:scale-[1.01] ${ASPECT_BG[asp.type]}`}
            >
              <span className={`text-base font-bold ${ASPECT_COLORS[asp.type]}`}>
                {ASPECT_ICONS[asp.type]}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-foreground font-medium">
                  {trPlanet(asp.p1Name)}
                </span>
                <span className="text-muted-foreground mx-1">↔</span>
                <span className="text-foreground font-medium">
                  {trPlanet(asp.p2Name)}
                </span>
              </div>
              <span className={`shrink-0 font-display text-[10px] ${ASPECT_COLORS[asp.type]}`}>
                {ASPECT_LABELS[asp.type]}
              </span>
              <span className="text-muted-foreground text-[10px] shrink-0">
                {asp.orb}°
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Aspect Detail Modal */}
      <AnimatePresence>
        {selectedAspect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedAspect(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm p-5 rounded-2xl glass-card max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-2xl ${ASPECT_COLORS[selectedAspect.type]}`}>
                  {ASPECT_ICONS[selectedAspect.type]}
                </span>
                <div>
                  <h4 className="font-display text-lg text-foreground">
                    {trPlanet(selectedAspect.p1Name)} ↔ {trPlanet(selectedAspect.p2Name)}
                  </h4>
                  <p className={`text-sm ${ASPECT_COLORS[selectedAspect.type]}`}>
                    {ASPECT_LABELS[selectedAspect.type]} · {selectedAspect.orb}°
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-foreground leading-relaxed">
                  {getAspectDescription(selectedAspect.type, selectedAspect.p1Name, selectedAspect.p2Name)}
                </p>
              </div>

              <button
                onClick={() => setSelectedAspect(null)}
                className="w-full mt-4 py-2 px-4 rounded-lg bg-primary/20 text-primary text-sm font-medium hover:bg-primary/30 transition-colors"
              >
                Kapat
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AspectFeed;
