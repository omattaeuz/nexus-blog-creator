import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Tag,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Post } from '@/types/index';

interface AdvancedSearchProps {
  posts: Post[];
  onSearchResults: (results: Post[]) => void;
}

interface SearchFilters {
  query: string;
  author: string;
  tags: string[];
  dateFrom: string;
  dateTo: string;
  minReadTime: number;
  maxReadTime: number;
  sortBy: 'relevance' | 'date' | 'readTime' | 'title';
  sortOrder: 'asc' | 'desc';
}

export default function AdvancedSearch({ posts, onSearchResults }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    author: '',
    tags: [],
    dateFrom: '',
    dateTo: '',
    minReadTime: 0,
    maxReadTime: 60,
    sortBy: 'relevance',
    sortOrder: 'desc'
  });

  const [showFilters, setShowFilters] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableAuthors, setAvailableAuthors] = useState<string[]>([]);

  useEffect(() => {
    const tags = [...new Set(posts.flatMap(post => post.tags || []))];
    const authors = [...new Set(posts.map(post => post.author?.email || 'Autor desconhecido'))];
    setAvailableTags(tags);
    setAvailableAuthors(authors);
  }, [posts]);

  const searchResults = useMemo(() => {
    let results = [...posts];

    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query)
      );
    }

    // Author filter
    if (filters.author) results = results.filter(post => post.author?.email === filters.author);

    // Tags filter
    if (filters.tags.length > 0) {
      results = results.filter(post => 
        filters.tags.some(tag => post.tags?.includes(tag))
      );
    }

    // Date range filter
    if (filters.dateFrom) {
      results = results.filter(post => 
        new Date(post.created_at) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      results = results.filter(post => 
        new Date(post.created_at) <= new Date(filters.dateTo)
      );
    }

    // Read time filter (estimated based on content length)
    results = results.filter(post => {
      const estimatedReadTime = Math.ceil(post.content.length / 1000); // ~1000 chars per minute
      return estimatedReadTime >= filters.minReadTime && estimatedReadTime <= filters.maxReadTime;
    });

    // Sorting
    results.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'readTime':
          comparison = Math.ceil(a.content.length / 1000) - Math.ceil(b.content.length / 1000);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'relevance':
        default:
          // Simple relevance based on query matches
          if (filters.query) {
            const aMatches = (a.title + ' ' + a.content).toLowerCase().split(filters.query.toLowerCase()).length - 1;
            const bMatches = (b.title + ' ' + b.content).toLowerCase().split(filters.query.toLowerCase()).length - 1;
            comparison = bMatches - aMatches;
          } else {
            comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          break;
      }
      
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return results;
  }, [posts, filters]);

  // Update search results when filters change
  useEffect(() => {
    onSearchResults(searchResults);
  }, [searchResults, onSearchResults]);

  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      author: '',
      tags: [],
      dateFrom: '',
      dateTo: '',
      minReadTime: 0,
      maxReadTime: 60,
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Search className="h-5 w-5 text-cyan-400" />
          Busca Avançada
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar posts..."
            value={filters.query}
            onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
            className="pl-10 bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
          />
        </div>

        {/* Filters Toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="border-slate-600/50 text-gray-300 hover:bg-slate-700/50 hover:text-white"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <div className="text-sm text-gray-300">
            {searchResults.length} resultado(s) encontrado(s)
          </div>
        </div>

        {showFilters && (
          <div className="space-y-4 p-4 border border-slate-600/50 rounded-lg bg-slate-700/30">
            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2 text-white">
                <User className="h-4 w-4 text-gray-400" />
                Autor
              </label>
              <select
                value={filters.author}
                onChange={(e) => setFilters(prev => ({ ...prev, author: e.target.value }))}
                className="w-full p-2 border border-slate-600/50 rounded-md bg-slate-700/50 text-white focus:border-cyan-400 focus:ring-cyan-400/20"
              >
                <option value="">Todos os autores</option>
                {availableAuthors.map(author => (
                  <option key={author} value={author}>{author}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2 text-white">
                <Tag className="h-4 w-4 text-gray-400" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={tag}
                      checked={filters.tags.includes(tag)}
                      onCheckedChange={() => handleTagToggle(tag)}
                      className="border-slate-600/50 data-[state=checked]:bg-cyan-400 data-[state=checked]:border-cyan-400"
                    />
                    <label htmlFor={tag} className="text-sm text-gray-300">
                      {tag}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2 text-white">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  Data Inicial
                </label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="bg-slate-700/50 border-slate-600/50 text-white focus:border-cyan-400 focus:ring-cyan-400/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 text-white">Data Final</label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="bg-slate-700/50 border-slate-600/50 text-white focus:border-cyan-400 focus:ring-cyan-400/20"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2 text-white">
                <Clock className="h-4 w-4 text-gray-400" />
                Tempo de Leitura (minutos)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Mínimo"
                  value={filters.minReadTime}
                  onChange={(e) => setFilters(prev => ({ ...prev, minReadTime: parseInt(e.target.value) || 0 }))}
                  className="bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                />
                <Input
                  type="number"
                  placeholder="Máximo"
                  value={filters.maxReadTime}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxReadTime: parseInt(e.target.value) || 60 }))}
                  className="bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2 text-white">
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  Ordenar por
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                  className="w-full p-2 border border-slate-600/50 rounded-md bg-slate-700/50 text-white focus:border-cyan-400 focus:ring-cyan-400/20"
                >
                  <option value="relevance">Relevância</option>
                  <option value="date">Data</option>
                  <option value="readTime">Tempo de Leitura</option>
                  <option value="title">Título</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 text-white">Ordem</label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as any }))}
                  className="w-full p-2 border border-slate-600/50 rounded-md bg-slate-700/50 text-white focus:border-cyan-400 focus:ring-cyan-400/20"
                >
                  <option value="desc">Decrescente</option>
                  <option value="asc">Crescente</option>
                </select>
              </div>
            </div>

            <Button 
              variant="outline" 
              onClick={clearFilters} 
              className="w-full border-slate-600/50 text-gray-300 hover:bg-slate-700/50 hover:text-white"
            >
              Limpar Filtros
            </Button>
          </div>
        )}

        {(filters.author || filters.tags.length > 0 || filters.dateFrom || filters.dateTo) && (
          <div className="flex flex-wrap gap-2">
            {filters.author && (
              <Badge className="flex items-center gap-1 bg-slate-700/50 text-gray-300 border-slate-600/50">
                <User className="h-3 w-3" />
                {filters.author}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, author: '' }))}
                  className="ml-1 hover:text-red-400"
                >
                  ×
                </button>
              </Badge>
            )}
            {filters.tags.map(tag => (
              <Badge key={tag} className="flex items-center gap-1 bg-slate-700/50 text-gray-300 border-slate-600/50">
                <Tag className="h-3 w-3" />
                {tag}
                <button
                  onClick={() => handleTagToggle(tag)}
                  className="ml-1 hover:text-red-400"
                >
                  ×
                </button>
              </Badge>
            ))}
            {filters.dateFrom && (
              <Badge className="flex items-center gap-1 bg-slate-700/50 text-gray-300 border-slate-600/50">
                <Calendar className="h-3 w-3" />
                Desde {new Date(filters.dateFrom).toLocaleDateString()}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, dateFrom: '' }))}
                  className="ml-1 hover:text-red-400"
                >
                  ×
                </button>
              </Badge>
            )}
            {filters.dateTo && (
              <Badge className="flex items-center gap-1 bg-slate-700/50 text-gray-300 border-slate-600/50">
                <Calendar className="h-3 w-3" />
                Até {new Date(filters.dateTo).toLocaleDateString()}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, dateTo: '' }))}
                  className="ml-1 hover:text-red-400"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}