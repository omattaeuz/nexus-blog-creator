// API service for blog posts
// Note: This will work fully once Supabase backend is connected

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  author?: string;
}

interface CreatePostData {
  title: string;
  content: string;
}

interface UpdatePostData {
  title: string;
  content: string;
}

// Mock data for demonstration until backend is connected
const mockPosts: Post[] = [
  {
    id: "1",
    title: "Welcome to Onboarding Blog",
    content: "This is your first blog post! This application demonstrates a complete CRUD blog system with a beautiful, modern interface. You can create, read, update, and delete posts seamlessly. The design features a gradient-based theme with smooth animations and responsive layouts that work perfectly on all devices. Once you connect Supabase, all these operations will persist to a real database with user authentication and advanced features.",
    createdAt: new Date().toISOString(),
    author: "System",
  },
  {
    id: "2", 
    title: "Getting Started with Your Blog",
    content: "Ready to start blogging? Here are some tips to get you started: 1) Write engaging titles that capture attention 2) Create valuable content that helps your readers 3) Use proper formatting with headings and lists 4) Add images to make posts more visual 5) Engage with your audience through comments. Remember, consistency is key - try to post regularly to build your audience. Don't forget to connect Supabase to enable user authentication, data persistence, and advanced features like comments and user profiles.",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    author: "System",
  }
];

let posts = [...mockPosts];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // Create a new post
  async createPost(data: CreatePostData): Promise<Post> {
    await delay(800);
    
    const newPost: Post = {
      id: Date.now().toString(),
      title: data.title,
      content: data.content,
      createdAt: new Date().toISOString(),
      author: "Current User", // Will be dynamic with auth
    };
    
    posts.unshift(newPost);
    return newPost;
  },

  // Get all posts with optional pagination and filtering
  async getPosts(options?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ posts: Post[]; total: number; page: number; totalPages: number }> {
    await delay(500);
    
    let filteredPosts = [...posts];
    
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
  },

  // Get a specific post by ID
  async getPost(id: string): Promise<Post | null> {
    await delay(300);
    
    const post = posts.find(p => p.id === id);
    return post || null;
  },

  // Update an existing post
  async updatePost(id: string, data: UpdatePostData): Promise<Post | null> {
    await delay(800);
    
    const postIndex = posts.findIndex(p => p.id === id);
    if (postIndex === -1) return null;
    
    const updatedPost: Post = {
      ...posts[postIndex],
      title: data.title,
      content: data.content,
      updatedAt: new Date().toISOString(),
    };
    
    posts[postIndex] = updatedPost;
    return updatedPost;
  },

  // Delete a post
  async deletePost(id: string): Promise<boolean> {
    await delay(500);
    
    const postIndex = posts.findIndex(p => p.id === id);
    if (postIndex === -1) return false;
    
    posts.splice(postIndex, 1);
    return true;
  },
};

export type { Post, CreatePostData, UpdatePostData };