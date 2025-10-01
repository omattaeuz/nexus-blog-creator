import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for handling async operations with consistent loading and error states
 * Provides a standardized pattern for API calls and async operations
 */
export interface AsyncOperationState<T = unknown> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}

export interface UseAsyncOperationReturn<T> extends AsyncOperationState<T> {
  execute: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
  setError: (error: string | null) => void;
}

/**
 * Hook for managing async operations with loading, error, and success states
 * @param asyncFunction - The async function to execute
 * @param options - Configuration options
 * @returns Async operation state and utilities
 */
export function useAsyncOperation<T = unknown>(
  asyncFunction: (...args: unknown[]) => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    resetOnExecute?: boolean;
  } = {}
): UseAsyncOperationReturn<T> {
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    isLoading: false,
    error: null,
    isSuccess: false,
  });

  // Use refs to store the latest callback functions
  const onSuccessRef = useRef(options.onSuccess);
  const onErrorRef = useRef(options.onError);
  const resetOnExecuteRef = useRef(options.resetOnExecute);

  // Update refs when options change
  onSuccessRef.current = options.onSuccess;
  onErrorRef.current = options.onError;
  resetOnExecuteRef.current = options.resetOnExecute;

  const execute = useCallback(async (...args: unknown[]): Promise<T | null> => {
    try {
      // Reset state if configured to do so
      if (resetOnExecuteRef.current) {
        setState(prev => ({
          ...prev,
          isLoading: true,
          error: null,
          isSuccess: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: true,
          error: null,
        }));
      }

      const result = await asyncFunction(...args);
      
      setState({
        data: result,
        isLoading: false,
        error: null,
        isSuccess: true,
      });

      // Call success callback if provided
      if (onSuccessRef.current) onSuccessRef.current(result);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      setState(prev => ({
        ...prev,
        data: null,
        isLoading: false,
        error: errorMessage,
        isSuccess: false,
      }));

      // Call error callback if provided
      if (onErrorRef.current && error instanceof Error) onErrorRef.current(error);

      return null;
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      isSuccess: false,
    });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
  };
}

/**
 * Hook for handling form submissions with validation
 * Combines form validation with async operation handling
 */
export function useFormSubmission<T extends Record<string, any>>(
  submitFunction: (data: T) => Promise<any>,
  validationRules: any = {},
  options: {
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
    onValidationError?: (errors: any) => void;
  } = {}
) {
  const asyncOperation = useAsyncOperation(submitFunction, {
    onSuccess: options.onSuccess,
    onError: options.onError,
  });

  const handleSubmit = useCallback(async (data: T, validateForm: (data: T) => boolean) => {
    // Validate form first
    if (!validateForm(data)) {
      if (options.onValidationError) options.onValidationError({});

      return false;
    }

    // Execute async operation
    const result = await asyncOperation.execute(data);
    return result !== null;
  }, [asyncOperation, options]);

  return {
    ...asyncOperation,
    handleSubmit,
  };
}