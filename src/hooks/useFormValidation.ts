import { useState, useCallback } from 'react';

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

/**
 * Hook for form validation with consistent error handling
 * @param rules - Validation rules for each field
 * @returns Validation utilities and error state
 */
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
    pattern: /\S+@\S+\.\S+/,
    custom: (value: string) => {
      if (!/\S+@\S+\.\S+/.test(value)) return 'Por favor, digite um email válido';
      
      return null;
    }
  },
  password: {
    required: true,
    minLength: 6,
    custom: (value: string) => {
      if (value.length < 6) return 'A senha deve ter pelo menos 6 caracteres';

      return null;
    }
  },
  confirmPassword: {
    required: true,
    custom: (value: string, originalPassword?: string) => {
      if (originalPassword && value !== originalPassword) return 'As senhas não coincidem';
      
      return null;
    }
  },
  title: {
    required: true,
    minLength: 3,
    maxLength: 100,
  },
  content: {
    required: true,
    minLength: 10,
  }
};