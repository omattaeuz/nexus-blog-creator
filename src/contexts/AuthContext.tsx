import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, authHelpers } from '@/lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

// Local types for compatibility
interface User {
  id: string;
  email: string;
  created_at: string;
}

interface RegisterData {
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

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
          console.error('Error getting session:', error);
        } else if (session) {
          setUser(convertSupabaseUser(session.user));
          setToken(session.access_token);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.email);
        
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
      console.log('🔐 Attempting login with Supabase SDK:', data.email);
      const result = await authHelpers.signIn(data.email, data.password);
      
      if ('error' in result && result.error) {
        console.error('❌ Login error:', result.error);
        throw new Error((result.error as any).message || 'Login failed');
      }
      
      if (result.user && result.session) {
        console.log('✅ Login successful:', result.user.email);
        // State will be updated by the auth state change listener
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      console.log('📝 Attempting registration with Supabase SDK:', data.email);
      const result = await authHelpers.signUp(data.email, data.password);
      
      if ('error' in result && result.error) {
        console.error('❌ Registration error:', result.error);
        throw new Error((result.error as any).message || 'Registration failed');
      }
      
      if (result.user) {
        console.log('✅ Registration successful, email confirmation required:', result.user.email);
        // Don't set user state here - wait for email confirmation
      }
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🚪 Logging out...');
      await authHelpers.signOut();
      // State will be updated by the auth state change listener
    } catch (error) {
      console.error('❌ Logout error:', error);
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
    console.log('🔐 Auth state changed:', {
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
