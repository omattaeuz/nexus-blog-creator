# Configuração de Variáveis de Ambiente

## Variáveis de Ambiente Necessárias

### Para Desenvolvimento Local
Crie um arquivo `.env.local` no diretório raiz com:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook
```

### Para GitHub Actions (CI/CD)
Adicione estes secrets ao seu repositório GitHub:

1. Vá para Settings → Secrets and variables → Actions
2. Adicione os seguintes secrets do repositório:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_N8N_WEBHOOK_URL`
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

### Para Deploy no Vercel
Adicione estas variáveis de ambiente no seu dashboard Vercel:

1. Vá para seu projeto → Settings → Environment Variables
2. Adicione as seguintes variáveis:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_N8N_WEBHOOK_URL`

## Valores Atuais (Fallbacks)
A aplicação tem valores de fallback configurados em `src/config/n8n.ts`:

- **Supabase URL**: `https://yedzidjgfilitaqmjjpc.supabase.co`
- **Supabase Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllZHppZGpnZmlsaXRhcW1qanBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MjM5MDIsImV4cCI6MjA3NDI5OTkwMn0.eqB732kCAvuba_VYz5NO_ijFq4pUnS76Y1FLHtQdyE0`
- **N8N Webhook URL**: `https://primary-production-e91c.up.railway.app/webhook`

## Solução de Problemas

### Erro: "Environment Variable references Secret which does not exist"
Este erro ocorre quando:
1. O projeto Vercel está configurado para usar secrets que não existem
2. O workflow GitHub Actions não passa as variáveis de ambiente para o Vercel

**Solução**: 
1. Adicione as variáveis de ambiente diretamente no dashboard Vercel, OU
2. Certifique-se de que o workflow GitHub Actions passa as variáveis (já corrigido no workflow)
