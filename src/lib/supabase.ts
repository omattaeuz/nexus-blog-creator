import { createClient } from '@supabase/supabase-js';
import { N8N_CONFIG } from '@/config/n8n';

// Create Supabase client
export const supabase = createClient(
  N8N_CONFIG.SUPABASE.URL,
  N8N_CONFIG.SUPABASE.ANON_KEY,
  {
    auth: {
      // Configure auth settings
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Auth helper functions
export const authHelpers = {
  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Get current session
  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Sign up with email and password
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/email-confirmation`
      }
    });
    if (error) throw error;
    return data;
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        // If session is already expired or invalid, we can still clear local state
        if (error.message.includes('session_not_found') || error.message.includes('Auth session missing')) {
          console.warn('Session already expired, clearing local state');
          // Manually clear localStorage for expired sessions
          this.clearLocalStorage();
          return; // Don't throw error for expired sessions
        }
        throw error;
      }
    } catch (_error) {
      // If logout fails due to session issues, we should still clear local state
      console.warn('Logout failed, but clearing local state anyway');
      // Manually clear localStorage when logout fails
      this.clearLocalStorage();
      // Don't re-throw the error to allow the app to continue
    }
  },

  // Clear localStorage manually
  clearLocalStorage() {
    try {
      // Clear all Supabase auth related localStorage items
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('supabase') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      console.log('LocalStorage cleared for Supabase auth');
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  },

  // Refresh session
  async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data;
  },

  // Reset password
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw error;
    return data;
  }
};

// Database helper functions
export const dbHelpers = {
  // Get posts
  async getPosts(page = 1, limit = 10) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data, error, count } = await supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) throw error;
    
    return {
      posts: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    };
  },

  // Get single post
  async getPost(id: string) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create post
  async createPost(title: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('posts')
      .insert({
        title,
        content,
        user_id: user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update post
  async updatePost(id: string, title: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('posts')
      .update({ title, content })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only update their own posts
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete post
  async deletePost(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure user can only delete their own posts
    
    if (error) throw error;
    return true;
  }
};
