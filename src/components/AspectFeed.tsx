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
  conjunction: "İki enerji birbirine kenetlenmiş. Sanki aynı motorun dişlileri. Bazen farkında olmadan bu gücü kullanıyorsun.",
  
  trine: "Pürüzsüz bir akış var. Sanki nehir yatağını bulmuş. Zorlamadan akıp gidiyor. Bu açı çalışırken, yeteneklerini kullanıyormuşsun gibi hissedersin.",
  
  sextile: "Gizli bir fırsat penceresi. Potansiyel taşıyor ama biraz çaba gerek. O fırsat orada, seni bekliyor.",
  
  square: "Gerilim yaratır. Kapıyı açmaya çalışırken diğer taraftan itilmek gibi. Bu açı seni harekete geçirir. Zorla büyümek istemezsen, seni zorlar.",
  
  opposition: "İki kutup arasında gerilim. İki farklı ses aynı anda şarkı söylüyor. Başkalarını yansıtmanı sağlar. Bazen acıtır, bazen aydınlatır.",
};

const PLANET_DESCRIPTIONS: Record<string, string> = {
  Sun: "Yaşam enerjin, ego güneşin.",
  Moon: "Bilinçaltının okyanusu, duygularının derinliği.",
  Mercury: "Zihninin sesi, düşüncelerinin habercisi.",
  Venus: "Kalbinin dili, değerlerinin aynası.",
  Mars: "İçindeki savaşçı, dürtülerinin yakıtı.",
  Jupiter: "Genişleyen rüzgârın, inancının ufku.",
  Saturn: "Yapının kuralları, sınırlarının bekçisi.",
  Uranus: "Ani değişimler, beklenmedik kıvılcımlar.",
  Neptune: "Rüyalarının okyanusu, sezgilerinin sisi.",
  Pluto: "Dönüşümün efendisi, ölüm ve doğuşun döngüsü.",
  Chiron: "İçindeki yara, şifanın anahtarı.",
  Lilith: "Bastırılmış arzunun yasaklanmış isteği.",
  NorthNode: "Ruhunun gitmesi gereken yön, karmik çağrı.",
  SouthNode: "Geçmişten gelen alışkanlıklar, kolay gelen şeyler.",
};

const ASPECT_MESSAGES: Record<string, string> = {
  conjunction: "Bu kavuşumun mesajı: Bir şeyi yaratma zamanı. İki güç birleşiyor — bunu kullan.",
  trine: "Üçgenin mesajı: Rahatla, akışa bırak. Zaten yeteneklisin, zorlamana gerek yok.",
  altıgen: "Altıgenin mesajı: Fırsat orada. Bir adım atsana.",
  square: "Karenin mesajı: Rahatsızlık büyümenin işareti. Önce zorluk, sonra dönüşüm.",
  opposition: "Karşıtın mesajı: Başkasında gördüğün kendindir. Yansıtmayı bırak.",
};

const PLANET_GLYPHS: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇",
  Chiron: "⚷", Lilith: "⚸", NorthNode: "☊", SouthNode: "☋",
  Ascendant: "AC", MC: "MC",
};

const ASPECT_ANGLES: Record<string, number> = {
  conjunction: 0,
  trine: 120,
  sextile: 60,
  square: 90,
  opposition: 180,
};

