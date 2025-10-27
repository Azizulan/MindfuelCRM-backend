import { Customer, Purchase } from '../types';

export const processAndAnalyzeData = (rawData: any[]): Customer[] => {
  const customerMap = new Map<string, any>();

  rawData.forEach(row => {
    const identifier = (row.phone || row.email || '').toString().trim();
    if (!identifier) return;

    const purchaseDate = new Date(row['purchase date']);
    const productPrice = parseFloat(row['product price']);
    if (isNaN(purchaseDate.getTime()) || isNaN(productPrice)) return;
    
    const newPurchase: Purchase = {
        date: purchaseDate,
        product: row.product || 'Unknown Product',
        amount: productPrice
    };
    
    if (customerMap.has(identifier)) {
      const existing = customerMap.get(identifier);
      existing.purchases.push(newPurchase);
      if (purchaseDate > existing.lastPurchaseDate) {
        existing.lastPurchaseDate = purchaseDate;
      }
    } else {
      customerMap.set(identifier, {
        id: identifier,
        name: row.name || 'Unknown',
        email: row.email || '',
        phone: row.phone || '',
        address: row.address || '',
        lastPurchaseDate: purchaseDate,
        purchases: [newPurchase],
        followUpNotes: [],
      });
    }
  });

  const processedCustomers: Customer[] = Array.from(customerMap.values()).map(cust => {
    const purchaseCount = cust.purchases.length;
    const totalSpending = cust.purchases.reduce((sum: number, p: Purchase) => sum + p.amount, 0);
    const purchaseHistory = [...new Set(cust.purchases.map((p: Purchase) => p.product))].join(', ');
    
    let valueRating: 'High' | 'Medium' | 'Low' = 'Low';
    if (totalSpending > 10000 || purchaseCount > 5) {
      valueRating = 'High';
    } else if (totalSpending > 3000 || purchaseCount > 2) {
      valueRating = 'Medium';
    }

    return {
      ...cust,
      purchaseCount,
      totalSpending,
      purchaseHistory,
      valueRating,
    };
  });
  
  return processedCustomers;
};
