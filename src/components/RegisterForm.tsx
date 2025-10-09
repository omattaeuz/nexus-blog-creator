import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmailInput } from "@/components/ui/EmailInput";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { UserPlus, Mail, CheckCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/useAuth";
import { useFormValidation, commonValidationRules } from "@/hooks/useFormValidation";
import { usePasswordVisibility } from "@/hooks/usePasswordVisibility";
import { useAsyncOperation } from "@/hooks/useAsyncOperation";
import { ERROR_MESSAGES } from "@/lib/constants";
import { showValidationError, showUnexpectedError } from "@/lib/toast-helpers";
import { type RegisterData } from "@/services/api";

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [formData, setFormData] = useState<RegisterData & { confirmPassword: string } & Record<string, unknown>>({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { showPassword, showConfirmPassword, togglePassword, toggleConfirmPassword } = usePasswordVisibility();
  const { errors, validateForm, clearError } = useFormValidation<RegisterData & { confirmPassword: string } & Record<string, unknown>>({
    email: commonValidationRules.email,
    password: commonValidationRules.password,
    confirmPassword: {
      ...commonValidationRules.confirmPassword,
      custom: (value: string) => {
        if (value !== formData.password) return ERROR_MESSAGES.PASSWORDS_DONT_MATCH;

        return null;
      }
    },
  });

  const registerOperation = useAsyncOperation(register, {
    onSuccess: () => {
      setRegisteredEmail(formData.email);
      setShowSuccessModal(true);
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
      });
    },
    onError: (error) => {
      showUnexpectedError(error.message || "Falha ao criar conta. Tente novamente.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      showValidationError();
      return;
    }

    await registerOperation.execute({
      email: formData.email,
      password: formData.password,
    });
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) clearError(field as keyof typeof formData);
  };

  const handleGoToLogin = () => {
    setShowSuccessModal(false);
    navigate("/login");
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <div className="w-full">
      <Card className="bg-transparent border-0 shadow-none">
        <CardHeader className="text-center p-4 sm:p-6">
          <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Criar Conta
          </CardTitle>
          <p className="text-sm sm:text-base text-gray-300 mt-2">
            Junte-se a nós e comece a compartilhar suas histórias
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
              disabled={registerOperation.isLoading}
              required
            />

            <PasswordInput
              id="password"
              label="Senha"
              value={formData.password}
              onChange={(value) => handleInputChange("password", value)}
              placeholder="Crie uma senha..."
              showPassword={showPassword}
              onToggleVisibility={togglePassword}
              error={errors.password}
              disabled={registerOperation.isLoading}
              required
              minLength={6}
            />

            <PasswordInput
              id="confirmPassword"
              label="Confirmar Senha"
              value={formData.confirmPassword}
              onChange={(value) => handleInputChange("confirmPassword", value)}
              placeholder="Confirme sua senha..."
              showPassword={showConfirmPassword}
              onToggleVisibility={toggleConfirmPassword}
              error={errors.confirmPassword}
              disabled={registerOperation.isLoading}
              required
              minLength={6}
            />

            <SubmitButton
              isLoading={registerOperation.isLoading}
              loadingText="Criando conta..."
              icon={<UserPlus className="h-4 w-4 mr-2" />}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Criar Conta
            </SubmitButton>

            <div className="text-center">
              <p className="text-sm sm:text-base text-gray-300">
                Já tem uma conta?{" "}
                <Link 
                  to="/login" 
                  className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium transition-colors duration-300"
                >
                  Entrar
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md mx-4 bg-slate-800/95 backdrop-blur-md border-slate-700/50">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-green-500/20 border border-green-500/30">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-white">
              Conta Criada com Sucesso!
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-gray-300">
              Enviamos um email de confirmação para:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-center p-3 sm:p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400 mr-2" />
              <span className="font-medium text-white text-sm sm:text-base truncate">{registeredEmail}</span>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-white text-sm sm:text-base">Próximos passos:</h4>
              <div className="space-y-2 text-xs sm:text-sm text-gray-300">
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-xs font-medium mr-2 sm:mr-3 mt-0.5">1</span>
                  <span>Verifique sua caixa de entrada (e pasta de spam)</span>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-xs font-medium mr-2 sm:mr-3 mt-0.5">2</span>
                  <span>Clique no link de confirmação no email</span>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-xs font-medium mr-2 sm:mr-3 mt-0.5">3</span>
                  <span>Volte aqui e faça login com suas credenciais</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleGoToLogin}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Ir para Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={handleCloseModal}
                className="w-full border-slate-600/50 text-gray-300 hover:bg-slate-700/50 hover:text-white"
              >
                Fechar
              </Button>
            </div>

            <p className="text-xs text-gray-400 text-center">
              Não recebeu o email? Verifique sua pasta de spam ou aguarde alguns minutos.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegisterForm;