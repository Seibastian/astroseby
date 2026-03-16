import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Star, Sparkles, Sun, Moon, Lock, CheckCircle, Circle, Play, RotateCcw, Atom, Globe, Heart, Zap, Eye, Crown, Users, BookOpen, Layers, ArrowRight } from "lucide-react";

const MODULES = [
  {
    id: 1,
    title: "Felsefi Temeller",
    subtitle: "Astroloji Nedir, Ne Değildir?",
    icon: Sparkles,
    color: "from-amber-500 to-orange-600",
    sections: [
      {
        title: "Astrolojinin Kökeni",
        content: `Astroloji, binlerce yıllık kadim bir bilgelik geleneğidir. Mısır, Babil, Yunan ve Hint uygarlıkları gökyüzünü yeryüzünün aynası olarak görmüşlerdir. Makrokosmos (büyük evren) ile mikrokosmos (insan) arasındaki bu bağlantı, astrolojinin temelini oluşturur.

Önemli: Astroloji bir "kader" sistemi DEĞİLDİR. Astroloji, olasılıklar matriksi sunan bir pusuladır - sizi yönlendirir ama kararı siz verirsiniz.`,
      },
      {
        title: "Yanlış Anlaşılan Astroloji",
        content: `Birçok kişi astrolojiyi "ceza" veya "karmik borç" sistemi olarak yanlış yorumlar. Bu yaklaşım yanlıştır.

DOĞRU: Doğum haritanız potansiyellerinizin envanteridir. Mars'ınız 7. evde mi? Bu sizin ilişkilerde güçlü bir enerjiye sahip olduğunuzu gösterir - bu bir "borç" değil, bir KAYNAK'tır.

Kelimeler önemlidir. "Kötü açı" yerine "aksiyona zorlayan enerji" demeyi tercih ediyoruz.`,
      },
      {
        title: "Kozmik Pusula Kavramı",
        content: `AstraCastra olarak biz astrolojiyi "kozmik pusula" olarak tanımlarız:

• Harita, sizin malzeme listenizdir - mutfakta ne var, ne yok
• Seçim sizin elinizdedir - aynı malzemelerle farklı yemekler yapabilirsiniz
• Transitler (güncel gökyüzü) mevsimsel koşullardır - bazı şeyler bu mevsime göre daha kolay/hard yapılır

Siz birer YARATICISINIZ, kozmosun kölesi değil.`,
      },
    ],
  },
  {
    id: 2,
    title: "Kozmik Tiyatro Sahneleri",
    subtitle: "12 Evin Sırları",
    icon: Layers,
    color: "from-emerald-500 to-teal-600",
    sections: [
      {
        title: "Ev Sistemi Nedir?",
        content: `Haritadaki 12 ev, yaşamın farklı alanlarını temsil eder. Her ev bir "sahne"dir ve bu sahnelerde gezegenler "oyuncular" olarak performans sergiler.

Placidus ev sistemi en yaygın kullanılandır. Her ev farklı büyüklükte olabilir - bu önemlidir çünkü bazı alanlar diğerlerinden daha "geniştir" (daha çok enerji).`,
      },
      {
        title: "1. Ev - Benlik ve Kimlik",
        content: `Birinci ev, "ASCENDANT" (yükselen) burcunuzun evidir. İnsanların sizi ilk gördüğünde nasıl algıladığınızı temsil eder.

Kendinizi dünyaya nasıl sunuyorsunuz? Fiziksel görünümünüz, tarzınız, ilk izlenimleriniz.

Örnek: Yükselen Koç = Enerjik, öncü, spontan
Örnek: Yükselen Yengeç = Sıcak, koruyucu, duygusal`,
      },
      {
        title: "4. Ev - Kökler ve Aile",
        content: `Dördüncü ev, kökenlerin, ailen ve iç dünyanın evidir. Anne/baba ile ilişkin, çocukluk deneyimlerin ve "ev" kavramıyla bağın bu evde yaşanır.

Bu ev aynı zamanda kalıtsal özelliklerini de taşır - ailenden miras aldığın kalıplar.

Soru: Bu evde hangi gezegen var? Aile dinamiklerinde sana ne anlatıyor?`,
      },
      {
        title: "7. Ev - İlişkiler",
        content: `Yedinci ev, yakın ilişkilerin, ortaklıkların ve "sen olmayan diğer" ile olan bağının evidir. Evlilik, iş ortaklıkları ve önemli ilişkiler bu evden yönetilir.

Bu evdeki gezegenler, senin için sağlıklı bir ilişkinin nasıl olması gerektiğini gösterir.

Mars buradaysa tutkulu, Venüs buradaysa uyumlu...`,
      },
      {
        title: "10. Ev - Kariyer ve Toplumsal Konum",
        content: `Onuncu ev, kariyer, toplumsal itibar ve "dünyaya bırakmak istediğin miras"ın evidir. Bu ev, toplumda nasıl bilinmek istediğini gösterir.

Bu evdeki gezegenler, hayatın boyunca ulaşmak istediğin "dışsal başarı" alanını işaret eder.

Hangi gezegen bu evde? Toplumda nasıl bir iz bırakmak istiyorsun?`,
      },
      {
        title: "12. Ev - Bilinçaltı ve Dönüşüm",
        content: `On ikinci ev, bilinçaltı, gizli düşmanlar, kapanmış kavşaklar ve ruhsal dönüşümün evidir. Bu ev, çoğu zaman korktuğumuz ama aslında büyümemizi sağlayan alandır.

Bu evdeki gezegenler, sırtınızda taşıdığınız ama farkında olmadığınız kalıplar olabilir.

Farkındalık = Özgürleşme. Bu evi "korkulacak" değil "anlaşılacak" yer olarak görün.`,
      },
    ],
  },
  {
    id: 3,
    title: "Sahnelerdeki Aktörler",
    subtitle: "Gezegenler ve Işıklar",
    icon: Sun,
    color: "from-yellow-500 to-amber-600",
    sections: [
      {
        title: "Güneş - Bilinç ve Işık",
        content: `Güneş, haritanın kalbidir. Ego, yaşam enerjisi ve bilinçli kimliğin kaynağıdır. Güneş burcunuz, sizin "çekirdek" enerjinizi gösterir.

ÖNEMLİ: Güneş burcunuz sadece %1'ini temsil eder - siz bundan çok daha kapsamlısınız!

Güneşiniz hangi evde? Bu alan sizin "ışığınızı" yansıtır - hayatta en çok bu alanda parlamak istersiniz.`,
      },
      {
        title: "Ay - Bilinçaltı ve Duygular",
        content: `Ay, bilinçaltınız, duygusal tepkileriniz ve "içsel çocuk"unuzdur. Duygusal güvenlik ihtiyacınız burada yatar.

Ay burcunuz, nasıl "rahat hissedeceğinizi" belirler. Fiziksel eviniz, güvendiğiniz kişiler, gelenekleriniz...

Ay = "Ben hissediyorum" enerjisi.`,
      },
      {
        title: "Merkür - Zihin ve İletişim",
        content: `Merkür, zihinsel süreçleriniz, iletişim tarzınız ve bilgiyi işleme biçiminizdir. Konuşma, yazma, öğrenme ve analiz bu gezegenin yönetimindedir.

Merkür burcunuz, düşünce tarzınızı gösterir:
• Koç Merkür = Hızlı, atılgan, sabırsız
• Boğa Merkür = Pratik, güvenilir, yavaş ama derin
• İkizler Merkür = Çok yönlü, meraklı, yüzeysel`,
      },
      {
        title: "Venüs - Değerler ve Sevgi",
        content: `Venüs, değerleriniz, estetik anlayışınız ve "sevgi dilleriniz"dir. Para, güzellik, ilişkiler ve zevkler bu gezegenin yönetimindedir.

Venüs burcunuz, sevgiyi nasıl ifade ettiğinizi ve neye değer verdiğinizi gösterir.

"Para sevgisi" de Venüs'tür! Paranıza nasıl yaklaşıyorsunuz? Venüs burcunuz cevaplar.`,
      },
      {
        title: "Mars - Eylem ve İrade",
        content: `Mars, savaşçı enerjinizdir. İstek, cesaret, eylem ve cinsellik bu gezegenin alanıdır. Mars, motivasyonunuzun kaynağıdır.

Mars burcunuz, savaşta nasıl savaştığınızı gösterir:
• Koç Mars = Doğrudan, sabırsız, öncü
• Boğa Mars = İnatçı, sabırlı, hedefe odaklı
• Akrep Mars = Tutkulu, dönüştürücü, yoğun`,
      },
      {
        title: "Jüpiter - Genişleme ve Şans",
        content: `Jüpiter, şans, yayılma ve inanç gezegenidir. Jüpiter, "olanaklar" gezegenidir - size kapılar açar ama içeri girmek sizin işiniz.

Bu gezegen aynı zamanda felsefe, yüksek eğitim ve yabancı kültürlerle de bağlantılıdır.

Jüpiter burcunuz, hayatta "şans"ın hangi kapıdan geleceğini gösterir.`,
      },
      {
        title: "Satürn - Disiplin ve Yapı",
        content: `Satürn, "olgunlaşma" gezegenidir. Sınırlar, sorumluluk, yapı ve düzen bu gezegenin alanıdır. Satürn korkulacak değil, saygı duyulacak bir gezegendir.

Satürn, gerçekçi beklentiler ve uzun vadeli planlar için gereklidir.

Satürn burcunuz, hayatta "emeğin" hangi alanda karşılık bulacağını gösterir.`,
      },
      {
        title: "Kolektif Gezegenler",
        content: `Uranüs, Neptün ve Plüton "nesiller arası" gezegenlerdir. Birçok kişiyle aynı anda geçiş yaparlar ve toplumsal değişimleri temsil ederler.

• Uranüs (7yıl): Devrim, yenilik, bireyselleşme
• Neptün (14yıl): İllüzyon, spiritüellik, hayaller
• Plüton (20yıl): Yıkım ve yeniden doğuş, kolektif dönüşüm

Bu gezegenlerin eviniz hangi nesil enerjisinden etkilendiğinizi gösterir.`,
      },
    ],
  },
  {
    id: 4,
    title: "Aktörlerin Kostümleri",
    subtitle: "Burçlar ve Elementler",
    icon: Star,
    color: "from-violet-500 to-purple-600",
    sections: [
      {
        title: "4 Element ve 3 Cross",
        content: `Zodyak 4 elementten oluşur: ATEŞ, TOPRAK, HAVA, SU

• ATEŞ (Koç, Aslan, Yay): Enerji, tutku, öncülük
• TOPRAK (Boğa, Başak, Oğlak): Pratiklik, güvenilirlik, maddi dünya
• HAVA (İkizler, Terazi, Kova): Zihinsel aktivite, iletişim, sosyallik
• SU (Yengeç, Akrep, Balık): Duygular, sezgi, bağ

Ve 3 nitelik (cross):
• SABIT (Boğa, Aslan, Akrep, Kova): İnatçı, kararlı, dirençli
• DEĞİŞKEN (İkizler, Başak, Yay, Balık): Uyumlu, esnek, adapte
• KARDİNAL (Koç, Yengeç, Terazi, Oğlak): Öncü, başlatıcı, harekete geçirici`,
      },
      {
        title: "Ateş Burçları - Tutku ve Işık",
        content: `KOÇ (Kardinal Ateş): Öncü, cesur, rekabetçi. Yeni başlangıçların burcu. Enerjin yönetilmeli - sabırsız olabilirsin.

ASLAN (Sabit Ateş): Yaratıcı, cömert, drama kralı/kraliçesi. Sahne senin - parlama zamanı!

YAY (Değişken Ateş): Maceracı, optimist, felsefeci. Mükemmeliyetçi değil, anlam arayışçısı.`,
      },
      {
        title: "Toprak Burçları - Madde ve Gerçeklik",
        content: `BOĞA (Sabit Toprak): İnatçı ama sadık, zevkleri seven, pratik. Güvenlik senin için önemli - ama değişime açık olmalısın.

BAŞAK (Değişken Toprak): Analitik, düzenli, hizmet odaklı. Detaycı ama "mükemmeliyetçi" tuzağına düşme.

OĞLAK (Kardinal Toprak): Disiplinli, kariyer odaklı,野心家 (ambitious). Sınırları bilirsin, aşırı baskıya da dikkat et.`,
      },
      {
        title: "Hava Burçları - Zihin ve İletişim",
        content: `İKİZLER (Değişken Hava): Meraklı, iletişimci, çok yönlü. Ama "yüzeysel" olma riski var - derinleşmeyi öğren.

TERAZİ (Kardinal Hava): Uyumlu, estetik, diplomatik. İlişkilerde denge arayışçısı - karar vermekte zorlanma.

KOVA (Sabit Hava): Bağımsız, yenilikçi, insancıl. "Farklı" olmaktan korkma - sen geleceği temsil ediyorsun.`,
      },
      {
        title: "Su Burçları - Duygu ve Sezgi",
        content: `YENGEÇ (Kardinal Su): Koruyucu, duygusal, gelenekçi. Aile senin çapaın - ama kendi sınırlarını da koru.

AKREP (Sabit Su): Yoğun, dönüştürücü, sezgisel. "Ya hep ya hiç" enerjin var - dengeyi bul.

BALIK (Değişken Su): Rüyalar, spiritüellik, empati. Dünyadan kaçma değil, dünyayı iyileştirme çağrısı sende.`,
      },
      {
        title: "Yönetici Gezegenler",
        content: `Her burcun bir "yönetici" gezegeni vardır (modern astrolojiye göre birden fazla olabilir):

• Koç = Mars
• Boğa = Venüs  
• İkizler = Merkür
• Yengeç = Ay
• Aslan = Güneş
• Başak = Merkür
• Terazi = Venüs
• Akrep = Mars (Plüton da)
• Yay = Jüpiter
• Oğlak = Satürn
• Kova = Satürn (Uranüs da)
• Balık = Jüpiter (Neptün de)

Haritanızda bu gezegenlerin enerjisi, o burcun enerjisini "destekler".`,
      },
    ],
  },
  {
    id: 5,
    title: "Dinamik Enerji Ağları",
    subtitle: "Açılar (Aspektler)",
    icon: Atom,
    color: "from-rose-500 to-pink-600",
    sections: [
      {
        title: "Açı Nedir?",
        content: `Açılar (aspektler), gezegenler arasındaki "açısal mesafelerdir". İki gezegen belirli bir açıyla birbirine baktığında, aralarında bir "diyalog" kurulur.

Bu diyalogun dili farklıdır:
• Akışkan mı, gerilimli mi?
• Aktif mi, pasif mi?
• Bilinçli mi, bilinçsiz mi?

Açılar, haritanızın "dinamiğini" oluşturur.`,
      },
      {
        title: "Kavuşum (Conjunction) - Birleşme",
        content: `Kavuşum, iki gezegenin aynı noktada olmasıdır (0°). Bu en yoğun açıdır - iki enerji birleşip tek bir güç oluşturur.

Örnek: Venüs-Mars Kavluşumu = Tutkulu bir birleşme. Sanatçı yaratıcılığı veya yoğun çekim.

Kavuşum, "doğuştan gelen yetenek" alanıdır - bu enerji sende doğal olarak var.`,
      },
      {
        title: "Sekstil - Fırsat Penceresi",
        content: `Sekstil, 60°'lik açıdır. Bu "fırsat" açısıdır - enerji akışı kolaydır ama harekete geçmezsen kaçabilir.

Sekstil, "potansiyel" enerji taşır. Bir yetenek vardır ama geliştirmek için çaba gerekir.

Örnek: Merkür-Jüpiter Sekstili = Öğrenme kolaylığı, felsefi düşünce potansiyeli - okumaya devam et!`,
      },
      {
        title: "Üçgen - Akışkanlık",
        content: `Üçgen, 120°'lik açıdır. Bu en "rahat" açıdır - enerji doğal akış halindedir.

Üçgen, "doğal yetenek" anlamına gelir. Zorlamadan yapabildiğin şeyler!

Örnek: Güneş-Satürn Üçgeni = Disiplin ile özgüven arasında doğal uyum. Kendini geliştirmek senin için kolay.`,
      },
      {
        title: "Kare - Gerilim ve Büyüme",
        content: `Kare, 90°'lik açıdır. Bu "zorlayıcı" açıdır - iki enerji birbiriyle çatışıyor gibi görünür.

ÖNEMLİ: Kare "kötü" DEĞİLDİR! Kare, "aksiyona zorlayan" açıdır. Gerilim, harekete geçmen için bir itiş gücüdür.

Örnek: Mars-Satürn Kare = Engellerle mücadele ama bu mücadele güçlendirir. "Pes etme" yok, "savaş" var!`,
      },
      {
        title: "Karşıt - Tamamlayıcılık",
        content: `Karşıt, 180°'lik açıdır. İki gezegen birbirine zıt baktığında oluşur.

Bu açı, "dışarıda aradığımız" enerjiyi gösterir. Başkasında çekici bulduğumuz şey, aslında kendimizde geliştirmek istediğimiz yön.

Örnek: Güneş-Marte Karşıt = Dışarıda güçlü, kararlı insanları çekmek ama aslında bu enerji senin içinde de var!`,
      },
    ],
  },
  {
    id: 6,
    title: "Gelişmiş Okuma",
    subtitle: "Derinleşme ve Uygulama",
    icon: Crown,
    color: "from-cyan-500 to-blue-600",
    sections: [
      {
        title: "Vedik Astroloji - Hindistan Geleneği",
        content: `Vedik (Hint) astrolojisi, Batı astrolojisinden farklı bir sistemdir. Aynı gezegenleri kullanır ama farklı yorumlar:

• Nakshatralar: Ay'ın 27 yıldızı - daha detaylı karakter analizi
• Dasha sistemi: Yaşamın zaman çizelgesi - hangi dönemde hangi enerjinin baskın olduğu
• Vimshottari Dasha: 120 yıllık döngü - gezegenlerin sırayla "yönetim" zamanları

Vedik astroloji daha "kadersel" görünse de aslında farkındalıkla yönlendirilebilir.`,
      },
      {
        title: "Evrimsel Astroloji - Ay Düğümleri",
        content: `Ay Düğümleri (Kuzey ve Güney Düğüm), ruhun bu yaşamda "neden" burada olduğunu gösterir:

• KUZEY DÜĞÜM: Bu yaşamda gitmen gereken yön - büyüme alanın
• GÜNEY DÜĞÜM: Geçmiş yaşamlardan getirdiğin kalıplar - "eski alışkanlıklar"

ÖNEMLİ: Bu "borç" değil - bu TECRÜBE etme yolun! Güney düğümüne takılıp kalmak yerine, Kuzey düğümüne doğru büyü.`,
      },
      {
        title: "Sinastri - İlişki Kimyası",
        content: `Sinastri, iki kişinin haritalarının karşılaştırmasıdır. İlişkideki "kimyayı" gösterir.

Önemli açılar:
• Güneş-Uyumu = Temel uyum
• Venüs-Uyumu = Çekim ve değerler
• Mars-Uyumu = Fiziksel ve enerji uyumu
• Ay-Uyumu = Duygusal güvenlik

Sinastri "mükemmel uyum" değil, "potansiyel" gösterir. İki farklı kimya nasıl tepkimeye girer?`,
      },
      {
        title: "Transitler - Güncel Gökyüzü",
        content: `Transitler, şu anda gökyüzünde olan geçişlerdir. Transitler, "mevsimsel rüzgarlar" gibidir - bazı şeyleri zorlaştırır, bazılarını kolaylaştırır.

Örnek: Satürn Güneş'inizden geçerken (yaklaşık 1 yıl) = Olgunlaşma dönemi. Zor ama gerekli.

Transitler "kader" değil FIRSAT'tır. Transit geçer ama siz yerinde kalabilirsiniz - veya büyüyebilirsiniz.`,
      },
      {
        title: "Harita Okuma Pratiği",
        content: `Şimdi öğrendiklerini uygula! Bir haritayı okurken:

1. ÖNCE GENEL: Yükselen burç, Güneş ve Ay'ı not et
2. SONRA EVLER: Hangi gezegen hangi evde?
3. AÇILAR: Enerjiler nasıl konuşuyor?
4. ELEMENTLER: Hangi element eksik/aşırı?
5. BÜTÜN: Bunlar bir hikaye anlatıyor - ne?

Astroloji bir bilimdir, sanattır ve sezgiseldir. Üçünü birleştir.`,
      },
    ],
  },
];

