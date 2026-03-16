import { useState, useRef } from "react";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Star, Sparkles, Sun, Lock, CheckCircle, Circle, RotateCcw, Atom, Globe, Heart, Zap, Eye, Crown, Target, GraduationCap, Share2, Download, Award, PartyPopper, Facebook, Instagram, Twitter, Link as LinkIcon, Copy, Check } from "lucide-react";


const HOUSES = [
  { id: 1, name: "1. Ev", title: "Benlik ve Kimlik", keywords: "Yükselen, ego, fiziksel görünüm", description: "Doğum anında ufuk çizgisinin yükselen noktası (Ascendant). İnsanların sizi ilk gördüğünde nasıl algıladığınız.", ruling: "Yükselen burç" },
  { id: 2, name: "2. Ev", title: "Değerler ve Kaynaklar", keywords: "Para, possessions, öz değer", description: "Maddi kaynaklar, para, değer sistemi ve sahip olduklarınız." },
  { id: 3, name: "3. Ev", title: "İletişim ve Çevre", keywords: "Kardeşler, komşular, eğitim", description: "Yakın çevre, kardeşler, günlük iletişim ve seyahat." },
  { id: 4, name: "4. Ev", title: "Kökler ve Aile", keywords: "Anne/baba, çocukluk, ev", description: "Aile kökenleriniz, çocukluk deneyimleriniz, ev ve yuva kavramı." },
  { id: 5, name: "5. Ev", title: "Yaratıcılık ve Aşk", keywords: "Çocuklar, sevgi, yaratıcılık", description: "Yaratıcılık, romantik aşk ve flört, eğlence ve hobiler." },
  { id: 6, name: "6. Ev", title: "Hizmet ve Sağlık", keywords: "İş, sağlık, rutin", description: "Günlük işler, hizmet etme, sağlık ve beslenme." },
  { id: 7, name: "7. Ev", title: "İlişkiler ve Ortaklıklar", keywords: "Evlilik, iş ortaklığı", description: "Yakın ilişkiler, evlilik ve iş ortaklıkları." },
  { id: 8, name: "8. Ev", title: "Dönüşüm ve Paylaşım", keywords: "Cinsellik, ölüm, miras", description: "Dönüşüm, cinsellik, miras ve borçlar." },
  { id: 9, name: "9. Ev", title: "Felsefe ve Macera", keywords: "Yüksek eğitim, seyahat", description: "Yüksek eğitim, felsefe, inanç sistemleri ve uzun seyahatler." },
  { id: 10, name: "10. Ev", title: "Kariyer ve Toplumsal Konum", keywords: "Kariyer, itibar", description: "Kariyer, toplumsal itibar ve dışsal başarı." },
  { id: 11, name: "11. Ev", title: "Topluluk ve Ütopyalar", keywords: "Arkadaşlar, umutlar", description: "Arkadaşlar, sosyal çevre, umutlar ve hayaller." },
  { id: 12, name: "12. Ev", title: "Bilinçaltı ve Ruh", keywords: "Bilinçaltı, gizli düşmanlar", description: "Bilinçaltı, gizli düşmanlar ve ruhsal dönüşüm." },
];

const QUIZZES = [
  {
    module: 1,
    questions: [
      { q: "Astroloji nedir?", options: ["Kader sistemi", "Olasılıklar matriksi", "Batıl inanç", "Bilim"], correct: 1 },
      { q: "Doğum haritası için hangi bilgiler gerekir?", options: ["Sadece tarih", "Tarih, saat, yer", "Sadece yer", "Sadece saat"], correct: 1 },
      { q: "Kozmik pusula metaforunda harita neyi temsil eder?", options: ["Kader", "Malzeme listesi", "Yemek tarifi", "Hava durumu"], correct: 1 },
    ]
  },
  {
    module: 2,
    questions: [
      { q: "1. Ev neyi temsil eder?", options: ["Para", "Aile", "Benlik ve kimlik", "Kariyer"], correct: 2 },
      { q: "7. Ev hangi konuyu yönetir?", options: ["Kariyer", "İlişkiler", "Sağlık", "Yaratıcılık"], correct: 1 },
      { q: "Hangi ev 'kökler ve aile' ile ilgilidir?", options: ["1. Ev", "4. Ev", "7. Ev", "10. Ev"], correct: 1 },
    ]
  },
  {
    module: 3,
    questions: [
      { q: "Güneş neyi temsil eder?", options: ["Duygular", "Bilgiç ve ego", "Para", "İletişim"], correct: 1 },
      { q: "Mars gezegeni hangi konuyu yönetir?", options: ["Aşk ve güzellik", "Eylem ve enerji", "Şans ve genişleme", "Disiplin"], correct: 1 },
      { q: "Venüs hangi burçları yönetir?", options: ["Koç ve Akrep", "Boğa ve Terazi", "Aslan ve Yay", "Oğlak ve Kova"], correct: 1 },
    ]
  },
  {
    module: 4,
    questions: [
      { q: "Kaç element vardır?", options: ["2", "3", "4", "5"], correct: 2 },
      { q: "Hangi element 'duygular ve sezgi'dir?", options: ["Ateş", "Toprak", "Hava", "Su"], correct: 3 },
      { q: "Koç burcu hangi elementtedir?", options: ["Toprak", "Hava", "Su", "Ateş"], correct: 3 },
    ]
  },
  {
    module: 5,
    questions: [
      { q: "Kare açısı (90°) neyi ifade eder?", options: ["Kolaylık", "Gerilim ve büyüme", "Tamamlayıcılık", "Birleşme"], correct: 1 },
      { q: "Üçgen açısı kaç derecedir?", options: ["60°", "90°", "120°", "180°"], correct: 2 },
      { q: "Yükselen (Ascendant) nedir?", options: ["En parlak gezegen", "Ufuk çizgisinin yükselen noktası", "En güçlü açı", "Bir burç"], correct: 1 },
    ]
  },
];

