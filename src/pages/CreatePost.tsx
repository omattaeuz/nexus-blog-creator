import PostForm from "@/components/PostForm";
import { api, type CreatePostData } from "@/services/api";
import { useAuth } from "@/contexts/useAuth";

const CreatePost = () => {
  const { token } = useAuth();

  const handleSubmit = async (data: CreatePostData) => {
    if (!token) {
      throw new Error("Authentication required");
    }
    await api.createPost(data, token);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <PostForm onSubmit={handleSubmit} />
    </div>
  );
};

export default CreatePost;