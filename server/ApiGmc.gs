/**
 * ApiGmc.gs
 * Google Merchant API v1 iletişim modülü (productAttributes Desteği ile)
 */
const GmcApi = {
  fetchData: function(merchantId) {
    const gmcMap = {};
    AppLogger.log(`GMC API çağrısı başlatılıyor... Hedef ID: ${merchantId}`, "BİLGİ");
    
    try {
      const token = ScriptApp.getOAuthToken();
      let pageToken = "";
      let hasNextPage = true;

      while (hasNextPage) {
        let url = `https://merchantapi.googleapis.com/products/v1/accounts/${merchantId}/products?pageSize=250`;
        if (pageToken) url += `&pageToken=${pageToken}`;

        const options = {
          method: "get",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          },
          muteHttpExceptions: true
        };

        const response = UrlFetchApp.fetch(url, options);
        const httpCode = response.getResponseCode();
        const jsonText = response.getContentText();
        const json = JSON.parse(jsonText);

        if (httpCode !== 200 || json.error) {
          AppLogger.log(`GMC API REDDETTİ! HTTP Kodu: ${httpCode} | Hata Detayı: ${jsonText}`, "HATA");
          break;
        }

        if (json.products) {
          json.products.forEach(product => {
            // YENİ MERCHANT API v1 KURALI: Nitelikler productAttributes içindedir!
            const attrs = product.productAttributes || {};
            
            // Başlık Okuma (Önce productAttributes içine, yoksa en üste bakar)
            let titleVal = attrs.title || product.title || "İsimsiz";

            // Fiyat Okuma (Micros cinsinden)
            let priceVal = 0;
            const priceObj = attrs.price || product.price;
            if (priceObj) {
              if (priceObj.amountMicros) {
                priceVal = parseFloat(priceObj.amountMicros) / 1000000;
              } else if (priceObj.value) {
                priceVal = parseFloat(priceObj.value);
              }
            }

            // offerId'yi garantiye almak için string trim yapıyoruz
            const offerIdKey = String(product.offerId || "").trim();
            if (offerIdKey) {
              gmcMap[offerIdKey] = {
                title: titleVal,
                price: priceVal
              };
            }
          });
        }

        if (json.nextPageToken) pageToken = json.nextPageToken;
        else hasNextPage = false;
      }
      
      AppLogger.log(`GMC İşlemi Bitti. Çekilen Ürün Sayısı: ${Object.keys(gmcMap).length}`, "BAŞARILI");
      
    } catch (error) {
      AppLogger.log(`GMC Kritik Bağlantı Hatası: ${error.message}`, "HATA");
    }
    return gmcMap;
  }
};