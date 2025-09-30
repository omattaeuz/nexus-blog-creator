import { describe, it, expect, vi } from 'vitest';

// Teste básico para verificar se o ambiente está funcionando
describe('Working Tests', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have proper test environment', () => {
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
  });

  it('should have testing library available', () => {
    expect(typeof document.querySelector).toBe('function');
    expect(typeof document.createElement).toBe('function');
  });

  it('should have vitest globals available', () => {
    expect(typeof vi).toBe('object');
    expect(typeof describe).toBe('function');
    expect(typeof it).toBe('function');
    expect(typeof expect).toBe('function');
  });
});