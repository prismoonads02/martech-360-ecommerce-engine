const AdsDataService = {
  fetchShoppingData: function(period, minClicks) {
    const productsMap = {};
    const tz = AdsApp.currentAccount().getTimeZone();
    const today = new Date();
    // 90 Günlük periyot (Dinamik fonksiyon Utilities'de olur ama Ads içinde sabit de yazabiliriz)
    const startDate = Utilities.formatDate(new Date(today.getTime() - 90 * 86400000), tz, 'yyyy-MM-dd');
    const endDate = Utilities.formatDate(new Date(today.getTime() - 86400000), tz, 'yyyy-MM-dd');
    
    const query = `
      SELECT segments.product_item_id, metrics.clicks, metrics.impressions, metrics.cost_micros, metrics.conversions
      FROM shopping_performance_view
      WHERE metrics.clicks >= ${minClicks}
      AND segments.date BETWEEN '${startDate}' AND '${endDate}'
    `;
      
    const result = AdsApp.search(query);
    while (result.hasNext()) {
      const row = result.next();
      const itemId = row.segments.productItemId;
      
      if (!productsMap[itemId]) {
        productsMap[itemId] = { imp: 0, clicks: 0, cost: 0, conv: 0 };
      }
      
      productsMap[itemId].imp += parseInt(row.metrics.impressions, 10);
      productsMap[itemId].clicks += parseInt(row.metrics.clicks, 10);
      productsMap[itemId].cost += parseFloat((row.metrics.costMicros / 1000000).toFixed(2));
      productsMap[itemId].conv += parseFloat(row.metrics.conversions);
    }
    
    // Web App'e gönderirken boyutu minimize etmek için Array'e çeviriyoruz
    const outputArray = [];
    for (const key in productsMap) {
      outputArray.push([key, productsMap[key].imp, productsMap[key].clicks, productsMap[key].cost, productsMap[key].conv]);
    }
    
    return outputArray;
  }
};