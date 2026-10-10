/**
 * Common shared types and interfaces
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code?: string;
    message: string;
    details?: any;
  };
}

export interface AuthenticatedUser {
  id: string;
  phone: string;
  role: string;
  isBanned?: boolean;
}
