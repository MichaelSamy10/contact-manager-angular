// User interface
export interface User {
  id: string;
  username: string;
  role: string;
  createdAt?: string;
}

// Contact interface
export interface Contact {
  _id?: string;
  name: string;
  phone: string;
  address: string;
  notes?: string;
  createdBy?: {
    _id: string;
    username: string;
  };
  isLocked?: boolean;
  lockedBy?: {
    _id: string;
    username: string;
  };
  lockedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface PaginationInfo {
  current: number;
  pages: number;
  total: number;
  limit: number;
}

export interface ContactsResponse {
  contacts: Contact[];
  pagination: PaginationInfo;
}

// Login interfaces
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Contact form interface
export interface ContactForm {
  name: string;
  phone: string;
  address: string;
  notes: string;
}

// Socket event interfaces
export interface SocketContactLocked {
  contactId: string;
  lockedBy: string;
  username: string;
}

export interface SocketContactUnlocked {
  contactId: string;
}

export interface SocketUserDisconnected {
  userId: string;
}

// Filter and sort interfaces
export interface ContactFilters {
  search: string;
  sortBy: 'name' | 'phone' | 'address' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
}

// Notification interface
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}
