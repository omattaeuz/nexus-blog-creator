import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PostForm from "@/components/PostForm";
import { api, type CreatePostData } from "@/services/api";
import { useAuth } from "@/contexts/useAuth";

const CreatePost = () => {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const [initialData, setInitialData] = useState<Partial<CreatePostData> | null>(null);

  useEffect(() => {
    // Check if there's template data in URL
    const templateParam = searchParams.get('template');
    if (templateParam) {
      try {
        const templateData = JSON.parse(decodeURIComponent(templateParam));
        setInitialData({
          title: templateData.title || '',
          content: templateData.content || '',
          excerpt: `Template: ${templateData.category || 'Post'}`,
          tags: [templateData.category || 'Template']
        });
      } catch (error) {
        console.error('Error parsing template data:', error);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (data: CreatePostData) => {
    if (!token) {
      throw new Error("Authentication required");
    }
    await api.createPost(data, token);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <PostForm onSubmit={handleSubmit} initialData={initialData} />
    </div>
  );
};

export default CreatePost;