const ZODIAC_SIGNS = [
  { name: "Koç", symbol: "♈", element: "Ateş", keyword: "Öncü, Cesur" },
  { name: "Boğa", symbol: "♉", element: "Toprak", keyword: "İnatçı, Pratik" },
  { name: "İkizler", symbol: "♊", element: "Hava", keyword: "Meraklı, İletişimci" },
  { name: "Yengeç", symbol: "♋", element: "Su", keyword: "Koruyucu, Duygusal" },
  { name: "Aslan", symbol: "♌", element: "Ateş", keyword: "Yaratıcı, Cömert" },
  { name: "Başak", symbol: "♍", element: "Toprak", keyword: "Analitik, Detaycı" },
  { name: "Terazi", symbol: "♎", element: "Hava", keyword: "Uyumlu, Estetik" },
  { name: "Akrep", symbol: "♏", element: "Su", keyword: "Yoğun, Dönüştürücü" },
  { name: "Yay", symbol: "♐", element: "Ateş", keyword: "Maceracı, Felsefeci" },
  { name: "Oğlak", symbol: "♑", element: "Toprak", keyword: "Disiplinli, Hedef Odaklı" },
  { name: "Kova", symbol: "♒", element: "Hava", keyword: "Bağımsız, Yenilikçi" },
  { name: "Balık", symbol: "♓", element: "Su", keyword: "Sezgisel, Rüya" },
];

