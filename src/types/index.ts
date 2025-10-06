/**
 * Centralized type definitions for the application
 * Provides consistent typing across all components and services
 */

// User types
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at?: string;
}

// Authentication types
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginData extends Record<string, unknown> {
  email: string;
  password: string;
}

export interface RegisterData extends Record<string, unknown> {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: User;
}

// Post types
export interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
  user_id?: string;
  is_public?: boolean;
  author?: {
    id: string;
    email: string;
  };
}

export interface CreatePostData {
  title: string;
  content: string;
  is_public?: boolean;
}

export interface UpdatePostData {
  title: string;
  content: string;
  is_public?: boolean;
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  totalPages: number;
}

// Form types
export interface FormState<T> {
  data: T;
  errors: Record<keyof T, string>;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

// API types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  errors?: ValidationError[];
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

// UI types
export interface ToastMessage {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

// Component props types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface FormComponentProps<T> extends BaseComponentProps {
  onSubmit: (data: T) => void | Promise<void>;
  initialData?: Partial<T>;
  validationRules?: any;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

// Configuration types
export interface AppConfig {
  apiUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  enableAnalytics: boolean;
  enableDebugMode: boolean;
}

// Hook return types
export interface UseAsyncOperationReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
  setError: (error: string | null) => void;
}

export interface UseFormValidationReturn<T> {
  errors: Record<keyof T, string>;
  validateField: (field: keyof T, value: string) => string | null;
  validateForm: (data: T) => boolean;
  clearError: (field: keyof T) => void;
  clearAllErrors: () => void;
  hasErrors: boolean;
}

// Event types
export interface FormEvent<T> {
  target: {
    name: keyof T;
    value: string;
  };
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Status types
export type LoadingStatus = 'idle' | 'loading' | 'success' | 'error';
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';
export type FormStatus = 'idle' | 'validating' | 'submitting' | 'success' | 'error';
