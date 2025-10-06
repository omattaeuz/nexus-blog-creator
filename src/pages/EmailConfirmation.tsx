import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logAuth, logError } from '@/lib/logger';

const EmailConfirmation = () => {
  const [_searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        logAuth('📧 Processing email confirmation...');
        
        // The Supabase SDK automatically handles the email confirmation
        // when the user is redirected to this page with the confirmation tokens
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          logError('❌ Error getting session:', error);
          setStatus('error');
          setMessage('Erro ao confirmar email. Link pode ter expirado.');
          return;
        }

        if (data.session && data.session.user) {
          logAuth('✅ Email confirmed successfully:', data.session.user.email);
          setStatus('success');
          setMessage('Email confirmado com sucesso! Você foi automaticamente logado.');

          // Redirect to posts page after 3 seconds
          setTimeout(() => {
            navigate('/posts');
          }, 3000);
        } else {
          // Check if there are tokens in the URL that need to be processed
          const hash = window.location.hash.substring(1);
          const params = new URLSearchParams(hash);
          
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const type = params.get('type');

          if (type === 'signup' && accessToken && refreshToken) {
            logAuth('🔄 Processing tokens from URL...');
            
            // Set the session with the tokens from the URL
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

            if (sessionError) {
              logError('❌ Error setting session:', sessionError);
              setStatus('error');
              setMessage('Erro ao processar confirmação. Tente novamente.');
              return;
            }

            if (sessionData.session && sessionData.session.user) {
              logAuth('✅ Session set successfully:', sessionData.session.user.email);
              setStatus('success');
              setMessage('Email confirmado com sucesso! Você foi automaticamente logado.');

              // Redirect to posts page after 3 seconds
              setTimeout(() => {
                navigate('/posts');
              }, 3000);
            } else {
              setStatus('error');
              setMessage('Erro ao processar confirmação.');
            }
          } else {
            setStatus('error');
            setMessage('Link de confirmação inválido ou expirado.');
          }
        }
      } catch (error) {
        logError('❌ Error confirming email:', error);
        setStatus('error');
        setMessage('Erro ao confirmar email. Tente novamente.');
      }
    };

    handleEmailConfirmation();
  }, [navigate]);


  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-16 w-16 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <div className="w-full max-w-md px-4">
        <Card className={`w-full max-w-md ${getStatusColor()}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Confirmando Email...'}
            {status === 'success' && 'Email Confirmado!'}
            {status === 'error' && 'Erro na Confirmação'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Por favor, aguarde enquanto processamos sua confirmação.'}
            {status === 'success' && 'Sua conta foi ativada com sucesso!'}
            {status === 'error' && 'Algo deu errado durante a confirmação.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>Verificando seu link de confirmação...</span>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <p className="text-green-700">{message}</p>
              <div className="bg-green-100 p-3 rounded-lg">
                <p className="text-sm text-green-800">
                  Você será redirecionado automaticamente para a página de posts em alguns segundos.
                </p>
              </div>
              <Button 
                onClick={() => navigate('/posts')}
                className="w-full bg-gradient-primary hover:bg-primary-hover"
              >
                Ir para Posts
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <p className="text-red-700">{message}</p>
              <div className="space-y-2">
                <Button 
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="w-full"
                >
                  Tentar Fazer Login
                </Button>
                <Button 
                  onClick={() => navigate('/register')}
                  variant="outline"
                  className="w-full"
                >
                  Registrar Novamente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailConfirmation;