const ZODIAC_WHEEL_COLORS = [
  "#ef4444", // Koç - Ateş
  "#84cc16", // Boğa - Toprak
  "#06b6d4", // İkizler - Hava  
  "#3b82f6", // Yengeç - Su
  "#f59e0b", // Aslan - Ateş
  "#84cc16", // Başak - Toprak
  "#06b6d4", // Terazi - Hava
  "#3b82f6", // Akrep - Su
  "#f59e0b", // Yay - Ateş
  "#84cc16", // Oğlak - Toprak
  "#06b6d4", // Kova - Hava
  "#3b82f6", // Balık - Su
];

const ZodiacWheel = ({ selectedSign, onSelect }: { selectedSign: number | null; onSelect: (i: number) => void }) => {
  return (
    <div className="relative w-64 h-64 mx-auto mb-4">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        <circle cx="100" cy="100" r="95" fill="#1e1b4b" stroke="#4c1d95" strokeWidth="2" />
        
        {ZODIAC_SIGNS.map((sign, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const x = 100 + 75 * Math.cos(angle);
          const y = 100 + 75 * Math.sin(angle);
          const isSelected = selectedSign === i;
          
          return (
            <g key={sign.name} onClick={() => onSelect(i)} className="cursor-pointer">
              <circle
                cx={x}
                cy={y}
                r={isSelected ? 18 : 14}
                fill={isSelected ? ZODIAC_WHEEL_COLORS[i] : "#312e81"}
                stroke={isSelected ? "#fff" : ZODIAC_WHEEL_COLORS[i]}
                strokeWidth={isSelected ? 2 : 1}
                filter={isSelected ? "url(#glow)" : ""}
                className="transition-all duration-300"
              />
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                className="text-xs fill-white font-bold pointer-events-none"
              >
                {sign.symbol}
              </text>
            </g>
          );
        })}
        
        <circle cx="100" cy="100" r="35" fill="#0f172a" stroke="#4c1d95" strokeWidth="1" />
        <text x="100" y="95" textAnchor="middle" className="text-[8px] fill-indigo-300">ZODYAK</text>
        <text x="100" y="108" textAnchor="middle" className="text-[6px] fill-indigo-400">ÇEMBERİ</text>
      </svg>
    </div>
  );
};

