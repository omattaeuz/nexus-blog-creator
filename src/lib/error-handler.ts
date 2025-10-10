import { logError } from './logger';

export interface ErrorContext {
  operation?: string;
  userId?: string;
  postId?: string;
  commentId?: string;
  [key: string]: unknown;
}

export class ErrorHandler {
  static handleApiError(
    error: unknown, 
    operation: string, 
    context: ErrorContext = {}
  ): Error {
    const errorMessage = this.extractErrorMessage(error);
    const userMessage = this.createUserFriendlyMessage(operation, errorMessage);
    
    logError(`API Error in ${operation}`, {
      error: errorMessage,
      context,
      originalError: error
    });

    return new Error(userMessage);
  }

  static handleAuthError(error: unknown, operation: string): Error {
    const errorMessage = this.extractErrorMessage(error);
    
    logError(`Auth Error in ${operation}`, {
      error: errorMessage,
      operation
    });

    return new Error(`Falha na autenticação: ${errorMessage}`);
  }

  static handleValidationError(
    errors: Record<string, string>, 
    operation: string
  ): Error {
    const errorMessages = Object.values(errors).join(', ');
    
    logError(`Validation Error in ${operation}`, {
      errors,
      operation
    });

    return new Error(`Erro de validação: ${errorMessages}`);
  }

  private static extractErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object' && 'message' in error) return String(error.message);
    
    return 'Erro desconhecido';
  }

  private static createUserFriendlyMessage(operation: string, errorMessage: string): string {
    const operationMessages: Record<string, string> = {
      'createPost': 'Falha ao criar post',
      'updatePost': 'Falha ao atualizar post',
      'deletePost': 'Falha ao excluir post',
      'getPosts': 'Falha ao carregar posts',
      'createComment': 'Falha ao criar comentário',
      'updateComment': 'Falha ao atualizar comentário',
      'deleteComment': 'Falha ao excluir comentário',
      'login': 'Falha ao fazer login',
      'register': 'Falha ao criar conta',
      'logout': 'Falha ao fazer logout'
    };

    const baseMessage = operationMessages[operation] || `Falha na operação: ${operation}`;
    return `${baseMessage}. Tente novamente.`;
  }
}