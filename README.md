# Punto — Görev Planlayıcı

React ve Vite ile geliştirilmiş, görevleri tarayıcının `localStorage` alanında saklayan Türkçe bir görev planlama uygulaması.

## Özellikler

- Görev ekleme, listeleme, düzenleme, tamamlama ve silme
- İş, Eğitim ve Kişisel listeleri; yüksek, orta ve düşük öncelik seçenekleri
- Bugün, yaklaşan ve tamamlanan görev filtreleri; liste, öncelik ve tarih seçicileri
- Bitiş tarihi, öncelik veya ada göre sıralama
- Görev adı, notu ve listesinde arama
- Duyarlı masaüstü ve mobil arayüz
- `Ctrl + K` ile aramaya, `Ctrl + Enter` ile yeni görev formuna hızlı erişim
- İlk kullanımda düzenlenebilir örnek görevler; sonraki değişiklikler tarayıcıda saklanır ve yenilemede korunur
- Klavye ile erişilebilir görev formu ve hatalı kayıt verisi için doğrulama

## Çalıştırma

Node.js kurulu bir bilgisayarda proje klasöründe:

```bash
npm install
npm run dev
```

Üretim derlemesini oluşturup yerel olarak önizlemek için:

```bash
npm run build
npm run preview
```

Kod denetimi: `npm run lint`

## Proje yapısı

```text
src/
  Components/   # Görev satırı, görev formu ve ikonlar
  Pages/        # Görev planlayıcı ekranı ve stilleri
  App.jsx
  main.jsx
```

## Ekran görüntüsü

![Punto görev planlayıcı ekranı](./public/punto-screenshot.png)

Uygulama ek bir CSS kütüphanesi kullanmadan saf CSS ile stillendirilmiştir. Yayınlamak için `npm run build` komutuyla oluşan `dist` klasörünü Netlify'a yükleyebilir veya depoyu Netlify'a bağlayıp build komutunu `npm run build`, yayın klasörünü `dist` olarak ayarlayabilirsiniz.
