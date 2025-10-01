import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PostCard from "@/components/PostCard";
import PostsPagination from "@/components/PostsPagination";
import { api, type Post } from "@/services/api";
import { useAuth } from "@/contexts/useAuth";
import { usePosts } from "@/hooks/usePosts";
import { Search, PlusCircle, Loader2, BookOpen, RefreshCw, Settings } from "lucide-react";
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
    itemsPerPage,
    hasNextPage,
    hasPreviousPage,
    startItem,
    endItem,
    searchPosts,
    goToPage,
    refreshPosts,
    setItemsPerPage,
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
    console.log('Changing to page:', page);
    await goToPage(page);
  };

  // Debug logs
  console.log('Posts page state:', { 
    posts: posts.length, 
    total, 
    totalPages, 
    currentPage, 
    itemsPerPage,
    loading 
  });

  // Force show pagination for testing
  const shouldShowPagination = !loading && posts.length > 0;
  console.log('Should show pagination:', shouldShowPagination, { postsLength: posts.length, totalPages });

  const handleItemsPerPageChange = async (value: string) => {
    const newLimit = parseInt(value, 10);
    await setItemsPerPage(newLimit);
    toast({
      title: "Configuração atualizada",
      description: `Mostrando ${newLimit} posts por página.`,
    });
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
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Blogs
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Descubra histórias, insights e ideias da nossa comunidade de escritores
          </p>
        </div>

        {/* Search and Actions */}
        <Card className="mb-6 sm:mb-8 bg-gradient-surface shadow-md border-border/50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
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

              {/* Stats and Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Badge variant="secondary" className="px-3 py-1 text-center sm:text-left">
                      {total} {total === 1 ? 'post' : 'posts'}
                    </Badge>
                    
                    {totalPages > 1 && (
                      <Badge variant="outline" className="px-3 py-1 text-center sm:text-left">
                        Página {currentPage} de {totalPages}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Items per page selector */}
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                      <SelectTrigger className="w-20 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="6">6</SelectItem>
                        <SelectItem value="9">9</SelectItem>
                        <SelectItem value="12">12</SelectItem>
                        <SelectItem value="18">18</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">por página</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={loading}
                    className="flex items-center space-x-2 flex-1 sm:flex-none"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Atualizar</span>
                  </Button>
                  <Button
                    asChild
                    className="bg-gradient-primary hover:bg-primary-hover shadow-glow transition-all duration-300 flex-1 sm:flex-none"
                  >
                    <Link to="/posts/new" className="flex items-center justify-center space-x-2">
                      <PlusCircle className="h-4 w-4" />
                      <span>Novo Post</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card className="bg-gradient-surface shadow-md">
            <CardContent className="p-8 sm:p-12 text-center">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mx-auto mb-3 sm:mb-4 text-primary" />
              <p className="text-sm sm:text-base text-muted-foreground">Carregando posts...</p>
            </CardContent>
          </Card>
        )}

        {/* Posts Grid */}
        {!loading && posts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
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
            <CardContent className="p-6 sm:p-8 md:p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-4 sm:mb-6 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-foreground">
                {searchTerm ? 'Nenhum post encontrado' : 'Ainda não há posts'}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto px-4">
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
                    <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Criar Seu Primeiro Post</span>
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pagination - Bottom */}
        {shouldShowPagination && (
          <div className="mt-8">
            <PostsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Posts;