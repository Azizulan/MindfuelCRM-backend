import React, { useMemo } from 'react';
import { Customer } from '../../types';

const DonutSegment: React.FC<{
    radius: number;
    strokeWidth: number;
    percentage: number;
    offsetPercentage: number;
    color: string;
}> = ({ radius, strokeWidth, percentage, offsetPercentage, color }) => {
    const circumference = 2 * Math.PI * radius;
    const effectivePercentage = percentage > 0.999 ? 0.999 : (percentage < 0.001 ? 0 : percentage);

    return (
        <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - effectivePercentage)}
            transform={`rotate(${-90 + 360 * offsetPercentage} ${radius + strokeWidth} ${radius + strokeWidth})`}
            className="transition-all duration-500"
            strokeLinecap="round"
        />
    );
};


interface ChartProps {
    customers: Customer[];
}

const ValueRatingChart: React.FC<ChartProps> = ({ customers }) => {
    const radius = 55;
    const strokeWidth = 20;
    const size = (radius + strokeWidth) * 2;
    const totalCustomers = customers.length;

    const ratingCounts = useMemo(() => {
        return customers.reduce((acc, customer) => {
            acc[customer.valueRating] = (acc[customer.valueRating] || 0) + 1;
            return acc;
        }, {} as Record<'High' | 'Medium' | 'Low', number>);
    }, [customers]);

    const chartData = [
        { label: 'High Value', value: ratingCounts.High || 0, color: '#10b981', percentage: totalCustomers > 0 ? (ratingCounts.High || 0) / totalCustomers : 0 },
        { label: 'Medium Value', value: ratingCounts.Medium || 0, color: '#f59e0b', percentage: totalCustomers > 0 ? (ratingCounts.Medium || 0) / totalCustomers : 0 },
        { label: 'Low Value', value: ratingCounts.Low || 0, color: '#ef4444', percentage: totalCustomers > 0 ? (ratingCounts.Low || 0) / totalCustomers : 0 }
    ];

    let accumulatedPercentage = 0;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 h-full">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Customer Value Distribution</h3>
            {totalCustomers > 0 ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
                        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                            <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke="#e2e8f0" strokeWidth={strokeWidth} />
                            {chartData.map((segment, index) => {
                                const offset = accumulatedPercentage;
                                accumulatedPercentage += segment.percentage;
                                return (
                                    <DonutSegment
                                        key={index}
                                        radius={radius}
                                        strokeWidth={strokeWidth}
                                        percentage={segment.percentage}
                                        offsetPercentage={offset}
                                        color={segment.color}
                                    />
                                );
                            })}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-3xl font-bold text-slate-800">{totalCustomers}</span>
                            <span className="text-sm text-slate-500">Customers</span>
                        </div>
                    </div>
                    <div className="flex-1 w-full space-y-3">
                        {chartData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                                    <span className="text-slate-600">{item.label}</span>
                                </div>
                                <span className="font-semibold text-slate-800">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-48 text-slate-500">
                    <p>No customer data to display chart.</p>
                </div>
            )}
        </div>
    );
};

export default ValueRatingChart;