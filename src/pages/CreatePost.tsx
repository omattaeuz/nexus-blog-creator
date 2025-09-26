import PostForm from "@/components/PostForm";
import { api, type CreatePostData } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const CreatePost = () => {
  const { token } = useAuth();

  const handleSubmit = async (data: CreatePostData) => {
    if (!token) {
      throw new Error("Authentication required");
    }
    await api.createPost(data, token);
  };

  return <PostForm onSubmit={handleSubmit} />;
};

export default CreatePost;