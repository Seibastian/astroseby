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

1. **Doğum Haritası Hesaplama**
   - Placidus ev sistemi
   - Tüm gezegenler ve noktalar
   - Doğru timezone hesaplama (DST dahil)

2. **"Ben Kimim?" Kimlik Kartı**
   - Yapay zeka destekli karakter analizi
   - Doğum haritasına dayalı kişisel tanım
   - Paylaşılabilir format

3. **Karmik Eşleştirme**
   - Doğum haritası uyumu analizi

4. **Rüya Günlüğü**
   - Rüya kaydetme
   - AI destekli rüya yorumu

5. **MANTAR AI Mentor**
   - Doğum haritasına göre kişiselleştirilmiş sohbet
   - Sıcak ve samimi ton

6. **Soul Chambers (Burç Salonları)**
   - Güneş burcuna göre topluluklar

---

## 🚀 Geliştirme Geçmişi

### Yapılan Değişiklikler

| Tarih | Değişiklik | Yapan |
|-------|-------------|-------|
| 2026-02 | Doğum haritası hesaplama düzeltildi (Placidus ev sistemi, Türkiye DST) | Musti |
| 2026-02 | "Ben Kimim?" özelliği eklendi | Musti |
| 2026-02 | Route düzeltmeleri (/karmic → /karmic-match) | Musti |
| 2026-02 | Dashboard'da yerel hesaplama (Supabase'e gerek yok) | Musti |
| 2026-02 | Lovable referansları temizlendi | Musti |

---

## 🔧 Teknik Altyapı

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Shadcn/UI

### Backend
- Supabase (Auth, Database, Edge Functions)
- Astronomy Engine (Astroloji hesaplamaları)
- OpenStreetMap API (Konum bulma)

### AI
- Mevcut: Google Gemini (Lovable gateway üzerinden)
- Gelecek: Claude API veya OpenAI entegrasyonu planlanıyor

---

## 📋 Yapılacaklar / Roadmap

### Kısa Vadede
- [ ] Rüya analizi geliştirme (bireysel + toplu)
- [ ] "Ben Kimim?" kartı AI iyileştirmesi
- [ ] PWA yapısı (mobil yükleme)
- [ ] Push bildirimleri

### Orta Vadede
- [ ] Tam kullanıcı eşleştirme sistemi
- [ ] Ruh ailesi salonları
- [ ] MANTAR AI kişiselleştirme (bellek, uzun konuşmalar)

### Uzun Vadede
- [ ] Kendi AI modelini eğitme (özel astroloji + rüya verileri)
- [ ] Premium içerikler (detaylı raporlar, PDF çıktıları)
- [ ] Topluluk özellikleri

---

## 🔌 Bağımlılıklar ve Değiştirilmesi Gerekenler

### AI Entegrasyonu
Mevcut AI Lovable'ın gateway'ini kullanıyor. Değiştirmek için:

```typescript
// supabase/functions/cosmic-mentor/index.ts
// satır 70:
// 'https://ai.gateway.lovable.dev/v1/chat/completions'
// yerine:
// OpenAI: 'https://api.openai.com/v1/chat/completions'
// Claude: 'https://api.anthropic.com/v1/messages'
```

### Environment Variables
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `LOVABLE_API_KEY` (Supabase secrets)

---

## 👤 Geliştirici

**Musti** - AstraCastra Kurucusu & Geliştirici

Tüm değişiklikler ve güncellemeler bu repo üzerinden yapılmaktadır.

---

## 📄 Lisans

MIT License

---

## 🔗 Linkler

- **Web:** astroseby.app
- **GitHub:** github.com/Seibastian/astroseby

---

*Son güncelleme: Şubat 2026*
