import React from 'react';
import { User } from '../types';

interface UserManagementPageProps {
    users: User[];
    currentUser: User;
    onToggleStatus: (userId: number) => void;
}

const UserManagementPage: React.FC<UserManagementPageProps> = ({ users, currentUser, onToggleStatus }) => {
    
    const roleColors: Record<User['role'], string> = {
        'Administrator': 'bg-blue-100 text-blue-800',
        'Sales Executive': 'bg-green-100 text-green-800',
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h2 className="text-3xl font-bold text-slate-800">User Management</h2>
            </div>
             <p className="text-sm text-slate-600 mb-6 max-w-2xl">
                This page allows administrators to view all users in the system and manage their access. Use the toggle to activate or block a user's account.
            </p>
            
            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-slate-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">User Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Role</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-900">{user.name}</div>
                                        <div className="text-xs text-slate-500">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                         <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors[user.role]}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm">
                                         <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                            {user.isActive ? 'Active' : 'Blocked'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        {user.id !== currentUser.id && user.role !== 'Administrator' ? (
                                             <button
                                                onClick={() => onToggleStatus(user.id)}
                                                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                                user.isActive ? 'bg-blue-600' : 'bg-slate-300'
                                                }`}
                                            >
                                                <span className="sr-only">Toggle Status</span>
                                                <span
                                                aria-hidden="true"
                                                className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                                                    user.isActive ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                                />
                                            </button>
                                        ) : (
                                            <span className="text-xs text-slate-400">N/A</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagementPage;