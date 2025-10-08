const getN8nBaseUrl = () => {
  if (import.meta.env.PROD) return "https://primary-production-e91c.up.railway.app";
  
  return "http://localhost:8080";
};

const getWebhookPath = () => {
  return "/webhook";
};

export const N8N_CONFIG = {
  BASE_URL: getN8nBaseUrl(),
  WEBHOOK_PATH: getWebhookPath(),
  WEBHOOK_URL: `${getN8nBaseUrl()}${getWebhookPath()}`,
  ENDPOINTS: {
    POSTS: "/posts",
    POSTS_PUBLIC: "/posts/public", 
    POSTS_UPDATE: "/posts-update/posts",
    POSTS_DELETE: "/posts-delete/posts",
    POSTS_GET_ONE: "/posts-get-one/posts"
  },
  SUPABASE: {
    URL: import.meta.env.VITE_SUPABASE_URL || "",
    ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || ""
  }
};