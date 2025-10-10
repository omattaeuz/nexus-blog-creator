import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PostForm from "@/components/PostForm";
import { api } from "@/services/api";
import { type CreatePostData } from "@/types";
import { useAuth } from "@/contexts/useAuth";
import { ERROR_MESSAGES } from "@/lib/constants";

const CreatePost = () => {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const [initialData, setInitialData] = useState<Partial<CreatePostData> | null>(null);

  useEffect(() => {
    const templateParam = searchParams.get('template');
    if (templateParam) {
      try {
        const templateData = JSON.parse(decodeURIComponent(templateParam));
        setInitialData({
          title: templateData.title || '',
          content: templateData.content || '',
          tags: [templateData.category || 'Template']
        });
      } catch (error) {
        console.error('Error parsing template data:', error);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (data: CreatePostData) => {
    if (!token) throw new Error(ERROR_MESSAGES.UNAUTHORIZED);

    await api.createPost(data, token);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <PostForm onSubmit={handleSubmit} initialData={initialData} />
    </div>
  );
};

export default CreatePost;