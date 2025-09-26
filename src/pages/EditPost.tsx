import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostForm from "@/components/PostForm";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { api, type Post, type UpdatePostData } from "@/services/api";
import { toast } from "@/hooks/use-toast";

const EditPost = () => {
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

  const handleSubmit = async (data: UpdatePostData) => {
    if (!id) throw new Error("Post ID is required");
    
    const updatedPost = await api.updatePost(id, data);
    if (!updatedPost) {
      throw new Error("Failed to update post");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-surface">
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-2xl mx-auto bg-gradient-surface shadow-md">
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
          <Card className="max-w-2xl mx-auto bg-gradient-surface shadow-md border-destructive/20">
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
              <button
                onClick={() => navigate("/posts")}
                className="text-primary hover:underline"
              >
                Back to Posts
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <PostForm initialData={post} onSubmit={handleSubmit} isEdit />;
};

export default EditPost;