/**
 * Toast helper functions for consistent messaging across the app
 * Centralized location for common toast patterns
 */

import { toast } from "@/hooks/use-toast";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "./constants";

/**
 * Shows a validation error toast
 */
export const showValidationError = () => {
  toast({
    title: "Erro de Validação",
    description: ERROR_MESSAGES.VALIDATION_ERROR,
    variant: "destructive",
  });
};

/**
 * Shows a network error toast
 */
export const showNetworkError = () => {
  toast({
    title: "Erro de Conexão",
    description: ERROR_MESSAGES.NETWORK_ERROR,
    variant: "destructive",
  });
};

/**
 * Shows an unexpected error toast
 */
export const showUnexpectedError = (customMessage?: string) => {
  toast({
    title: "Erro",
    description: customMessage || ERROR_MESSAGES.UNEXPECTED_ERROR,
    variant: "destructive",
  });
};

/**
 * Shows a success toast for post operations
 */
export const showPostSuccess = (isEdit: boolean) => {
  toast({
    title: isEdit ? SUCCESS_MESSAGES.POST_UPDATED : SUCCESS_MESSAGES.POST_CREATED,
    description: `Seu post foi ${isEdit ? "atualizado" : "criado"} com sucesso.`,
  });
};

/**
 * Shows a success toast for authentication operations
 */
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

