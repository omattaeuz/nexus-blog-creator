// N8n Configuration
// Update this file with your actual N8n webhook URL

// Get webhook URL from environment variable, localStorage, or use default
const getWebhookUrl = () => {
  // First try environment variable
  if (import.meta.env.VITE_N8N_WEBHOOK_URL) {
    return import.meta.env.VITE_N8N_WEBHOOK_URL;
  }
  
  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('n8n_webhook_url');
    if (stored && stored.includes('railway.app')) {
      return stored;
    }
  }
  
  // Default fallback
  return 'https://primary-production-e91c.up.railway.app/webhook';
};

export const N8N_CONFIG = {
  // Webhook URL - can be configured via localStorage or this file
  WEBHOOK_URL: getWebhookUrl(),
  
  // Supabase configuration - uses environment variables with fallbacks
  SUPABASE: {
    URL: import.meta.env.VITE_SUPABASE_URL || 'https://yedzidjgfilitaqmjjpc.supabase.co',
    ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllZHppZGpnZmlsaXRhcW1qanBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MjM5MDIsImV4cCI6MjA3NDI5OTkwMn0.eqB732kCAvuba_VYz5NO_ijFq4pUnS76Y1FLHtQdyE0'
  }
};

// Instructions for setup:
// 1. Deploy your N8n workflow with the provided JSON configuration
// 2. Get the webhook URL from your N8n instance
// 3. Replace the WEBHOOK_URL above with your actual webhook URL
// 4. The Supabase configuration is already set up for the provided workflow
