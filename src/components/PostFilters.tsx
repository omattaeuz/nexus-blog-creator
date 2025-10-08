import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Filter, X, RotateCcw } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface FilterOptions {
  sortBy: 'created_at' | 'title' | 'updated_at';
  sortOrder: 'asc' | 'desc';
  dateFrom?: Date;
  dateTo?: Date;
  itemsPerPage: number;
}

interface PostFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  totalPosts: number;
  loading?: boolean;
}

const PostFilters = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters, 
  totalPosts,
  loading = false 
}: PostFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSortByChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sortBy: value as FilterOptions['sortBy']
    });
  };

  const handleSortOrderChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sortOrder: value as FilterOptions['sortOrder']
    });
  };

  const handleDateFromChange = (date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      dateFrom: date
    });
  };

  const handleDateToChange = (date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      dateTo: date
    });
  };

  const handleItemsPerPageChange = (value: string) => {
    onFiltersChange({
      ...filters,
      itemsPerPage: parseInt(value)
    });
  };

  const hasActiveFilters = filters.dateFrom || filters.dateTo || 
    filters.sortBy !== 'created_at' || filters.sortOrder !== 'desc' || 
    filters.itemsPerPage !== 6;

  const getSortByLabel = (sortBy: string) => {
    switch (sortBy) {
      case 'created_at': return 'Data de Criação';
      case 'title': return 'Título';
      case 'updated_at': return 'Data de Atualização';
      default: return 'Data de Criação';
    }
  };

  const getSortOrderLabel = (sortOrder: string) => {
    return sortOrder === 'asc' ? 'Crescente' : 'Decrescente';
  };

  return (
    <Card className="bg-gradient-surface shadow-md border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filtros
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                Filtros ativos
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              disabled={!hasActiveFilters || loading}
              className="h-8 px-2"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sortBy" className="text-sm font-medium">
              Ordenar por
            </Label>
            <Select value={filters.sortBy} onValueChange={handleSortByChange} disabled={loading}>
              <SelectTrigger id="sortBy" className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Data de Criação</SelectItem>
                <SelectItem value="title">Título</SelectItem>
                <SelectItem value="updated_at">Data de Atualização</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortOrder" className="text-sm font-medium">
              Ordem
            </Label>
            <Select value={filters.sortOrder} onValueChange={handleSortOrderChange} disabled={loading}>
              <SelectTrigger id="sortOrder" className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Decrescente</SelectItem>
                <SelectItem value="asc">Crescente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Data inicial</Label>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-9 justify-start text-left font-normal"
                  disabled={loading}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {filters.dateFrom ? (
                    format(filters.dateFrom, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    <span className="text-muted-foreground">Selecionar data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={filters.dateFrom}
                  onSelect={handleDateFromChange}
                  disabled={(date) => 
                    date > new Date() || 
                    (filters.dateTo && date > filters.dateTo)
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Data final</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-9 justify-start text-left font-normal"
                  disabled={loading}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {filters.dateTo ? (
                    format(filters.dateTo, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    <span className="text-muted-foreground">Selecionar data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={filters.dateTo}
                  onSelect={handleDateToChange}
                  disabled={(date) => 
                    date > new Date() || 
                    (filters.dateFrom && date < filters.dateFrom)
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Label htmlFor="itemsPerPage" className="text-sm font-medium">
                Posts por página
              </Label>
              <Select 
                value={filters.itemsPerPage.toString()} 
                onValueChange={handleItemsPerPageChange}
                disabled={loading}
              >
                <SelectTrigger id="itemsPerPage" className="w-24 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="48">48</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                Total: <span className="font-medium text-foreground">{totalPosts}</span> posts
              </p>
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Filtros ativos:</span>
              <Badge variant="outline" className="text-xs">
                {getSortByLabel(filters.sortBy)} ({getSortOrderLabel(filters.sortOrder)})
              </Badge>
              {filters.dateFrom && (
                <Badge variant="outline" className="text-xs">
                  De: {format(filters.dateFrom, "dd/MM/yyyy", { locale: ptBR })}
                </Badge>
              )}
              {filters.dateTo && (
                <Badge variant="outline" className="text-xs">
                  Até: {format(filters.dateTo, "dd/MM/yyyy", { locale: ptBR })}
                </Badge>
              )}
              {filters.itemsPerPage !== 6 && (
                <Badge variant="outline" className="text-xs">
                  {filters.itemsPerPage} por página
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostFilters;