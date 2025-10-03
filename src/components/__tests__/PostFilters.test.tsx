import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import PostFilters from '../PostFilters';

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => {
    if (date instanceof Date) {
      return date.toLocaleDateString('pt-BR');
    }
    return '01/01/2024';
  }),
}));

vi.mock('date-fns/locale', () => ({
  ptBR: {},
}));

describe('PostFilters', () => {
  const defaultFilters = {
    sortBy: 'created_at' as const,
    sortOrder: 'desc' as const,
    itemsPerPage: 6,
  };

  const mockOnFiltersChange = vi.fn();
  const mockOnClearFilters = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all filter controls', () => {
    render(
      <PostFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
        totalPosts={10}
      />
    );

    expect(screen.getByText('Filtros')).toBeInTheDocument();
    expect(screen.getByText('Ordenar por')).toBeInTheDocument();
    expect(screen.getByText('Ordem')).toBeInTheDocument();
    expect(screen.getByText('Data inicial')).toBeInTheDocument();
    expect(screen.getByText('Data final')).toBeInTheDocument();
    expect(screen.getByText('Posts por página')).toBeInTheDocument();
  });

  it('should display current filter values', () => {
    render(
      <PostFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
        totalPosts={10}
      />
    );

    expect(screen.getByText('Data de Criação')).toBeInTheDocument();
    expect(screen.getByText('Decrescente')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('should show active filters summary when filters are applied', () => {
    const filtersWithActiveFilters = {
      sortBy: 'title' as const,
      sortOrder: 'asc' as const,
      dateFrom: new Date('2024-01-01'),
      dateTo: new Date('2024-01-31'),
      itemsPerPage: 12,
    };

    render(
      <PostFilters
        filters={filtersWithActiveFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
        totalPosts={10}
      />
    );

    expect(screen.getByText('Filtros ativos')).toBeInTheDocument();
  });

  it('should not show active filters summary when using default filters', () => {
    render(
      <PostFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
        totalPosts={10}
      />
    );

    expect(screen.queryByText('Filtros ativos')).not.toBeInTheDocument();
  });
});