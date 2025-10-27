import React, { useState, useEffect } from 'react';
import { getOrders } from '../services/packzyApiService';
import { Order } from '../types';

const OrderStatusPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeStatus, setActiveStatus] = useState<string>('all');

    const statuses = ['all', 'in_review', 'pending', 'delivered', 'cancelled', 'returned'];

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await getOrders();
                setOrders(response.data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch orders.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    useEffect(() => {
        if (activeStatus === 'all') {
            setFilteredOrders(orders);
        } else {
            setFilteredOrders(orders.filter(o => o.status === activeStatus));
        }
    }, [activeStatus, orders]);

    const statusColors: Record<string, string> = {
        delivered: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        in_review: 'bg-blue-100 text-blue-800',
        cancelled: 'bg-red-100 text-red-800',
        returned: 'bg-purple-100 text-purple-800',
    };
    
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="text-center p-8 space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-slate-500">Loading orders...</p>
                </div>
            );
        }
        if (error) {
            return <div className="p-4 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>;
        }
        if (filteredOrders.length === 0) {
            return (
                <div className="text-center py-16 px-6">
                    <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-xl font-semibold text-slate-800">No Orders Found</h3>
                    <p className="mt-1 text-sm text-slate-500">There are no orders with the selected status.</p>
                </div>
            );
        }

        return (
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Invoice / Tracking</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Customer</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Amount</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {filteredOrders.map(order => (
                            <tr key={order.consignment_id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="font-medium text-slate-900">{order.invoice}</div>
                                    <div className="text-xs text-slate-500">{order.tracking_code}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                                    <div>{order.recipient_name}</div>
                                    <div className="text-xs text-slate-500">{order.recipient_phone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">{new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(order.cod_amount)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${statusColors[order.status] || 'bg-slate-100 text-slate-800'}`}>
                                        {order.status.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(order.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        );
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Order Status Overview</h2>

            <div className="bg-white rounded-lg shadow-md border border-slate-200">
                <div className="border-b border-slate-200">
                     <nav className="flex space-x-2 overflow-x-auto -mb-px px-4" aria-label="Tabs">
                        {statuses.map(status => (
                            <button
                                key={status}
                                onClick={() => setActiveStatus(status)}
                                className={`capitalize py-3 px-4 text-sm font-medium whitespace-nowrap border-b-2 focus:outline-none ${
                                    activeStatus === status
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                            >
                                {status.replace('_', ' ')}
                            </button>
                        ))}
                    </nav>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default OrderStatusPage;
