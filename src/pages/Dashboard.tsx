import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import ThemeToggle from '@/components/ThemeToggle';
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
      onToggleTheme: () => console.log('Toggle theme shortcut'),
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (postsError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-destructive text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Erro ao carregar dados</h2>
          <p className="text-muted-foreground mb-4">
            {postsError ? String(postsError) : 'Erro desconhecido'}
          </p>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="hidden sm:flex">
                <TrendingUp className="h-3 w-3 mr-1" />
                {posts.length} posts
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('notifications')}
                className="relative"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              <ThemeToggle />
              <HelpModal shortcuts={createBlogShortcuts({})} />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 lg:grid-cols-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Comentários</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Busca</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              <span className="hidden sm:inline">Backup</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Posts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{realStats.totalPosts}</div>
                  <p className="text-xs text-muted-foreground">
                    Posts criados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{realStats.totalViews.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Total de visualizações
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Comentários</CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{realStats.totalComments}</div>
                  <p className="text-xs text-muted-foreground">
                    Total de comentários
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Curtidas</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{realStats.totalLikes}</div>
                  <p className="text-xs text-muted-foreground">
                    Total de curtidas
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Post Mais Popular</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="space-y-2 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                    onClick={() => window.location.href = `/posts/${realStats.mostPopularPost.id}`}
                  >
                    <h3 className="font-semibold hover:text-primary transition-colors">{realStats.mostPopularPost.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        <Eye className="h-3 w-3 mr-1" />
                        {realStats.mostPopularPost.views} visualizações
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {realStats.recentActivity.map((activity, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-3 text-sm cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                        onClick={() => window.location.href = `/posts/${activity.postId}`}
                      >
                        {activity.type === 'view' && <Eye className="h-4 w-4 text-blue-500" />}
                        {activity.type === 'comment' && <MessageCircle className="h-4 w-4 text-green-500" />}
                        {activity.type === 'like' && <Heart className="h-4 w-4 text-red-500" />}
                        <span className="flex-1 truncate hover:text-primary transition-colors">{activity.postTitle}</span>
                        <span className="text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard 
              stats={realStats} 
              postAnalytics={realPostAnalytics}
              posts={posts}
            />
          </TabsContent>

          <TabsContent value="comments">
            <CommentsSystem
              postId="1"
              comments={comments}
              onAddComment={handleAddComment}
              onLikeComment={handleLikeComment}
              onReply={handleReply}
              onModerate={handleModerate}
              isModerator={true}
            />
          </TabsContent>

          <TabsContent value="templates">
            <PostTemplates
              templates={[]}
              onSelectTemplate={handleSelectTemplate}
              onCreateTemplate={handleCreateTemplate}
              onUpdateTemplate={handleUpdateTemplate}
              onDeleteTemplate={handleDeleteTemplate}
            />
          </TabsContent>

          <TabsContent value="search">
            <AdvancedSearch
              posts={posts}
              onSearchResults={handleSearchResults}
            />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSystem
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onDeleteNotification={deleteNotification}
              onUpdatePreferences={updatePreferences}
            />
          </TabsContent>

          <TabsContent value="backup">
            <BackupManager
              posts={posts}
              onRestoreComplete={(message) => {
                console.log('Restore complete:', message);
                // TODO: Show toast notification
              }}
            />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Tema</h3>
                    <p className="text-sm text-muted-foreground">
                      Escolha entre tema claro, escuro ou seguir o sistema
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Notificações</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure suas preferências de notificação
                    </p>
                  </div>
                  <Button variant="outline">
                    <Bell className="h-4 w-4 mr-2" />
                    Configurar
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Backup Automático</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure backups automáticos dos seus posts
                    </p>
                  </div>
                  <Button variant="outline">
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