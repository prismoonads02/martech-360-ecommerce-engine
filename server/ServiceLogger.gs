/**
 * ServiceLogger.gs
 * Arka plan işlemlerini ve API yanıtlarını E-Tabloya yazdıran kayıt merkezi.
 */
const AppLogger = {
  log: function(message, type) {
    var logType = type || "BİLGİ";
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName("Sys_Logs");
      
      // Log sayfası yoksa oluştur ve başlık at
      if (!sheet) {
        sheet = ss.insertSheet("Sys_Logs");
        sheet.appendRow(["Tarih / Saat", "Tür", "Mesaj"]);
        sheet.getRange("A1:C1").setFontWeight("bold").setBackground("#333333").setFontColor("#ffffff");
        sheet.setFrozenRows(1);
        sheet.setColumnWidth(1, 150);
        sheet.setColumnWidth(2, 100);
        sheet.setColumnWidth(3, 800);
      }
      
      var date = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
      sheet.appendRow([date, logType, message]);
      
    } catch(e) {
      console.error("Logger Yazma Hatası: " + e.message);
    }
  }
};