const FINAL_QUIZ = {
  questions: [
    { q: "Yükselen Koç olan biri nasıl görünür?", options: ["Sakin ve pratik", "Enerjik ve öncü", "Uyumlu ve diplomatik", "Duygusal ve koruyucu"], correct: 1 },
    { q: "Venüs 2. evde olan biri için aşağıdakilerden hangisi doğrudur?", options: ["Para konusunda yetenekli", "İletişimde güçlü", "Sağlık sorunları", "Kariyer odaklı"], correct: 0 },
    { q: "Mars-Akrep kare açısı neyi gösterir?", options: ["Kolay ilişkiler", "Yoğun enerji ve güç mücadelesi", "Sakin bir yaşam", "Mantıklı kararlar"], correct: 1 },
    { q: "Ay düğümlerinden Kuzey Düğümü neyi temsil eder?", options: ["Geçmişteki borçlar", "Bu yaşamda büyüme yönü", "Kötü alışkanlıklar", "Sınırlar"], correct: 1 },
    { q: "Satürn transitinde ne olur?", options: ["Şanslı bir dönem", "Kısa süreli değişim", "Olgunlaşma ve disiplin dönemi", "Yaratıcılık patlaması"], correct: 2 },
    { q: "Hangi element eksikliği iletişim zorluğu gösterebilir?", options: ["Ateş", "Toprak", "Hava", "Su"], correct: 2 },
    { q: "Güneş 10. evde olan biri için aşağıdakilerden hangisi doğrudur?", options: ["Gizli liderlik", "Kariyer ve toplumsal başarı vurgusu", "Aile odaklı", "Gizemli"], correct: 1 },
    { q: "Plüton hangi konuyu yönetir?", options: ["Günlük iletişim", "Dönüşüm ve yeniden doğuş", "Şans ve bolluk", "Dostluk"], correct: 1 },
    { q: "Kare açı 'kötü' olarak yorumlanabilir mi?", options: ["Evet, her zaman kötüdür", "Hayır, bu gerilim büyüme için fırsattır", "Sadece bazı durumlarda", "Bilinemez"], correct: 1 },
    { q: "Bir harita okunurken ilk bakılması gereken üç temel unsur hangileridir?", options: ["Merkür, Venüs, Mars", "Yükselen, Güneş, Ay", "Jüpiter, Satürn, Uranüs", "Tüm gezegenler"], correct: 1 },
  ]
};

const MODULES = [
  {
    id: 1,
    title: "Felsefi Temeller",
    subtitle: "Astroloji Nedir?",
    icon: Sparkles,
    color: "from-amber-500 to-orange-600",
    sections: [
      { title: "Astrolojinin Kökeni", content: `Astroloji, binlerce yıllık kadim bir bilgelik geleneğidir. Mısır, Babil, Yunan ve Hint uygarlıkları gökyüzünü yeryüzünün aynası olarak görmüşlerdir. Makrokosmos (büyük evren) ile mikrokosmos (insan) arasındaki bu bağlantı, astrolojinin temelini oluşturur.

Önemli: Astroloji bir "kader" sistemi DEĞİLDİR. Astroloji, olasılıklar matriksi sunan bir pusuladır - sizi yönlendirir ama kararı siz verirsiniz.` },
      { title: "Yanlış Anlaşılan Astroloji", content: `Birçok kişi astrolojiyi "ceza" veya "karmik borç" sistemi olarak yanlış yorumlar.

DOĞRU: Doğum haritanız potansiyellerinizin envanteridir.

Kelimeler önemlidir:
- "Kötü açı" yerine → "Aksiyona zorlayan enerji"
- "Karmik borç" yerine → "Büyüme fırsatı"Siz birer YARATICISINIZ!` },
      { title: "Harita Nasıl Çıkarılır?", content: `Doğum haritası üç temel bilgiyle çıkarılır:

1. DOĞUM TARİHİ - Gün, ay, yıl
2. DOĞUM SAATİ - Saat ve dakika (çok önemli!)
3. DOĞUM YERİ - Enlem ve boylam

Neden saat önemli? 
Yükselen (Ascendant) burcunuz tam doğum saatine göre belirlenir. 4 dakikalık fark bile yükselen burcunuzu değiştirebilir!` },
      { title: "Kozmik Pusula Kavramı", content: `AstraCastra olarak astrolojiyi "kozmik pusula" olarak tanımlarız:

• HARİTA = Malzeme listeniz
• SİZ = Şef (aynı malzemelerle farklı yemekler)
• TRANSİTLER = Mevsimsel koşullar
• NİYET = Tarif

Siz birer YARATICISINIZ!` },
    ],
  },
  {
    id: 2,
    title: "Kozmik Tiyatro Sahneleri",
    subtitle: "12 Ev Sistemi",
    icon: Globe,
    color: "from-emerald-500 to-teal-600",
    sections: [
      { title: "1. Ev - Benlik", content: `📍 1. Ev "Benlik ve Kimlik"\n\nDoğum anında ufuk çizgisinin yükselen noktası (Ascendant). İnsanların sizi ilk gördüğünde nasıl algıladığınız, kendinizi dünyaya nasıl sunduğunuz.\n\nAnahtar: Yükselen burç, ego, fiziksel görünüm` },
      { title: "2. Ev - Değerler", content: `📍 2. Ev "Değerler ve Kaynaklar"\n\nMaddi kaynaklar, para, değer sistemi ve sahip olduklarınız. Kendi değerinizi nasıl algıladığınız ve para ile ilişkiniz.\n\nAnahtar: Para, possessions, yetenekler` },
      { title: "3. Ev - İletişim", content: `📍 3. Ev "İletişim ve Çevre"\n\nYakın çevre, kardeşler, komşular, günlük iletişim ve seyahat. Öğrenme biçiminiz ve bilgiyi işleme tarzınız.\n\nAnahtar: Kardeşler, eğitim, günlük iletişim` },
      { title: "4. Ev - Kökler", content: `📍 4. Ev "Kökler ve Aile"\n\nAile kökenleriniz, çocukluk deneyimleriniz, ev ve yuva kavramı. Duygusal güvenliğiniz ve içinizdeki "çocuk".\n\nAnahtar: Anne/baba, çocukluk, iç dünya` },
      { title: "5. Ev - Yaratıcılık", content: `📍 5. Ev "Yaratıcılık ve Aşk"\n\nYaratıcılık, çocuklar, romantik aşk, eğlence ve hobiler. Kendinizi ifade etme biçiminiz.\n\nAnahtar: Çocuklar, sevgi, yaratıcılık` },
      { title: "6. Ev - Hizmet", content: `📍 6. Ev "Hizmet ve Sağlık"\n\nGünlük işler, hizmet etme, sağlık ve beslenme, iş arkadaşları ve evcil hayvanlar.\n\nAnahtar: İş, sağlık, rutin` },
      { title: "7. Ev - İlişkiler", content: `📍 7. Ev "İlişkiler ve Ortaklıklar"\n\nYakın ilişkiler, evlilik, iş ortaklıkları ve "sen olmayan diğer" ile olan bağınız.\n\nAnahtar: Evlilik, ortaklıklar` },
      { title: "8. Ev - Dönüşüm", content: `📍 8. Ev "Dönüşüm ve Paylaşım"\n\nDönüşüm, cinsellik, ölüm ve yeniden doğuş, miras ve borçlar. En derin korkularınızla yüzleşme alanı.\n\nAnahtar: Cinsellik, ölüm, miras` },
      { title: "9. Ev - Felsefe", content: `📍 9. Ev "Felsefe ve Macera"\n\nYüksek eğitim, felsefe, inanç sistemleri, uzun seyahatler ve yabancı kültürler.\n\nAnahtar: Yüksek eğitim, seyahat, inanç` },
      { title: "10. Ev - Kariyer", content: `📍 10. Ev "Kariyer ve Toplumsal Konum"\n\nKariyer, toplumsal itibar ve "dünyaya bırakmak istediğiniz miras".\n\nAnahtar: Kariyer, itibar, dışsal başarı` },
      { title: "11. Ev - Topluluk", content: `📍 11. Ev "Topluluk ve Ütopyalar"\n\nArkadaşlar, sosyal çevre, umutlar ve hayaller, insanlık ve kolektif bilinç.\n\nAnahtar: Arkadaşlar, umutlar, gruplar` },
      { title: "12. Ev - Bilinçaltı", content: `📍 12. Ev "Bilinçaltı ve Ruh"\n\nBilinçaltı, gizli düşmanlar, kapanmış kavşaklar ve ruhsal dönüşüm. En derin büyümenin gerçekleştiği yer.\n\nAnahtar: Bilinçaltı, gizli düşmanlar` },
    ],
  },
  {
    id: 3,
    title: "Sahnelerdeki Aktörler",
    subtitle: "Gezegenler",
    icon: Sun,
    color: "from-yellow-500 to-amber-600",
    sections: [
      { title: "Güneş - Bilinç", content: `🪐 Güneş ☉\n\nBilinç, ego, yaşam enerjisi, kimlik. "Ne istiyorum?" sorusunun cevabı. Haritanın kalbi.\n\nYönetir: Aslan` },
      { title: "Ay - Duygular", content: `🪐 Ay ☽\n\nBilinçaltı, duygular, iç dünya, güvenlik ihtiyacı. "Ne hissediyorum?" sorusunun cevabı.\n\nYönetir: Yengeç` },
      { title: "Merkür - Zihin", content: `🪐 Merkür ☿\n\nZihin, iletişim, öğrenme, analiz. "Nasıl düşünüyorum?" sorusunun cevabı.\n\nYönetir: İkizler, Başak` },
      { title: "Venüs - Değerler", content: `🪐 Venüs ♀\n\nDeğerler, sevgi, estetik, ilişkiler. "Ne seviyorum?" sorusunun cevabı.\n\nYönetir: Boğa, Terazi` },
      { title: "Mars - Eylem", content: `🪐 Mars ♂\n\nEylem, isteme, cesaret, cinsellik. "Nasıl harekete geçerim?"\n\nYönetir: Koç, Akrep` },
      { title: "Jüpiter - Şans", content: `🪐 Jüpiter ♃\n\nŞans, genişleme, inanç, felsefe. "Neye inanıyorum?"\n\nYönetir: Yay, Balık` },
      { title: "Satürn - Disiplin", content: `🪐 Satürn ♄\n\nDisiplin, sınırlar, yapı, olgunluk. "Neden sorumluluk almalıyım?"\n\nYönetir: Oğlak, Kova` },
      { title: "Kolektif Gezegenler", content: `🌟 URANÜS: Devrim, yenilik, özgürlük (7 yılda bir değişir)\n\n🌊 NEPTÜN: İllüzyon, hayaller, spiritüellik (14 yılda bir değişir)\n\n💀 PLÜTON: Dönüşüm, yıkım, yeniden doğuş (20 yılda bir değişir)\n\nBunlar nesiller arası etki taşır.` },
    ],
  },
  {
    id: 4,
    title: "Aktörlerin Kostümleri",
    subtitle: "Burçlar",
    icon: Star,
    color: "from-violet-500 to-purple-600",
    sections: [
      { title: "4 Element", content: `🔥 ATEŞ: Koç, Aslan, Yay\nEnerji, tutku, yaratıcılık\n\n🌍 TOPRAK: Boğa, Başak, Oğlak\nPratiklik, güvenilirlik\n\n💨 HAVA: İkizler, Terazi, Kova\nZihinsel aktivite, iletişim\n\n🌊 SU: Yengeç, Akrep, Balık\nDuygular, sezgi, bağ` },
      { title: "3 Nitelik", content: `🔥 KARDİNAL: Koç, Yengeç, Terazi, Oğlak\nBaşlatıcı, öncü\n\n🌟 SABIT: Boğa, Aslan, Akrep, Kova\nDirençli, kararlı\n\n🔄 DEĞİŞKEN: İkizler, Başak, Yay, Balık\nUyumlu, esnek` },
      { title: "Ateş Burçları", content: `🧭 KOÇ ♈\nAteş - Kardinal\nÖncü, cesur, spontan\n\n🧭 ASLAN ♌\nAteş - Sabit\nYaratıcı, cömert, dramatik\n\n🧭 YAY ♐\nAteş - Değişken\nMaceracı, optimist, felsefeci` },
      { title: "Toprak Burçları", content: `🧭 BOĞA ♉\nToprak - Sabit\nİnatçı, sadık, pratik\n\n🧭 BAŞAK ♍\nToprak - Değişken\nAnalitik, düzenli, hizmet odaklı\n\n🧭 OĞLAK ♑\nToprak - Kardinal\nDisiplinli, kariyer odaklı` },
      { title: "Hava Burçları", content: `🧭 İKİZLER ♊\nHava - Değişken\nMeraklı, iletişimci, çok yönlü\n\n🧭 TERAZİ ♎\nHava - Kardinal\nUyumlu, estetik, diplomatik\n\n🧭 KOVA ♒\nHava - Sabit\nBağımsız, yenilikçi, insancıl` },
      { title: "Su Burçları", content: `🧭 YENGEÇ ♋\nSu - Kardinal\nKoruyucu, duygusal\n\n🧭 AKREP ♏\nSu - Sabit\nYoğun, dönüştürücü\n\n🧭 BALIK ♓\nSu - Değişken\nSezgisel, rüyalar, spiritüel` },
    ],
  },
  {
    id: 5,
    title: "Dinamik Enerji Ağları",
    subtitle: "Açılar",
    icon: Atom,
    color: "from-rose-500 to-pink-600",
    sections: [
      { title: "Açı Nedir?", content: `Açılar, gezegenler arasındaki "açısal mesafelerdir". İki gezegen belirli bir açıyla birbirine baktığında, aralarında bir "diyalog" kurulur.

🎯 Orbs (Hata Payı):\n- Kavuşum: 0-10°\n- Kare/Karşıt: 0-8°\n- Üçgen: 0-8°\n- Sekstil: 0-6°` },
      { title: "Kavuşum (0°)", content: `☌ KAVUŞUM\n\nİki gezegen aynı noktada. En yoğun açı - iki enerji birleşir.\n\nDoğa: Birleştirici, yoğun\n\nÖrnek: Venüs-Mars Kavluşumu = Tutkulu birleşme` },
      { title: "Sekstil (60°)", content: `⚺ SEKSTİL\n\n60° açı. Fırsat penceresi - enerji akışı kolay ama harekete geçmezsen kaçabilir.\n\nDoğa: Fırsat, potansiyel\n\nÖrnek: Merkür-Jüpiter Sekstili = Öğrenme kolaylığı` },
      { title: "Kare (90°)", content: `□ KARE\n\n90° açı. Gerilim ve zorluk - iki enerji birbiriyle çatışıyor gibi.\n\nDoğa: Zorlayıcı, büyüten\n\nÖNEMLİ: Kare "kötü" DEĞİLDİR! Bu gerilim BÜYÜME için itiş gücüdür!` },
      { title: "Üçgen (120°)", content: `△ ÜÇGEN\n\n120° açı. En rahat açı - enerji doğal akış halinde.\n\nDoğa: Akışkan, kolaylaştırıcı\n\nÖrnek: Güneş-Satürn Üçgeni = Disiplin ile özgüven arasında doğal uyum` },
      { title: "Karşıt (180°)", content: `☍ KARŞIT\n\n180° açı. Zıt kutuplar - dışarıda aradığımız enerji.\n\nDoğa: Tamamlayıcı, çekici\n\nÖrnek: Güneş-Marte Karşıt = Dışarıda güçlü kişileri çekmek ama aslında bu enerji sende de var` },
    ],
  },
  {
    id: 6,
    title: "Pratik Harita Okuma",
    subtitle: "Sıra Sende",
    icon: Target,
    color: "from-cyan-500 to-blue-600",
    sections: [
      { title: "Harita Okuma Adımları", content: `📋 ADIM 1: TEMEL BİLGİLER\n• Yükselen burç\n• Güneş burcu\n• Ay burcu\n\n📋 ADIM 2: ELEMENT DAĞILIMI\n• Hangi element ağır?\n• Hangi element eksik?\n\n📋 ADIM 3: GEZEGENLERİN YERLEŞİMİ\n• Hangi gezegen hangi evde?\n• Güçlü/zayıf konumlar\n\n📋 ADIM 4: AÇILAR\n• Hangi önemli açılar var?` },
      { title: "Transitler", content: `Transitler, şu anda gökyüzünde olan geçişlerdir:

🌟 SATÜRN TRANSİTİ (2-3 yıl): Olgunlaşma, sınırlar\n\n🌟 ÜÇLÜ TRANSİT (1 yıl): Şans ve fırsat\n\n🌟 PLÜTON TRANSİT (15-20 yıl): Köklü dönüşüm

NOT: Transitler "kader" değil FIRSAT'tır!` },
      { title: "Evrimsel Astroloji", content: `🌙 KUZEY DÜĞÜM: Bu yaşamda büyümen gereken yön\n\n🌑 GÜNEY DÜĞÜM: Geçmişten getirdiğin kalıplar\n\nÖNEMLİ: Bu "borç" DEĞİL - bu TECRÜBE etme yolun!` },
      { title: "Son Söz", content: `🌟 ASTROLOJİ BİR BİLİMDİR\n  Matematik ve gözlem üzerine kuruludur.\n\n🌟 ASTROLOJİ BİR SANATTIR\n  Yorumlama ve sezgi gerektirir.\n\n🚀 SONRAKİ ADIMLAR:\n1. Kendi haritanızı inceleyin\n2. Bu quizleri çözün\n3. Sertifika alın!\n\n"Harita bir pusuladır, kader değil."` },
    ],
  },
];

