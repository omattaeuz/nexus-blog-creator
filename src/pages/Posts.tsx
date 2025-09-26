import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PostCard from "@/components/PostCard";
import { api, type Post } from "@/services/api";
import { Search, PlusCircle, Loader2, BookOpen } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Posts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const postsPerPage = 6;

  const fetchPosts = async (page: number = 1, search: string = "") => {
    try {
      setLoading(true);
      const response = await api.getPosts({
        page,
        limit: postsPerPage,
        search: search.trim(),
      });
      
      setPosts(response.posts);
      setTotalPages(response.totalPages);
      setTotal(response.total);
      setCurrentPage(response.page);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch posts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1, searchTerm);
  }, [searchTerm]);

  const handleDelete = async (id: string) => {
    try {
      await api.deletePost(id);
      await fetchPosts(currentPage, searchTerm);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (page: number) => {
    fetchPosts(page, searchTerm);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
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
                  onChange={handleSearch}
                  className="pl-10 transition-all duration-300 focus:ring-primary"
                />
              </div>

              {/* Stats and CTA */}
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="px-3 py-1">
                  {total} {total === 1 ? 'post' : 'posts'}
                </Badge>
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
              <p className="text-muted-foreground">Loading posts...</p>
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
                {searchTerm ? 'No posts found' : 'No posts yet'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? `We couldn't find any posts matching "${searchTerm}". Try a different search term.`
                  : 'Be the first to share your story! Create your first blog post to get started.'
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
                    <span>Create Your First Post</span>
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
                  disabled={currentPage === 1}
                  className="transition-all duration-300"
                >
                  Previous
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
                  disabled={currentPage === totalPages}
                  className="transition-all duration-300"
                >
                  Next
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