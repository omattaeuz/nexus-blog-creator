# Configuração de Email do Supabase

## URL de Redirecionamento para Confirmação de Email

Para que a confirmação de email funcione corretamente, você precisa configurar a URL de redirecionamento no painel do Supabase:

### 1. Acesse o Painel do Supabase
- Vá para [supabase.com](https://supabase.com)
- Faça login na sua conta
- Selecione seu projeto

### 2. Configure a URL de Redirecionamento
- Vá para **Authentication** > **URL Configuration**
- Em **Site URL**, adicione: `http://localhost:8080` (para desenvolvimento)
- Em **Redirect URLs**, adicione: `http://localhost:8080/email-confirmation`

### 3. Para Produção
Quando fizer deploy, adicione também:
- **Site URL**: `https://seu-dominio.com`
- **Redirect URLs**: `https://seu-dominio.com/email-confirmation`

### 4. Como Funciona
1. Usuário se registra no app
2. Supabase envia email de confirmação
3. Usuário clica no link do email
4. Supabase redireciona para `/email-confirmation` com tokens na URL
5. A página `EmailConfirmation` processa os tokens e faz login automático
6. Usuário é redirecionado para `/posts`

### 5. Estrutura da URL de Confirmação
```
http://localhost:8080/email-confirmation#access_token=...&refresh_token=...&token_type=bearer&expires_in=3600&type=signup
```

### 6. Teste
1. Registre um novo usuário
2. Verifique o email recebido
3. Clique no link de confirmação
4. Deve ser redirecionado para a página de confirmação com mensagem de sucesso
5. Após 3 segundos, deve ser redirecionado para `/posts` automaticamente
