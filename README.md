# 🌙 AstraCastra / MANTAR

**Doğum haritası, rüya analizi ve AI mentorluk bir arada.**

---

## 🌟 Vizyon

AstraCastra, astroloji ve bilinçaltı bilimini birleştiren, tamamen organik ve özgün bir kozmik deneyim sunmayı hedefleyen bir platformdur.

**Temel Değerler:**
- 🔮 Astroloji sadece eğlence değil, kişisel gelişim aracıdır
- 🧠 Rüyalar bilinçaltımızın kapısıdır - bilimsel ve spiritüel perspektif birleşir
- 🤖 Yapay zeka bir araçtır - insan gibi, sıcak ve samimi
- 🌱 Organik ve özgün deneyim - kopyalanamaz

**Hedef Kitle:**
- Kendini tanımak isteyenler
- Spiritüel yolculuğunda ilerleyenler
- Astroloji meraklıları
- Rüya günlüğü tutanlar

---

## ✨ Özellikler

### ✓ Mevcut Özellikler

#### 1. Doğum Haritası Hesaplama
- **Placidus ev sistemi** - Geleneksel ve en yaygın kullanılan ev sistemi
- **Tüm gezegenler** - Güneş, Ay, Merkür, Venüs, Mars, Jüpiter, Satürn, Uranüs, Neptün, Plüton
- **Noktalar** - Ascendant (Yükselen), MC (Yıldızlar), Chiron, Lilith, North Node, South Node, Vertex
- **Doğru timezone hesaplama** - Türkiye için DST (Yaz Saati/Kış Saati) dahil
- **Coğrafi konum** - OpenStreetMap API ile otomatik enlem/boylam bulma

#### 2. "Ben Kimim?" Kimlik Kartı
- Yapay zeka destekli karakter analizi
- Doğum haritasına dayalı kişisel tanım
- Güneş, Ay ve Yükselen burçlarının detaylı yorumu
- Element dengesi analizi
- Paylaşılabilir format (Instagram Story, WhatsApp, Telegram)
- 1000+ karakter uzunluğunda detaylı profil

#### 3. Karmik Eşleştirme (Karmic Match)
- İki kişinin doğum haritası uyumu analizi
- Gezegenlerin birbirleriyle açıları (kare, trigon, konjunksiyon, vs.)
- İlişki potansiyeli skoru
- AI destekli yorum

#### 4. Rüya Günlüğü (Dreams)
- Rüya kaydetme sistemi
- Rüya kategorileri
- AI destekli rüya yorumu
- Doğum haritası verileriyle bağlantı kurma
- Bireysel ve toplu rüya analizi

#### 5. MANTAR AI Mentor
- Doğum haritasına göre kişiselleştirilmiş sohbet
- Sıcak ve samimi ton
- Gerçekçi, klişe olmayan yorumlar
- Kısa ve etkili yanıtlar
- Her yanıtta soru ile sohbeti sürdürme

#### 6. Soul Chambers (Burç Salonları)
- Güneş burcuna göre topluluklar
- Her burç için özel oda
- Oda içi sohbet özelliği

#### 7. Profil Yönetimi
- Doğum tarihi ve yeri
- Meslek ve cinsiyet
- İlişki durumu
- Kişisel notlar

---

## 🚀 Geliştirme Geçmişi

### Yapılan Değişiklikler

| Tarih | Değişiklik | Yapan |
|-------|-------------|-------|
| 2026-02 | Doğum haritası hesaplama düzeltildi - Placidus ev sistemi ve Türkiye DST hesaplaması düzeltildi | Seibastian |
| 2026-02 | "Ben Kimim?" özelliği eklendi - AI destekli karakter analizi kartı | Seibastian |
| 2026-02 | Route düzeltmeleri - /karmic → /karmic-match | Seibastian |
| 2026-02 | Dashboard'da yerel hesaplama - Supabase Edge Function yerine tarayıcıda hesaplama | Seibastian |
| 2026-02 | Lovable referansları temizlendi - index.html'deki görseller ve meta tag'ler düzeltildi | Seibastian |
| 2026-02 | README.md detaylı doküman eklendi | Seibastian |
| 2026-02 | GitHub reposu oluşturuldu ve tüm kodlar yüklendi | Seibastian |

---

## 👥 Ekip

### Kurucular
- **Seibastian** - Kurucu & Frontend Geliştirici
- **Sebo777** - Kurucu & Tasarımcı

### Destekçiler
- Lovable (Platform desteği)
- Supabase (Altyapı)
- Astronomy Engine (Astroloji hesaplamaları)

---

## 🔧 Teknik Altyapı

### Frontend
- **React 18** - UI framework
- **TypeScript** - Tip güvenli kod
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animasyonlar
- **Shadcn/UI** - Component library

### Backend
- **Supabase**
  - Authentication (Email/Password, OAuth)
  - Database (PostgreSQL)
  - Edge Functions (Serverless)
  - Storage (Dosya yükleme)
- **Astronomy Engine** - Astroloji hesaplamaları
- **OpenStreetMap API** - Coğrafi konum bulma

### AI Mimarisi
- **Mevcut:** Google Gemini 3 Flash (Lovable gateway üzerinden)
- **Gelecek:** Claude API veya OpenAI entegrasyonu planlanıyor
- **Yapı:** Supabase Edge Functions üzerinden çalışır
- **Prompt Engineering:** Doğum haritası verileriyle kişiselleştirilmiş yanıtlar

---

## 📋 Yapılacaklar / Roadmap

### Kısa Vadede (1-3 ay)
- [ ] Rüya analizi geliştirme
  - [ ] Toplu rüya analizi
  - [ ] Rüya motifleri takibi
  - [ ] AI yorum kalitesi artırma
