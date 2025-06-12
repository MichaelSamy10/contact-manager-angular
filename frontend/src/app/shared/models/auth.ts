export interface LoginCredentials {
  username: string;
  password: string;
}

// Contact interface
export interface Contact {
  _id?: string;
  name: string;
  phone: string;
  address: string;
  notes?: string;
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}
