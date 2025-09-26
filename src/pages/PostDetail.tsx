import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Edit, Trash2, ArrowLeft, User, Loader2, AlertCircle } from "lucide-react";
import { api, type Post } from "@/services/api";
import { toast } from "@/hooks/use-toast";

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        setError("Post ID is required");
        setLoading(false);
        return;
      }

      try {
        const fetchedPost = await api.getPost(id);
        if (!fetchedPost) {
          setError("Post not found");
        } else {
          setPost(fetchedPost);
        }
      } catch (err) {
        setError("Failed to fetch post");
        toast({
          title: "Error",
          description: "Failed to load post. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (!post) return;

    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      try {
        await api.deletePost(post.id);
        toast({
          title: "Post deleted",
          description: "The post has been successfully deleted.",
          variant: "destructive",
        });
        navigate("/posts");
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete post. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-surface">
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-4xl mx-auto bg-gradient-surface shadow-md">
            <CardContent className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading post...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-surface">
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-4xl mx-auto bg-gradient-surface shadow-md border-destructive/20">
            <CardContent className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-xl bg-destructive/10 text-destructive">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                {error || "Post not found"}
              </h2>
              <p className="text-muted-foreground mb-6">
                The post you're looking for doesn't exist or has been removed.
              </p>
              <Button
                onClick={() => navigate("/posts")}
                variant="outline"
                className="transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Posts
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/posts")}
            className="hover:bg-secondary transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Posts
          </Button>
        </div>

        {/* Post Content */}
        <Card className="max-w-4xl mx-auto bg-gradient-surface shadow-glow border-border/50">
          <CardHeader className="pb-6">
            <div className="flex items-start justify-between mb-4">
              <CardTitle className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                {post.title}
              </CardTitle>
              {post.updatedAt && post.updatedAt !== post.createdAt && (
                <Badge variant="secondary" className="ml-4 shrink-0">
                  Updated
                </Badge>
              )}
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Published {formatDate(post.createdAt)}</span>
              </div>
              {post.author && (
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>by {post.author}</span>
                </div>
              )}
              {post.updatedAt && post.updatedAt !== post.createdAt && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Updated {formatDate(post.updatedAt)}</span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Post Content */}
            <div className="prose prose-lg max-w-none">
              <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  asChild
                  className="hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
                >
                  <Link to={`/posts/${post.id}/edit`} className="flex items-center space-x-2">
                    <Edit className="h-4 w-4" />
                    <span>Edit Post</span>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleDelete}
                  className="hover:bg-destructive hover:text-destructive-foreground transition-all duration-300"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Post
                </Button>
              </div>

              <Button
                variant="default"
                asChild
                className="bg-gradient-primary hover:bg-primary-hover shadow-glow transition-all duration-300"
              >
                <Link to="/posts">
                  View All Posts
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostDetail;