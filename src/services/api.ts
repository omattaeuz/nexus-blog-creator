// API service for blog posts
// Integrated with n8n backend on Railway

import axios from 'axios';

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
  user_id?: string;
}

interface CreatePostData {
  title: string;
  content: string;
}

interface UpdatePostData {
  title: string;
  content: string;
}

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: User;
}

interface RegisterData {
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

// Configure axios with base URL for n8n webhook
// Always use direct URL to n8n production
const baseURL = 'https://primary-production-e91c.up.railway.app/webhook';

const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Auth service functions
export const auth = {
  // Register a new user
  async register(data: RegisterData): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.post<ApiResponse<User>>('/register', data);
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const message = error.response.data?.message || `HTTP ${error.response.status}: ${error.response.statusText}`;
          throw new Error(`Failed to register: ${message}`);
        }
        const message = error.message || 'Network error occurred';
        throw new Error(`Failed to register: ${message}`);
      }
      throw new Error('Failed to register: Unknown error');
    }
  },

  // Login user
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/login', data);
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const message = error.response.data?.message || `HTTP ${error.response.status}: ${error.response.statusText}`;
          throw new Error(`Failed to login: ${message}`);
        }
        const message = error.message || 'Network error occurred';
        throw new Error(`Failed to login: ${message}`);
      }
      throw new Error('Failed to login: Unknown error');
    }
  },

  // Get current user from token
  async getCurrentUser(token: string): Promise<User> {
    try {
      const response = await apiClient.get<User>('/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw new Error('Failed to get current user');
    }
  }
};

export const api = {
  // Create a new post (requires authentication)
  async createPost(data: CreatePostData, token: string): Promise<Post> {
    try {
      const response = await apiClient.post<ApiResponse<Post>>('/posts', data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.status === 'success') {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      
      // In development, provide a fallback for CORS issues
      if (import.meta.env.DEV && axios.isAxiosError(error)) {
        if (error.code === 'ERR_NETWORK' || error.message.includes('CORS') || error.code === 'ERR_CANCELED') {
          console.warn('CORS/Network error detected. Using fallback for development.');
          
          // Create a mock response that simulates the n8n response
          const mockPost: Post = {
            id: `mock-${Date.now()}`,
            title: data.title,
            content: data.content,
            created_at: new Date().toISOString(),
            user_id: 'mock-user-id',
          };
          
          // Show a warning toast but still return the mock data
          setTimeout(() => {
            if (typeof window !== 'undefined' && window.alert) {
              alert('⚠️ CORS Error: Using mock data for development. In production, this would be saved to the database.');
            }
          }, 100);
          
          return mockPost;
        }
      }
      
      if (axios.isAxiosError(error)) {
        // Handle authentication errors
        if (error.response?.status === 401) {
          throw new Error('Authentication required. Please login to create posts.');
        }
        
        // Handle CORS errors specifically
        if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
          throw new Error('CORS Error: Unable to connect to the server. Please check your network connection and try again.');
        }
        
        // Handle other HTTP errors
        if (error.response) {
          const message = error.response.data?.message || `HTTP ${error.response.status}: ${error.response.statusText}`;
          throw new Error(`Failed to create post: ${message}`);
        }
        
        // Handle network errors
        const message = error.message || 'Network error occurred';
        throw new Error(`Failed to create post: ${message}`);
      }
      throw new Error('Failed to create post: Unknown error');
    }
  },

  // Get all posts with optional pagination and filtering
  async getPosts(options?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ posts: Post[]; total: number; page: number; totalPages: number }> {
    try {
      // For now, we'll use a mock implementation since the n8n workflow only has POST
      // In a real implementation, you would add GET endpoints to your n8n workflow
      const mockPosts: Post[] = [
        {
          id: "1",
          title: "Welcome to Nexta",
          content: "This is your first blog post! This application demonstrates a complete CRUD blog system with a beautiful, modern interface. You can create, read, update, and delete posts seamlessly. The design features a gradient-based theme with smooth animations and responsive layouts that work perfectly on all devices. Once you connect Supabase, all these operations will persist to a real database with user authentication and advanced features.",
          created_at: new Date().toISOString(),
        },
        {
          id: "2", 
          title: "Getting Started with Your Blog",
          content: "Ready to start blogging? Here are some tips to get you started: 1) Write engaging titles that capture attention 2) Create valuable content that helps your readers 3) Use proper formatting with headings and lists 4) Add images to make posts more visual 5) Engage with your audience through comments. Remember, consistency is key - try to post regularly to build your audience. Don't forget to connect Supabase to enable user authentication, data persistence, and advanced features like comments and user profiles.",
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        }
      ];

      let filteredPosts = [...mockPosts];
      
      // Apply search filter
      if (options?.search) {
        const searchTerm = options.search.toLowerCase();
        filteredPosts = filteredPosts.filter(post => 
          post.title.toLowerCase().includes(searchTerm) ||
          post.content.toLowerCase().includes(searchTerm)
        );
      }
      
      const total = filteredPosts.length;
      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const totalPages = Math.ceil(total / limit);
      
      // Apply pagination
      const startIndex = (page - 1) * limit;
      const paginatedPosts = filteredPosts.slice(startIndex, startIndex + limit);
      
      return {
        posts: paginatedPosts,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw new Error('Failed to fetch posts');
    }
  },

  // Get a specific post by ID
  async getPost(id: string): Promise<Post | null> {
    try {
      // For now, we'll use a mock implementation since the n8n workflow only has POST
      // In a real implementation, you would add GET endpoints to your n8n workflow
      const mockPosts: Post[] = [
        {
          id: "1",
          title: "Welcome to Nexta",
          content: "This is your first blog post! This application demonstrates a complete CRUD blog system with a beautiful, modern interface. You can create, read, update, and delete posts seamlessly. The design features a gradient-based theme with smooth animations and responsive layouts that work perfectly on all devices. Once you connect Supabase, all these operations will persist to a real database with user authentication and advanced features.",
          created_at: new Date().toISOString(),
        },
        {
          id: "2", 
          title: "Getting Started with Your Blog",
          content: "Ready to start blogging? Here are some tips to get you started: 1) Write engaging titles that capture attention 2) Create valuable content that helps your readers 3) Use proper formatting with headings and lists 4) Add images to make posts more visual 5) Engage with your audience through comments. Remember, consistency is key - try to post regularly to build your audience. Don't forget to connect Supabase to enable user authentication, data persistence, and advanced features like comments and user profiles.",
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        }
      ];
      
      const post = mockPosts.find(p => p.id === id);
      return post || null;
    } catch (error) {
      console.error('Error fetching post:', error);
      throw new Error('Failed to fetch post');
    }
  },

  // Update an existing post
  async updatePost(id: string, data: UpdatePostData): Promise<Post | null> {
    try {
      // For now, we'll use a mock implementation since the n8n workflow only has POST
      // In a real implementation, you would add PUT/PATCH endpoints to your n8n workflow
      const mockPost: Post = {
        id,
        title: data.title,
        content: data.content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      return mockPost;
    } catch (error) {
      console.error('Error updating post:', error);
      throw new Error('Failed to update post');
    }
  },

  // Delete a post
  async deletePost(id: string): Promise<boolean> {
    try {
      // For now, we'll use a mock implementation since the n8n workflow only has POST
      // In a real implementation, you would add DELETE endpoints to your n8n workflow
      console.log(`Mock delete for post with id: ${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw new Error('Failed to delete post');
    }
  },
};

export type { Post, CreatePostData, UpdatePostData, User, AuthResponse, RegisterData, LoginData };