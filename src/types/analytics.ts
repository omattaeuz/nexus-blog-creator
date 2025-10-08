export interface PostAnalytics {
  id: string;
  postId: string;
  views: number;
  readTime: number;
  bounceRate: number;
  socialShares: number;
  comments: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalPosts: number;
  totalViews: number;
  totalComments: number;
  totalLikes: number;
  averageReadTime: number;
  mostPopularPost: {
    id: string;
    title: string;
    views: number;
  };
  recentActivity: {
    type: 'view' | 'comment' | 'like' | 'share';
    postId: string;
    postTitle: string;
    timestamp: Date;
  }[];
}

export interface Comment {
  id: string;
  postId: string;
  author: string;
  authorEmail: string;
  content: string;
  replies: Comment[];
  createdAt: Date;
  updatedAt: Date;
  approved: boolean;
  likes: number;
  isReply: boolean;
  parentId?: string;
}

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  canonical: string;
  author: string;
  publishedTime: string;
  modifiedTime: string;
  section: string;
  tags: string[];
}

export interface PostTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
  createdAt: Date;
}

export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: Date;
  details: Record<string, any>;
}

export interface Notification {
  id: string;
  type: 'comment' | 'like' | 'mention' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  userId: string;
  postId?: string;
  commentId?: string;
}