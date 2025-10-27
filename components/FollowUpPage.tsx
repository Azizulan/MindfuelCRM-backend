
import React, { useState } from 'react';
import { Customer, FollowUpNote, Product, User } from '../types';
import CustomerTable from './CustomerTable';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ClockIcon } from './icons/ClockIcon';

interface FollowUpPageProps {
    todaysReminders: Customer[];
    pendingFollowUpList: Customer[];
    completedFollowUpList: Customer[];
    onAddFollowUpNote: (customerId: number | string, newNote: FollowUpNote) => void;
    products: Product[];
    currentUser: User;
}

type FollowUpTab = 'pending' | 'completed';

const FollowUpPage: React.FC<FollowUpPageProps> = ({ todaysReminders, pendingFollowUpList, completedFollowUpList, onAddFollowUpNote, products, currentUser }) => {
    const [activeTab, setActiveTab] = useState<FollowUpTab>('pending');
    
    const tabs = [
        { id: 'pending', name: 'Pending', icon: <ClockIcon />, data: pendingFollowUpList, title: "Pending Follow-ups" },
        { id: 'completed', name: 'Completed', icon: <CheckCircleIcon />, data: completedFollowUpList, title: "Completed Follow-ups" },
    ];

    const activeData = tabs.find(tab => tab.id === activeTab)?.data || [];
    const activeTitle = tabs.find(tab => tab.id === activeTab)?.title || '';

    return (
        <div className="space-y-10">
            <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Today's Priority Reminders</h3>
                <CustomerTable 
                    customers={todaysReminders} 
                    title="Today's Reminders"
                    onAddFollowUpNote={onAddFollowUpNote} 
                    products={products} 
                    currentUser={currentUser}
                    displayMode="followup"
                />
            </div>

            <div>
                 <h3 className="text-2xl font-bold text-slate-800">General Follow-up Lists</h3>
                 <p className="text-sm text-slate-500 mb-4">Customers who last purchased between 25-30 days ago.</p>
                <div className="border-b border-slate-200">
                  <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as FollowUpTab)}
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
                  <CustomerTable 
                    customers={activeData} 
                    title={activeTitle} 
                    onAddFollowUpNote={onAddFollowUpNote} 
                    products={products} 
                    currentUser={currentUser} 
                    displayMode="followup"
                  />
                </div>
            </div>
        </div>
    );
};

export default FollowUpPage;
