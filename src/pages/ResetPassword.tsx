import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Loader2, Key, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'ready'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        console.log('🔑 Processing password reset...');
        
        // Check if we have the necessary tokens in the URL
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');

        if (type === 'recovery' && accessToken && refreshToken) {
          console.log('🔄 Setting session with recovery tokens...');
          
          // Set the session with the recovery tokens
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            console.error('❌ Error setting session:', sessionError);
            setStatus('error');
            setMessage('Erro ao processar link de reset. Link pode ter expirado.');
            return;
          }

          if (sessionData.session && sessionData.session.user) {
            console.log('✅ Session set successfully:', sessionData.session.user.email);
            setStatus('ready');
            setMessage('Digite sua nova senha abaixo.');
          } else {
            setStatus('error');
            setMessage('Erro ao processar link de reset.');
          }
        } else {
          // Check if user is already authenticated
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session && session.user) {
            console.log('✅ User already authenticated:', session.user.email);
            setStatus('ready');
            setMessage('Digite sua nova senha abaixo.');
          } else {
            setStatus('error');
            setMessage('Link de reset inválido ou expirado.');
          }
        }
      } catch (error) {
        console.error('❌ Error processing password reset:', error);
        setStatus('error');
        setMessage('Erro ao processar reset de senha.');
      }
    };

    handlePasswordReset();
  }, []);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem.',
        variant: 'destructive'
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Erro',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🔑 Updating password...');
      
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('❌ Error updating password:', error);
        setStatus('error');
        setMessage(`Erro ao atualizar senha: ${error.message}`);
        toast({
          title: 'Erro',
          description: `Erro ao atualizar senha: ${error.message}`,
          variant: 'destructive'
        });
        return;
      }

      if (data.user) {
        console.log('✅ Password updated successfully:', data.user.email);
        setStatus('success');
        setMessage('Senha atualizada com sucesso! Você será redirecionado para a página de posts.');
        
        toast({
          title: 'Sucesso',
          description: 'Senha atualizada com sucesso!',
          variant: 'default'
        });

        // Redirect to posts page after 3 seconds
        setTimeout(() => {
          navigate('/posts');
        }, 3000);
      }
    } catch (error: any) {
      console.error('❌ Exception updating password:', error);
      setStatus('error');
      setMessage('Erro inesperado ao atualizar senha.');
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao atualizar senha.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-16 w-16 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500" />;
      case 'ready':
        return <Key className="h-16 w-16 text-blue-500" />;
      default:
        return <Key className="h-16 w-16 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'ready':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface flex items-center justify-center p-4">
      <Card className={`w-full max-w-md ${getStatusColor()}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Processando Reset...'}
            {status === 'success' && 'Senha Atualizada!'}
            {status === 'error' && 'Erro no Reset'}
            {status === 'ready' && 'Definir Nova Senha'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Por favor, aguarde enquanto processamos seu link de reset.'}
            {status === 'success' && 'Sua senha foi atualizada com sucesso!'}
            {status === 'error' && 'Algo deu errado durante o reset.'}
            {status === 'ready' && 'Digite sua nova senha abaixo.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Verificando link de reset...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <p className="text-sm text-green-600">
                {message}
              </p>
              <Button 
                onClick={() => navigate('/posts')}
                className="w-full"
              >
                Ir para Posts
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <p className="text-sm text-red-600">
                {message}
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="w-full"
                >
                  Ir para Login
                </Button>
                <Button 
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="w-full"
                >
                  Ir para Home
                </Button>
              </div>
            </div>
          )}

          {status === 'ready' && (
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite sua nova senha"
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme sua nova senha"
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading || !newPassword || !confirmPassword}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Atualizando Senha...
                  </>
                ) : (
                  'Atualizar Senha'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
