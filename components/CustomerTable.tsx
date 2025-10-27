import React, { useState, useMemo, useEffect } from 'react';
import { Customer, FollowUpNote, Product, User } from '../types';
import { UserCircleIcon } from './icons/UserCircleIcon';
import CustomerProfileModal from './CustomerProfileModal';
import { ChevronUpDownIcon } from './icons/ChevronUpDownIcon';

interface CustomerTableProps {
  customers: Customer[];
  title: string;
  onAddFollowUpNote: (customerId: number | string, newNote: FollowUpNote) => void;
  products: Product[];
  currentUser: User;
  displayMode?: 'dashboard' | 'followup';
}

type SortableKey = 'name' | 'lastPurchaseDate' | 'valueRating' | 'totalSpending' | 'purchaseCount';

const CustomerTable: React.FC<CustomerTableProps> = ({ customers, title, onAddFollowUpNote, products, currentUser, displayMode = 'dashboard' }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortableKey; direction: 'ascending' | 'descending' }>({ key: 'lastPurchaseDate', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize, title, customers]);

  const sortedCustomers = useMemo(() => {
    let sortableItems = [...customers];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let compareResult = 0;
        
        if (sortConfig.key === 'lastPurchaseDate') {
            const dateA = a.lastPurchaseDate ? new Date(a.lastPurchaseDate).getTime() : 0;
            const dateB = b.lastPurchaseDate ? new Date(b.lastPurchaseDate).getTime() : 0;
            compareResult = dateA - dateB;
        } else if (sortConfig.key === 'valueRating') {
          const ratingOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          compareResult = ratingOrder[a.valueRating] - ratingOrder[b.valueRating];
        } else {
            const aValue = a[sortConfig.key as keyof Customer];
            const bValue = b[sortConfig.key as keyof Customer];
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                compareResult = aValue.localeCompare(bValue);
            } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                compareResult = aValue - bValue;
            }
        }
        
        return sortConfig.direction === 'ascending' ? compareResult : -compareResult;
      });
    }
    return sortableItems;
  }, [customers, sortConfig]);

  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedCustomers.slice(startIndex, startIndex + pageSize);
  }, [sortedCustomers, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedCustomers.length / pageSize);
  
  const requestSort = (key: SortableKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getRepeatCustomerTagStyle = (purchaseCount: number): string => {
    if (purchaseCount >= 6) return 'bg-purple-100 text-purple-800';
    if (purchaseCount >= 4) return 'bg-green-100 text-green-800';
    if (purchaseCount >= 2) return 'bg-cyan-100 text-cyan-800';
    return 'bg-slate-100 text-slate-800'; // Should not happen if logic is for count > 1, but good fallback
  };


  if (customers.length === 0) {
    return (
        <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md border border-slate-200">
            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-xl font-semibold text-slate-800">No Customers to Display</h3>
            <p className="mt-1 text-sm text-slate-500">There are no customers in the "{title}" list.</p>
        </div>
    );
  }
  
  const ratingStyles = {
    High: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Low: 'bg-red-100 text-red-800',
  };

  const SortableHeader = ({ label, sortKey }: { label: string, sortKey: SortableKey }) => (
    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
      <button className="flex items-center gap-2 group" onClick={() => requestSort(sortKey)}>
        {label}
        <ChevronUpDownIcon
          className={`h-4 w-4 ${sortConfig.key === sortKey ? 'text-slate-800' : 'text-slate-400 group-hover:text-slate-600'}`}
          direction={sortConfig.key === sortKey ? sortConfig.direction : 'none'}
        />
      </button>
    </th>
  );

  return (
    <>
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <SortableHeader label="Name" sortKey="name" />
                <SortableHeader label="Last Purchase" sortKey="lastPurchaseDate" />
                {displayMode === 'dashboard' ? (
                    <SortableHeader label="Value Rating" sortKey="valueRating" />
                ) : (
                    <SortableHeader label="Status" sortKey="purchaseCount" />
                )}
                <SortableHeader label="Total Spending" sortKey="totalSpending" />
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {paginatedCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{customer.name}</div>
                    <div className="text-sm text-slate-500">{customer.email || customer.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {customer.lastPurchaseDate ? new Date(customer.lastPurchaseDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {displayMode === 'dashboard' ? (
                        <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${ratingStyles[customer.valueRating]}`}>
                                {customer.valueRating}
                            </span>
                            {customer.purchaseCount > 1 && (
                                <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-cyan-100 text-cyan-800">
                                Repeat
                                </span>
                            )}
                        </div>
                    ) : (
                        <div>
                            {customer.purchaseCount > 1 ? (
                                <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getRepeatCustomerTagStyle(customer.purchaseCount)}`}>
                                    Repeat ({customer.purchaseCount})
                                </span>
                            ) : (
                                <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800">
                                    First-time
                                </span>
                            )}
                        </div>
                    )}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">
                    {new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(customer.totalSpending)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium rounded-md text-sm px-4 py-2 text-center transition-colors hover:bg-blue-50"
                    >
                      <UserCircleIcon />
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between py-3 px-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center">
            <label htmlFor="pageSize" className="text-sm text-slate-600 mr-2">Rows per page:</label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={e => setPageSize(Number(e.target.value))}
              className="bg-white border border-slate-300 rounded-md shadow-sm pl-2 pr-8 py-1 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          <span className="text-sm text-slate-600">
            Page {currentPage} of {totalPages > 0 ? totalPages : 1}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {selectedCustomer && <CustomerProfileModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} onAddFollowUpNote={onAddFollowUpNote} products={products} currentUser={currentUser} />}
    </>
  );
};

export default CustomerTable;