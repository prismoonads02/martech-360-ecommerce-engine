function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return ApiResponse.error(400, "Geçersiz İstek.");
    const payload = JSON.parse(e.postData.contents);
    
    const currency = payload.currency || "TRY";
    const accountName = payload.accountName || "Bilinmeyen Hesap"; // HESAP ADINI YAKALA
    const adsDataArray = payload.products; 
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let queueSheet = ss.getSheetByName(CONFIG.SHEETS.QUEUE);
    if (!queueSheet) queueSheet = ss.insertSheet(CONFIG.SHEETS.QUEUE);
    
    // Her satırın sonuna Currency (indis 5) ve AccountName (indis 6) ekle
    const queueData = adsDataArray.map(item => [...item, currency, accountName]); 
    
    queueSheet.getRange(queueSheet.getLastRow() + 1, 1, queueData.length, queueData[0].length).setValues(queueData);
    
    scheduleWorker();
    
    return ApiResponse.success("Veriler kuyruğa alındı ve işçi tetiklendi.");
    
  } catch (error) {
    return ApiResponse.error(500, `Sunucu Hatası: ${error.message}`);
  }
}

function scheduleWorker() {
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "processQueueWorker") return;
  }
  ScriptApp.newTrigger("processQueueWorker").timeBased().after(1000).create();
}