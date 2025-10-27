import React, { useMemo } from 'react';
import { Purchase } from '../../types';

interface BestSellingProductsProps {
    purchases: Purchase[];
}

const BestSellingProducts: React.FC<BestSellingProductsProps> = ({ purchases }) => {
    const topProducts = useMemo(() => {
        if (!purchases || purchases.length === 0) return [];
        
        // FIX: The accumulator type is correctly specified by casting the initial value for the `reduce` function. This allows TypeScript to correctly infer the type of `productCounts` and resolves the error in the `sort` method.
        const productCounts = purchases.reduce((acc, purchase) => {
            if (purchase.product) {
                acc[purchase.product] = (acc[purchase.product] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(productCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

    }, [purchases]);

    const totalSales = topProducts.reduce((sum, p) => sum + p.count, 0);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 h-full">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Best Selling Products</h3>
            {topProducts.length > 0 ? (
                <div className="space-y-4">
                    {topProducts.map((product, index) => (
                        <div key={index}>
                            <div className="flex justify-between items-center text-sm mb-1">
                                <span className="font-medium text-slate-700 truncate" title={product.name}>{product.name}</span>
                                <span className="text-slate-500">{product.count} units</span>
                            </div>
                            <div className="bg-slate-200 rounded-full h-2.5">
                                <div 
                                    className="bg-green-500 h-2.5 rounded-full" 
                                    style={{ width: `${(product.count / topProducts[0].count) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                    <p>No sales data to display.</p>
                </div>
            )}
        </div>
    );
};

export default BestSellingProducts;