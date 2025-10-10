import { toast } from "@/hooks/use-toast";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "./constants";

export const showValidationError = () => {
  toast({
    title: "Erro de Validação",
    description: ERROR_MESSAGES.VALIDATION_ERROR,
    variant: "destructive",
  });
};

export const showNetworkError = () => {
  toast({
    title: "Erro de Conexão",
    description: ERROR_MESSAGES.NETWORK_ERROR,
    variant: "destructive",
  });
};

export const showUnexpectedError = (customMessage?: string) => {
  toast({
    title: "Erro",
    description: customMessage || ERROR_MESSAGES.UNEXPECTED_ERROR,
    variant: "destructive",
  });
};

export const showPostSuccess = (isEdit: boolean) => {
  toast({
    title: isEdit ? SUCCESS_MESSAGES.POST_UPDATED : SUCCESS_MESSAGES.POST_CREATED,
    description: `Seu post foi ${isEdit ? "atualizado" : "criado"} com sucesso.`,
  });
};

export const showAuthSuccess = (operation: 'login' | 'register' | 'logout') => {
  const messages = {
    login: SUCCESS_MESSAGES.LOGIN_SUCCESS,
    register: SUCCESS_MESSAGES.REGISTER_SUCCESS,
    logout: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
  };
  
  toast({
    title: messages[operation],
    description: operation === 'login' ? "Você foi logado com sucesso." : undefined,
  });
};