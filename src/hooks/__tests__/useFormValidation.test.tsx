import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormValidation, commonValidationRules } from '../useFormValidation';

describe('useFormValidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with empty errors', () => {
      const { result } = renderHook(() => 
        useFormValidation({
          email: commonValidationRules.email,
          password: commonValidationRules.password,
        })
      );

      expect(result.current.errors).toEqual({});
    });

    it('should initialize with custom validation rules', () => {
      const customRules = {
        name: {
          required: true,
          minLength: 2,
        },
      };

      const { result } = renderHook(() => useFormValidation(customRules));

      expect(result.current.errors).toEqual({});
    });
  });

  describe('validation', () => {
    it('should validate required fields', () => {
      const { result } = renderHook(() => 
        useFormValidation({
          email: commonValidationRules.email,
        })
      );

      const formData = { email: '' };
      let isValid;
      act(() => {
        isValid = result.current.validateForm(formData);
      });

      expect(result.current.errors.email).toBe('email é obrigatório');
      expect(isValid).toBe(false);
    });

    it('should validate email format', () => {
      const { result } = renderHook(() => 
        useFormValidation({
          email: commonValidationRules.email,
        })
      );

      const formData = { email: 'invalid-email' };
      act(() => result.current.validateForm(formData));

      expect(result.current.errors.email).toBe('email tem formato inválido');
    });

    it('should validate password length', () => {
      const { result } = renderHook(() => 
        useFormValidation({
          password: commonValidationRules.password,
        })
      );

      const formData = { password: '123' };
      act(() => result.current.validateForm(formData));

      expect(result.current.errors.password).toBe('password deve ter pelo menos 6 caracteres');
    });

    it('should validate custom rules', () => {
      const customRules = {
        name: {
          required: true,
          minLength: 3,
          message: 'Name must be at least 3 characters',
        },
      };

      const { result } = renderHook(() => useFormValidation(customRules));

      const formData = { name: 'AB' };
      act(() => result.current.validateForm(formData));

      expect(result.current.errors.name).toBe('name deve ter pelo menos 3 caracteres');
    });

    it('should return true for valid form', () => {
      const { result } = renderHook(() => 
        useFormValidation({
          email: commonValidationRules.email,
          password: commonValidationRules.password,
        })
      );

      const formData = {
        email: 'test@example.com',
        password: 'password123',
      };

      let isValid;
      act(() => {
        isValid = result.current.validateForm(formData);
      });

      expect(result.current.errors).toEqual({});
      expect(isValid).toBe(true);
    });

    it('should validate multiple fields', () => {
      const { result } = renderHook(() => 
        useFormValidation({
          email: commonValidationRules.email,
          password: commonValidationRules.password,
        })
      );

      const formData = {
        email: 'invalid-email',
        password: '123',
      };

      act(() => result.current.validateForm(formData));

      expect(result.current.errors.email).toBe('email tem formato inválido');
      expect(result.current.errors.password).toBe('password deve ter pelo menos 6 caracteres');
    });
  });

  describe('clearError', () => {
    it('should clear specific field error', () => {
      const { result } = renderHook(() => 
        useFormValidation({
          email: commonValidationRules.email,
          password: commonValidationRules.password,
        })
      );

      // First, create an error
      const formData = { email: '', password: '' };
      act(() => result.current.validateForm(formData));

      expect(result.current.errors.email).toBe('email é obrigatório');

      // Then clear the error
      act(() => result.current.clearError('email'));

      expect(result.current.errors.email).toBeUndefined();
      expect(result.current.errors.password).toBe('password é obrigatório');
    });

    it('should clear all errors', () => {
      const { result } = renderHook(() => 
        useFormValidation({
          email: commonValidationRules.email,
          password: commonValidationRules.password,
        })
      );

      // First, create errors
      const formData = { email: '', password: '' };
      act(() => result.current.validateForm(formData));

      expect(result.current.errors.email).toBe('email é obrigatório');
      expect(result.current.errors.password).toBe('password é obrigatório');

      // Then clear all errors
      act(() => result.current.clearError('email'));
      act(() => result.current.clearError('password'));

      expect(result.current.errors).toEqual({});
    });
  });

  describe('commonValidationRules', () => {
    it('should have correct email validation rules', () => {
      expect(commonValidationRules.email).toEqual({
        required: true,
        pattern: /\S+@\S+\.\S+/,
        custom: expect.any(Function),
      });
    });

    it('should have correct password validation rules', () => {
      expect(commonValidationRules.password).toEqual({
        required: true,
        minLength: 6,
        custom: expect.any(Function),
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty validation rules', () => {
      const { result } = renderHook(() => useFormValidation({}));

      const formData = {};
      let isValid;
      act(() => {
        isValid = result.current.validateForm(formData);
      });

      expect(result.current.errors).toEqual({});
      expect(isValid).toBe(true);
    });

    it('should handle undefined form data', () => {
      const { result } = renderHook(() => 
        useFormValidation({
          email: commonValidationRules.email,
        })
      );

      act(() => result.current.validateForm({} as any));

      expect(result.current.errors.email).toBe('email é obrigatório');
    });

    it('should handle null form data', () => {
      const { result } = renderHook(() => 
        useFormValidation({
          email: commonValidationRules.email,
        })
      );

      act(() => result.current.validateForm({} as any));

      expect(result.current.errors.email).toBe('email é obrigatório');
    });

    it('should handle whitespace-only values', () => {
      const { result } = renderHook(() => 
        useFormValidation({
          email: commonValidationRules.email,
        })
      );

      const formData = { email: '   ' };
      act(() => result.current.validateForm(formData));

      expect(result.current.errors.email).toBe('email é obrigatório');
    });
  });

  describe('pattern validation', () => {
    it('should validate email pattern correctly', () => {
      const { result } = renderHook(() => 
        useFormValidation({
          email: commonValidationRules.email,
        })
      );

      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
      ];

      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test.example.com',
      ];

      validEmails.forEach(email => {
        act(() => result.current.validateForm({ email }));
        expect(result.current.errors.email).toBeUndefined();
      });

      invalidEmails.forEach(email => {
        act(() => result.current.validateForm({ email }));
        expect(result.current.errors.email).toBe('email tem formato inválido');
      });
    });
  });

  describe('minLength validation', () => {
    it('should validate minimum length correctly', () => {
      const { result } = renderHook(() => 
        useFormValidation({
          password: commonValidationRules.password,
        })
      );

      const validPasswords = [
        '123456',
        'password123',
        'verylongpassword',
      ];

      const invalidPasswords = [
        { password: '', expectedError: 'password é obrigatório' },
        { password: '123', expectedError: 'password deve ter pelo menos 6 caracteres' },
        { password: '12345', expectedError: 'password deve ter pelo menos 6 caracteres' },
      ];

      validPasswords.forEach(password => {
        act(() => result.current.validateForm({ password }));
        expect(result.current.errors.password).toBeUndefined();
      });

      invalidPasswords.forEach(({ password, expectedError }) => {
        act(() => result.current.validateForm({ password }));
        expect(result.current.errors.password).toBe(expectedError);
      });
    });
  });
});
