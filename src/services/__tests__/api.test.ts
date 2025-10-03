import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api, auth } from '../api';

// Mock do axios
vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
      isAxiosError: actual.isAxiosError,
    },
  };
});

// Mock do logger
vi.mock('../../lib/logger', () => ({
  logApi: vi.fn(),
  logError: vi.fn(),
}));

// Mock do N8N config
vi.mock('../../config/n8n', () => ({
  N8N_CONFIG: {
    WEBHOOK_URL: 'https://test.n8n.co/webhook',
    SUPABASE: {
      URL: 'https://test.supabase.co',
      ANON_KEY: 'test-anon-key',
    },
  },
}));

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('auth service', () => {
    it('should have register function', () => {
      expect(typeof auth.register).toBe('function');
    });

    it('should have login function', () => {
      expect(typeof auth.login).toBe('function');
    });

    it('should have getCurrentUser function', () => {
      expect(typeof auth.getCurrentUser).toBe('function');
    });

    it('should have testConnection function', () => {
      expect(typeof auth.testConnection).toBe('function');
    });
  });

  describe('posts API', () => {
    it('should have createPost function', () => {
      expect(typeof api.createPost).toBe('function');
    });

    it('should have getPosts function', () => {
      expect(typeof api.getPosts).toBe('function');
    });

    it('should have getPost function', () => {
      expect(typeof api.getPost).toBe('function');
    });

    it('should have updatePost function', () => {
      expect(typeof api.updatePost).toBe('function');
    });

    it('should have deletePost function', () => {
      expect(typeof api.deletePost).toBe('function');
    });

    it('should handle getPosts with filter parameters', async () => {
      // Test that the function accepts filter parameters without throwing
      const filters = {
        sortBy: 'title' as const,
        sortOrder: 'asc' as const,
        dateFrom: new Date('2024-01-01'),
        dateTo: new Date('2024-01-31'),
        itemsPerPage: 12,
      };

      // This test verifies that the function signature accepts filters
      // The actual implementation will be tested in integration tests
      expect(() => {
        api.getPosts({
          page: 1,
          limit: 12,
          search: 'test',
          token: 'test-token',
          filters,
        });
      }).not.toThrow();
    });
  });
});