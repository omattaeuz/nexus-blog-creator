const getWebhookUrl = () => {
  // Em produção (Vercel), usar proxy local
  if (import.meta.env.PROD) {
    return "/webhook"; // Proxy da Vercel
  }
  
  // Em desenvolvimento, usar proxy do Vite (resolve CORS)
  if (import.meta.env.DEV) {
    return "/webhook"; // Proxy do Vite configurado no vite.config.ts
  }
  
  // Fallback geral
  return "/webhook";
};

export const N8N_CONFIG = {
  WEBHOOK_URL: getWebhookUrl(),
  SUPABASE: {
    URL: import.meta.env.VITE_SUPABASE_URL || "https://yedzidjgfilitaqmjjpc.supabase.co",
    ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || "SEU_ANON_KEY_AQUI"
  }
};