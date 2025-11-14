/**
 * Authentication API functions.
 */
import api from './api';

export interface RegisterData {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  terms_accepted: boolean;
}

export interface LoginData {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_email_verified: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
  expires_in: number;
}

// Auth API functions
export const authAPI = {
  register: async (data: RegisterData) => {
    const response = await api.post('/api/v1/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<LoginResponse> => {
    const response = await api.post('/api/v1/auth/login', data);
    // Store tokens
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
    }
    return response.data;
  },

  logout: async () => {
    await api.post('/api/v1/auth/logout');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  verifyEmail: async (token: string) => {
    const response = await api.post('/api/v1/auth/verify-email', { token });
    return response.data;
  },

  resendVerification: async (email: string) => {
    const response = await api.post('/api/v1/auth/resend-verification', { email });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/api/v1/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, new_password: string, confirm_password: string) => {
    const response = await api.post('/api/v1/auth/reset-password', {
      token,
      new_password,
      confirm_password,
    });
    return response.data;
  },

  changePassword: async (current_password: string, new_password: string, confirm_password: string) => {
    const response = await api.post('/api/v1/auth/change-password', {
      current_password,
      new_password,
      confirm_password,
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/api/v1/users/me');
    return response.data;
  },
};

// OAuth URLs
export const getGoogleOAuthUrl = () => {
  return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/google/login`;
};

export const getMicrosoftOAuthUrl = () => {
  return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/microsoft/login`;
};

