import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Eye, 
  MessageCircle, 
  Heart, 
  Share2, 
  TrendingUp, 
  Clock
} from 'lucide-react';
import { DashboardStats, PostAnalytics } from '@/types/analytics';
import { analyticsService } from '@/services/analytics';

interface AnalyticsDashboardProps {
  stats: DashboardStats;
  postAnalytics: PostAnalytics[];
  posts: any[];
}

export default function AnalyticsDashboard({ stats, postAnalytics, posts }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const viewsData = analyticsService.getViewsOverTime(posts, timeRange);

  const topPostsData = postAnalytics
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
    .map(post => ({
      name: post.postId.substring(0, 20) + '...',
      views: post.views,
      comments: post.comments,
      likes: post.likes
    }));

  const engagementData = analyticsService.getEngagementData(posts);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics em Tempo Real</h2>
          <p className="text-gray-300">Monitore o desempenho do seu blog</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <Button
              key={range}
              variant="outline"
              size="sm"
              className={timeRange === range 
                ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-transparent" 
                : "bg-slate-700/50 border-slate-600/50 text-gray-300 hover:bg-slate-600/50 hover:text-white"
              }
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total de Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-gray-300">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-400" />
              +12% do mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Comentários</CardTitle>
            <MessageCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalComments}</div>
            <p className="text-xs text-gray-300">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-400" />
              +8% do mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Curtidas</CardTitle>
            <Heart className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalLikes}</div>
            <p className="text-xs text-gray-300">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-400" />
              +15% do mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Tempo Médio de Leitura</CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.averageReadTime}min</div>
            <p className="text-xs text-gray-300">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-400" />
              +2min do mês passado
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <TabsTrigger 
            value="overview"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white text-gray-300 hover:text-white"
          >
            Visão Geral
          </TabsTrigger>
          <TabsTrigger 
            value="posts"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white text-gray-300 hover:text-white"
          >
            Posts
          </TabsTrigger>
          <TabsTrigger 
            value="engagement"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white text-gray-300 hover:text-white"
          >
            Engajamento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white">Visualizações ao Longo do Tempo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={viewsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1E293B',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        color: '#F1F5F9'
                      }}
                    />
                    <Line type="monotone" dataKey="views" stroke="#8B5CF6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white">Distribuição de Engajamento</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={engagementData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8B5CF6"
                      dataKey="value"
                    >
                      {engagementData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1E293B',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        color: '#F1F5F9'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
            <CardHeader>
                <CardTitle className="text-white">Posts com Melhor Desempenho</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topPostsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#F1F5F9'
                    }}
                  />
                  <Bar dataKey="views" fill="#8B5CF6" />
                  <Bar dataKey="comments" fill="#10B981" />
                  <Bar dataKey="likes" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white">Post Mais Popular</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="font-semibold text-white">{stats.mostPopularPost.title}</h3>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-slate-700/50 text-gray-300 border-slate-600/50">
                      <Eye className="h-3 w-3 mr-1" />
                      {stats.mostPopularPost.views} visualizações
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
                <div className="space-y-2">
                  {stats.recentActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {activity.type === 'view' && <Eye className="h-3 w-3 text-blue-400" />}
                      {activity.type === 'comment' && <MessageCircle className="h-3 w-3 text-green-400" />}
                      {activity.type === 'like' && <Heart className="h-3 w-3 text-red-400" />}
                      {activity.type === 'share' && <Share2 className="h-3 w-3 text-purple-400" />}
                      <span className="truncate text-gray-300">{activity.postTitle}</span>
                      <Badge className="bg-slate-700/50 text-gray-300 border-slate-600/50 text-xs">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}