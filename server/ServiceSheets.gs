/**
 * ServiceSheets.gs
 * Executive Dashboard Tasarımı ve Formatlama Katmanı.
 */
const SheetService = {
  writeReport: function(data, currency, accountName) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
    let dynamicSheetName = `${timestamp} - ${accountName}`;
    if (dynamicSheetName.length > 31) dynamicSheetName = dynamicSheetName.substring(0, 31);
    
    let sheet = ss.getSheetByName(dynamicSheetName) || ss.insertSheet(dynamicSheetName);
    sheet.clear();
    sheet.setHiddenGridlines(false);
    
    const headers = [
      "Ürün ID", 
      "Ürün Başlığı (GMC)", 
      `Fiyat (${currency})`, 
      "Gösterim", 
      "Tıklama", 
      "TO (CTR)", 
      "Ads Dönüşüm",
      `Ads Harcaması (${currency})`, 
      "GA4 Ürün İnceleme", 
      "GA4 Sepete Ekleme", 
      "GA4 Sepete Atma Oranı", 
      "Google Ads Satış Adedi", 
      `Google Ads Cirosu (${currency})`, 
      "Doğrudan Ürün ROAS", 
      "Toplam Satış Adedi", 
      `Toplam Ürün Cirosu (${currency})`, 
      "AI Durum Tespiti", 
      "Önerilen Aksiyon"
    ];
    
    // --- 1. SATIR: PRO DASHBOARD BAŞLIK KARTI ---
    sheet.setRowHeight(1, 44);
    const titleRange = sheet.getRange(1, 1, 1, headers.length);
    titleRange.merge()
              .setValue(`📊 ${accountName.toUpperCase()} — 360° E-TİCARET & ÜRÜN PERFORMANS KONSOLU`)
              .setBackground('#0F172A')
              .setFontColor('#F8FAFC')
              .setFontSize(12)
              .setFontWeight("bold")
              .setVerticalAlignment('middle');

    // --- 2. SATIR: METAVERİ & KPI BİLGİ BANDI ---
    sheet.setRowHeight(2, 26);
    const subTitleRange = sheet.getRange(2, 1, 1, headers.length);
    subTitleRange.merge()
                 .setValue(`🕒 Rapor Zamanı: ${timestamp}   |   💰 Para Birimi: ${currency}   |   📦 İncelenen Ürün: ${data.length} Adet   |   🎯 Kapsam: Google Ads + Shopping + GA4 Funnel`)
                 .setBackground('#F1F5F9')
                 .setFontColor('#475569')
                 .setFontSize(9)
                 .setFontWeight("bold")
                 .setVerticalAlignment('middle');

    // --- 3. SATIR: TABLO BAŞLIKLARI ---
    sheet.setRowHeight(3, 40);
    const headerRange = sheet.getRange(3, 1, 1, headers.length);
    headerRange.setValues([headers])
               .setFontWeight("bold")
               .setFontColor('#FFFFFF')
               .setBackground('#1E293B')
               .setHorizontalAlignment('center')
               .setVerticalAlignment('middle')
               .setWrap(true);

    sheet.setFrozenRows(3);
    
    // --- VERİLERİN YAZILMASI (4. SATIRDAN BAŞLAR) ---
    if (data.length > 0) {
      const dataRange = sheet.getRange(4, 1, data.length, data[0].length);
      dataRange.setValues(data).setVerticalAlignment('middle');
      
      sheet.getRange(4, 1, data.length, 1).setHorizontalAlignment('center');                          // 1. Ürün ID
      sheet.getRange(4, 3, data.length, 1).setNumberFormat("0.00");                                    // 3. Fiyat
      sheet.getRange(4, 4, data.length, 2).setHorizontalAlignment('center').setNumberFormat("#,##0"); // 4. Gösterim, 5. Tıklama
      sheet.getRange(4, 6, data.length, 1).setNumberFormat("0.00%").setHorizontalAlignment('center'); // 6. TO
      sheet.getRange(4, 7, data.length, 1).setNumberFormat("0.00").setHorizontalAlignment('center');  // 7. Ads Dönüşüm
      sheet.getRange(4, 8, data.length, 1).setNumberFormat("0.00").setHorizontalAlignment('center');  // 8. Ads Harcaması
      sheet.getRange(4, 9, data.length, 2).setHorizontalAlignment('center').setNumberFormat("#,##0"); // 9. İnceleme, 10. Sepete Ekleme
      sheet.getRange(4, 11, data.length, 1).setNumberFormat("0.00%").setHorizontalAlignment('center'); // 11. Sepete Atma Oranı
      sheet.getRange(4, 12, data.length, 1).setHorizontalAlignment('center').setNumberFormat("#,##0"); // 12. Ads Satış Adedi
      sheet.getRange(4, 13, data.length, 1).setNumberFormat("0.00").setHorizontalAlignment('center');  // 13. Ads Cirosu
      sheet.getRange(4, 14, data.length, 1).setNumberFormat('0.00"x"').setHorizontalAlignment('center').setFontWeight("bold"); // 14. ROAS
      sheet.getRange(4, 15, data.length, 1).setHorizontalAlignment('center').setNumberFormat("#,##0"); // 15. Toplam Satış Adedi
      sheet.getRange(4, 16, data.length, 1).setNumberFormat("0.00").setHorizontalAlignment('center');  // 16. Toplam Ciro
      sheet.getRange(4, 17, data.length, 2).setHorizontalAlignment('center');                         // 17. Durum, 18. Aksiyon
    }
    
    // Otomatik Sütun Genişlikleri
    for (let col = 1; col <= headers.length; col++) {
       sheet.autoResizeColumn(col);
       const currentWidth = sheet.getColumnWidth(col);
       sheet.setColumnWidth(col, currentWidth > 380 ? 380 : currentWidth + 16);
    }
    
    sheet.setColumnWidth(1, 60);
    
    // Alt Kısma Yönetici Karar Rehberi
    const noteText = "💡 YÖNETİCİ REHBERİ:\n" +
                     "• Ads Dönüşüm vs GA4 Satış: Ads'in modeliyle GA4'ün son tıklamadaki net e-ticaret satışını yan yana kıyaslayın.\n" +
                     "• Doğrudan Ürün ROAS: Yalnızca Google Ads cirosu / Harcama üzerinden net hesaplanır.\n" +
                     "• Destek (Halo) Etkisi: Ads doğrudan satamamış olsa bile Toplam Ciro yüksekse ürün mağazayı besliyordur (hemen kapatmayın, TBM düşürün).\n" +
                     "• Sepette Terk: İnceleme ve sepete ekleme yüksek ama satış 0 ise ürün beğenilmiş; kargo/ödeme adımlarını optimize edin.";
    
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 2, 1, 1, Math.min(10, headers.length)).merge()
         .setValue(noteText)
         .setFontWeight("bold")
         .setFontColor('#0F172A')
         .setBackground('#F8FAFC')
         .setWrap(true)
         .setVerticalAlignment('middle');
    sheet.setRowHeight(lastRow + 2, 85);
  }
};