import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Posts from '../Posts';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

// Mock do useAuth
vi.mock('../../contexts/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: '1', email: 'test@test.com' },
    token: 'test-token',
    isAuthenticated: true,
  })),
}));

// Mock do usePostsWithCache
const mockUsePostsWithCache = {
  posts: [
    { id: '1', title: 'Post 1', content: 'Content 1', created_at: '2024-01-01T00:00:00Z' },
    { id: '2', title: 'Post 2', content: 'Content 2', created_at: '2024-01-02T00:00:00Z' },
  ],
  loading: false,
  error: null,
  refetch: vi.fn(),
  invalidateCache: vi.fn(),
  invalidatePostCache: vi.fn(),
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalPosts: 2,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

vi.mock('../../hooks/usePostsWithCache', () => ({
  usePostsWithCache: vi.fn((_options) => mockUsePostsWithCache),
}));

// Mock do api
vi.mock('../../services/api', () => ({
  api: {
    deletePost: vi.fn(),
  },
}));

// Mock do toast
vi.mock('../../hooks/use-toast', () => ({
  toast: vi.fn(),
}));

// Mock do logger
vi.mock('../../lib/logger', () => ({
  logApi: vi.fn(),
  logError: vi.fn(),
}));

// Mock do PostCard
vi.mock('../../components/PostCard', () => ({
  default: ({ post, onDelete }: any) => (
    <div data-testid={`post-card-${post.id}`}>
      <h3>{post.title}</h3>
      <p>{post.content}</p>
      <button onClick={() => onDelete(post.id)}>Delete</button>
    </div>
  ),
}));

// Mock do PostFilters
vi.mock('../../components/PostFilters', () => ({
  default: ({ filters, onFiltersChange, onClearFilters, totalPosts }: any) => (
    <div data-testid="post-filters">
      <div>Filters: {JSON.stringify(filters)}</div>
      <div>Total: {totalPosts}</div>
      <button onClick={() => onFiltersChange({ ...filters, sortBy: 'title' })}>
        Change Sort
      </button>
      <button onClick={onClearFilters}>Clear Filters</button>
    </div>
  ),
}));

// Mock do PostsPagination
vi.mock('../../components/PostsPagination', () => ({
  default: ({ currentPage, totalPages, onPageChange }: any) => (
    <div data-testid="posts-pagination">
      <div>Page {currentPage} of {totalPages}</div>
      <button onClick={() => onPageChange(2)}>Next Page</button>
    </div>
  ),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(component);
};

describe('Posts Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render posts page with header', () => {
    renderWithRouter(<Posts />);

    expect(screen.getByText('Blogs')).toBeInTheDocument();
    expect(screen.getByText('Descubra histórias, insights e ideias da nossa comunidade de escritores')).toBeInTheDocument();
  });

  it('should render search input', () => {
    renderWithRouter(<Posts />);

    expect(screen.getByPlaceholderText('Buscar posts...')).toBeInTheDocument();
  });

  it('should render filter and new post buttons', () => {
    renderWithRouter(<Posts />);

    expect(screen.getByText('Filtros')).toBeInTheDocument();
    expect(screen.getByText('Novo Post')).toBeInTheDocument();
  });

  it('should render posts count and pagination info', () => {
    renderWithRouter(<Posts />);

    expect(screen.getByText('2 posts')).toBeInTheDocument();
  });

  it('should render post cards', () => {
    renderWithRouter(<Posts />);

    expect(screen.getByTestId('post-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('post-card-2')).toBeInTheDocument();
    expect(screen.getByText('Post 1')).toBeInTheDocument();
    expect(screen.getByText('Post 2')).toBeInTheDocument();
  });
});