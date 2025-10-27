
import React, { useState } from 'react';
// FIX: Added 'Purchase' and 'User' types to import for use in component props.
import { Customer, FollowUpNote, Product, Purchase, User } from '../types';
import CustomerTable from './CustomerTable';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { StarIcon } from './icons/StarIcon';
import CustomerSegmentationChart from './charts/CustomerSegmentationChart';
import ValueRatingChart from './charts/ValueRatingChart';
import OrdersChart from './charts/OrdersChart';
import BestSellingProducts from './charts/BestSellingProducts';

interface CustomerDashboardProps {
  allCustomers: Customer[];
  repeatBuyers: Customer[];
  followUpList: Customer[]; // Still needed for segmentation chart
  onAddFollowUpNote: (customerId: number | string, newNote: FollowUpNote) => void;
  products: Product[];
  allPurchases: Purchase[];
  currentUser: User;
}

type Tab = 'repeatBuyers' | 'all';

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ allCustomers, repeatBuyers, followUpList, onAddFollowUpNote, products, allPurchases, currentUser }) => {
  const [activeTab, setActiveTab] = useState<Tab>('repeatBuyers');

  const tabs = [
    { id: 'repeatBuyers', name: 'Repeat Buyers', icon: <StarIcon />, data: repeatBuyers },
    { id: 'all', name: 'All Customers', icon: <UserGroupIcon />, data: allCustomers },
  ];

  const activeData = tabs.find(tab => tab.id === activeTab)?.data || [];
  const activeTitle = tabs.find(tab => tab.id === activeTab)?.name || '';

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CustomerSegmentationChart
                total={allCustomers.length}
                repeat={repeatBuyers.length}
                followUp={followUpList.length}
            />
            <ValueRatingChart customers={allCustomers} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <OrdersChart purchases={allPurchases} />
        </div>
        <div>
            <BestSellingProducts purchases={allPurchases} />
        </div>
      </div>


      <div>
        <h3 className="text-2xl font-bold text-slate-800 mb-4">Customer Lists</h3>
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
              >
                {tab.icon}
                <span className="ml-2">{tab.name}</span>
                <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.data.length}
                </span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-8">
          <CustomerTable customers={activeData} title={activeTitle} onAddFollowUpNote={onAddFollowUpNote} products={products} currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
