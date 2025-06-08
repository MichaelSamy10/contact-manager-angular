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
