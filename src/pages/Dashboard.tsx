import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnimatedBackground from '@/components/AnimatedBackground';
import { 
  BarChart3, 
  MessageCircle, 
  FileText, 
  Search,
  Settings,
  HardDrive,
  Bell,
  TrendingUp,
  Eye,
  Heart
} from 'lucide-react';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import CommentsSystem from '@/components/CommentsSystem';
import PostTemplates from '@/components/PostTemplates';
import AdvancedSearch from '@/components/AdvancedSearch';
import NotificationSystem from '@/components/NotificationSystem';
import BackupManager from '@/components/BackupManager';
import HelpModal from '@/components/HelpModal';
import { useKeyboardShortcuts, createBlogShortcuts } from '@/hooks/useKeyboardShortcuts';
import { usePosts } from '@/hooks/usePosts';
import { useNotifications } from '@/hooks/useNotifications';
import { Comment } from '@/types/analytics';
import { Post } from '@/types/index';
import { analyticsService } from '@/services/analytics';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use real posts data
  const { 
    posts, 
    loading: postsLoading, 
    error: postsError,
    searchPosts,
    filters 
  } = usePosts();

  // Use notifications hook
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    preferences,
    updatePreferences
  } = useNotifications();

  // Calculate real stats using analytics service
  const realStats = analyticsService.getDashboardStats(posts);
  const realPostAnalytics = analyticsService.getPostAnalytics(posts);

  useEffect(() => {
    setIsLoading(postsLoading);
  }, [postsLoading]);

  // Generate activity-based notifications when posts change
  useEffect(() => {
    if (posts.length > 0) {
      // This would be called by the notification service when posts are updated
      // For now, we'll just ensure notifications are loaded
    }
  }, [posts]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: createBlogShortcuts({
      onNewPost: () => window.location.href = '/posts/new',
      onSavePost: () => console.log('Save post shortcut'),
      onPreviewPost: () => console.log('Preview post shortcut'),
      onSearch: () => setActiveTab('search'),
      onGoToPosts: () => window.location.href = '/posts',
      onGoToHome: () => setActiveTab('overview'),
      onGoToAnalytics: () => setActiveTab('analytics'),
      onGoToSettings: () => setActiveTab('settings'),
      onHelp: () => console.log('Help shortcut')
    })
  });

  // Real functions for comments (would integrate with API)
  const handleAddComment = (content: string, parentId?: string) => {
    // TODO: Integrate with real comments API
    const newComment: Comment = {
      id: Date.now().toString(),
      postId: '1',
      author: 'Usuário',
      authorEmail: 'usuario@example.com',
      content,
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      approved: true,
      likes: 0,
      isReply: !!parentId,
      parentId
    };
    setComments(prev => [...prev, newComment]);
  };

  const handleLikeComment = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, likes: comment.likes + 1 }
        : comment
    ));
  };

  const handleReply = (commentId: string, content: string) => {
    const newReply: Comment = {
      id: Date.now().toString(),
      postId: '1',
      author: 'Usuário',
      authorEmail: 'usuario@example.com',
      content,
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      approved: true,
      likes: 0,
      isReply: true,
      parentId: commentId
    };
    
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, replies: [...comment.replies, newReply] }
        : comment
    ));
  };

  const handleModerate = (commentId: string, approved: boolean) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, approved }
        : comment
    ));
  };

  // Notification handlers are now provided by the hook

  // Handle search with real data
  const handleSearchResults = (results: Post[]) => {
    console.log('Search results:', results);
  };

  // Handle template selection - redirect to create post with template
  const handleSelectTemplate = (template: any) => {
    // Create a URL with template data as query parameters
    const templateData = encodeURIComponent(JSON.stringify({
      title: template.name,
      content: template.content,
      category: template.category
    }));
    
    // Redirect to create post page with template data
    window.location.href = `/posts/new?template=${templateData}`;
  };

  // Handle template creation
  const handleCreateTemplate = (template: any) => {
    console.log('Creating template:', template);
    // TODO: Implement template creation API
  };

  // Handle template update
  const handleUpdateTemplate = (id: string, template: any) => {
    console.log('Updating template:', id, template);
    // TODO: Implement template update API
  };

  // Handle template deletion
  const handleDeleteTemplate = (id: string) => {
    console.log('Deleting template:', id);
    // TODO: Implement template deletion API
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
        <AnimatedBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-gray-300">Carregando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (postsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
        <AnimatedBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2 text-white">Erro ao carregar dados</h2>
            <p className="text-gray-300 mb-4">
              {postsError ? String(postsError) : 'Erro desconhecido'}
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      <AnimatedBackground />
      <header className="relative z-10 border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge className="hidden sm:flex bg-slate-700/50 text-gray-300 border-slate-600/50">
                <TrendingUp className="h-3 w-3 mr-1" />
                {posts.length} posts
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('notifications')}
                className="relative text-gray-400 hover:bg-slate-700/50 hover:text-white"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              <HelpModal shortcuts={createBlogShortcuts({})} />
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap w-full md:grid md:grid-cols-6 lg:grid-cols-8 bg-slate-800/50 backdrop-blur-md border-slate-700/50">
            <TabsTrigger value="overview" className="flex items-center justify-center gap-2 text-gray-300 data-[state=active]:bg-slate-600/50 data-[state=active]:text-white data-[state=active]:shadow-lg flex-1 min-w-0">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center justify-center gap-2 text-gray-300 data-[state=active]:bg-slate-600/50 data-[state=active]:text-white data-[state=active]:shadow-lg flex-1 min-w-0">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center justify-center gap-2 text-gray-300 data-[state=active]:bg-slate-600/50 data-[state=active]:text-white data-[state=active]:shadow-lg flex-1 min-w-0">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Comentários</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center justify-center gap-2 text-gray-300 data-[state=active]:bg-slate-600/50 data-[state=active]:text-white data-[state=active]:shadow-lg flex-1 min-w-0">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="hidden md:flex items-center gap-2 text-gray-300 data-[state=active]:bg-slate-600/50 data-[state=active]:text-white data-[state=active]:shadow-lg">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Busca</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="hidden md:flex items-center gap-2 text-gray-300 data-[state=active]:bg-slate-600/50 data-[state=active]:text-white data-[state=active]:shadow-lg">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="backup" className="hidden md:flex items-center gap-2 text-gray-300 data-[state=active]:bg-slate-600/50 data-[state=active]:text-white data-[state=active]:shadow-lg">
              <HardDrive className="h-4 w-4" />
              <span className="hidden sm:inline">Backup</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="hidden md:flex items-center gap-2 text-gray-300 data-[state=active]:bg-slate-600/50 data-[state=active]:text-white data-[state=active]:shadow-lg">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Total de Posts</CardTitle>
                  <FileText className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{realStats.totalPosts}</div>
                  <p className="text-xs text-gray-300">
                    Posts criados
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Visualizações</CardTitle>
                  <Eye className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{realStats.totalViews.toLocaleString()}</div>
                  <p className="text-xs text-gray-300">
                    Total de visualizações
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Comentários</CardTitle>
                  <MessageCircle className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{realStats.totalComments}</div>
                  <p className="text-xs text-gray-300">
                    Total de comentários
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Curtidas</CardTitle>
                  <Heart className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{realStats.totalLikes}</div>
                  <p className="text-xs text-gray-300">
                    Total de curtidas
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Post Mais Popular</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="space-y-2 cursor-pointer hover:bg-slate-700/50 p-2 rounded-md transition-colors"
                    onClick={() => window.location.href = `/posts/${realStats.mostPopularPost.id}`}
                  >
                    <h3 className="font-semibold hover:text-cyan-400 transition-colors text-white">{realStats.mostPopularPost.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-slate-700/50 text-gray-300 border-slate-600/50">
                        <Eye className="h-3 w-3 mr-1" />
                        {realStats.mostPopularPost.views} visualizações
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {realStats.recentActivity.map((activity, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-3 text-sm cursor-pointer hover:bg-slate-700/50 p-2 rounded-md transition-colors"
                        onClick={() => window.location.href = `/posts/${activity.postId}`}
                      >
                        {activity.type === 'view' && <Eye className="h-4 w-4 text-blue-400" />}
                        {activity.type === 'comment' && <MessageCircle className="h-4 w-4 text-green-400" />}
                        {activity.type === 'like' && <Heart className="h-4 w-4 text-red-400" />}
                        <span className="flex-1 truncate hover:text-cyan-400 transition-colors text-gray-300">{activity.postTitle}</span>
                        <span className="text-gray-400">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white">Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <AnalyticsDashboard 
                  stats={realStats} 
                  postAnalytics={realPostAnalytics}
                  posts={posts}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white">Sistema de Comentários</CardTitle>
              </CardHeader>
              <CardContent>
                <CommentsSystem
                  postId="1"
                  comments={comments}
                  onAddComment={handleAddComment}
                  onLikeComment={handleLikeComment}
                  onReply={handleReply}
                  onModerate={handleModerate}
                  isModerator={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white">Templates de Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <PostTemplates
                  templates={[]}
                  onSelectTemplate={handleSelectTemplate}
                  onCreateTemplate={handleCreateTemplate}
                  onUpdateTemplate={handleUpdateTemplate}
                  onDeleteTemplate={handleDeleteTemplate}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white">Busca Avançada</CardTitle>
              </CardHeader>
              <CardContent>
                <AdvancedSearch
                  posts={posts}
                  onSearchResults={handleSearchResults}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white">Sistema de Notificações</CardTitle>
              </CardHeader>
              <CardContent>
                <NotificationSystem
                  notifications={notifications}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                  onDeleteNotification={deleteNotification}
                  onUpdatePreferences={updatePreferences}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backup" className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white">Gerenciador de Backup</CardTitle>
              </CardHeader>
              <CardContent>
                <BackupManager
                  posts={posts}
                  onRestoreComplete={(message) => {
                    console.log('Restore complete:', message);
                    // TODO: Show toast notification
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white">Configurações do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-white">Notificações</h3>
                    <p className="text-sm text-gray-300">
                      Configure suas preferências de notificação
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    className="border-slate-600/50 text-gray-300 hover:bg-slate-700/50 hover:text-white"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Configurar
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-white">Backup Automático</h3>
                    <p className="text-sm text-gray-300">
                      Configure backups automáticos dos seus posts
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    className="border-slate-600/50 text-gray-300 hover:bg-slate-700/50 hover:text-white"
                  >
                    <HardDrive className="h-4 w-4 mr-2" />
                    Configurar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}