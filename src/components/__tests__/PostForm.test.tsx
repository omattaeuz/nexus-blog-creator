import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PostForm from '../PostForm';

// Mock do toast
vi.mock('../../hooks/use-toast', () => ({
  toast: vi.fn(),
}));

// Mock do react-router-dom
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    Link: ({ children, to, ...props }: any) => {
      const React = require('react');
      return React.createElement('a', { href: to, ...props }, children);
    },
  };
});

describe('PostForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPostForm = (props: any = {}) =>
    render(
      <BrowserRouter>
        <PostForm onSubmit={vi.fn()} {...props} />
      </BrowserRouter>
    );

  it('should render title and content inputs', () => {
    renderPostForm();
    expect(screen.getByLabelText(/Título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Conteúdo/i)).toBeInTheDocument();
  });

  it('should render create button', () => {
    renderPostForm();
    expect(screen.getByRole('button', { name: /Criar Post/i })).toBeInTheDocument();
  });

  it('should render cancel button', () => {
    renderPostForm();
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
  });

  it('should pre-fill form with initialData in edit mode', () => {
    const initialData = { title: 'Existing Title', content: 'Existing Content' };
    renderPostForm({ initialData, isEdit: true });

    expect(screen.getByLabelText(/Título/i)).toHaveValue('Existing Title');
    expect(screen.getByLabelText(/Conteúdo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Atualizar Post/i })).toBeInTheDocument();
  });
});