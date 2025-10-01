# Guia de Configuração do Workflow N8n

Este guia irá ajudá-lo a configurar o workflow N8n para a aplicação de blog.

## Pré-requisitos

1. Uma instância N8n (self-hosted ou cloud)
2. Um projeto Supabase
3. O JSON do workflow N8n fornecido

## Passo 1: Importar o Workflow N8n

1. Abra sua instância N8n
2. Clique em "Workflows" na barra lateral
3. Clique em "Import from file" ou "Import from URL"
4. Copie e cole o JSON do workflow fornecido
5. Salve o workflow

## Passo 2: Configurar Supabase

O workflow já está configurado para usar a instância Supabase fornecida:
- **URL**: `https://yedzidjgfilitaqmjjpc.supabase.co`
- **Anon Key**: Já configurado no workflow

## Passo 3: Obter sua URL do Webhook

1. No seu workflow N8n, encontre os nós webhook
2. Clique em cada nó webhook para obter sua URL
3. As URLs do webhook serão parecidas com: `https://your-n8n-instance.com/webhook/your-webhook-id`

## Passo 4: Atualizar Configuração do Frontend

1. Abra `src/config/n8n.ts`
2. Substitua `https://your-n8n-instance.com/webhook` pela sua URL real do webhook
3. Salve o arquivo

## Passo 5: Testar a Integração

1. Inicie sua aplicação frontend: `npm run dev`
2. Registre um novo usuário
3. Crie um post de blog
4. Verifique se o post aparece no seu banco de dados Supabase

## Endpoints da API

O workflow fornece os seguintes endpoints:

### Autenticação
- **POST** `/auth/v1/signup` - Registrar novo usuário
- **POST** `/auth/v1/token` - Login do usuário
- **GET** `/auth/v1/user` - Obter usuário atual

### Posts
- **POST** `/posts` - Criar post (requer auth)
- **GET** `/posts` - Listar posts (com paginação e busca)
- **GET** `/posts/:id` - Obter post individual
- **PATCH** `/posts/:id` - Atualizar post (requer auth)
- **DELETE** `/posts/:id` - Deletar post (requer auth)

### CORS
- **OPTIONS** `/posts` - CORS para endpoints de posts
- **OPTIONS** `/posts/:id` - CORS para endpoints de posts individuais

## Recursos do Workflow

### Fluxo de Autenticação
1. Usuário se registra/faz login através do Supabase Auth
2. Frontend envia requisições com token Bearer
3. N8n valida token com Supabase
4. Se válido, prossegue com operações de banco de dados
5. Se inválido, retorna 401 Unauthorized

### Operações de Banco de Dados
- Todas as operações de banco usam a chave de service role do Supabase
- Posts são armazenados com user_id para propriedade
- Paginação e busca são suportadas
- Headers CORS são configurados corretamente

### Tratamento de Erros
- 401 para erros de autenticação
- 404 para não encontrado
- Mensagens de erro adequadas em português
- Suporte CORS para todos os endpoints

## Solução de Problemas

### Problemas Comuns

1. **Erros CORS**: Certifique-se de que as URLs do webhook estão configuradas corretamente
2. **Erros de Autenticação**: Verifique a configuração do Supabase
3. **Erros de Banco de Dados**: Verifique a chave de service role do Supabase
4. **Erros de Rede**: Verifique se a instância N8n está acessível

### Passos de Debug

1. Verifique os logs de execução do N8n
2. Verifique as URLs do webhook na aba de rede do navegador
3. Teste endpoints com Postman ou curl
4. Verifique os logs do Supabase para erros de banco de dados

## Notas de Segurança

- A chave de service role do Supabase tem acesso total ao banco de dados
- A autenticação do usuário é gerenciada pelo Supabase
- CORS está configurado para o domínio do frontend
- Todas as operações sensíveis requerem autenticação

## Suporte

Se você encontrar problemas:
1. Verifique os logs de execução do N8n
2. Verifique todos os valores de configuração
3. Teste endpoints individuais
4. Verifique o console do navegador para erros
