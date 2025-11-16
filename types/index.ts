export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber?: string;
  address?: string;
  birthday?: string;
  profilePicture?: string;
}

export interface Todo {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'Extreme' | 'Moderate' | 'Low';
  createdAt?: string;
  updatedAt?: string;
  order?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  success?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

