# 🚀 Guia Rápido - Testar Criação de Posts

## ⚠️ PROBLEMA IDENTIFICADO
O webhook n8n está em **modo de teste** e precisa ser ativado antes de cada uso.

## 🔧 SOLUÇÃO - Passo a Passo

### 1. Ativar Webhook no n8n
1. **Acesse**: Seu workflow n8n no Railway
2. **Clique**: Botão "Execute workflow" (▶️)
3. **Aguarde**: Execução completar
4. **Status**: Webhook ativo por 1 execução

### 2. Testar no Frontend
1. **Acesse**: http://localhost:8080
2. **Navegue**: "New Post" ou `/posts/new`
3. **Preencha**: Título e conteúdo
4. **Clique**: "Create Post"
5. **Resultado**: Post criado no Supabase! ✅

### 3. Verificar no Supabase
1. **Acesse**: Seu projeto Supabase
2. **Vá para**: Tabela `posts`
3. **Confirme**: Post foi criado

## 🔄 Para Cada Teste
**Repita o passo 1** (ativar webhook) antes de cada novo teste.

## 📊 Logs Esperados
```
Sending Request to the Target: POST /posts
Received Response from the Target: 200 /posts  ← Sucesso!
```

## ❌ Se Der Erro 404
```
Received Response from the Target: 404 /posts  ← Webhook não ativo
```
**Solução**: Ative o webhook no n8n (passo 1)

## 🎯 Para Produção
- **Publique** o workflow no n8n
- Webhook ficará sempre ativo
- Não precisará reativar

## ✅ Status Atual
- ✅ CORS resolvido
- ✅ Proxy configurado
- ✅ URL corrigida para `/webhook` (conforme n8n)
- ⚠️ Webhook precisa ser ativado manualmente
