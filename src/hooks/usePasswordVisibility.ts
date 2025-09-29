import { useState, useCallback } from 'react';

/**
 * Custom hook for managing password visibility toggle
 * Provides consistent password visibility behavior across forms
 */
export interface UsePasswordVisibilityReturn {
  showPassword: boolean;
  showConfirmPassword: boolean;
  togglePassword: () => void;
  toggleConfirmPassword: () => void;
  reset: () => void;
}

/**
 * Hook for managing password visibility states
 * @param initialPasswordVisible - Initial state for password field
 * @param initialConfirmVisible - Initial state for confirm password field
 * @returns Password visibility state and toggle functions
 */
export function usePasswordVisibility(
  initialPasswordVisible: boolean = false,
  initialConfirmVisible: boolean = false
): UsePasswordVisibilityReturn {
  const [showPassword, setShowPassword] = useState(initialPasswordVisible);
  const [showConfirmPassword, setShowConfirmPassword] = useState(initialConfirmVisible);

  const togglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleConfirmPassword = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  const reset = useCallback(() => {
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, []);

  return {
    showPassword,
    showConfirmPassword,
    togglePassword,
    toggleConfirmPassword,
    reset,
  };
}