function getAspectDescription(type: string, p1: string, p2: string): { explanation: string; message: string } {
  const aspect = ASPECT_DESCRIPTIONS[type] || "";
  const message = ASPECT_MESSAGES[type] || "Bu açı senin için bir şey fısıldıyor.";
  
  const combinations: Record<string, { explanation: string; message: string }> = {
    "Sun-Moon": { 
      explanation: "Güneş ve Ay arasındaki köprü. İç dünyan ile dış dünyan arasındaki denge.", 
      message: "Kendinle barışık olma zamanı. İç çatışman var — ama bu senin parçan." 
    },
    "Moon-Sun": { 
      explanation: "Güneş ve Ay arasındaki köprü. İç dünyan ile dış dünyan arasındaki denge.", 
      message: "Kendinle barışık olma zamanı. İç çatışman var — ama bu senin parçan." 
    },
    "Sun-Mars": { 
      explanation: "Enerjin yüksek. Bir şeyi istediğinde peşine düşersin.", 
      message: "Öfke de bu enerjinin parçası. Yapıcı mı yıkıcı mı kullanırsın, senin elinde." 
    },
    "Mars-Sun": { 
      explanation: "Enerjin yüksek. Bir şeyi istediğinde peşine düşersin.", 
      message: "Öfke de bu enerjinin parçası. Yapıcı mı yıkıcı mı kullanırsın, senin elinde." 
    },
    "Venus-Mars": { 
      explanation: "Tutku ile sevgi arasındaki dans.", 
      message: "Sevdiğin şeyi istemek. Bu dengeyi bulmak senin öğrenmen." 
    },
    "Mars-Venus": { 
      explanation: "Tutku ile sevgi arasındaki dans.", 
      message: "Sevdiğin şeyi istemek. Bu dengeyi bulmak senin öğrenmen." 
    },
    "Sun-Saturn": { 
      explanation: "Ego ile yapı arasındaki gerilim.", 
      message: "Kurallarla yaşamayı öğrenme zamanı. Özgürlük ve sorumluluk dengesini bul." 
    },
    "Saturn-Sun": { 
      explanation: "Ego ile yapı arasındaki gerilim.", 
      message: "Kurallarla yaşamayı öğrenme zamanı. Özgürlük ve sorumluluk dengesini bul." 
    },
    "Moon-Venus": { 
      explanation: "Duyguların yumuşak ve şefkatli.", 
      message: "Sevgiye açıksın. Duygusal ihtiyaç mı gerçek sevgi mi, bunu ayırt et." 
    },
    "Venus-Moon": { 
      explanation: "Duyguların yumuşak ve şefkatli.", 
      message: "Sevgiye açıksın. Duygusal ihtiyaç mı gerçek sevgi mi, bunu ayırt et." 
    },
    "Mercury-Jupiter": { 
      explanation: "Düşüncelerin genişliyor.", 
      message: "Fikrini yakala ve somutlaştır. Bu senin öğretmenlik yolun." 
    },
    "Jupiter-Mercury": { 
      explanation: "Düşüncelerin genişliyor.", 
      message: "Fikrini yakala ve somutlaştır. Bu senin öğretmenlik yolun." 
    },
    "Sun-Jupiter": { 
      explanation: "Yaşam enerjin genişliyor.", 
      message: "Kanatların var, uçuyormuşsun gibi hissettiriyor. Şans senin yanında." 
    },
    "Jupiter-Sun": { 
      explanation: "Yaşam enerjin genişliyor.", 
      message: "Kanatların var, uçuyormuşsun gibi hissettiriyor. Şans senin yanında." 
    },
    "Pluto-Sun": { 
      explanation: "Derin dönüşüm. Kim olduğunu sorgulama anları.", 
      message: "Eski ben ölür, yenisi doğar. Bu acıtır ama kaçılmaz." 
    },
    "Sun-Pluto": { 
      explanation: "Derin dönüşüm. Kim olduğunu sorgulama anları.", 
      message: "Eski ben ölür, yenisi doğar. Bu acıtır ama kaçılmaz." 
    },
    "Pluto-Moon": { 
      explanation: "Bilinçaltında derin şeyler dönüyor.", 
      message: "Bastırılmış duygular, çözülmemiş yaralar. Yüzleşme zamanı." 
    },
    "Moon-Pluto": { 
      explanation: "Bilinçaltında derin şeyler dönüyor.", 
      message: "Bastırılmış duygular, çözülmemiş yaralar. Yüzleşme zamanı." 
    },
    "Uranus-Moon": { 
      explanation: "Duygularında ani değişimler.", 
      message: "Beklenmedik duygusal patlamalar. Bu seni şaşırtıyor — ama bu senin özgürlüğün." 
    },
    "Moon-Uranus": { 
      explanation: "Duygularında ani değişimler.", 
      message: "Beklenmedik duygusal patlamalar. Bu seni şaşırtıyor — ama bu senin özgürlüğün." 
    },
    "Neptune-Moon": { 
      explanation: "Gerçek ile hayal arasındaki çizgi bulanık.", 
      message: "Sezgilerini dinle. Ama bazen sezgi aldatıcı olabilir." 
    },
    "Moon-Neptune": { 
      explanation: "Gerçek ile hayal arasındaki çizgi bulanık.", 
      message: "Sezgilerini dinle. Ama bazen sezgi aldatıcı olabilir." 
    },
  };
  
  const key = `${p1}-${p2}`;
  const reverseKey = `${p2}-${p1}`;
  
  if (combinations[key]) return combinations[key];
  if (combinations[reverseKey]) return combinations[reverseKey];
  
  return { explanation: `${trPlanet(p1)} ve ${trPlanet(p2)} birlikte çalışıyor.`, message: ASPECT_MESSAGES[type] || "Bu açı senin için bir şey fısıldıyor." };
}

