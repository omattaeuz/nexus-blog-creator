# 🚀 Proxy Vercel + Railway - Nexus Blog Creator

## ✅ Implementação da Opção 1 (Recomendada)

Esta implementação resolve todos os problemas de CORS usando um proxy serverless na Vercel que redireciona as requisições para o N8n no Railway.

## 🎯 Como Funciona

```
Frontend (Vercel) → /webhook/* → Proxy API → N8n (Railway)
     ↓                    ↓           ↓         ↓
  Mesma origem      Rewrite para   CORS      Backend
  (sem CORS)        /api/n8n/*    Universal   Real
```

## 📁 Arquivos Criados/Modificados

### 1. **vercel.json** - Configuração de Rewrites
```json
{
  "rewrites": [
    {
      "source": "/webhook/(.*)",
      "destination": "/api/n8n/$1"
    }
  ]
}
```

### 2. **api/n8n/[...path].ts** - Função Proxy Edge
- ✅ Edge Runtime para máxima performance
- ✅ CORS universal automático
- ✅ Proxy transparente para Railway
- ✅ Logs detalhados para debug

### 3. **src/config/n8n.ts** - Configuração Inteligente
- ✅ **Produção**: Usa `/webhook` (proxy local)
- ✅ **Desenvolvimento**: Usa URL direta do Railway
- ✅ Fallbacks automáticos

## 🚀 Como Usar

### **Em Produção (Vercel)**
```typescript
// Automaticamente usa proxy local
const response = await api.createPost(data, token);
// Chama: /webhook/posts → /api/n8n/posts → Railway
```

### **Em Desenvolvimento**
```typescript
// Usa URL direta do Railway (com CORS do Railway)
const response = await api.createPost(data, token);
// Chama: https://primary-production-e91c.up.railway.app/webhook/posts
```

**⚠️ IMPORTANTE**: Para desenvolvimento local, crie um arquivo `.env.local`:
```bash
VITE_N8N_WEBHOOK_URL=https://primary-production-e91c.up.railway.app/webhook
```

## 🔧 Configuração

### 1. **Deploy na Vercel**
```bash
# Deploy automático
git push origin main

# Ou deploy manual
vercel --prod
```

### 2. **Configurar N8n no Railway**
1. Acesse seu N8n no Railway
2. Configure os webhooks
3. URLs serão: `https://primary-production-e91c.up.railway.app/webhook/*`

### 3. **Variáveis de Ambiente (Opcional)**
```bash
# Para desenvolvimento local
VITE_N8N_WEBHOOK_URL=https://primary-production-e91c.up.railway.app/webhook
```

## 🎯 Vantagens

### ✅ **Zero CORS Issues**
- Frontend chama mesma origem (`/webhook/*`)
- CORS gerenciado pelo proxy
- Funciona com qualquer domínio

### ✅ **Performance**
- Edge Runtime (executa próximo ao usuário)
- Cache automático da Vercel
- Latência mínima

### ✅ **Simplicidade**
- Configuração automática
- Sem necessidade de Nginx
- Deploy direto na Vercel

### ✅ **Flexibilidade**
- Desenvolvimento local funciona
- Produção usa proxy
- Fallbacks automáticos

## 🔍 Debug e Logs

### **Logs da Vercel**
```bash
# Ver logs em tempo real
vercel logs --follow

# Ver logs específicos
vercel logs --filter="api/n8n"
```

### **Logs do Proxy**
A função proxy inclui logs detalhados:
```typescript
console.log(`[N8n Proxy] ${req.method} ${path} -> ${target}`);
console.log(`[N8n Proxy] Railway response: ${upstream.status}`);
```

## 🧪 Testando

### **Teste Local (Desenvolvimento)**
```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Testar requisição
curl -X POST http://localhost:5173/webhook/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{"title":"Test","content":"Content"}'
```

### **Teste em Produção**
```bash
# Testar proxy da Vercel
curl -X POST https://your-app.vercel.app/webhook/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{"title":"Test","content":"Content"}'
```

## 🔧 Configurações Avançadas

### **Para Usar com Cookies/Sessão**
No arquivo `api/n8n/[...path].ts`, troque:
```typescript
// De:
headers.set("Access-Control-Allow-Origin", "*");

// Para:
headers.set("Access-Control-Allow-Origin", origin || "");
headers.set("Access-Control-Allow-Credentials", "true");
```

### **Para Domínios Específicos**
```typescript
// Restringir a domínios específicos
const allowedOrigins = ["https://yourdomain.com", "https://app.yourdomain.com"];
if (origin && allowedOrigins.includes(origin)) {
  headers.set("Access-Control-Allow-Origin", origin);
}
```

## 🚨 Troubleshooting

### **Problema: 404 no proxy**
- Verifique se o `vercel.json` está correto
- Confirme que a função está em `api/n8n/[...path].ts`
- Verifique os logs da Vercel

### **Problema: CORS ainda aparece**
- Verifique se está usando `/webhook/*` no frontend
- Confirme que o proxy está funcionando
- Verifique os headers na resposta

### **Problema: Railway não responde**
- Verifique se o N8n está ativo no Railway
- Confirme a URL base no proxy
- Verifique os logs do Railway

## 📊 Monitoramento

### **Métricas da Vercel**
- Acesse dashboard da Vercel
- Veja métricas de performance
- Monitore erros e logs

### **Métricas do Railway**
- Acesse dashboard do Railway
- Veja logs de execução do N8n
- Monitore uso de recursos

## 🎉 Resultado Final

- ✅ **Frontend**: Chama `/webhook/*` (mesma origem)
- ✅ **Proxy**: Redireciona para Railway com CORS
- ✅ **Backend**: N8n no Railway funciona normalmente
- ✅ **CORS**: Gerenciado automaticamente
- ✅ **Performance**: Edge Runtime + Cache
- ✅ **Simplicidade**: Deploy direto na Vercel
