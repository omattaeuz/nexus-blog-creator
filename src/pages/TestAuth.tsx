import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { supabase, authHelpers, dbHelpers } from '@/lib/supabase';
import { logAuth } from '@/lib/logger';

const TestAuth = () => {
  const [testEmail, setTestEmail] = useState('qualquercoisa479@gmail.com');
  const [testPassword, setTestPassword] = useState('Umasenhaaib9090');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const addResult = (test: string, success: boolean, message: string, data?: any) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testSupabaseConnection = async () => {
    setIsLoading(true);
    try {
      logAuth('Testing Supabase connection');
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      addResult('Supabase Connection', true, 'Conexão com Supabase funcionando', {
        hasSession: !!data.session,
        userEmail: data.session?.user?.email || 'No user'
      });
    } catch (error: any) {
      addResult('Supabase Connection', false, 'Falha na conexão', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testLogin = async () => {
    setIsLoading(true);
    try {
      logAuth('Testing login with Supabase SDK', { email: testEmail, password: '***' });
      const result = await authHelpers.signIn(testEmail, testPassword);
      
      if (!result.user) throw new Error('Login failed');
      
      addResult('Login Test', true, 'Login realizado com sucesso', {
        user: result.user?.email,
        sessionId: result.session?.access_token?.substring(0, 20) + '...'
      });
    } catch (error: any) {
      addResult('Login Test', false, error.message, error);
    } finally {
      setIsLoading(false);
    }
  };

  const testRegister = async () => {
    setIsLoading(true);
    try {
      const testEmail = `test-${Date.now()}@example.com`;
      const result = await authHelpers.signUp(testEmail, 'testpassword123');
      
      if (!result.user) throw new Error('Registration failed');
      
      addResult('Register Test', true, 'Registro realizado com sucesso', {
        user: result.user?.email,
        email: testEmail,
        needsConfirmation: !result.user?.email_confirmed_at
      });
    } catch (error: any) {
      addResult('Register Test', false, error.message, error);
    } finally {
      setIsLoading(false);
    }
  };

  const testDatabase = async () => {
    setIsLoading(true);
    try {
      logAuth('Testing database connection');
      const result = await dbHelpers.getPosts(1, 5);
      addResult('Database Test', true, 'Conexão com banco funcionando', {
        postsCount: result.posts.length,
        total: result.total
      });
    } catch (error: any) {
      addResult('Database Test', false, error.message, error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="w-full max-w-4xl px-4">
      <Card className="bg-gradient-surface shadow-glow border-border/50">
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center">
            <TestTube className="h-8 w-8 mr-2" />
            Teste de Autenticação
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Configuração de Teste</h3>
              <div className="space-y-2">
                <Label htmlFor="testEmail">Email para Teste</Label>
                <Input
                  id="testEmail"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Digite o email para testar"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="testPassword">Senha para Teste</Label>
                <Input
                  id="testPassword"
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="Digite a senha para testar"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Testes Disponíveis</h3>
              <div className="space-y-2">
                <Button
                  onClick={testSupabaseConnection}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Testar Conexão Supabase
                </Button>
                
                <Button
                  onClick={testLogin}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Testar Login
                </Button>
                
                <Button
                  onClick={testRegister}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Testar Registro
                </Button>
                
                <Button
                  onClick={testDatabase}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Testar Banco de Dados
                </Button>
                
                <Button
                  onClick={clearResults}
                  disabled={isLoading}
                  variant="destructive"
                  className="w-full"
                >
                  Limpar Resultados
                </Button>
              </div>
            </div>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Resultados dos Testes</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result.success 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {result.success ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className="font-medium">{result.test}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{result.timestamp}</span>
                    </div>
                    <p className="mt-1 text-sm">{result.message}</p>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer">
                          Ver detalhes
                        </summary>
                        <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestAuth;