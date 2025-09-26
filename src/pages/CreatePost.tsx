import PostForm from "@/components/PostForm";
import { api, type CreatePostData } from "@/services/api";

const CreatePost = () => {
  const handleSubmit = async (data: CreatePostData) => {
    await api.createPost(data);
  };

  return <PostForm onSubmit={handleSubmit} />;
};

export default CreatePost;