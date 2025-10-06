# 🚨 Guia de Solução de Problemas - Nexus Blog Creator

Este guia documenta os principais problemas encontrados durante o desenvolvimento e suas soluções, para ajudar outros desenvolvedores a evitar ou resolver situações similares.

---

## 📋 Índice

1. [Problemas de Autenticação Supabase](#1-problemas-de-autenticação-supabase)
2. [Erros de Linting na Pipeline CI/CD](#2-erros-de-linting-na-pipeline-cicd)
3. [Problemas de Roteamento em Produção](#3-problemas-de-roteamento-em-produção)
4. [Conflitos de CORS e Proxy](#4-conflitos-de-cors-e-proxy)
5. [Problemas de Configuração de Ambiente](#5-problemas-de-configuração-de-ambiente)
6. [Indicadores Visuais de Posts](#6-indicadores-visuais-de-posts)

---

## 1. Problemas de Autenticação Supabase

### 🚨 **Problema: "Invalid API key"**

**Sintomas:**
```json
{
  "message": "Invalid API key",
  "hint": "Double check your Supabase `anon` or `service_role` API key."
}
```

**Causa:**
- Aplicação usando valor padrão `"SEU_ANON_KEY_AQUI"` em vez da chave real do Supabase
- Arquivo `.env.local` não existia ou não estava configurado

**Solução:**
1. **Criar arquivo `.env.local` na raiz do projeto:**
```bash
# Configuração do Supabase
VITE_SUPABASE_URL=https://seuprojeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

2. **Obter chave real do Supabase:**
   - Acesse [Supabase Dashboard](https://supabase.com/dashboard)
   - Vá em **Settings** > **API**
   - Copie a **anon/public** key
   - Cole no arquivo `.env.local`

3. **Reiniciar servidor:**
```bash
npm run dev
```

**Prevenção:**
- Sempre verificar se as variáveis de ambiente estão configuradas
- Nunca commitar arquivos `.env.local`
- Usar apenas a chave **anon/public** (não service_role)

---

## 2. Erros de Linting na Pipeline CI/CD

### 🚨 **Problema: Pipeline falhando com 38 problemas de ESLint**

**Sintomas:**
```
✖ 38 problems (6 errors, 32 warnings)
ELIFECYCLE Command failed with exit code 1.
```

**Causa:**
- Imports não utilizados
- Variáveis não utilizadas
- Try/catch desnecessários
- Arquivos Node.js sem configuração ESLint adequada

**Soluções Aplicadas:**

#### **A. Arquivo Node.js (`test-vercel-proxy.js`)**
```javascript
// Adicionar no topo do arquivo
/* eslint-env node */
/* eslint-disable no-console, no-undef */
```

#### **B. Imports não utilizados**
```typescript
// ❌ Antes
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, type Post } from "@/services/api";

// ✅ Depois
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/services/api";
```

#### **C. Variáveis não utilizadas**
```typescript
// ❌ Antes
const [searchParams] = useSearchParams();
const actionTypes = { ... };

// ✅ Depois
const [_searchParams] = useSearchParams();
const _actionTypes = { ... };
```

#### **D. Try/catch desnecessário**
```typescript
// ❌ Antes
const makeRequest = async () => {
  try {
    return await api.get();
  } catch (error) {
    throw error; // Desnecessário
  }
};

// ✅ Depois
const makeRequest = async () => {
  return await api.get(); // Deixa o erro borbulhar naturalmente
};
```

**Prevenção:**
- Executar `npm run lint` antes de commits
- Configurar pre-commit hooks
- Usar convenção `_` para variáveis intencionalmente não utilizadas

---

## 3. Problemas de Roteamento em Produção

### 🚨 **Problema: 404 em rotas client-side**

**Sintomas:**
```
GET https://app.vercel.app/posts/123 404 (Not Found)
```

**Causa:**
- Vercel servindo 404 para rotas client-side (SPA)
- Falta de configuração de fallback para `index.html`

**Solução:**
**Configurar `vercel.json`:**
```json
{
  "framework": "vite",
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

**Explicação:**
- `filesystem`: Serve arquivos estáticos primeiro
- `"/(.*)": "/index.html"`: Qualquer rota não encontrada serve o SPA

---

## 4. Conflitos de CORS e Proxy

### 🚨 **Problema: API retornando HTML em vez de JSON**

**Sintomas:**
```
content-type: text/html; charset=utf-8
content-disposition: inline; filename="index.html"
x-vercel-cache: HIT
```

**Causa:**
- Em produção, `/webhook/*` estava sendo capturado pelo fallback SPA
- Proxy não configurado corretamente

**Solução:**
**Usar URL absoluta em produção (`src/config/n8n.ts`):**
```typescript
const getWebhookUrl = () => {
  if (import.meta.env.PROD) {
    return "https://primary-production-e91c.up.railway.app/webhook";
  }
  return "/webhook"; // Proxy do Vite em desenvolvimento
};
```

**Estratégia:**
- **Desenvolvimento:** Proxy do Vite (`/webhook` → Railway)
- **Produção:** Chamada direta para Railway (sem proxy)

**Prevenção:**
- Testar sempre em produção após mudanças de roteamento
- Verificar headers de resposta (deve ser `application/json`)

---

## 5. Problemas de Configuração de Ambiente

### 🚨 **Problema: Comportamento diferente entre dev e prod**

**Sintomas:**
- Funciona em localhost, falha em produção
- URLs diferentes entre ambientes

**Solução:**
**Configuração baseada em ambiente:**
```typescript
// src/config/n8n.ts
const getWebhookUrl = () => {
  if (import.meta.env.PROD) {
    return "https://primary-production-e91c.up.railway.app/webhook";
  }
  if (import.meta.env.DEV) {
    return "/webhook"; // Proxy do Vite
  }
  return "/webhook";
};
```

**Variáveis de ambiente necessárias:**
```bash
# .env.local
VITE_SUPABASE_URL=https://seuprojeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

**No Vercel:**
- Configurar as mesmas variáveis em **Project Settings** > **Environment Variables**

---

## 6. Indicadores Visuais de Posts

### 🚨 **Problema: Falta de indicadores de status dos posts**

**Requisito:**
- Bolinha verde para posts públicos
- Bolinha vermelha para posts privados

**Solução:**
**1. Atualizar tipos TypeScript:**
```typescript
// src/types/index.ts
export interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
  user_id?: string;
  is_public?: boolean; // ← Adicionado
  author?: {
    id: string;
    email: string;
  };
}
```

**2. Implementar indicador visual:**
```typescript
// src/components/PostCard.tsx
<Card className="group hover:shadow-glow transition-all duration-300 bg-gradient-surface border-border/50 h-full flex flex-col relative">
  {/* Status indicator - positioned absolutely in top right corner */}
  <div className="absolute top-3 right-3 z-10">
    <div 
      className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${
        post.is_public 
          ? 'bg-green-500' 
          : 'bg-red-500'
      }`}
      title={post.is_public ? 'Post público' : 'Post privado'}
    />
  </div>
  {/* ... resto do componente */}
</Card>
```

**Características:**
- Posicionamento absoluto no canto superior direito
- Tooltip explicativo
- Cores semânticas (verde=público, vermelho=privado)
- Responsivo

---

## 🛠️ Comandos Úteis

### **Desenvolvimento:**
```bash
npm run dev          # Iniciar servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build local
npm run lint         # Verificar linting
npm run test         # Executar testes
```

### **Git:**
```bash
git add .            # Adicionar mudanças
git commit -m "fix: descrição"  # Commit com mensagem
git push origin main # Push para produção
```

### **Verificação:**
```bash
# Verificar se servidor está rodando
curl http://localhost:8080

# Verificar variáveis de ambiente
echo $VITE_SUPABASE_URL
```

---

## 🎯 Checklist de Deploy

Antes de fazer deploy, verificar:

- [ ] Variáveis de ambiente configuradas (`.env.local` e Vercel)
- [ ] Linting passando (`npm run lint`)
- [ ] Build funcionando (`npm run build`)
- [ ] Testes passando (`npm run test`)
- [ ] URLs de API corretas para produção
- [ ] Roteamento SPA configurado (`vercel.json`)

---

## 📚 Recursos Adicionais

- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Vite](https://vitejs.dev/guide/)
- [ESLint Rules](https://eslint.org/docs/rules/)

---

## 💡 Dicas Gerais

1. **Sempre testar em produção** após mudanças de roteamento
2. **Verificar headers de resposta** (deve ser JSON, não HTML)
3. **Usar variáveis de ambiente** para configurações sensíveis
4. **Executar linting** antes de commits
5. **Documentar problemas** e soluções para futuras referências

---

*Este guia foi criado baseado em problemas reais encontrados durante o desenvolvimento. Se encontrar novos problemas, considere adicioná-los aqui para ajudar outros desenvolvedores.*
