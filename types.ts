// FIX: Moved Packzy API service types here to avoid circular dependencies and defined them.
export interface ApiCredentials {
  apiKey: string;
  secretKey: string;
}

export interface OrderPayload {
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  note: string;
}

export interface OrderSuccessResponse {
  consignment: {
    consignment_id: string;
    tracking_code: string;
  };
}

export interface TrackingStatusResponse {
  delivery_status: string;
}

export interface ApiErrorResponse {
  message: string;
  errors?: { [key: string]: string[] };
}

export interface Order {
    consignment_id: number;
    invoice: string;
    tracking_code: string;
    recipient_name: string;
    recipient_phone: string;
    cod_amount: number;
    status: string;
    created_at: string;
}

export interface OrdersResponse {
    data: Order[];
}


export interface FollowUpNote {
  date: Date;
  feedback: 'Positive' | 'Happy' | 'Neutral' | 'Angry' | 'Not Interested' | 'Call Back Later';
  notes: string;
  agent: string;
  reminderDate?: Date;
}

// FIX: Added and exported Purchase type for use across components.
export interface Purchase {
  date: Date;
  product: string;
  amount: number;
}

export interface Customer {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  lastPurchaseDate: Date;
  // FIX: Used the exported Purchase type.
  purchases: Purchase[];
  purchaseCount: number;
  totalSpending: number;
  valueRating: 'High' | 'Medium' | 'Low';
  purchaseHistory: string; // A summary of products purchased
  followUpNotes?: FollowUpNote[];
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'Administrator' | 'Sales Executive';
  isActive: boolean;
}


// Re-exporting for use in other files if needed
// FIX: Removed re-export as it's no longer needed and was part of a circular dependency issue.