const Certificate = ({ onClose, score }: { onClose: () => void; score: number }) => {
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const handleShare = (platform: string) => {
    const text = `🌟 AstraCastra Profesyonel Astroloji Okuryazarlığı Sertifikası\n\nBen bu eğitimden geçtim ve artık doğum haritamı okuyabiliyorum!\n\n#AstraCastra #AstrolojiEğitimi #KozmikNavigasyon`;
    
    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'instagram') {
      alert('Instagram için: Sertifikayı indirebilir veya ekran görüntüsü alabilirsiniz!');
    }
  };

  const handleDownload = () => {
    alert('Sertifikayı ekran görüntüsü olarak kaydedebilirsiniz!\n\nEkran görüntüsü almak için:\n- Windows: Windows tuşu + Shift + S\n- Mac: Command + Shift + 4');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText('AstraCastra - Kozmik Navigasyon Eğitimini Tamamladım!');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
    >
      <div className="max-w-lg w-full">
        <div ref={certRef} className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 rounded-3xl p-8 border-2 border-amber-400/50 shadow-2xl">
          {/* Certificate Header */}
          <div className="text-center mb-6">
            <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-2" />
            <h1 className="text-2xl font-display text-white mb-1">AstraCastra</h1>
            <p className="text-amber-400/80 text-sm">Kozmik Okuryazarlık Okulu</p>
          </div>

          {/* Certificate Body */}
          <div className="text-center mb-6">
            <p className="text-white/60 text-sm mb-2">Bu belgeyle</p>
            <h2 className="text-xl font-display text-white mb-4">Profesyonel Astroloji Okuryazarlığı</h2>
            <div className="w-20 h-20 mx-auto mb-4">
              <Award className="w-full h-full text-amber-400" />
            </div>
            <p className="text-white/80 text-sm mb-4">
              "Doğum haritasını okuma, 12 evi, gezegenleri, burçları ve açıları anlama, astrolojinin felsefi temellerini kavrama yetkinliğine sahiptir."
            </p>
            <p className="text-indigo-300/60 text-xs">
              Test Skoru: {score}/10
            </p>
          </div>

          {/* Certificate Footer */}
          <div className="border-t border-white/10 pt-4 flex justify-between items-center">
            <div className="text-left">
              <p className="text-white/40 text-xs">Tarih</p>
              <p className="text-white/60 text-sm">{new Date().toLocaleDateString('tr-TR')}</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs">Eğitim</p>
              <p className="text-white/60 text-sm">Kozmik Navigasyon</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <Button
            onClick={handleDownload}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500"
          >
            <Download className="w-4 h-4 mr-2" /> İndir
          </Button>
          <Button
            onClick={() => setShareOpen(!shareOpen)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500"
          >
            <Share2 className="w-4 h-4 mr-2" /> Paylaş
          </Button>
        </div>

        {/* Share Options */}
        {shareOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-white/10 rounded-xl p-4"
          >
            <p className="text-white/60 text-xs mb-3">Nerede paylaşmak istersin?</p>
            <div className="flex gap-2">
              <Button
                onClick={() => handleShare('facebook')}
                className="flex-1 bg-blue-600 hover:bg-blue-500"
              >
                <Facebook className="w-4 h-4 mr-1" /> Facebook
              </Button>
              <Button
                onClick={() => handleShare('twitter')}
                className="flex-1 bg-sky-500 hover:bg-sky-400"
              >
                <Twitter className="w-4 h-4 mr-1" /> X
              </Button>
              <Button
                onClick={() => handleShare('instagram')}
                className="flex-1 bg-pink-600 hover:bg-pink-500"
              >
                <Instagram className="w-4 h-4 mr-1" /> Instagram
              </Button>
            </div>
            <Button
              onClick={handleCopy}
              variant="outline"
              className="w-full mt-2 border-white/20 text-white hover:bg-white/10"
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? 'Kopyalandı!' : 'Linki Kopyala'}
            </Button>
          </motion.div>
        )}

        <Button
          onClick={onClose}
          variant="ghost"
          className="w-full mt-4 text-white/60 hover:text-white"
        >
          Kapat
        </Button>
      </div>
    </motion.div>
  );
};

