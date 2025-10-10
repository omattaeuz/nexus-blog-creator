import { useState, useCallback } from 'react';
import { VALIDATION_CONSTANTS, AUTH_CONSTANTS, ERROR_MESSAGES } from '@/lib/constants';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface UseFormValidationReturn<T> {
  errors: ValidationErrors;
  validateField: (field: keyof T, value: string) => string | null;
  validateForm: (data: T) => boolean;
  clearError: (field: keyof T) => void;
  clearAllErrors: () => void;
  hasErrors: boolean;
}

export function useFormValidation<T extends Record<string, unknown>>(
  rules: ValidationRules
): UseFormValidationReturn<T> {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = useCallback((field: keyof T, value: string): string | null => {
    const rule = rules[field as string];
    if (!rule) return null;

    if (rule.required && (!value || value.trim() === '')) return `${String(field)} é obrigatório`;
    if (!value || value.trim() === '') return null;
    if (rule.minLength && value.length < rule.minLength) return `${String(field)} deve ter pelo menos ${rule.minLength} caracteres`;
    if (rule.maxLength && value.length > rule.maxLength) return `${String(field)} deve ter no máximo ${rule.maxLength} caracteres`;
    if (rule.pattern && !rule.pattern.test(value)) return `${String(field)} tem formato inválido`;
    if (rule.custom) return rule.custom(value);

    return null;
  }, [rules]);

  const validateForm = useCallback((data: T): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(rules).forEach((field) => {
      const error = validateField(field as keyof T, String(data[field] || ''));
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [rules, validateField]);

  const clearError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field as string];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasErrors = Object.keys(errors).length > 0;

  return {
    errors,
    validateField,
    validateForm,
    clearError,
    clearAllErrors,
    hasErrors,
  };
}

export const commonValidationRules = {
  email: {
    required: true,
    pattern: VALIDATION_CONSTANTS.EMAIL_PATTERN,
    custom: (value: string) => {
      if (!VALIDATION_CONSTANTS.EMAIL_PATTERN.test(value)) return ERROR_MESSAGES.INVALID_EMAIL;
      
      return null;
    }
  },
  password: {
    required: true,
    minLength: AUTH_CONSTANTS.MIN_PASSWORD_LENGTH,
    custom: (value: string) => {
      if (value.length < AUTH_CONSTANTS.MIN_PASSWORD_LENGTH) return ERROR_MESSAGES.PASSWORD_TOO_WEAK;

      return null;
    }
  },
  confirmPassword: {
    required: true,
    custom: (value: string, originalPassword?: string) => {
      if (originalPassword && value !== originalPassword) return ERROR_MESSAGES.PASSWORDS_DONT_MATCH;
      
      return null;
    }
  },
  title: {
    required: true,
    minLength: VALIDATION_CONSTANTS.MIN_TITLE_LENGTH,
    maxLength: VALIDATION_CONSTANTS.MAX_TITLE_LENGTH,
  },
  content: {
    required: true,
    minLength: VALIDATION_CONSTANTS.MIN_CONTENT_LENGTH,
  }
};