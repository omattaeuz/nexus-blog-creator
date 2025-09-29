import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Bug, CheckCircle, XCircle, RefreshCw, Key, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logAuth, logError } from '@/lib/logger';

const DebugAuth = () => {
  const [testEmail, setTestEmail] = useState('qualquercoisa479@gmail.com');
  const [testPassword, setTestPassword] = useState('Umasenhaaib9090');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugResults, setDebugResults] = useState<any[]>([]);

  const addResult = (test: string, success: boolean, message: string, data?: any) => {
    setDebugResults(prev => [...prev, {
      test,
      success,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testDirectLogin = async () => {
    setIsLoading(true);
    try {
      logAuth('Testing direct login with Supabase SDK');
      
      // Test with signInWithPassword
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });

      if (error) {
        addResult('Direct Login Test', false, `Login failed: ${error.message}`, {
          errorCode: error.message,
          errorStatus: error.status,
          fullError: error
        });
      } else {
        addResult('Direct Login Test', true, 'Login successful!', {
          userId: data.user?.id,
          userEmail: data.user?.email,
          sessionExists: !!data.session,
          accessToken: data.session?.access_token?.substring(0, 20) + '...'
        });
      }
    } catch (error: any) {
      addResult('Direct Login Test', false, `Exception: ${error.message}`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const testPasswordReset = async () => {
    setIsLoading(true);
    try {
      logAuth('🔄 Testing password reset...');
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(testEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        addResult('Password Reset Test', false, `Reset failed: ${error.message}`, error);
      } else {
        addResult('Password Reset Test', true, 'Password reset email sent!', {
          message: 'Check your email for reset instructions'
        });
      }
    } catch (error: any) {
      addResult('Password Reset Test', false, `Exception: ${error.message}`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const testUpdatePassword = async () => {
    if (!newPassword) {
      addResult('Update Password Test', false, 'New password is required', null);
      return;
    }

    setIsLoading(true);
    try {
      logAuth('🔑 Testing password update...');
      
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        addResult('Update Password Test', false, `Update failed: ${error.message}`, error);
      } else {
        addResult('Update Password Test', true, 'Password updated successfully!', {
          userId: data.user?.id,
          userEmail: data.user?.email
        });
      }
    } catch (error: any) {
      addResult('Update Password Test', false, `Exception: ${error.message}`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const testUserInfo = async () => {
    setIsLoading(true);
    try {
      logAuth('👤 Testing user info retrieval...');
      
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        addResult('User Info Test', false, `Failed to get user: ${error.message}`, error);
      } else if (user) {
        addResult('User Info Test', true, 'User info retrieved successfully!', {
          userId: user.id,
          userEmail: user.email,
          emailConfirmed: user.email_confirmed_at,
          lastSignIn: user.last_sign_in_at,
          createdAt: user.created_at,
          userMetadata: user.user_metadata,
          appMetadata: user.app_metadata
        });
      } else {
        addResult('User Info Test', false, 'No user found - not authenticated', null);
      }
    } catch (error: any) {
      addResult('User Info Test', false, `Exception: ${error.message}`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const testSessionInfo = async () => {
    setIsLoading(true);
    try {
      logAuth('🔐 Testing session info...');
      
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        addResult('Session Info Test', false, `Failed to get session: ${error.message}`, error);
      } else if (session) {
        addResult('Session Info Test', true, 'Session found!', {
          userId: session.user?.id,
          userEmail: session.user?.email,
          accessToken: session.access_token?.substring(0, 20) + '...',
          refreshToken: session.refresh_token?.substring(0, 20) + '...',
          expiresAt: session.expires_at,
          tokenType: session.token_type
        });
      } else {
        addResult('Session Info Test', false, 'No active session found', null);
      }
    } catch (error: any) {
      addResult('Session Info Test', false, `Exception: ${error.message}`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const testCreateNewUser = async () => {
    setIsLoading(true);
    try {
      const testEmail = `debug-test-${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';
      
      logAuth('👤 Testing new user creation...');
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
      });

      if (error) {
        addResult('Create New User Test', false, `Creation failed: ${error.message}`, error);
      } else {
        addResult('Create New User Test', true, 'New user created successfully!', {
          userId: data.user?.id,
          userEmail: data.user?.email,
          needsConfirmation: !data.user?.email_confirmed_at,
          sessionExists: !!data.session
        });
      }
    } catch (error: any) {
      addResult('Create New User Test', false, `Exception: ${error.message}`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const testCredentialsProblem = async () => {
    setIsLoading(true);
    try {
      logAuth('🔍 Testing credentials problem with multiple approaches...');
      
      // Approach 1: Direct signInWithPassword
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });

      if (loginError) {
        addResult('Credentials Problem - Direct Login', false, `Direct login failed: ${loginError.message}`, {
          errorCode: loginError.message,
          errorStatus: loginError.status,
          fullError: loginError
        });

        // Approach 2: Try with different password variations
        const passwordVariations = [
          testPassword,
          testPassword.toLowerCase(),
          testPassword.toUpperCase(),
          'Umasenhaaib9090',
          'umasenhaaib9090',
          'UMASENHAAIB9090'
        ];

        for (const password of passwordVariations) {
          if (password === testPassword) continue; // Skip the original
          
          const { error: varError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: password
          });

          if (!varError) {
            addResult('Credentials Problem - Password Variation', true, `Login successful with password: ${password}`, {
              workingPassword: password,
              originalPassword: testPassword
            });
            break;
          }
        }

        // Approach 3: Check if user exists and is confirmed
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          addResult('Credentials Problem - User Check', false, `Cannot check user: ${userError.message}`, userError);
        } else if (user) {
          addResult('Credentials Problem - User Check', true, 'User is authenticated (session exists)', {
            userId: user.id,
            userEmail: user.email,
            emailConfirmed: user.email_confirmed_at,
            lastSignIn: user.last_sign_in_at
          });
        } else {
          addResult('Credentials Problem - User Check', false, 'No user session found', null);
        }

      } else {
        addResult('Credentials Problem - Direct Login', true, 'Direct login successful!', {
          userId: loginData.user?.id,
          userEmail: loginData.user?.email,
          sessionExists: !!loginData.session
        });
      }

    } catch (error: any) {
      addResult('Credentials Problem Test', false, `Exception: ${error.message}`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const testPasswordResetFlow = async () => {
    setIsLoading(true);
    try {
      logAuth('🔄 Testing complete password reset flow...');
      
      // Step 1: Send password reset email
      const { data: resetData, error: resetError } = await supabase.auth.resetPasswordForEmail(testEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (resetError) {
        addResult('Password Reset Flow - Send Email', false, `Reset email failed: ${resetError.message}`, resetError);
        return;
      }

      addResult('Password Reset Flow - Send Email', true, 'Password reset email sent successfully!', {
        message: 'Check your email for reset instructions',
        redirectTo: `${window.location.origin}/reset-password`
      });

      // Step 2: Try to login with a temporary password (this won't work, but shows the flow)
      const tempPassword = 'TempPassword123!';
      
      const { error: tempLoginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: tempPassword
      });

      if (tempLoginError) {
        addResult('Password Reset Flow - Temp Login', false, `Temp login failed (expected): ${tempLoginError.message}`, {
          expected: true,
          message: 'This is expected - user needs to use reset link'
        });
      }

      addResult('Password Reset Flow - Instructions', true, 'Next steps:', {
        step1: 'Check your email for password reset link',
        step2: 'Click the link to set a new password',
        step3: 'Try logging in with the new password',
        note: 'The reset link will redirect to /reset-password page'
      });

    } catch (error: any) {
      addResult('Password Reset Flow Test', false, `Exception: ${error.message}`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setDebugResults([]);
  };

  const exportResults = () => {
    const dataStr = JSON.stringify(debugResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `debug-results-${Date.now()}.json`;
    link.click();
  };

  return (
    <div className="w-full max-w-6xl px-4">
      <Card className="bg-gradient-surface shadow-glow border-border/50">
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center">
            <Bug className="h-8 w-8 mr-2" />
            Debug Avançado de Autenticação
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Test Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Label htmlFor="testPassword">Senha Atual</Label>
                <Input
                  id="testPassword"
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="Digite a senha atual"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha (para teste de update)</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite uma nova senha"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Testes de Autenticação</h3>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  onClick={testDirectLogin}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <User className="h-4 w-4 mr-2" />}
                  Testar Login Direto
                </Button>
                
                <Button
                  onClick={testUserInfo}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <User className="h-4 w-4 mr-2" />}
                  Testar Info do Usuário
                </Button>
                
                <Button
                  onClick={testSessionInfo}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Key className="h-4 w-4 mr-2" />}
                  Testar Info da Sessão
                </Button>
                
                <Button
                  onClick={testPasswordReset}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                  Testar Reset de Senha
                </Button>
                
                <Button
                  onClick={testUpdatePassword}
                  disabled={isLoading || !newPassword}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Key className="h-4 w-4 mr-2" />}
                  Testar Update de Senha
                </Button>
                
                <Button
                  onClick={testCreateNewUser}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <User className="h-4 w-4 mr-2" />}
                  Testar Criação de Usuário
                </Button>
                
                <Button
                  onClick={testCredentialsProblem}
                  disabled={isLoading}
                  variant="destructive"
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Bug className="h-4 w-4 mr-2" />}
                  🔍 Debug Credenciais Problem
                </Button>
                
                <Button
                  onClick={testPasswordResetFlow}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                  🔄 Testar Reset de Senha Completo
                </Button>
              </div>
            </div>
          </div>

          {/* Results */}
          {debugResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Resultados dos Testes</h3>
                <div className="space-x-2">
                  <Button
                    onClick={exportResults}
                    variant="outline"
                    size="sm"
                  >
                    Exportar Resultados
                  </Button>
                  <Button
                    onClick={clearResults}
                    variant="destructive"
                    size="sm"
                  >
                    Limpar
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {debugResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
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
                          Ver detalhes técnicos
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

export default DebugAuth;