const Quiz = ({ module, onComplete, onSkip }: { module: number; onComplete: (score: number) => void; onSkip: () => void }) => {
  const quiz = QUIZZES.find(q => q.module === module);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  if (!quiz) return null;

  const q = quiz.questions[currentQ];

  const handleAnswer = (idx: number) => {
    setSelected(idx);
    if (idx === q.correct) {
      setScore(s => s + 1);
    }
    setTimeout(() => {
      if (currentQ < quiz.questions.length - 1) {
        setCurrentQ(c => c + 1);
        setSelected(null);
      } else {
        setShowResult(true);
      }
    }, 800);
  };

  if (showResult) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-card/90 to-card/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 mb-4 text-center"
      >
        <PartyPopper className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h3 className="text-xl font-display text-white mb-2">Modül {module} Tamamlandı!</h3>
        <p className="text-indigo-300 mb-4">Skorun: {score}/{quiz.questions.length}</p>
        <div className="flex gap-2">
          <Button onClick={() => onComplete(score)} className="flex-1 bg-emerald-600">
            Devam Et
          </Button>
          <Button onClick={onSkip} variant="outline" className="flex-1 border-white/20 text-white">
            Atla
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-card/90 to-card/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 mb-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">Modül {module} Quiz</h3>
        <span className="text-indigo-300/60 text-xs">{currentQ + 1}/{quiz.questions.length}</span>
      </div>

      <p className="text-white mb-4">{q.q}</p>

      <div className="space-y-2">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(idx)}
            disabled={selected !== null}
            className={`w-full p-3 rounded-xl text-left text-sm transition-all ${
              selected === idx
                ? idx === q.correct
                  ? "bg-emerald-600 text-white"
                  : "bg-red-600 text-white"
                : selected !== null && idx === q.correct
                  ? "bg-emerald-600/50 text-white"
                  : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

const FinalTest = ({ onComplete }: { onComplete: (score: number) => void }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const q = FINAL_QUIZ.questions[currentQ];

  const handleAnswer = (idx: number) => {
    setSelected(idx);
    if (idx === q.correct) {
      setScore(s => s + 1);
    }
    setTimeout(() => {
      if (currentQ < FINAL_QUIZ.questions.length - 1) {
        setCurrentQ(c => c + 1);
        setSelected(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  if (showResult) {
    const passed = score >= 7;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-card/90 to-card/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 mb-4 text-center"
      >
        {passed ? (
          <>
            <Award className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h3 className="text-xl font-display text-white mb-2">Tebrikler!</h3>
            <p className="text-emerald-400 mb-2">Sertifika Almaya Hak Kazandın!</p>
          </>
        ) : (
          <>
            <Sparkles className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
            <h3 className="text-xl font-display text-white mb-2">Başarısız!</h3>
            <p className="text-indigo-300 mb-2">Daha fazla çalışmalısın</p>
          </>
        )}
        <p className="text-indigo-300/60 mb-4">Skorun: {score}/{FINAL_QUIZ.questions.length}</p>
        <Button onClick={() => onComplete(score)} className={passed ? "bg-amber-600" : "bg-indigo-600"}>
          {passed ? "Sertifikayı Al" : "Tekrar Dene"}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-card/90 to-card/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 mb-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">Final Sınavı</h3>
        <span className="text-indigo-300/60 text-xs">{currentQ + 1}/{FINAL_QUIZ.questions.length}</span>
      </div>

      <div className="w-full h-2 bg-white/10 rounded-full mb-4 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-amber-500 to-purple-500 transition-all duration-300"
          style={{ width: `${((currentQ + 1) / FINAL_QUIZ.questions.length) * 100}%` }}
        />
      </div>

      <p className="text-white mb-4">{q.q}</p>

      <div className="space-y-2">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(idx)}
            disabled={selected !== null}
            className={`w-full p-3 rounded-xl text-left text-sm transition-all ${
              selected === idx
                ? idx === q.correct
                  ? "bg-emerald-600 text-white"
                  : "bg-red-600 text-white"
                : selected !== null && idx === q.correct
                  ? "bg-emerald-600/50 text-white"
                  : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

const AstroEdu = () => {
  const [currentModule, setCurrentModule] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showFinal, setShowFinal] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [quizScore, setQuizScore] = useState<Record<number, number>>({});

  const module = MODULES[currentModule];
  const totalSections = module.sections.length;
  const isLastSection = currentSection === totalSections - 1;
  const isLastModule = currentModule === MODULES.length - 1;

  const nextSection = () => {
    if (isLastModule) {
      setShowFinal(true);
      return;
    }
    
    if (isLastSection) {
      if (!completedModules.includes(currentModule)) {
        setCompletedModules([...completedModules, currentModule]);
      }
      setShowQuiz(true);
      return;
    }
    
    setCurrentSection(currentSection + 1);
  };

  const handleQuizComplete = (score: number) => {
    setQuizScore({ ...quizScore, [currentModule + 1]: score });
    setShowQuiz(false);
    if (!isLastModule) {
      setCurrentModule(currentModule + 1);
      setCurrentSection(0);
    }
  };

  const handleQuizSkip = () => {
    setShowQuiz(false);
    if (!isLastModule) {
      setCurrentModule(currentModule + 1);
      setCurrentSection(0);
    }
  };

  const handleFinalComplete = (score: number) => {
    setFinalScore(score);
    if (score >= 7) {
      setShowCertificate(true);
    }
    setShowFinal(false);
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
    setShowQuiz(false);
    setShowFinal(false);
    setShowCertificate(false);
    setQuizScore({});
  };

  const moduleProgress = ((currentModule + (isLastSection ? 1 : 0)) / MODULES.length) * 100;

  return (
    <div className="min-h-screen pb-20 relative theme-insight overflow-hidden">
      <motion.div 
        className="fixed inset-0 z-0"
        animate={{
          background: showCertificate 
            ? 'radial-gradient(ellipse at 50% 0%, #065f46 0%, #0a0a1a 50%, #05050a 100%)'
            : showFinal 
              ? 'radial-gradient(ellipse at 50% 0%, #7c2d12 0%, #0a0a1a 50%, #05050a 100%)'
              : `radial-gradient(ellipse at 50% 0%, ${completedModules.includes(currentModule) ? '#065f46' : '#1e1b4b'} 0%, #0a0a1a 50%, #05050a 100%)`
        }}
        transition={{ duration: 1.5 }}
      />

      <AnimatePresence>
        {showQuiz && (
          <Quiz 
            module={currentModule + 1} 
            onComplete={handleQuizComplete}
            onSkip={handleQuizSkip}
          />
        )}

        {showFinal && (
          <div className="relative z-10 px-4 pt-6 max-w-2xl mx-auto">
            <FinalTest onComplete={handleFinalComplete} />
            <Button
              onClick={() => setShowFinal(false)}
              variant="ghost"
              className="w-full text-white/60"
            >
              İptal
            </Button>
          </div>
        )}

        {showCertificate && (
          <Certificate onClose={() => setShowCertificate(false)} score={finalScore} />
        )}
      </AnimatePresence>

      {!showQuiz && !showFinal && !showCertificate && (
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
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-xl font-display text-white">
                    Kozmik Navigasyon
                  </h1>
                  <p className="text-indigo-300/60 text-xs">
                    Modül {currentModule + 1}/{MODULES.length} • Bölüm {currentSection + 1}/{totalSections}
                  </p>
                </div>
                <button
                  onClick={resetProgress}
                  className="p-2 rounded-lg bg-white/10 text-indigo-300 hover:bg-white/20"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Progress */}
              <div className="w-full h-1 bg-white/10 rounded-full mb-4 overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-amber-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${moduleProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Quiz Banner */}
              {isLastSection && !showQuiz && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 border border-amber-500/30 rounded-xl p-3 mb-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-amber-200 text-sm">Modül {currentModule + 1} Testi</p>
                    <p className="text-amber-300/60 text-xs">Bilgilerini test et!</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => setShowQuiz(true)}
                    className="bg-amber-600 hover:bg-amber-500"
                  >
                    Başla
                  </Button>
                </motion.div>
              )}

              {/* Module Card */}
              <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md rounded-2xl border border-white/10 p-5 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center shadow-lg`}>
                    <module.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display text-white">{module.title}</h2>
                    <p className="text-indigo-300/70 text-xs">{module.subtitle}</p>
                  </div>
                  {completedModules.includes(currentModule) && quizScore[currentModule + 1] !== undefined && (
                    <div className="ml-auto text-right">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <p className="text-emerald-400/60 text-xs">{quizScore[currentModule + 1]}/3</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 rounded-md bg-white/10 text-indigo-300 text-xs font-medium">
                    {currentSection + 1}/{totalSections}
                  </span>
                  <h3 className="text-white font-medium">{module.sections[currentSection].title}</h3>
                </div>

                <div className="text-indigo-100/80 text-sm leading-relaxed whitespace-pre-line">
                  {module.sections[currentSection].content}
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
                  {isLastModule ? (
                    <>Finale Git <Crown className="w-4 h-4 ml-1" /></>
                  ) : (
                    <>İleri <ChevronRight className="w-4 h-4 ml-1" /></>
                  )}
                </Button>
              </div>

              {/* Module Dots */}
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

              {/* Info Box */}
              <div className="mt-6 bg-amber-900/20 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-amber-400 mt-0.5" />
                  <div>
                    <p className="text-amber-200/80 text-xs font-medium mb-1">Eğitim ipucu</p>
                    <p className="text-amber-300/60 text-xs">
                      Her modül sonunda quiz var. Finalde %70 alan sertifika alır!
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default AstroEdu;
