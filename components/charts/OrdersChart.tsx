import React, { useState, useMemo } from 'react';
import { Purchase } from '../../types';

interface OrdersChartProps {
    purchases: Purchase[];
}

type TimeRange = 30 | 90 | 120;

const OrdersChart: React.FC<OrdersChartProps> = ({ purchases }) => {
    const [timeRange, setTimeRange] = useState<TimeRange>(30);

    const chartData = useMemo(() => {
        const data = new Map<string, number>();
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - timeRange);
        startDate.setHours(0, 0, 0, 0);

        // Initialize all days in the range with 0 orders
        for (let i = 0; i < timeRange; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateString = date.toISOString().split('T')[0];
            data.set(dateString, 0);
        }

        // Aggregate purchase data
        purchases.forEach(purchase => {
            const purchaseDate = new Date(purchase.date);
            if (purchaseDate >= startDate && purchaseDate <= today) {
                const dateString = purchaseDate.toISOString().split('T')[0];
                data.set(dateString, (data.get(dateString) || 0) + 1);
            }
        });

        return Array.from(data.entries()).map(([date, count]) => ({
            date,
            count
        })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    }, [purchases, timeRange]);

    const maxValue = useMemo(() => {
        const max = Math.max(...chartData.map(d => d.count));
        return Math.max(10, Math.ceil(max / 5) * 5); // Ensure a reasonable max value, at least 10, rounded to nearest 5
    }, [chartData]);
    
    const formatDateLabel = (dateString: string, index: number) => {
        const date = new Date(dateString);
        if (timeRange === 30) {
           if (chartData.length > 7 && index % 5 === 0) {
             return `${date.getDate()}/${date.getMonth() + 1}`;
           }
           if(chartData.length <=7){
               return `${date.getDate()}/${date.getMonth() + 1}`;
           }
           return '';
        } else { // For 90/120 days, show fewer labels
            if (index % 15 === 0) {
                return `${date.getDate()}/${date.getMonth() + 1}`;
            }
            return '';
        }
    }


    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-700">Orders Over Time</h3>
                <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
                    {[30, 90, 120].map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range as TimeRange)}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${timeRange === range ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {range}d
                        </button>
                    ))}
                </div>
            </div>
            {chartData.length > 0 ? (
                <div className="h-64 flex flex-col">
                    <div className="flex-grow flex items-end gap-1 border-b border-slate-200">
                         {chartData.map((dataPoint, index) => (
                             <div key={dataPoint.date} className="flex-1 h-full flex flex-col justify-end items-center group relative">
                                 <div 
                                     className="w-full bg-blue-300 hover:bg-blue-500 rounded-t-sm"
                                     style={{ height: `${(dataPoint.count / maxValue) * 100}%` }}
                                 ></div>
                                 <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-800 text-white text-xs px-2 py-1 rounded-md">
                                     {dataPoint.count} orders on {new Date(dataPoint.date).toLocaleDateString()}
                                </div>
                             </div>
                         ))}
                    </div>
                    <div className="flex items-end gap-1 mt-1 -mx-1">
                        {chartData.map((dataPoint, index) => (
                            <div key={dataPoint.date} className="flex-1 text-center text-xs text-slate-500">
                                {formatDateLabel(dataPoint.date, index)}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="h-64 flex items-center justify-center text-slate-500">
                    <p>No order data available for this period.</p>
                </div>
            )}
        </div>
    );
};

export default OrdersChart;
