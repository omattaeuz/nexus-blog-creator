import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePasswordVisibility } from '../usePasswordVisibility';

describe('usePasswordVisibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with password hidden', () => {
      const { result } = renderHook(() => usePasswordVisibility());

      expect(result.current.showPassword).toBe(false);
    });
  });

  describe('togglePassword', () => {
    it('should toggle password visibility from hidden to visible', () => {
      const { result } = renderHook(() => usePasswordVisibility());

      expect(result.current.showPassword).toBe(false);

      act(() => {
        result.current.togglePassword();
      });

      expect(result.current.showPassword).toBe(true);
    });

    it('should toggle password visibility from visible to hidden', () => {
      const { result } = renderHook(() => usePasswordVisibility());

      // First toggle to show password
      act(() => {
        result.current.togglePassword();
      });

      expect(result.current.showPassword).toBe(true);

      // Second toggle to hide password
      act(() => {
        result.current.togglePassword();
      });

      expect(result.current.showPassword).toBe(false);
    });

    it('should toggle multiple times correctly', () => {
      const { result } = renderHook(() => usePasswordVisibility());

      // Initial state
      expect(result.current.showPassword).toBe(false);

      // First toggle
      act(() => {
        result.current.togglePassword();
      });
      expect(result.current.showPassword).toBe(true);

      // Second toggle
      act(() => {
        result.current.togglePassword();
      });
      expect(result.current.showPassword).toBe(false);

      // Third toggle
      act(() => {
        result.current.togglePassword();
      });
      expect(result.current.showPassword).toBe(true);

      // Fourth toggle
      act(() => {
        result.current.togglePassword();
      });
      expect(result.current.showPassword).toBe(false);
    });
  });

  describe('state persistence', () => {
    it('should maintain state across re-renders', () => {
      const { result, rerender } = renderHook(() => usePasswordVisibility());

      // Initial state
      expect(result.current.showPassword).toBe(false);

      // Toggle to show
      act(() => {
        result.current.togglePassword();
      });
      expect(result.current.showPassword).toBe(true);

      // Re-render
      rerender();

      // State should be maintained
      expect(result.current.showPassword).toBe(true);
    });

    it('should reset state when hook is unmounted and remounted', () => {
      const { result, unmount } = renderHook(() => usePasswordVisibility());

      // Toggle to show
      act(() => {
        result.current.togglePassword();
      });
      expect(result.current.showPassword).toBe(true);

      // Unmount
      unmount();

      // Remount
      const { result: newResult } = renderHook(() => usePasswordVisibility());

      // Should be back to initial state
      expect(newResult.current.showPassword).toBe(false);
    });
  });

  describe('function stability', () => {
    it('should return stable toggle function', () => {
      const { result, rerender } = renderHook(() => usePasswordVisibility());

      const firstToggle = result.current.togglePassword;

      rerender();

      const secondToggle = result.current.togglePassword;

      expect(firstToggle).toBe(secondToggle);
    });

    it('should work correctly with stable function', () => {
      const { result } = renderHook(() => usePasswordVisibility());

      const toggleFunction = result.current.togglePassword;

      expect(result.current.showPassword).toBe(false);

      act(() => {
        toggleFunction();
      });

      expect(result.current.showPassword).toBe(true);

      act(() => {
        toggleFunction();
      });

      expect(result.current.showPassword).toBe(false);
    });
  });

  describe('integration scenarios', () => {
    it('should work with multiple instances independently', () => {
      const { result: result1 } = renderHook(() => usePasswordVisibility());
      const { result: result2 } = renderHook(() => usePasswordVisibility());

      // Both should start hidden
      expect(result1.current.showPassword).toBe(false);
      expect(result2.current.showPassword).toBe(false);

      // Toggle first instance
      act(() => {
        result1.current.togglePassword();
      });

      // First should be visible, second should remain hidden
      expect(result1.current.showPassword).toBe(true);
      expect(result2.current.showPassword).toBe(false);

      // Toggle second instance
      act(() => {
        result2.current.togglePassword();
      });

      // Both should be visible
      expect(result1.current.showPassword).toBe(true);
      expect(result2.current.showPassword).toBe(true);

      // Toggle first instance again
      act(() => {
        result1.current.togglePassword();
      });

      // First should be hidden, second should remain visible
      expect(result1.current.showPassword).toBe(false);
      expect(result2.current.showPassword).toBe(true);
    });

    it('should handle rapid toggles correctly', () => {
      const { result } = renderHook(() => usePasswordVisibility());

      expect(result.current.showPassword).toBe(false);

      // Rapid toggles
      act(() => {
        result.current.togglePassword();
        result.current.togglePassword();
        result.current.togglePassword();
      });

      // Should end up visible (odd number of toggles)
      expect(result.current.showPassword).toBe(true);

      // More rapid toggles
      act(() => {
        result.current.togglePassword();
        result.current.togglePassword();
        result.current.togglePassword();
        result.current.togglePassword();
      });

      // Should end up visible (even number of toggles from visible state)
      expect(result.current.showPassword).toBe(true);
    });
  });
});
