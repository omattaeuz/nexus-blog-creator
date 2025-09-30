import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from '../LoginForm';

// Mock do useAuth
vi.mock('../../contexts/useAuth', () => ({
  useAuth: vi.fn(() => ({
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,
  })),
}));

// Mock do toast
vi.mock('../../hooks/use-toast', () => ({
  toast: vi.fn(),
}));

// Mock do supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn(),
    },
  },
}));

// Mock do useFormValidation
vi.mock('../../hooks/useFormValidation', () => ({
  useFormValidation: vi.fn(() => ({
    errors: {},
    validateForm: vi.fn(),
    clearError: vi.fn(),
  })),
  commonValidationRules: {
    email: { required: true, pattern: /^\S+@\S+\.\S+$/ },
    password: { required: true, minLength: 6 },
  },
}));

// Mock do usePasswordVisibility
vi.mock('../../hooks/usePasswordVisibility', () => ({
  usePasswordVisibility: vi.fn(() => ({
    showPassword: false,
    togglePassword: vi.fn(),
  })),
}));

// Mock do useAsyncOperation
vi.mock('../../hooks/useAsyncOperation', () => ({
  useAsyncOperation: vi.fn(() => ({
    execute: vi.fn(),
    isLoading: false,
    error: null,
    isSuccess: false,
  })),
}));

// Mock do react-router-dom
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    Link: ({ children, to, ...props }: any) => {
      const React = require('react');
      return React.createElement('a', { href: to, ...props }, children);
    },
  };
});

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLoginForm = () =>
    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

  it('should render email and password inputs', () => {
    renderLoginForm();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
  });

  it('should render login button', () => {
    renderLoginForm();
    expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();
  });

  it('should render forgot password button', () => {
    renderLoginForm();
    expect(screen.getByRole('button', { name: /Esqueci minha senha/i })).toBeInTheDocument();
  });
});