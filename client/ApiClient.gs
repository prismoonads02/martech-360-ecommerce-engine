const ApiClient = {
  sendPayload: function(url, payload) {
    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    try {
      // Fire and Forget: İsteği atar ve yanıtı saniyesinde alır.
      const response = UrlFetchApp.fetch(url, options);
      const httpCode = response.getResponseCode();
      const jsonResponse = JSON.parse(response.getContentText());
      
      if (httpCode === 200 && jsonResponse.statusCode === 200) {
        Logger.log(`✅ BAŞARILI: Veriler sunucu kuyruğuna yazıldı. (Ads İstemcisi Kapanıyor)`);
      } else {
        Logger.log(`⚠️ SUNUCU UYARISI: HTTP ${httpCode} - ${jsonResponse.message || 'Hata'}`);
      }
    } catch (e) {
      Logger.log(`❌ Bağlantı Hatası: ${e.message}`);
    }
  }
};