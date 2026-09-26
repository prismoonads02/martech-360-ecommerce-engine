/**
 * DİKKAT: Web App'i yayınlamadan önce, kod yazma ekranında üstteki açılır menüden 
 * "setupAuth" fonksiyonunu seçin ve "Çalıştır"a basın. 
 * Bu, scriptin kendi kendine "Zamanlayıcı (Trigger)" kurabilmesi için Google'dan izin almasını sağlar.
 */
function setupAuth() {
  ScriptApp.getProjectTriggers();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.QUEUE);
  if(!sheet) SpreadsheetApp.getActiveSpreadsheet().insertSheet(CONFIG.SHEETS.QUEUE);
  console.log("Yetkilendirme ve Kurulum Başarılı! Artık Dağıtım (Deploy) yapabilirsiniz.");
}

/**
 * Cloud Projesini (737881792871) Merchant Center'a (467943572) kaydeder.
 * Yalnızca bir kez çalıştırılması yeterlidir.
 */
function registerMerchantGcp() {
  const merchantId = CONFIG.MERCHANT_CENTER_ID;
  const developerEmail = "prismoonads02@gmail.com"; 
  const token = ScriptApp.getOAuthToken();
  
  const url = `https://merchantapi.googleapis.com/accounts/v1/accounts/${merchantId}/developerRegistration:registerGcp`;
  
  const options = {
    method: "post",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    payload: JSON.stringify({ developerEmail: developerEmail }),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  console.log("Kayıt Yanıtı (HTTP " + response.getResponseCode() + "): " + response.getContentText());
}