function AspectVisual({ p1Angle, p2Angle, type }: { p1Angle: number; p2Angle: number; type: string }) {
  const size = 80;
  const center = size / 2;
  const radius = 28;
  
  const getPoint = (angle: number) => ({
    x: center + radius * Math.cos((angle - 90) * Math.PI / 180),
    y: center + radius * Math.sin((angle - 90) * Math.PI / 180),
  });
  
  const p1 = getPoint(p1Angle);
  const p2 = getPoint(p2Angle);
  
  const midAngle = ((p1Angle + p2Angle) / 2 + 360) % 360;
  const labelPoint = getPoint(midAngle);
  
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      <circle cx={center} cy={center} r={radius} fill="none" stroke="hsl(270, 30%, 30%)" strokeWidth="1" strokeDasharray="4 2" />
      <circle cx={p1.x} cy={p1.y} r={6} fill="hsl(45, 80%, 60%)" />
      <circle cx={p2.x} cy={p2.y} r={6} fill="hsl(200, 80%, 60%)" />
      <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="hsl(270, 50%, 50%)" strokeWidth="2" strokeLinecap="round" />
      <text x={labelPoint.x} y={labelPoint.y} textAnchor="middle" dominantBaseline="middle" fontSize="16" fill="hsl(270, 60%, 70%)">
        {ASPECT_ANGLES[type] || "?"}°
      </text>
    </svg>
  );
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
              className="w-full max-w-sm p-4 rounded-2xl glass-card max-h-[70vh] overflow-y-auto"
            >
              {/* Visual */}
              <AspectVisual 
                p1Angle={data?.planets.find(p => p.name === selectedAspect.p1Name)?.longitude || 0}
                p2Angle={data?.planets.find(p => p.name === selectedAspect.p2Name)?.longitude || 0}
                type={selectedAspect.type}
              />
              
              <div className="flex items-center gap-2 mb-3 mt-2">
                <span className={`text-xl ${ASPECT_COLORS[selectedAspect.type]}`}>
                  {ASPECT_ICONS[selectedAspect.type]}
                </span>
                <div>
                  <h4 className="font-display text-sm text-foreground">
                    {trPlanet(selectedAspect.p1Name)} ↔ {trPlanet(selectedAspect.p2Name)}
                  </h4>
                  <p className={`text-xs ${ASPECT_COLORS[selectedAspect.type]}`}>
                    {ASPECT_LABELS[selectedAspect.type]} · {selectedAspect.orb}°
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs text-foreground leading-relaxed">
                  {getAspectDescription(selectedAspect.type, selectedAspect.p1Name, selectedAspect.p2Name).explanation}
                </p>
                <div className="pt-2 border-t border-border/30">
                  <p className="text-xs text-primary font-medium">
                    ✦ {getAspectDescription(selectedAspect.type, selectedAspect.p1Name, selectedAspect.p2Name).message}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAspect(null)}
                className="w-full mt-3 py-2 px-4 rounded-lg bg-primary/20 text-primary text-xs font-medium hover:bg-primary/30 transition-colors"
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
