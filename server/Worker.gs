function processQueueWorker() {
  AppLogger.log("Arka Plan İşçisi (Worker) Uyandı ve İşleme Başladı.", "BİLGİ");
  
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "processQueueWorker") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const queueSheet = ss.getSheetByName(CONFIG.SHEETS.QUEUE);
  if (!queueSheet || queueSheet.getLastRow() === 0) {
    AppLogger.log("Kuyrukta işlenecek veri bulunamadı.", "UYARI");
    return; 
  }
  
  const queueData = queueSheet.getDataRange().getValues();
  const currency = queueData[0][5]; 
  const accountName = queueData[0][6] || "Hesap"; // KUYRUKTAN HESAP ADINI OKU
  
  const adsMap = {};
  queueData.forEach(row => {
    adsMap[row[0]] = { imp: row[1], clicks: row[2], cost: row[3], conv: row[4] };
  });
  
  AppLogger.log(`Kuyruktan ${Object.keys(adsMap).length} adet Ads ürünü okundu. Dış API'lere gidiliyor...`, "BİLGİ");

  const ga4Data = Ga4Api.fetchData(CONFIG.GA4_PROPERTY_ID);
  const gmcData = GmcApi.fetchData(CONFIG.MERCHANT_CENTER_ID);
  
  const reportData = AnalyzerService.mergeData(adsMap, ga4Data, gmcData);
  
  // Hesap adını Sheets servisine gönder
  SheetService.writeReport(reportData, currency, accountName);
  queueSheet.clear();
  
  AppLogger.log("İşçi görevini tamamladı ve raporu çizdi. Kuyruk temizlendi.", "BAŞARILI");
}