import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, authHelpers } from '@/lib/supabase';
import { logAuth, logError } from '@/lib/logger';
import { ERROR_MESSAGES } from '@/lib/constants';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import type { User, LoginData, RegisterData } from '@/types';

// Remove duplicate types - now imported from @/types

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Convert Supabase user to local User type
  const convertSupabaseUser = (supabaseUser: SupabaseUser | null): User | null => {
    if (!supabaseUser) return null;
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      created_at: supabaseUser.created_at
    };
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          logError('Error getting session', { error: error.message });
        } else if (session) {
          logAuth('Session restored', { email: session.user.email });
          setUser(convertSupabaseUser(session.user));
          setToken(session.access_token);
        }
      } catch (error) {
        logError('Error initializing auth', { error: error instanceof Error ? error.message : 'Unknown error' });
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logAuth('Auth state changed', { event, email: session?.user?.email });
        
        if (session) {
          setUser(convertSupabaseUser(session.user));
          setToken(session.access_token);
        } else {
          setUser(null);
          setToken(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (data: LoginData): Promise<void> => {
    try {
      logAuth('Attempting login', { email: data.email });
      const result = await authHelpers.signIn(data.email, data.password);
      
      if ('error' in result && result.error) {
        const errorMessage = result.error instanceof Error ? result.error.message : 'Login failed';
        logError('Login error', { error: errorMessage });
        throw new Error(errorMessage || ERROR_MESSAGES.UNEXPECTED_ERROR);
      }
      
      if (result.user && result.session) {
        logAuth('Login successful', { email: result.user.email });
        // State will be updated by the auth state change listener
      }
    } catch (error) {
      logError('Login failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      logAuth('Attempting registration', { email: data.email });
      const result = await authHelpers.signUp(data.email, data.password);
      
      if ('error' in result && result.error) {
        const errorMessage = result.error instanceof Error ? result.error.message : 'Registration failed';
        logError('Registration error', { error: errorMessage });
        throw new Error(errorMessage || ERROR_MESSAGES.UNEXPECTED_ERROR);
      }
      
      if (result.user) {
        logAuth('Registration successful, email confirmation required', { email: result.user.email });
        // Don't set user state here - wait for email confirmation
      }
    } catch (error) {
      logError('Registration failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      logAuth('Logging out');
      await authHelpers.signOut();
      // State will be updated by the auth state change listener
    } catch (error) {
      logError('Logout error', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
  };

  // Debug: Log auth state changes
  useEffect(() => {
    logAuth('Auth state changed', {
      isAuthenticated: !!user && !!token,
      hasUser: !!user,
      hasToken: !!token,
      tokenPreview: token ? `${token.slice(0, 12)}...` : 'null',
      userEmail: user?.email || 'null'
    });
  }, [user, token]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  
  return context;
};
