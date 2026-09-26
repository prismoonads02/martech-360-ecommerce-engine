function main() {
  Logger.log("🚀 Google Ads İstemcisi Başlatıldı...");
  
  try {
    const accountCurrency = AdsApp.currentAccount().getCurrencyCode();
    const accountName = AdsApp.currentAccount().getName(); // HESAP ADI BURADA ÇEKİLİYOR
    
    const productDataArray = AdsDataService.fetchShoppingData(CONFIG.PERIOD, CONFIG.MIN_CLICKS);
    
    if (productDataArray.length === 0) {
      Logger.log("ℹ️ Kriterlere uyan ürün bulunamadı.");
      return;
    }
    
    Logger.log(`📦 ${productDataArray.length} ürün bulundu. Fire and Forget mimarisi ile fırlatılıyor...`);
    
    const payload = {
      accountName: accountName, // SUNUCUYA HESAP ADI EKLENDİ
      currency: accountCurrency,
      products: productDataArray
    };
    
    ApiClient.sendPayload(CONFIG.WEB_APP_URL, payload);
    
  } catch (error) {
    Logger.log(`❌ KRİTİK HATA (Main): ${error.message}`);
  }
}