import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, UserPlus, Eye, EyeOff, Mail, CheckCircle, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/useAuth";
import { type RegisterData } from "@/services/api";

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [formData, setFormData] = useState<RegisterData & { confirmPassword: string }>({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Por favor, digite um email válido";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password.length < 6) {
      newErrors.password = "A senha deve ter pelo menos 6 caracteres";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Por favor, confirme sua senha";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password && !newErrors.confirmPassword;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, corrija os erros no formulário",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await register({
        email: formData.email,
        password: formData.password,
      });
      
      // Store the registered email and show success modal
      setRegisteredEmail(formData.email);
      setShowSuccessModal(true);
      
      // Clear the form
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast({
        title: "Falha no Cadastro",
        description: error instanceof Error ? error.message : "Falha ao criar conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleGoToLogin = () => {
    setShowSuccessModal(false);
    navigate("/login");
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <div className="w-full max-w-md mx-auto px-3 sm:px-4">
      <Card className="bg-gradient-surface shadow-glow border-border/50">
        <CardHeader className="text-center p-4 sm:p-6">
          <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Criar Conta
          </CardTitle>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Junte-se a nós e comece a compartilhar suas histórias
          </p>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Digite seu email..."
                className={`transition-all duration-300 ${
                  errors.email 
                    ? "border-destructive focus:ring-destructive" 
                    : "focus:ring-primary"
                }`}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Crie uma senha..."
                  className={`pr-10 transition-all duration-300 ${
                    errors.password 
                      ? "border-destructive focus:ring-destructive" 
                      : "focus:ring-primary"
                  }`}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                Confirmar Senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  placeholder="Confirme sua senha..."
                  className={`pr-10 transition-all duration-300 ${
                    errors.confirmPassword 
                      ? "border-destructive focus:ring-destructive" 
                      : "focus:ring-primary"
                  }`}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-primary hover:bg-primary-hover shadow-glow transition-all duration-300"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
                Criar Conta
            </Button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm sm:text-base text-muted-foreground">
                Já tem uma conta?{" "}
                <Link 
                  to="/login" 
                  className="text-primary hover:underline font-medium"
                >
                  Entrar
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
              Conta Criada com Sucesso!
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-muted-foreground">
              Enviamos um email de confirmação para:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 sm:space-y-6">
            {/* Email Display */}
            <div className="flex items-center justify-center p-3 sm:p-4 bg-muted/50 rounded-lg border">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary mr-2" />
              <span className="font-medium text-foreground text-sm sm:text-base truncate">{registeredEmail}</span>
            </div>

            {/* Instructions */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground text-sm sm:text-base">Próximos passos:</h4>
              <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium mr-2 sm:mr-3 mt-0.5">1</span>
                  <span>Verifique sua caixa de entrada (e pasta de spam)</span>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium mr-2 sm:mr-3 mt-0.5">2</span>
                  <span>Clique no link de confirmação no email</span>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium mr-2 sm:mr-3 mt-0.5">3</span>
                  <span>Volte aqui e faça login com suas credenciais</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleGoToLogin}
                className="w-full bg-gradient-primary hover:bg-primary-hover"
              >
                Ir para Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={handleCloseModal}
                className="w-full"
              >
                Fechar
              </Button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-muted-foreground text-center">
              Não recebeu o email? Verifique sua pasta de spam ou aguarde alguns minutos.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegisterForm;
