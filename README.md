# 📊 360° E-Commerce & Google Ads Intelligence Engine

Bu proje; **Google Ads (PMax & Alışveriş)**, **Google Merchant API (v1)** ve **Google Analytics 4 (GA4 Data API)** sistemlerini asenkron bir mikro-servis mimarisiyle birbirine bağlayan, ürün bazlı kârlılık ve dönüşüm hunisi (funnel) denetleyicisidir.

Klasik Google Ads raporlarının ötesine geçerek; reklam harcamasını, site içi kullanıcı davranışlarını (İnceleme ➔ Sepet ➔ Satış) ve çok kanallı (Halo/Destek) gelir etkisini tek bir yönetici konsolunda birleştirir.

---

## 🏗️ Sistem Mimarisi (Microservice & Asynchronous Queue)

Sistem, Google Ads komut dosyalarının 30 dakikalık ve Google Apps Script'in 6 dakikalık çalışma sınırlarını (Timeout) aşmak ve **90.000+ ürünlük katalogları** güvenle işleyebilmek için **"Fire and Forget" (Mesaj Kuyruğu)** mimarisiyle tasarlanmıştır.

```text
[ Google Ads Client ] 
       │ (Harcama & Tıklama Verisi Toplama - ES6)
       ▼ (HTTP POST / JSON Payload)
[ Google Sheets Web App (doPost) ] 
       │ (Kuyruğa Yazma: Sys_Queue)
       ▼ (1 sn sonra Tetiklenen Bağımsız İşçi)
[ Background Worker Engine ]
       ├──▶ Google Merchant API (v1 REST) ➔ Güncel Fiyat & Ürün Başlıkları
       ├──▶ GA4 Data API (Advanced Service) ➔ 5 Kademeli E-Ticaret Hunisi & google/cpc Satışları
       └──▶ Analyzer & Decision Engine ➔ Doğrudan ROAS & Halo Etkisi Teşhisi
       │
       ▼ (Otomatik Biçimlendirme & Dashboard Üretimi)
[ Executive Performance Dashboard (Google Sheets) ]
