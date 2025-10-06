# 🔧 Como Resolver o Erro "Invalid API key" do Supabase

## 🚨 Problema Identificado

O erro `"Invalid API key"` acontece porque a aplicação está usando o valor padrão `"SEU_ANON_KEY_AQUI"` em vez da chave real do Supabase.

## ✅ Solução

### 1. **Criar arquivo `.env.local`**

Crie um arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```bash
# Configuração do Supabase
VITE_SUPABASE_URL=https://yedzidjgfilitaqmjjpc.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_REAL_AQUI
```

### 2. **Obter a chave real do Supabase**

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** > **API**
4. Copie a **anon/public** key
5. Cole no arquivo `.env.local`

### 3. **Exemplo de arquivo `.env.local`**

```bash
# Configuração do Supabase
VITE_SUPABASE_URL=https://yedzidjgfilitaqmjjpc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllZHppZGpnZmlsaXRhcW1qanBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ4NzEsImV4cCI6MjA1MDU1MDg3MX0.SUA_CHAVE_REAL_AQUI
```

### 4. **Reiniciar o servidor**

Após criar o arquivo `.env.local`:

```bash
# Parar o servidor (Ctrl+C)
# Reiniciar
npm run dev
```

## 🔍 Verificação

### **Logs esperados após correção:**

```javascript
[API] Making POST request {
  "url": "/auth/v1/signup",
  "baseURL": "https://yedzidjgfilitaqmjjpc.supabase.co"
}
```

### **Sem mais erros de:**
- ❌ "Invalid API key"
- ❌ "Double check your Supabase anon or service_role API key"

## 🚨 Importante

- **NUNCA** commite o arquivo `.env.local` (já está no `.gitignore`)
- **SEMPRE** use a chave **anon/public** (não a service_role)
- **VERIFIQUE** se a URL do Supabase está correta

## 🎯 Resultado

Após seguir estes passos:
- ✅ Login funcionará corretamente
- ✅ Registro funcionará corretamente
- ✅ Posts serão criados/atualizados
- ✅ Autenticação funcionará em todos os recursos

## 📞 Se ainda der erro

1. Verifique se o arquivo `.env.local` está na raiz do projeto
2. Verifique se as variáveis começam com `VITE_`
3. Reinicie o servidor de desenvolvimento
4. Verifique se a chave está correta no Supabase Dashboard
