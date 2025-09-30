import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePosts } from '../usePosts';

// Mock do api
vi.mock('../../services/api', () => ({
  api: {
    getPosts: vi.fn(),
    getPost: vi.fn(),
    createPost: vi.fn(),
    updatePost: vi.fn(),
    deletePost: vi.fn(),
  },
}));

// Mock do useAuth
vi.mock('../../contexts/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    token: null,
    isAuthenticated: false,
  })),
}));

// Mock do logger
vi.mock('../../lib/logger', () => ({
  logApi: vi.fn(),
  logError: vi.fn(),
}));

describe('usePosts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have usePosts hook available', () => {
    expect(typeof usePosts).toBe('function');
  });
});