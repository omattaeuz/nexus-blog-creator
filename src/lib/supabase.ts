import { createClient } from '@supabase/supabase-js';
import { N8N_CONFIG } from '@/config/n8n';

export const supabase = createClient(
  N8N_CONFIG.SUPABASE.URL,
  N8N_CONFIG.SUPABASE.ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

export const authHelpers = {
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

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

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        if (error.message.includes('session_not_found') || error.message.includes('Auth session missing')) {
          console.warn('Session already expired, clearing local state');
          this.clearLocalStorage();
          return;
        }
        throw error;
      }
    } catch (_error) {
      console.warn('Logout failed, but clearing local state anyway');
      this.clearLocalStorage();
    }
  },

  clearLocalStorage() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('supabase') || key.includes('sb-')) localStorage.removeItem(key);
      });
      console.log('LocalStorage cleared for Supabase auth');
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  },

  async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data;
  },

  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw error;
    return data;
  }
};

export const dbHelpers = {
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

  async getPost(id: string) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

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

  async updatePost(id: string, title: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('posts')
      .update({ title, content })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deletePost(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) throw error;
    return true;
  }
};