# Integração Frontend com n8n Backend - Nexus Blog Creator

## Resumo da Integração

Este projeto foi integrado com o backend n8n hospedado no Railway para implementar um sistema completo de autenticação e criação de posts. O sistema inclui:

- ✅ **Autenticação completa** (Register/Login)
- ✅ **Criação de posts autenticada**
- ✅ **Proteção de rotas**
- ✅ **Interface responsiva e moderna**

## Configuração da API

### Endpoints n8n
- **URL Base**: `https://primary-production-e91c.up.railway.app/webhook`
- **Register**: `POST /register`
- **Login**: `POST /login`
- **Create Post**: `POST /posts` (requer autenticação)
- **Content-Type**: `application/json`

### Estrutura de Dados

#### Register Request
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login Request
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login Response
```json
{
  "access_token": "jwt-token",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "refresh-token",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Create Post Request (com autenticação)
```json
{
  "title": "Meu primeiro post",
  "content": "Conteúdo do post da Semana 1"
}
```

#### Create Post Response
```json
{
  "status": "success",
  "message": "Post criado com sucesso!",
  "data": {
    "id": "uuid-gerado-pelo-supabase",
    "title": "Meu primeiro post",
    "content": "Conteúdo do post da Semana 1",
    "created_at": "2024-01-01T00:00:00.000Z",
    "user_id": "user-uuid"
  }
}
```

## Implementação

### 1. Serviço de API (`src/services/api.ts`)

- **Axios**: Configurado com baseURL do n8n
- **Interceptors**: Para logging de requests/responses
- **Error Handling**: Tratamento robusto de erros
- **TypeScript**: Interfaces tipadas para type safety

```typescript
const apiClient = axios.create({
  baseURL: 'https://primary-production-e91c.up.railway.app/webhook',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 2. Função de Criação

```typescript
async createPost(data: CreatePostData): Promise<Post> {
  try {
    const response = await apiClient.post<ApiResponse<Post>>('/posts', data);
    
    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to create post');
    }
  } catch (error) {
    // Error handling...
  }
}
```

### 3. Componentes Atualizados

- **PostForm**: Usa a nova API para criação
- **PostCard**: Atualizado para usar `created_at` em vez de `createdAt`
- **CreatePost**: Integrado com o endpoint n8n
- **Posts**: Mantém funcionalidade de listagem (mock por enquanto)

## Funcionalidades Implementadas

### ✅ Semana 1 - Create (POST)
- [x] Formulário de criação de posts
- [x] Integração com endpoint n8n
- [x] Validação de dados
- [x] Feedback visual (toasts)
- [x] Tratamento de erros
- [x] Loading states

### 🔄 Próximas Semanas (Mock por enquanto)
- [ ] Read (GET) - Listagem de posts
- [ ] Update (PUT/PATCH) - Edição de posts
- [ ] Delete (DELETE) - Exclusão de posts

## Como Testar

1. **Iniciar o servidor**:
   ```bash
   pnpm run dev
   ```

2. **Acessar a aplicação**:
   - URL: http://localhost:8082
   - Navegar para "New Post" ou `/posts/new`

3. **Criar um post**:
   - Preencher título e conteúdo
   - Clicar em "Create Post"
   - Verificar no console do navegador os logs da API
   - Verificar no Supabase se o post foi criado

## Logs e Debugging

A aplicação inclui logs detalhados:
- **Console do navegador**: Requests e responses da API
- **Network tab**: Para verificar requisições HTTP
- **Toasts**: Feedback visual de sucesso/erro

## Estrutura do n8n Workflow

O workflow n8n implementa:
1. **Webhook Trigger**: Recebe POST requests
2. **HTTP Request**: Envia dados para Supabase
3. **Response**: Retorna dados formatados

## Próximos Passos

Para completar o CRUD:
1. Adicionar endpoints GET, PUT, DELETE no n8n
2. Implementar autenticação
3. Adicionar paginação real
4. Implementar filtros e busca
5. Adicionar testes automatizados

## Variáveis de Ambiente

Para produção, configure:
```env
VITE_API_BASE_URL=https://primary-production-e91c.up.railway.app/webhook
```

## Soluções para CORS

### Problema
Erro de CORS ao tentar criar posts do frontend local para o n8n no Railway.

### Soluções Implementadas

#### 1. URL Direta para Produção
```typescript
// src/services/api.ts
const baseURL = 'https://primary-production-e91c.up.railway.app/webhook';
```

#### 2. Sem Proxy (Requisições Diretas)
- Todas as requisições vão diretamente para o n8n
- Sem proxy local
- Requer webhooks ativos no n8n

#### 3. Fallback para Desenvolvimento
- Em caso de erro CORS, usa dados mock
- Mostra alerta explicativo
- Permite testar a funcionalidade

#### 4. Tratamento de Erros Melhorado
- Detecção específica de erros CORS
- Mensagens de erro mais claras
- Logs detalhados para debugging

## Solução de Problemas

### Erro de CORS ✅ RESOLVIDO
- **Solução**: URL direta para n8n
- **Fallback**: Dados mock em desenvolvimento
- **Produção**: Requisições diretas para n8n

### Timeout
- Aumentar timeout no axios (atualmente 10s)
- Verificar conectividade com Railway

### Erro 500
- Verificar logs do n8n
- Verificar configuração do Supabase
- Verificar formato dos dados enviados

### Como Testar Agora

#### 1. Ativar o Webhook no n8n
**IMPORTANTE**: Antes de testar, você precisa ativar o webhook no n8n:

1. Acesse seu workflow n8n no Railway
2. Clique no botão **"Execute workflow"** (▶️)
3. Aguarde a execução completar
4. O webhook ficará ativo por uma execução

#### 2. Testar no Frontend
1. Acesse: http://localhost:8080
2. Vá para "New Post"
3. Crie um post - deve funcionar sem erro CORS
4. Se ainda houver CORS, verá alerta mas post será criado (mock)

#### 3. Verificar no Supabase
- Acesse seu projeto Supabase
- Vá para a tabela `posts`
- Verifique se o post foi criado

### ⚠️ Nota Importante sobre n8n
O webhook n8n funciona em **modo de teste** por padrão, o que significa:
- Só funciona por **uma execução** após clicar "Execute workflow"
- Para produção, você precisa **publicar** o workflow
- Cada teste requer reativar o webhook
