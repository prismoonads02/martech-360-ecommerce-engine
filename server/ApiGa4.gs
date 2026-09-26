/**
 * ApiGa4.gs
 * GA4 Servisi: E-Ticaret Dönüşüm Hunisi ve Google Ads Satış Kırılımı.
 */
const Ga4Api = {
  fetchData: function(propertyId) {
    const ga4Map = {};
    AppLogger.log(`GA4 API çağrısı başlatılıyor... Hedef ID: ${propertyId}`, "BİLGİ");
    
    // --- 1. SORGU: TÜM SİTE DÖNÜŞÜM HUNİSİ (TOTAL FUNNEL) ---
    try {
      const requestTotal = AnalyticsData.newRunReportRequest();
      requestTotal.dateRanges = [AnalyticsData.newDateRange()];
      requestTotal.dateRanges[0].startDate = "90daysAgo";
      requestTotal.dateRanges[0].endDate = "today";
      
      requestTotal.dimensions = [AnalyticsData.newDimension()];
      requestTotal.dimensions[0].name = "itemId"; 
      
      // 5 Kademeli E-ticaret Hunisi Metrikleri
      const m1 = AnalyticsData.newMetric(); m1.name = "itemsViewed";      // 1. Ürün İnceleme
      const m2 = AnalyticsData.newMetric(); m2.name = "itemsAddedToCart";  // 2. Sepete Ekleme
      const m3 = AnalyticsData.newMetric(); m3.name = "cartToViewRate";   // 3. Sepete Atma Oranı
      const m4 = AnalyticsData.newMetric(); m4.name = "itemsPurchased";   // 4. Toplam Satış Adedi
      const m5 = AnalyticsData.newMetric(); m5.name = "itemRevenue";      // 5. Toplam Ciro
      requestTotal.metrics = [m1, m2, m3, m4, m5];
      
      const respTotal = AnalyticsData.Properties.runReport(requestTotal, 'properties/' + propertyId);
      
      if (respTotal.rows) {
        respTotal.rows.forEach(row => {
          const itemId = row.dimensionValues[0].value;
          ga4Map[itemId] = {
            views: parseInt(row.metricValues[0].value, 10) || 0,
            carts: parseInt(row.metricValues[1].value, 10) || 0,
            cartRate: parseFloat(row.metricValues[2].value) || 0,
            totalPurchases: parseInt(row.metricValues[3].value, 10) || 0,
            totalRevenue: parseFloat(row.metricValues[4].value) || 0,
            adsPurchases: 0,
            adsRevenue: 0
          };
        });
        AppLogger.log(`GA4 Genel Huni Alındı. Ürün Sayısı: ${respTotal.rows.length}`, "BAŞARILI");
      }
    } catch (error) {
      AppLogger.log(`GA4 Genel Huni Hatası: ${error.message}`, "HATA");
      return ga4Map;
    }

    // --- 2. SORGU: SADECE GOOGLE ADS (google / cpc) SATIŞLARI ---
    try {
      const requestAds = AnalyticsData.newRunReportRequest();
      requestAds.dateRanges = [AnalyticsData.newDateRange()];
      requestAds.dateRanges[0].startDate = "90daysAgo";
      requestAds.dateRanges[0].endDate = "today";
      
      requestAds.dimensions = [AnalyticsData.newDimension()];
      requestAds.dimensions[0].name = "itemId"; 
      
      const mAds1 = AnalyticsData.newMetric(); mAds1.name = "itemsPurchased";
      const mAds2 = AnalyticsData.newMetric(); mAds2.name = "itemRevenue";
      requestAds.metrics = [mAds1, mAds2];
      
      const filter = AnalyticsData.newFilter();
      filter.fieldName = "sessionSourceMedium";
      filter.stringFilter = AnalyticsData.newStringFilter();
      filter.stringFilter.matchType = "CONTAINS";
      filter.stringFilter.value = "google / cpc";
      
      const filterExpr = AnalyticsData.newFilterExpression();
      filterExpr.filter = filter;
      requestAds.dimensionFilter = filterExpr;
      
      const respAds = AnalyticsData.Properties.runReport(requestAds, 'properties/' + propertyId);
      if (respAds.rows) {
        respAds.rows.forEach(row => {
          const itemId = row.dimensionValues[0].value;
          if (ga4Map[itemId]) {
            ga4Map[itemId].adsPurchases = parseInt(row.metricValues[0].value, 10) || 0;
            ga4Map[itemId].adsRevenue = parseFloat(row.metricValues[1].value) || 0;
          }
        });
        AppLogger.log(`GA4 Ads Kırılımı Alındı. Eşleşen Ürün: ${respAds.rows.length}`, "BAŞARILI");
      }
    } catch (error) {
      // Olası bir GA4 filtre kısıtında sistem çökmez; log atar ve genel huniyle güvenle devam eder.
      AppLogger.log(`GA4 Ads Kırılımı Filtrelenemedi (${error.message}). Genel huniyle devam ediliyor.`, "UYARI");
    }
    
    return ga4Map;
  }
};