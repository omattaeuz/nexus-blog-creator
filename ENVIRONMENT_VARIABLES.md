# Environment Variables Configuration

## Required Environment Variables

### For Local Development
Create a `.env.local` file in the root directory with:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook
```

### For GitHub Actions (CI/CD)
Add these secrets to your GitHub repository:

1. Go to Settings → Secrets and variables → Actions
2. Add the following repository secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_N8N_WEBHOOK_URL`
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

### For Vercel Deployment
Add these environment variables in your Vercel dashboard:

1. Go to your project → Settings → Environment Variables
2. Add the following variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_N8N_WEBHOOK_URL`

## Current Values (Fallbacks)
The application has fallback values configured in `src/config/n8n.ts`:

- **Supabase URL**: `https://yedzidjgfilitaqmjjpc.supabase.co`
- **Supabase Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllZHppZGpnZmlsaXRhcW1qanBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MjM5MDIsImV4cCI6MjA3NDI5OTkwMn0.eqB732kCAvuba_VYz5NO_ijFq4pUnS76Y1FLHtQdyE0`
- **N8N Webhook URL**: `https://primary-production-e91c.up.railway.app/webhook`

## Troubleshooting

### Error: "Environment Variable references Secret which does not exist"
This error occurs when:
1. The Vercel project is configured to use secrets that don't exist
2. The GitHub Actions workflow doesn't pass environment variables to Vercel

**Solution**: 
1. Add the environment variables directly in Vercel dashboard, OR
2. Ensure the GitHub Actions workflow passes the variables (already fixed in the workflow)
