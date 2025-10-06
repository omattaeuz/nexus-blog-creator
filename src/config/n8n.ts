const getWebhookUrl = () => {
  if (import.meta.env.PROD) return "https://primary-production-e91c.up.railway.app/webhook";
  
  return "/webhook";
};

export const N8N_CONFIG = {
  WEBHOOK_URL: getWebhookUrl(),
  SUPABASE: {
    URL: import.meta.env.VITE_SUPABASE_URL || "https://yedzidjgfilitaqmjjpc.supabase.co",
    ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || "SEU_ANON_KEY_AQUI"
  }
};