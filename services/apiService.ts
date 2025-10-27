import { User, Customer, FollowUpNote } from '../types';

const API_BASE_URL = 'http://localhost:5001/api'; // Your backend server URL

// --- Helper for API calls ---
const apiRequest = async (endpoint: string, method: string = 'GET', body: any = null) => {
    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            // In a real app, you'd add an Authorization header with a JWT token
        },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'An API error occurred');
    }

    return data;
};

// --- Auth Functions ---
export const login = async (email: string, password: string): Promise<User> => {
    return apiRequest('/login', 'POST', { email, password });
};

export const register = async (name: string, email: string, password: string): Promise<User> => {
    return apiRequest('/register', 'POST', { name, email, password });
};

// --- User Management Functions ---
export const getUsers = async (): Promise<User[]> => {
    return apiRequest('/users');
};

export const toggleUserStatus = async (userId: number): Promise<User> => {
    return apiRequest(`/users/${userId}/toggle-status`, 'PATCH');
};

// --- Customer Data Functions ---
export const getCustomers = async (): Promise<Customer[]> => {
    return apiRequest('/customers');
};

export const addFollowUpNote = async (customerId: number | string, note: FollowUpNote): Promise<Customer> => {
    return apiRequest(`/customers/${customerId}/followup`, 'POST', note);
};

export const uploadCustomers = async (customers: any[]): Promise<{ message: string }> => {
    return apiRequest('/upload-customers', 'POST', customers);
};
