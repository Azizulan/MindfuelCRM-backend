import React, { useState, useMemo, useEffect } from 'react';
import { Customer, Product, FollowUpNote, Purchase, User } from './types';
import CustomerDashboard from './components/CustomerDashboard';
import Sidebar from './components/Sidebar';
import ProductsPage from './components/ProductsPage';
import NewOrderPage from './components/NewOrderPage';
import TrackOrderPage from './components/TrackOrderPage';
import SettingsPage from './components/SettingsPage';
import OrderStatusPage from './components/OrderStatusPage';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import FollowUpPage from './components/FollowUpPage';
import UserManagementPage from './components/UserManagementPage';
import DataUploadPage from './components/DataUploadPage'; // Re-added for backend integration
import * as api from './services/apiService';

export type View = 'dashboard' | 'products' | 'newOrder' | 'trackOrder' | 'orderStatus' | 'settings' | 'followUp' | 'userManagement' | 'uploadData' | 'loading';

const initialProducts: Product[] = [
  { id: 1, name: 'Classic Peanut Butter (400g)', price: 450, stock: 120 },
  { id: 2, name: 'Chocolate Peanut Butter Bliss (400g)', price: 550, stock: 80 },
  { id: 3, name: 'Crunchy Trail Mix Nuts (250g)', price: 600, stock: 90 },
  { id: 4, name: 'Honey Almond Granola (500g)', price: 750, stock: 60 },
  { id: 5, name: 'Peanut Butter Granola Bars (6-pack)', price: 480, stock: 150 },
  { id: 6, name: 'Classic Muesli with Berries (500g)', price: 700, stock: 75 },
];

const isToday = (someDate: Date) => {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
           someDate.getMonth() === today.getMonth() &&
           someDate.getFullYear() === today.getFullYear();
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<View>('loading');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setActiveView('loading'); 
    }
  }, [currentUser]);

  const fetchData = async () => {
      if (!currentUser) return;
      setIsLoading(true);
      setError(null);
      try {
          const [fetchedCustomers, fetchedUsers] = await Promise.all([
              api.getCustomers(),
              currentUser.role === 'Administrator' ? api.getUsers() : Promise.resolve([]),
          ]);
          setCustomers(fetchedCustomers);
          if(currentUser.role === 'Administrator') setUsers(fetchedUsers);
          
          const defaultView = currentUser.role === 'Administrator' ? 'dashboard' : 'followUp';
          setActiveView(defaultView);

      } catch (err: any) {
          setError(err.message);
          setCurrentUser(null);
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
      if(currentUser) {
          fetchData();
      }
  }, [currentUser]);

  const addFollowUpNote = async (customerId: number | string, newNote: FollowUpNote) => {
    try {
        const updatedCustomer = await api.addFollowUpNote(customerId, newNote);
        setCustomers(prevCustomers =>
          prevCustomers.map(customer =>
            customer.id === customerId ? updatedCustomer : customer
          )
        );
    } catch(err: any) {
        setError("Failed to save note: " + err.message);
    }
  };

  const handleDataUploaded = () => {
    fetchData(); // Refetch all data from the backend after upload
  }

  const addProduct = (productData: Omit<Product, 'id'>) => {
    setProducts(prevProducts => {
        const newId = prevProducts.length > 0 ? Math.max(...prevProducts.map(p => p.id)) + 1 : 1;
        const newProduct: Product = { ...productData, id: newId };
        return [...prevProducts, newProduct];
    });
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prevProducts => 
        prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
  };

  const deleteProduct = (productId: number) => {
    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
  };

  const handleLogin = async (email: string, password: string): Promise<string> => {
      try {
          const user = await api.login(email, password);
          setCurrentUser(user);
          return 'success';
      } catch (err: any) {
          return err.message;
      }
  };
  
  const handleRegister = async (name: string, email: string, password: string): Promise<string> => {
      try {
          const newUser = await api.register(name, email, password);
          setCurrentUser(newUser);
          setActiveView('followUp');
          return 'success';
      } catch (err: any) {
          return err.message;
      }
  };

  const handleToggleUserStatus = async (userId: number) => {
      try {
        const updatedUser = await api.toggleUserStatus(userId);
        setUsers(currentUsers =>
            currentUsers.map(user => user.id === userId ? updatedUser : user)
        );
      } catch (err: any) {
          setError("Failed to update user status: " + err.message);
      }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCustomers([]);
    setUsers([]);
  }

  const repeatBuyers = useMemo(() => customers.filter(c => c.purchaseCount > 1), [customers]);
  
  const baseFollowUpList = useMemo(() => {
    const today = new Date();
    return customers.filter(c => {
      if (!c.lastPurchaseDate) return false;
      const diffTime = today.getTime() - new Date(c.lastPurchaseDate).getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays >= 25 && diffDays <= 30;
    });
  }, [customers]);

  const [pendingFollowUpList, completedFollowUpList] = useMemo(() => {
      const pending = baseFollowUpList.filter(c => !c.followUpNotes || c.followUpNotes.length === 0);
      let completed = baseFollowUpList.filter(c => c.followUpNotes && c.followUpNotes.length > 0);
      
      if (currentUser?.role === 'Sales Executive') {
          completed = completed.filter(c => 
              c.followUpNotes?.some(note => note.agent === currentUser.name)
          );
      }
      
      return [pending, completed];
  }, [baseFollowUpList, currentUser]);

  const todaysReminders = useMemo(() => {
    return customers.filter(customer => 
        customer.followUpNotes?.some(note => 
            note.reminderDate && isToday(new Date(note.reminderDate))
        )
    );
  }, [customers]);

  const allPurchases: Purchase[] = useMemo(() => {
    return customers.flatMap(c => c.purchases.map(p => ({...p, date: new Date(p.date)})));
  }, [customers]);
  
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} onRegister={handleRegister} />;
  }
  
  const viewTitles: Record<View, string> = {
    dashboard: 'Dashboard',
    products: 'Product Management',
    newOrder: 'Create New Order',
    trackOrder: 'Track Order',
    orderStatus: 'Order Status Overview',
    settings: 'Settings',
    followUp: 'Follow-up Center',
    userManagement: 'User Management',
    uploadData: 'Upload Customer Data',
    loading: 'Loading...'
  };


  const renderView = () => {
    if(isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
        );
    }
    
    if (error) {
        return <div className="p-4 bg-red-100 text-red-700 rounded-md">Error: {error}</div>;
    }

    // Role-based view protection
    if (currentUser.role === 'Sales Executive' && activeView !== 'followUp') {
       return <FollowUpPage todaysReminders={todaysReminders} pendingFollowUpList={pendingFollowUpList} completedFollowUpList={completedFollowUpList} onAddFollowUpNote={addFollowUpNote} products={products} currentUser={currentUser} />;
    }

    switch (activeView) {
      case 'dashboard':
        return <CustomerDashboard allCustomers={customers} repeatBuyers={repeatBuyers} followUpList={baseFollowUpList} onAddFollowUpNote={addFollowUpNote} products={products} allPurchases={allPurchases} currentUser={currentUser} />;
      case 'followUp':
        return <FollowUpPage todaysReminders={todaysReminders} pendingFollowUpList={pendingFollowUpList} completedFollowUpList={completedFollowUpList} onAddFollowUpNote={addFollowUpNote} products={products} currentUser={currentUser} />;
      case 'uploadData':
          return <DataUploadPage onUploadSuccess={handleDataUploaded} />;
      case 'products':
        return <ProductsPage products={products} onAddProduct={addProduct} onUpdateProduct={updateProduct} onDeleteProduct={deleteProduct} />;
      case 'newOrder':
        return <NewOrderPage customers={customers} products={products} setView={setActiveView} />;
      case 'trackOrder':
        return <TrackOrderPage />;
       case 'orderStatus':
        return <OrderStatusPage />;
       case 'settings':
        return <SettingsPage />;
      case 'userManagement':
        return <UserManagementPage users={users} currentUser={currentUser} onToggleStatus={handleToggleUserStatus} />;
      default:
        return (
          <div className="max-w-4xl mx-auto py-12">
            <h3 className="text-xl font-semibold text-slate-700">Welcome!</h3>
            <p className="text-slate-500">Select an option from the sidebar to get started.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 md:flex">
      <Sidebar user={currentUser} activeView={activeView} setView={setActiveView} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} onLogout={handleLogout} />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <Header 
          title={viewTitles[activeView]} 
          onMenuClick={() => setIsSidebarOpen(true)}
          reminders={todaysReminders}
          onReminderClick={(customer) => {
            setActiveView('followUp');
          }}
        />
        {renderView()}
      </main>
    </div>
  );
};

export default App;
