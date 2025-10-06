# 🔧 Configuração para Desenvolvimento Local

## 🚨 Problema Identificado

O erro que você está vendo acontece porque em **desenvolvimento local** (localhost:8080), o proxy da Vercel não existe. O proxy só funciona em **produção** na Vercel.

## ✅ Solução

### 1. **Proxy do Vite configurado**

O `vite.config.ts` já tem um proxy configurado que resolve o problema de CORS:

```typescript
proxy: {
  "/webhook": {
    target: "https://primary-production-e91c.up.railway.app",
    changeOrigin: true,
    secure: true,
    rewrite: (p) => p,
  },
}
```

### 2. **Como funciona agora:**

#### **Em Desenvolvimento (localhost:8080):**
- ✅ Usa proxy do Vite: `/webhook` → Railway
- ✅ CORS gerenciado pelo proxy do Vite
- ✅ Funciona localmente sem problemas

#### **Em Produção (Vercel):**
- ✅ Usa proxy da Vercel: `/webhook` → Railway
- ✅ CORS gerenciado pelo proxy da Vercel
- ✅ Zero problemas de CORS

## 🚀 Passos para Resolver

### 1. **Reiniciar o servidor de desenvolvimento:**
```bash
# Parar o servidor atual (Ctrl+C)
# Reiniciar
npm run dev
# ou
pnpm dev
```

### 2. **Verificar se está funcionando:**
- Abra o console do navegador
- Deve ver logs mostrando `/webhook` (proxy do Vite)
- As requisições devem funcionar normalmente
- Sem erros de CORS

## 🔍 Verificação

### **Logs esperados em desenvolvimento:**
```
[API] Making GET request {
  "url": "/posts?_t=...",
  "baseURL": "/webhook"  // Proxy do Vite
}
```

### **Logs esperados em produção:**
```
[API] Making GET request {
  "url": "/posts?_t=...",
  "baseURL": "/webhook"  // Proxy da Vercel
}
```

## 🎯 Resumo da Configuração

| Ambiente | URL Base | CORS | Proxy |
|----------|----------|------|-------|
| **Desenvolvimento** | `/webhook` | Vite | ✅ |
| **Produção** | `/webhook` | Vercel | ✅ |

## 🚨 Troubleshooting

### **Se ainda der erro 404:**
1. Verifique se o `vite.config.ts` tem o proxy configurado
2. Reinicie o servidor de desenvolvimento
3. Verifique se a URL do Railway está correta

### **Se der erro de CORS:**
1. Em desenvolvimento: O proxy do Vite resolve automaticamente
2. Em produção: O proxy da Vercel resolve automaticamente

### **Para testar em produção:**
```bash
# Build e deploy
npm run build
vercel --prod
```

## 📝 Notas Importantes

- **Desenvolvimento**: Usa proxy do Vite (`/webhook` → Railway)
- **Produção**: Usa proxy da Vercel (`/webhook` → Railway)
- **Configuração**: Automática baseada no ambiente
- **CORS**: Gerenciado automaticamente pelos proxies
