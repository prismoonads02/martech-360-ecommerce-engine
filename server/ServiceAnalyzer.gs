/**
 * ServiceAnalyzer.gs
 * 18 Sütunlu Karar Destek ve Huni Analiz Motoru.
 */
const AnalyzerService = {
  mergeData: function(adsData, ga4Map, gmcMap) {
    const finalReport = [];
    
    for (const itemId in adsData) {
      const ad = adsData[itemId];
      const gm = gmcMap[itemId] || { title: "Bulunamadı / Pasif", price: 0 };
      const ga = ga4Map[itemId] || {
        views: 0,
        carts: 0,
        cartRate: 0,
        totalPurchases: 0,
        totalRevenue: 0,
        adsPurchases: 0,
        adsRevenue: 0
      };
      
      const ctr = ad.imp > 0 ? (ad.clicks / ad.imp) : 0;
      
      // Doğrudan Ürün ROAS (Google Ads Cirosu / Ads Harcaması)
      const directRoas = ad.cost > 0 ? (ga.adsRevenue / ad.cost) : 0;
      
      // --- KARAR DESTEK & TEŞHİS MOTORU ---
      let status = "Normal";
      let actionToTake = "İzlemeye Devam";
      
      if (directRoas >= 4.0) {
        status = "🟢 YILDIZ: Yüksek Kârlılık";
        actionToTake = "Bütçeyi Artır / Ayrı Kampanyaya Al";
      } else if (directRoas >= 1.5) {
        status = "🟢 KAZANÇLI: Hedef ROAS";
        actionToTake = "Performansı Koru / Takip Et";
      } else if (ad.cost > CONFIG.THRESHOLDS.COST && directRoas < 1.0) {
        if (ga.totalRevenue >= (ad.cost * 3.0)) {
          status = "🟡 UYARI: Destek (Halo) Etkisi";
          actionToTake = "Tamamen Kapatma / TBM Düşür";
        } else if (ga.carts > 0 && ga.totalPurchases === 0) {
          status = "🟡 UYARI: Sepette Terk Edildi";
          actionToTake = "Ödeme/Kargo Süreçlerini Kontrol Et";
        } else if (ga.views > 0 && ga.carts === 0) {
          status = "🔴 TEHLİKE: Sepete Ekleyen Yok";
          actionToTake = "Fiyat veya Açılış Sayfası Teklifi Zayıf";
        } else {
          status = "🔴 TEHLİKE: Kesin Zarar";
          actionToTake = "PMax/Alışveriş'ten Hariç Tut";
        }
      }
  
      // Tarih çıkarıldı, ad.conv eklendi (Tam 18 Sütun)
      finalReport.push([
        itemId,             // 1. Ürün ID
        gm.title,           // 2. Ürün Başlığı (GMC)
        gm.price,           // 3. Fiyat
        ad.imp,             // 4. Gösterim
        ad.clicks,          // 5. Tıklama
        ctr,                // 6. TO (CTR)
        ad.conv,            // 7. Ads Dönüşüm (YENİ EKLENDİ)
        ad.cost,            // 8. Ads Harcaması
        ga.views,           // 9. GA4 Ürün İnceleme
        ga.carts,           // 10. GA4 Sepete Ekleme
        ga.cartRate,        // 11. GA4 Sepete Atma Oranı
        ga.adsPurchases,    // 12. Google Ads Satış Adedi
        ga.adsRevenue,      // 13. Google Ads Cirosu
        directRoas,         // 14. Doğrudan Ürün ROAS
        ga.totalPurchases,  // 15. Toplam Satış Adedi
        ga.totalRevenue,    // 16. Toplam Ürün Cirosu
        status,             // 17. AI Durum Tespiti
        actionToTake        // 18. Önerilen Aksiyon
      ]);
    }
    
    // Harcamaya (ad.cost -> 7. indis) göre azalan sıralama
    return finalReport.sort((a, b) => b[7] - a[7]);
  }
};