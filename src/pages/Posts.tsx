import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PostCard from "@/components/PostCard";
import { api, type Post } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts } from "@/hooks/usePosts";
import { Search, PlusCircle, Loader2, BookOpen, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { logApi, logError } from "@/lib/logger";

const Posts = () => {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Use the custom hook for posts management
  const {
    posts,
    loading,
    error,
    total,
    totalPages,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    searchPosts,
    goToPage,
    refreshPosts,
  } = usePosts({
    page: 1,
    limit: 6,
    search: "",
    autoFetch: true,
  });

  // Handle search with debouncing
  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    await searchPosts(value);
  };

  // Handle refresh
  const handleRefresh = async () => {
    await refreshPosts();
    toast({
      title: "Posts atualizados",
      description: "Lista de posts foi atualizada com sucesso.",
    });
  };

  const handleDelete = async (id: string) => {
    if (!token) {
      toast({
        title: "Erro",
        description: "Autenticação necessária para excluir posts.",
        variant: "destructive",
      });
      return;
    }

    try {
      logApi('Deleting post', { postId: id });
      await api.deletePost(id, token);
      toast({
        title: "Sucesso",
        description: "Post excluído com sucesso.",
      });
      // Refresh the posts list
      await refreshPosts();
    } catch (error) {
      logError('Failed to delete post', { postId: id, error: error instanceof Error ? error.message : 'Unknown error' });
      toast({
        title: "Erro",
        description: "Falha ao excluir post. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = async (page: number) => {
    await goToPage(page);
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Debounce search - only search after user stops typing
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Blogs
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubra histórias, insights e ideias da nossa comunidade de escritores
          </p>
        </div>

        {/* Search and Actions */}
        <Card className="mb-8 bg-gradient-surface shadow-md border-border/50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar posts..."
                  value={searchTerm}
                  onChange={handleSearchInput}
                  className="pl-10 transition-all duration-300 focus:ring-primary"
                />
              </div>

              {/* Stats and CTA */}
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="px-3 py-1">
                  {total} {total === 1 ? 'post' : 'posts'}
                </Badge>
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Atualizar</span>
                </Button>
                <Button
                  asChild
                  className="bg-gradient-primary hover:bg-primary-hover shadow-glow transition-all duration-300"
                >
                  <Link to="/posts/new" className="flex items-center space-x-2">
                    <PlusCircle className="h-4 w-4" />
                    <span>Novo Post</span>
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card className="bg-gradient-surface shadow-md">
            <CardContent className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Carregando posts...</p>
            </CardContent>
          </Card>
        )}

        {/* Posts Grid */}
        {!loading && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <Card className="bg-gradient-surface shadow-md">
            <CardContent className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-foreground">
                {searchTerm ? 'Nenhum post encontrado' : 'Ainda não há posts'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? `Não encontramos posts correspondentes a "${searchTerm}". Tente um termo de busca diferente.`
                  : 'Seja o primeiro a compartilhar sua história! Crie seu primeiro post para começar.'
                }
              </p>
              {!searchTerm && (
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-primary hover:bg-primary-hover shadow-glow transition-all duration-300"
                >
                  <Link to="/posts/new" className="flex items-center space-x-2">
                    <PlusCircle className="h-5 w-5" />
                    <span>Criar Seu Primeiro Post</span>
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Card className="bg-gradient-surface shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPreviousPage}
                  className="transition-all duration-300"
                >
                  Anterior
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="transition-all duration-300"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNextPage}
                  className="transition-all duration-300"
                >
                  Próximo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Posts;