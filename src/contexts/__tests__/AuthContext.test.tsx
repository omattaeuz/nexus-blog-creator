import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from '../AuthContext';
import { useAuth } from '../useAuth';

// Mock do supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
  },
  authHelpers: {
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  },
}));

// Mock do logger
vi.mock('../../lib/logger', () => ({
  logAuth: vi.fn(),
  logError: vi.fn(),
}));

// Helper component to consume AuthContext
const TestComponent = () => {
  const { user, token, isLoading, isAuthenticated } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? user.email : 'No user'}</span>
      <span data-testid="token">{token ? 'Has token' : 'No token'}</span>
      <span data-testid="loading">{isLoading ? 'Loading' : 'Not loading'}</span>
      <span data-testid="authenticated">{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</span>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render AuthProvider without crashing', () => {
    render(
      <AuthProvider>
        <div>Test</div>
      </AuthProvider>
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should have useAuth hook available', () => {
    // This test verifies that useAuth is imported correctly
    expect(useAuth).not.toBeNull();
  });
});