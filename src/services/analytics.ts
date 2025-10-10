import { Post } from '@/types/index';
import { PostAnalytics, DashboardStats } from '@/types/analytics';
import { calculateReadingTime } from '@/lib/formatters';
import { ERROR_MESSAGES } from '@/lib/constants';

export interface AnalyticsService {
  getDashboardStats(posts: Post[]): DashboardStats;
  getPostAnalytics(posts: Post[]): PostAnalytics[];
  getViewsOverTime(posts: Post[], timeRange: '7d' | '30d' | '90d' | '1y'): any[];
  getTopPosts(posts: Post[], limit?: number): Post[];
  getEngagementData(posts: Post[]): any[];
}

class RealAnalyticsService implements AnalyticsService {
  getDashboardStats(posts: Post[]): DashboardStats {
    const totalPosts = posts.length;
    const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
    const totalComments = posts.reduce((sum, post) => sum + (post.comments_count || 0), 0);
    const totalLikes = posts.reduce((sum, post) => sum + (post.likes_count || 0), 0);
    
    const averageReadTime = totalPosts > 0 
      ? Math.round(posts.reduce((sum, post) => sum + calculateReadingTime(post.content), 0) / totalPosts)
      : 0;

    const mostPopularPost = posts.length > 0 
      ? posts.reduce((prev, current) => (prev.views || 0) > (current.views || 0) ? prev : current)
      : null;

    const recentActivity = posts
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(post => ({
        type: 'view' as const,
        postId: post.id,
        postTitle: post.title,
        timestamp: new Date(post.created_at)
      }));

    return {
      totalPosts,
      totalViews,
      totalComments,
      totalLikes,
      averageReadTime,
      mostPopularPost: mostPopularPost ? {
        id: mostPopularPost.id,
        title: mostPopularPost.title,
        views: mostPopularPost.views || 0
      } : {
        id: '',
        title: ERROR_MESSAGES.NOT_FOUND,
        views: 0
      },
      recentActivity
    };
  }

  getPostAnalytics(posts: Post[]): PostAnalytics[] {
    return posts.map(post => ({
      id: post.id,
      postId: post.id,
      views: post.views || 0,
      readTime: calculateReadingTime(post.content),
      bounceRate: 0.15,
      socialShares: 0, 
      comments: post.comments_count || 0,
      likes: post.likes_count || 0,
      createdAt: new Date(post.created_at),
      updatedAt: new Date(post.updated_at || post.created_at)
    }));
  }

  getViewsOverTime(posts: Post[], timeRange: '7d' | '30d' | '90d' | '1y'): any[] {
    const now = new Date();
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    const filteredPosts = posts.filter(post => 
      new Date(post.created_at) >= startDate
    );

    const groupedData: { [key: string]: { views: number; comments: number; likes: number } } = {};

    filteredPosts.forEach(post => {
      const postDate = new Date(post.created_at);
      let key: string;

      if (timeRange === '7d') {
        key = postDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      } else if (timeRange === '30d') {
        key = postDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      } else if (timeRange === '90d') {
        key = postDate.toLocaleDateString('pt-BR', { month: 'short' });
      } else {
        key = postDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      }

      if (!groupedData[key]) {
        groupedData[key] = { views: 0, comments: 0, likes: 0 };
      }

      groupedData[key].views += post.views || 0;
      groupedData[key].comments += post.comments_count || 0;
      groupedData[key].likes += post.likes_count || 0;
    });

    return Object.entries(groupedData).map(([name, data]) => ({
      name,
      views: data.views,
      comments: data.comments,
      likes: data.likes
    }));
  }

  getTopPosts(posts: Post[], limit: number = 5): Post[] {
    return posts
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, limit);
  }

  getEngagementData(posts: Post[]): any[] {
    const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
    const totalComments = posts.reduce((sum, post) => sum + (post.comments_count || 0), 0);
    const totalLikes = posts.reduce((sum, post) => sum + (post.likes_count || 0), 0);

    return [
      { name: 'Views', value: totalViews, color: '#8884d8' },
      { name: 'Comments', value: totalComments, color: '#82ca9d' },
      { name: 'Likes', value: totalLikes, color: '#ffc658' },
    ];
  }
}

export const analyticsService = new RealAnalyticsService();

export type { AnalyticsService as AnalyticsServiceType };