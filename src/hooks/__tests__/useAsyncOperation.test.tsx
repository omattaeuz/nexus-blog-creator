import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAsyncOperation, useFormSubmission } from '../useAsyncOperation';
import { delay } from '../../test/mocks';

describe('useAsyncOperation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('should initialize with correct default state', () => {
      const mockAsyncFunction = vi.fn();
      const { result } = renderHook(() => useAsyncOperation(mockAsyncFunction));

      expect(result.current.data).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isSuccess).toBe(false);
    });

    it('should execute async function successfully', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockAsyncFunction = vi.fn().mockResolvedValue(mockData);
      const { result } = renderHook(() => useAsyncOperation(mockAsyncFunction));

      let executeResult;
      await act(async () => {
        executeResult = await result.current.execute();
      });

      expect(mockAsyncFunction).toHaveBeenCalledTimes(1);
      expect(result.current.data).toEqual(mockData);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isSuccess).toBe(true);
      expect(executeResult).toEqual(mockData);
    });

    it('should handle async function errors', async () => {
      const errorMessage = 'Test error';
      const mockAsyncFunction = vi.fn().mockRejectedValue(new Error(errorMessage));
      const { result } = renderHook(() => useAsyncOperation(mockAsyncFunction));

      let executeResult;
      await act(async () => {
        executeResult = await result.current.execute();
      });

      expect(mockAsyncFunction).toHaveBeenCalledTimes(1);
      expect(result.current.data).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isSuccess).toBe(false);
      expect(executeResult).toBeNull();
    });

    it('should handle non-Error objects', async () => {
      const mockAsyncFunction = vi.fn().mockRejectedValue('String error');
      const { result } = renderHook(() => useAsyncOperation(mockAsyncFunction));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.error).toBe('An unexpected error occurred');
    });
  });

  describe('loading states', () => {
    it('should set loading to true during execution', async () => {
      const mockAsyncFunction = vi.fn().mockImplementation(() => delay(100));
      const { result } = renderHook(() => useAsyncOperation(mockAsyncFunction));

      act(() => {
        result.current.execute();
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await delay(150);
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should reset state when resetOnExecute is true', async () => {
      const mockAsyncFunction = vi.fn().mockResolvedValue('success');
      const { result } = renderHook(() => 
        useAsyncOperation(mockAsyncFunction, { resetOnExecute: true })
      );

      // First execution
      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.isSuccess).toBe(true);

      // Second execution should reset state
      await act(async () => {
        result.current.execute();
      });

      expect(result.current.isSuccess).toBe(true);
    });
  });

  describe('callbacks', () => {
    it('should call onSuccess callback', async () => {
      const mockData = { id: 1 };
      const mockAsyncFunction = vi.fn().mockResolvedValue(mockData);
      const onSuccess = vi.fn();
      
      const { result } = renderHook(() => 
        useAsyncOperation(mockAsyncFunction, { onSuccess })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(onSuccess).toHaveBeenCalledWith(mockData);
    });

    it('should call onError callback', async () => {
      const error = new Error('Test error');
      const mockAsyncFunction = vi.fn().mockRejectedValue(error);
      const onError = vi.fn();
      
      const { result } = renderHook(() => 
        useAsyncOperation(mockAsyncFunction, { onError })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(onError).toHaveBeenCalledWith(error);
    });

    it('should not call onError for non-Error objects', async () => {
      const mockAsyncFunction = vi.fn().mockRejectedValue('String error');
      const onError = vi.fn();
      
      const { result } = renderHook(() => 
        useAsyncOperation(mockAsyncFunction, { onError })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe('utility functions', () => {
    it('should reset state', () => {
      const mockAsyncFunction = vi.fn().mockResolvedValue('success');
      const { result } = renderHook(() => useAsyncOperation(mockAsyncFunction));

      act(() => {
        result.current.setData('test');
        result.current.setError('error');
      });

      expect(result.current.data).toBe('test');
      expect(result.current.error).toBe('error');

      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isSuccess).toBe(false);
    });

    it('should set data manually', () => {
      const mockAsyncFunction = vi.fn();
      const { result } = renderHook(() => useAsyncOperation(mockAsyncFunction));

      act(() => {
        result.current.setData('manual data');
      });

      expect(result.current.data).toBe('manual data');
    });

    it('should set error manually', () => {
      const mockAsyncFunction = vi.fn();
      const { result } = renderHook(() => useAsyncOperation(mockAsyncFunction));

      act(() => {
        result.current.setError('manual error');
      });

      expect(result.current.error).toBe('manual error');
    });
  });

  describe('arguments passing', () => {
    it('should pass arguments to async function', async () => {
      const mockAsyncFunction = vi.fn().mockResolvedValue('success');
      const { result } = renderHook(() => useAsyncOperation(mockAsyncFunction));

      await act(async () => {
        await result.current.execute('arg1', 'arg2', { key: 'value' });
      });

      expect(mockAsyncFunction).toHaveBeenCalledWith('arg1', 'arg2', { key: 'value' });
    });
  });
});

describe('useFormSubmission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle successful form submission', async () => {
    const mockSubmitFunction = vi.fn().mockResolvedValue('success');
    const mockValidationRules = {};
    const { result } = renderHook(() => 
      useFormSubmission(mockSubmitFunction, mockValidationRules)
    );

    const formData = { name: 'Test' };
    const validateForm = vi.fn().mockReturnValue(true);

    let submitResult;
    await act(async () => {
      submitResult = await result.current.handleSubmit(formData, validateForm);
    });

    expect(validateForm).toHaveBeenCalledWith(formData);
    expect(mockSubmitFunction).toHaveBeenCalledWith(formData);
    expect(submitResult).toBe(true);
    expect(result.current.isSuccess).toBe(true);
  });

  it('should handle validation failure', async () => {
    const mockSubmitFunction = vi.fn();
    const mockValidationRules = {};
    const onValidationError = vi.fn();
    
    const { result } = renderHook(() => 
      useFormSubmission(mockSubmitFunction, mockValidationRules, { onValidationError })
    );

    const formData = { name: '' };
    const validateForm = vi.fn().mockReturnValue(false);

    let submitResult;
    await act(async () => {
      submitResult = await result.current.handleSubmit(formData, validateForm);
    });

    expect(validateForm).toHaveBeenCalledWith(formData);
    expect(mockSubmitFunction).not.toHaveBeenCalled();
    expect(onValidationError).toHaveBeenCalledWith({});
    expect(submitResult).toBe(false);
  });

  it('should handle submission error', async () => {
    const error = new Error('Submission failed');
    const mockSubmitFunction = vi.fn().mockRejectedValue(error);
    const mockValidationRules = {};
    const onError = vi.fn();
    
    const { result } = renderHook(() => 
      useFormSubmission(mockSubmitFunction, mockValidationRules, { onError })
    );

    const formData = { name: 'Test' };
    const validateForm = vi.fn().mockReturnValue(true);

    let submitResult;
    await act(async () => {
      submitResult = await result.current.handleSubmit(formData, validateForm);
    });

    expect(validateForm).toHaveBeenCalledWith(formData);
    expect(mockSubmitFunction).toHaveBeenCalledWith(formData);
    expect(onError).toHaveBeenCalledWith(error);
    expect(submitResult).toBe(false);
    expect(result.current.error).toBe('Submission failed');
  });
});