const AstroEdu = () => {
  const [currentModule, setCurrentModule] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [selectedSign, setSelectedSign] = useState<number | null>(null);
  const [showZodiac, setShowZodiac] = useState(true);
  const [completedModules, setCompletedModules] = useState<number[]>([]);

  const module = MODULES[currentModule];
  const totalSections = module.sections.length;
  const isLastSection = currentSection === totalSections - 1;
  const isLastModule = currentModule === MODULES.length - 1;

  const nextSection = () => {
    if (isLastSection) {
      if (!completedModules.includes(currentModule)) {
        setCompletedModules([...completedModules, currentModule]);
      }
      if (!isLastModule) {
        setCurrentModule(currentModule + 1);
        setCurrentSection(0);
      }
    } else {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    } else if (currentModule > 0) {
      setCurrentModule(currentModule - 1);
      setCurrentSection(MODULES[currentModule - 1].sections.length - 1);
    }
  };

  const resetProgress = () => {
    setCurrentModule(0);
    setCurrentSection(0);
    setCompletedModules([]);
    setSelectedSign(null);
  };

  const progress = ((currentModule * totalSections + currentSection + 1) / (MODULES.length * 5)) * 100;

  return (
    <div className="min-h-screen pb-20 relative theme-insight overflow-hidden">
      <motion.div 
        className="fixed inset-0 z-0"
        animate={{
          background: `radial-gradient(ellipse at 50% 0%, ${completedModules.includes(currentModule) ? '#065f46' : '#1e1b4b'} 0%, #0a0a1a 50%, #05050a 100%)`
        }}
        transition={{ duration: 1.5 }}
      />

      <div className="relative z-10 px-4 pt-6 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentModule}-${currentSection}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-display text-white">
                  Kozmik Navigasyon
                </h1>
                <p className="text-indigo-300/60 text-xs">
                  Modül {currentModule + 1}/{MODULES.length}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={resetProgress}
                  className="p-2 rounded-lg bg-white/10 text-indigo-300 hover:bg-white/20 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-white/10 rounded-full mb-6 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Module Card */}
            <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md rounded-2xl border border-white/10 p-5 mb-4">
              {/* Module Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center shadow-lg`}>
                  <module.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-display text-white">{module.title}</h2>
                  <p className="text-indigo-300/70 text-xs">{module.subtitle}</p>
                </div>
                {completedModules.includes(currentModule) && (
                  <CheckCircle className="w-5 h-5 text-emerald-400 ml-auto" />
                )}
              </div>

              {/* Section Title */}
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 rounded-md bg-white/10 text-indigo-300 text-xs font-medium">
                  {currentSection + 1}/{totalSections}
                </span>
                <h3 className="text-white font-medium">{module.sections[currentSection].title}</h3>
              </div>

              {/* Zodiac Wheel Toggle */}
              {currentModule >= 2 && (
                <button
                  onClick={() => setShowZodiac(!showZodiac)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 mb-3 flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  {showZodiac ? "Zodyak Çemberini Gizle" : "Zodyak Çemberini Göster"}
                </button>
              )}

              {/* Zodiac Wheel */}
              {currentModule >= 2 && showZodiac && (
                <ZodiacWheel 
                  selectedSign={selectedSign} 
                  onSelect={(i) => setSelectedSign(selectedSign === i ? null : i)}
                />
              )}

              {/* Selected Sign Info */}
              {selectedSign !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-indigo-900/50 border border-indigo-500/30 rounded-xl p-3 mb-4"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{ZODIAC_SIGNS[selectedSign].symbol}</span>
                    <span className="text-white font-medium">{ZODIAC_SIGNS[selectedSign].name}</span>
                    <span className="text-indigo-400 text-xs">({ZODIAC_SIGNS[selectedSign].element})</span>
                  </div>
                  <p className="text-indigo-300/70 text-sm">{ZODIAC_SIGNS[selectedSign].keyword}</p>
                </motion.div>
              )}

              {/* Content */}
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="text-indigo-100/80 text-sm leading-relaxed whitespace-pre-line">
                  {module.sections[currentSection].content}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={prevSection}
                disabled={currentModule === 0 && currentSection === 0}
                className="flex-1 border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/20"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Geri
              </Button>
              
              <Button
                onClick={nextSection}
                className={`flex-1 ${module.color} text-white shadow-lg`}
              >
                {isLastModule && isLastSection ? (
                  <>Tamamla <CheckCircle className="w-4 h-4 ml-1" /></>
                ) : (
                  <>İleri <ChevronRight className="w-4 h-4 ml-1" /></>
                )}
              </Button>
            </div>

            {/* Module Navigation Dots */}
            <div className="flex justify-center gap-2 mt-6 flex-wrap">
              {MODULES.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => { setCurrentModule(i); setCurrentSection(0); }}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentModule === i 
                      ? "bg-white scale-125" 
                      : completedModules.includes(i) 
                        ? "bg-emerald-400" 
                        : "bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>

            {/* Completion Message */}
            {completedModules.length === MODULES.length && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 bg-gradient-to-r from-emerald-900/50 to-cyan-900/50 border border-emerald-500/30 rounded-xl p-6 text-center"
              >
                <Crown className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                <h3 className="text-xl font-display text-white mb-2">Tebrikler!</h3>
                <p className="text-emerald-200/80 text-sm">
                  Kozmik Navigasyon eğitimini tamamladın. Artık bir astroloji okuryazarısın!
                  <br />
                  <span className="text-indigo-300">Şimdi kendi haritanı keşfetme zamanı.</span>
                </p>
              </motion.div>
            )}

            {/* Info Box */}
            <div className="mt-6 bg-amber-900/20 border border-amber-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <p className="text-amber-200/80 text-xs font-medium mb-1">Öğrenme İpucu</p>
                  <p className="text-amber-300/60 text-xs">
                    Bu eğitim, AstraCastra'nın temel astroloji eğitim setidir. 
                    Her modülü tamamladığında yeni bir "yıldız tohumu" ekilir.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
};

export default AstroEdu;
