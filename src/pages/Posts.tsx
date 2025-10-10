import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PostCard from "@/components/PostCard";
import PostsPagination from "@/components/PostsPagination";
import PostFilters, { type FilterOptions } from "@/components/PostFilters";
import AnimatedBackground from "@/components/AnimatedBackground";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/useAuth";
import { usePostsWithCache } from "@/hooks/usePostsWithCache";
import { Search, PlusCircle, Loader2, BookOpen, Filter, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { logApi, logError } from "@/lib/logger";

const Posts = () => {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const {
    posts,
    loading,
    refetch,
    invalidatePostCache,
    pagination
  } = usePostsWithCache({
    page: currentPage,
    limit: 6
  });

  const handleSearchSubmit = async () => {
    await refetch();
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
      
      await invalidatePostCache(id);
      await refetch(true);
      
      toast({
        title: "Sucesso",
        description: "Post excluído com sucesso.",
      });
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
    setCurrentPage(page);
  };

  const handleFiltersChange = async (_newFilters: FilterOptions) => { await refetch(); };

  const handleClearFilters = async () => {
    await refetch();
  };

  const shouldShowPagination = !loading && posts.length > 0;
  
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(async () => {
      await handleSearchSubmit();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      <AnimatedBackground />
      <div className="relative z-10 container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="text-center mb-8 sm:mb-12">
          <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 mb-4 w-fit mx-auto">
            <Sparkles className="h-4 w-4 mr-2" />
            Biblioteca de Conteúdo
          </Badge>
          <div className="flex items-center justify-center gap-3 mb-3 sm:mb-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Blogs
              </span>
            </h1>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto px-4">
            Descubra histórias, insights e ideias da nossa comunidade de escritores
          </p>
        </div>

        <Card className="mb-6 sm:mb-8 bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <form
                className="flex w-full gap-2 items-center"
                onSubmit={async (e) => { e.preventDefault(); await handleSearchSubmit(); }}
              >
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar posts..."
                    value={searchTerm}
                    onChange={handleSearchInput}
                    onBlur={async () => { await handleSearchSubmit(); }}
                    onKeyDown={async (e) => { if (e.key === 'Enter') { e.preventDefault(); await handleSearchSubmit(); } }}
                    className="pl-10 bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 transition-all duration-300"
                  />
                </div>

                <div className="flex items-center">
                  <Button
                    type="submit"
                    variant="default"
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Buscar
                  </Button>
                </div>
              </form>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Badge className="px-3 py-1 text-center sm:text-left whitespace-nowrap bg-slate-700/50 text-gray-300 border-slate-600/50">
                      {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                    </Badge>
                  </div>
                  
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-3 py-1 text-center sm:text-left whitespace-nowrap bg-slate-700/50 border-slate-600/50 text-gray-300 hover:bg-slate-600/50 hover:text-white"
                  >
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Filtros</span>
                  </Button>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex-1 sm:flex-none"
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

        {showFilters && (
          <div className="mb-6 sm:mb-8">
            <PostFilters
              filters={{
                sortBy: 'created_at',
                sortOrder: 'desc',
                itemsPerPage: 6
              }}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              totalPosts={pagination.totalPosts}
              loading={loading}
            />
          </div>
        )}

        {loading && (
          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
            <CardContent className="p-8 sm:p-12 text-center">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mx-auto mb-3 sm:mb-4 text-cyan-400" />
              <p className="text-sm sm:text-base text-gray-300">Carregando posts...</p>
            </CardContent>
          </Card>
        )}

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

        {!loading && posts.length === 0 && (
          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
            <CardContent className="p-6 sm:p-8 md:p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-4 sm:mb-6 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg">
                <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-white">
                {searchTerm ? 'Nenhum post encontrado' : 'Ainda não há posts'}
              </h3>
              <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 max-w-md mx-auto px-4">
                {searchTerm 
                  ? `Não encontramos posts correspondentes a "${searchTerm}". Tente um termo de busca diferente.`
                  : 'Seja o primeiro a compartilhar sua história! Crie seu primeiro post para começar.'
                }
              </p>
              {!searchTerm && (
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
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

        {shouldShowPagination && (
          <div className="mt-8">
            <PostsPagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Posts;