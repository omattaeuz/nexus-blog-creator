import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle conditional classes', () => {
      const shouldShow = true;
      const shouldHide = false;
      const result = cn('base', shouldShow && 'conditional', shouldHide && 'hidden');
      expect(result).toBe('base conditional');
    });

    it('should handle undefined and null values', () => {
      const result = cn('base', undefined, null, 'valid');
      expect(result).toBe('base valid');
    });

    it('should merge conflicting Tailwind classes', () => {
      const result = cn('p-2 p-4', 'm-1 m-2');
      expect(result).toBe('p-4 m-2');
    });

    it('should handle empty inputs', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle arrays of classes', () => {
      const result = cn(['class1', 'class2'], 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('should handle objects with boolean values', () => {
      const result = cn({
        'active': true,
        'disabled': false,
        'hidden': true,
      });
      expect(result).toBe('active hidden');
    });

    it('should handle complex combinations', () => {
      const result = cn(
        'base-class',
        ['array-class1', 'array-class2'],
        {
          'object-class': true,
          'hidden': false,
        },
        'string-class',
        undefined,
        null
      );
      expect(result).toBe('base-class array-class1 array-class2 object-class string-class');
    });

    it('should handle Tailwind class conflicts properly', () => {
      // Test that later classes override earlier ones
      const result = cn('text-red-500', 'text-blue-500');
      expect(result).toBe('text-blue-500');
    });

    it('should handle responsive classes', () => {
      const result = cn('p-2 md:p-4', 'p-1 md:p-2');
      expect(result).toBe('p-1 md:p-2');
    });

    it('should handle state variants', () => {
      const result = cn('hover:bg-blue-500', 'hover:bg-red-500');
      expect(result).toBe('hover:bg-red-500');
    });
  });
});