- [ ] "Ben Kimim?" kartı iyileştirmesi
  - [ ] Daha detaylı prompt
  - [ ] Farklı format seçenekleri
- [ ] PWA yapısı
  - [ ] Service worker
  - [ ] Offline destek
  - [ ] Mobil app olarak yükleme
- [ ] Push bildirimleri
- [ ] Sosyal paylaşım optimizasyonu

### Orta Vadede (3-6 ay)
- [ ] Tam kullanıcı eşleştirme sistemi
  - [ ] Beğeni/kaçınma sistemi
  - [ ] Mesajlaşma
  - [ ] Profil ziyaretleri
- [ ] Ruh ailesi salonları
  - [ ] Burç dışında kriterler (Ay, yükselen, element)
  - [ ] Topluluk özellikleri
- [ ] MANTAR AI kişiselleştirme
  - [ ] Uzun konuşma belleği
  - [ ] Kullanıcı tercihleri öğrenme
  - [ ] Kişisel asistan özellikleri
- [ ] Premium içerikler
  - [ ] Detaylı PDF raporları
  - [ ] Transit analizleri
  - [ ] Günlük/haftalık yorumlar

### Uzun Vadede (6-12 ay)
- [ ] Kendi AI modelini eğitme
  - [ ] Özel astroloji verileri
  - [ ] Rüya sembolizmi veritabanı
  - [ ] Kişisel gelişim promptları
- [ ] Topluluk özellikleri
  - [ ] Forum
  - [ ] Blog yazarları
  - [ ] Uzman astrolojiciler
- [ ] API açma
  - [ ] Diğer uygulamalar için astroloji hizmeti
- [ ] Uluslararasılaştırma
  - [ ] English dil desteği
  - [ ] Diğer diller

---

## 🔌 AI Entegrasyonu

### Mevcut Durum
AI, Lovable'ın gateway'i üzerinden Google Gemini 3 Flash kullanıyor. Bu:
- Kolay kurulum sağlıyor
- Bedava (sınırlı)
- Ama Lovable'a bağımlılık oluşturuyor

### Değiştirmek İstersen

**1. OpenAI (GPT-4):**
```typescript
// supabase/functions/cosmic-mentor/index.ts
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "gpt-4",
    messages: aiMessages,
  }),
});
```

**2. Anthropic (Claude):**
```typescript
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
    "anthropic-version": "2023-06-01",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "claude-3-opus-20240229",
    max_tokens: 1024,
    messages: aiMessages,
  }),
});
```

**3. Kendi Server'ını Kur:**
```typescript
// Kendi Node.js/Python server'ını kur
// Docker container olarak deploy et
// Supabase'den o server'a yönlendir
```

---

## 🛠️ Kurulum (Geliştirme İçin)

```bash
# Repo'yu klonla
git clone https://github.com/Seibastian/astroseby.git
cd astroseby

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusu başlat
npm run dev

# Build yap
npm run build
```

### Environment Variables
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJxxx
```

---

## 🔐 Güvenlik

- Tüm kullanıcı verileri Supabase tarafından şifreleniyor
- Authentication Supabase Auth ile yönetiliyor
- Row Level Security (RLS) aktif
- API key'ler environment variable'larda saklanıyor

---

## 📊 Veritabanı Şeması

### profiles
| Alan | Tip | Açıklama |
|------|-----|----------|
| user_id | uuid | Kullanıcı ID |
| name | text | İsim |
| nickname | text | Takma ad |
| email | text | E-posta |
| gender | text | Cinsiyet |
| profession | text | Meslek |
| relationship_status | text | İlişki durumu |
| date_of_birth | date | Doğum tarihi |
| birth_time | time | Doğum saati |
| birth_place | text | Doğum yeri |
| sun_sign | text | Güneş burcu |
| moon_sign | text | Ay burcu |
| rising_sign | text | Yükselen burcu |

### dreams
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | uuid | Rüya ID |
| user_id | uuid | Kullanıcı ID |
| title | text | Rüya başlığı |
| content | text | Rüya detayı |
| category | text | Kategori |
| created_at | timestamp | Oluşturulma tarihi |

### syntheses
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | uuid | Sentez ID |
| user_id | uuid | Kullanıcı ID |
| content | text | AI yorumu |
| dream_id | uuid | İlişkili rüya |

---

## 🤝 Katkıda Bulunma

1. Fork'la
2. Branch oluştur (`git checkout -b ozellik/ozellik-adi`)
3. Değişiklikleri commit et (`git commit -m 'Özellik eklendi'`)
4. Push et (`git push origin ozellik/ozellik-adi`)
5. Pull Request aç

---

## 📜 Lisans

MIT License - Tüm hakları saklıdır.

---

## 🔗 Linkler

- **Web:** astroseby.app
- **GitHub:** github.com/Seibastian/astroseby
- **Destek:** support@astroseby.app

---

## 💌 İletişim

Sorular, öneriler ve iş birlikleri için:
- **E-posta:** hello@astroseby.app
- **Sosyal Medya:** @AstroRuya

---

## 📝 Son Not

Bu proje, astrolojinin sadece eğlence olmadığını, gerçek bir kişisel gelişim aracı olabileceğini göstermek için yapılmıştır. Rüyalarımız bilinçaltımızın bize fısıldadığı mesajlardır. Doğum haritamız ise kozmosun bizlere verdiği haritadır.

Bu iki dünyayı birleştirerek, insanların kendilerini daha iyi tanımalarına ve gelişimlerine katkı sağlamayı hedefliyoruz.

---

**Seibastian & Sebo777**  
*Kozmik Yolculukta Birlikte*

---

*Son güncelleme: Şubat 2026 | AstraCastra v1.0*
