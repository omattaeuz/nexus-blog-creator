import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Globe, Calendar, User, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { Post } from '@/types';
import ShareButton from '@/components/ShareButton';

const PublicPosts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPublicPosts = async () => {
      try {
        setLoading(true);
        const result = await api.getPublicPosts(page, 10);
        
        if (page === 1) {
          setPosts(result.data);
        } else {
          setPosts(prev => [...prev, ...result.data]);
        }
        
        setHasMore(result.data.length === 10);
        setError(null);
      } catch (err) {
        console.error('Error fetching public posts:', err);
        setError('Erro ao carregar posts públicos');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicPosts();
  }, [page]);

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen bg-gradient-surface">
        <div className="container mx-auto px-3 sm:px-4 py-12 sm:py-20">
          <Card className="max-w-4xl mx-auto bg-gradient-surface shadow-md">
            <CardContent className="p-8 sm:p-12 text-center">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mx-auto mb-3 sm:mb-4 text-primary" />
              <p className="text-sm sm:text-base text-muted-foreground">Carregando posts públicos...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-surface">
        <div className="container mx-auto px-3 sm:px-4 py-12 sm:py-20">
          <Card className="max-w-4xl mx-auto bg-gradient-surface shadow-md">
            <CardContent className="p-8 sm:p-12 text-center">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
                Erro ao carregar posts
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
                {error}
              </p>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao início
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="container mx-auto px-3 sm:px-4 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Posts Públicos
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Conteúdo compartilhado publicamente pela comunidade
            </p>
          </div>

          {/* Posts List */}
          {posts.length === 0 ? (
            <Card className="bg-gradient-surface shadow-md">
              <CardContent className="p-8 sm:p-12 text-center">
                <Globe className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6 text-muted-foreground" />
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">
                  Nenhum post público encontrado
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
                  Ainda não há posts públicos disponíveis. Faça login para criar e compartilhar conteúdo.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    variant="default"
                    asChild
                    className="bg-gradient-primary hover:bg-primary-hover shadow-glow transition-all duration-300"
                  >
                    <Link to="/login">
                      <User className="h-4 w-4 mr-2" />
                      Fazer Login
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/")}
                    className="hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar ao início
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {posts.map((post) => (
                <Card key={post.id} className="group bg-gradient-surface shadow-md hover:shadow-lg transition-all duration-300 border border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 leading-tight">
                        {post.title}
                      </CardTitle>
                      <div className="flex gap-2 ml-2 flex-shrink-0">
                        <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                          <Globe className="h-3 w-3 mr-1" />
                          Público
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground mb-4 sm:mb-6">
                      <p className="line-clamp-3 sm:line-clamp-4">
                        {post.content}
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>
                          {new Date(post.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
                        >
                          <Link to={`/posts/${post.id}`}>
                            Ler mais
                          </Link>
                        </Button>
                        
                        <ShareButton
                          postTitle={post.title}
                          postId={post.id}
                          postContent={post.content}
                          variant="outline"
                          size="sm"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Load More Button */}
              {hasMore && (
                <div className="text-center pt-6 sm:pt-8">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={loading}
                    className="hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Carregando...
                      </>
                    ) : (
                      'Carregar mais posts'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicPosts;
