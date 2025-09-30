import { vi } from 'vitest';

// Mock do Supabase
export const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
};

// Mock do React Router
export const mockNavigate = vi.fn();
export const mockUseNavigate = () => mockNavigate;

// Mock do React Router DOM
vi.mock('react-router-dom', () => ({
  useNavigate: mockUseNavigate,
  Link: ({ children, to, ...props }: any) => {
    const React = require('react');
    return React.createElement('a', { href: to, ...props }, children);
  },
  useParams: () => ({}),
  useLocation: () => ({ pathname: '/' }),
}));

// Mock do Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
  authHelpers: {
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  },
}));

// Mock do toast
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

// Mock do axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
    isAxiosError: vi.fn(),
  },
}));

// Mock do logger
vi.mock('@/lib/logger', () => ({
  logAuth: vi.fn(),
  logError: vi.fn(),
  logApi: vi.fn(),
}));

// Mock do N8N config
vi.mock('@/config/n8n', () => ({
  N8N_CONFIG: {
    WEBHOOK_URL: 'https://test.n8n.co/webhook',
    SUPABASE: {
      URL: 'https://test.supabase.co',
      ANON_KEY: 'test-anon-key',
    },
  },
}));

// Mock do window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000',
    pathname: '/',
    href: 'http://localhost:3000/',
  },
  writable: true,
});

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock do sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock do fetch
global.fetch = vi.fn();

// Mock do IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock do ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock do crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'mock-uuid-123'),
  },
});

// Helper para criar dados de teste
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2023-01-01T00:00:00Z',
  ...overrides,
});

export const createMockPost = (overrides = {}) => ({
  id: 'test-post-id',
  title: 'Test Post',
  content: 'This is a test post content',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  user_id: 'test-user-id',
  ...overrides,
});

export const createMockSession = (overrides = {}) => ({
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: createMockUser(),
  ...overrides,
});

// Helper para simular delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper para simular erro de rede
export const createNetworkError = () => {
  const error = new Error('Network Error');
  error.name = 'NetworkError';
  return error;
};

// Helper para simular erro de autenticação
export const createAuthError = (message = 'Invalid credentials') => {
  const error = new Error(message);
  error.name = 'AuthError';
  return error;
};
