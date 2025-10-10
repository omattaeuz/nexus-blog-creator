import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { EmailInput } from "@/components/ui/EmailInput";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Loader2, LogIn, KeyRound } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/useAuth";
import { supabase } from "@/lib/supabase";
import { useFormValidation, commonValidationRules } from "@/hooks/useFormValidation";
import { usePasswordVisibility } from "@/hooks/usePasswordVisibility";
import { useAsyncOperation } from "@/hooks/useAsyncOperation";
import { logAuth, logError } from "@/lib/logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES, ROUTES } from "@/lib/constants";
import { type LoginData } from "@/types";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });

  const { showPassword, togglePassword } = usePasswordVisibility();
  const { errors, validateForm, clearError } = useFormValidation<LoginData>({
    email: commonValidationRules.email,
    password: commonValidationRules.password,
  });

  const loginOperation = useAsyncOperation(login, {
    onSuccess: () => {
      logAuth('Login successful', { email: formData.email });
      toast({
        title: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        description: "Você foi logado com sucesso.",
      });
      navigate(ROUTES.POSTS);
    },
    onError: (error) => {
      logError('Login failed', { email: formData.email, error: error.message });
      toast({
        title: "Falha no Login",
        description: error.message || ERROR_MESSAGES.UNEXPECTED_ERROR,
        variant: "destructive",
      });
    },
  });

  const resetPasswordOperation = useAsyncOperation(
    async (email: string) => {
      logAuth('Sending password reset email', { email });
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${ROUTES.RESET_PASSWORD}`
      });
      if (error) throw error;
      return data;
    },
    {
      onSuccess: () => {
        logAuth('Password reset email sent successfully');
        toast({
          title: SUCCESS_MESSAGES.PASSWORD_RESET_SENT,
          description: "Verifique sua caixa de entrada e clique no link para resetar sua senha.",
        });
      },
      onError: (error) => {
        logError('Password reset email failed', { error: error.message });
        toast({
          title: "Erro ao Enviar Email",
          description: `Erro: ${error.message}`,
          variant: "destructive",
        });
      },
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      toast({
        title: ERROR_MESSAGES.VALIDATION_ERROR,
        description: "Por favor, corrija os erros no formulário",
        variant: "destructive",
      });
      return;
    }

    await loginOperation.execute(formData);
  };

  const handleInputChange = (field: keyof LoginData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) clearError(field);
  };

  const handleForgotPassword = async () => {
    if (!formData.email.trim()) {
      toast({
        title: "Email Obrigatório",
        description: "Por favor, digite seu email para resetar a senha.",
        variant: "destructive",
      });
      return;
    }

    if (!commonValidationRules.email.pattern?.test(formData.email)) {
      toast({
        title: "Email Inválido",
        description: ERROR_MESSAGES.INVALID_EMAIL,
        variant: "destructive",
      });
      return;
    }

    await resetPasswordOperation.execute(formData.email);
  };

  return (
    <div className="w-full">
      <Card className="bg-transparent border-0 shadow-none">
        <CardHeader className="text-center p-4 sm:p-6">
          <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Bem-vindo de Volta
          </CardTitle>
          <p className="text-sm sm:text-base text-gray-300 mt-2">
            Entre na sua conta para continuar
          </p>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <EmailInput
              id="email"
              label="Email"
              value={formData.email}
              onChange={(value) => handleInputChange("email", value)}
              placeholder="Digite seu email..."
              error={errors.email}
              disabled={loginOperation.isLoading}
              required
            />

            <PasswordInput
              id="password"
              label="Senha"
              value={formData.password}
              onChange={(value) => handleInputChange("password", value)}
              placeholder="Digite sua senha..."
              showPassword={showPassword}
              onToggleVisibility={togglePassword}
              error={errors.password}
              disabled={loginOperation.isLoading}
              required
              minLength={6}
            />

            <div className="text-right">
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={handleForgotPassword}
                disabled={loginOperation.isLoading || resetPasswordOperation.isLoading}
                className="text-gray-400 hover:text-cyan-400 p-0 h-auto"
              >
                {resetPasswordOperation.isLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <KeyRound className="h-3 w-3 mr-1" />
                    Esqueci minha senha
                  </>
                )}
              </Button>
            </div>

            <SubmitButton
              isLoading={loginOperation.isLoading}
              loadingText="Entrando..."
              icon={<LogIn className="h-4 w-4" />}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Entrar
            </SubmitButton>

            <div className="text-center">
              <p className="text-sm sm:text-base text-gray-300">
                Não tem uma conta?{" "}
                <Link 
                  to={ROUTES.REGISTER} 
                  className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium transition-colors duration-300"
                >
                  Cadastre-se
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;