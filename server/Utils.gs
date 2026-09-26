/**
 * Utils.gs
 * Standart API yanıtları (API Envelopes) gibi ortak yardımcı fonksiyonlar.
 */
const ApiResponse = {
  success: function(message, data = null) {
    const payload = { statusCode: 200, message: message, data: data };
    return ContentService.createTextOutput(JSON.stringify(payload))
                         .setMimeType(ContentService.MimeType.JSON);
  },
  
  error: function(statusCode, message) {
    const payload = { statusCode: statusCode, message: message, data: null };
    return ContentService.createTextOutput(JSON.stringify(payload))
                         .setMimeType(ContentService.MimeType.JSON);
  }
};