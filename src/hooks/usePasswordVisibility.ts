import { useState, useCallback } from 'react';

export interface UsePasswordVisibilityReturn {
  showPassword: boolean;
  showConfirmPassword: boolean;
  togglePassword: () => void;
  toggleConfirmPassword: () => void;
  reset: () => void;
}

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