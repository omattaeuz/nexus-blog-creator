import { useState, useCallback, useRef } from 'react';

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

  const onSuccessRef = useRef(options.onSuccess);
  const onErrorRef = useRef(options.onError);
  const resetOnExecuteRef = useRef(options.resetOnExecute);

  onSuccessRef.current = options.onSuccess;
  onErrorRef.current = options.onError;
  resetOnExecuteRef.current = options.resetOnExecute;

  const execute = useCallback(async (...args: unknown[]): Promise<T | null> => {
    try {
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

export function useFormSubmission<T extends Record<string, any>>(
  submitFunction: (data: T) => Promise<any>,
  _validationRules: any = {},
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
    if (!validateForm(data)) {
      if (options.onValidationError) options.onValidationError({});

      return false;
    }

    const result = await asyncOperation.execute(data);
    return result !== null;
  }, [asyncOperation, options]);

  return {
    ...asyncOperation,
    handleSubmit,
  };
}