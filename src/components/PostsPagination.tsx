import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PostsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const PostsPagination: React.FC<PostsPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  
  if (totalPages < 1) return null;

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) onPageChange(page);
  };

  const getPageDots = () => {
    const dots: number[] = [];
    const maxVisible = 5; // Show max 5 dots
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) { dots.push(i); }
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);
      
      if (currentPage <= 3) end = Math.min(totalPages, 5);
      if (currentPage > totalPages - 3) start = Math.max(1, totalPages - 4);
      
      for (let i = start; i <= end; i++) { dots.push(i); }
    }
    
    return dots;
  };

  const pageDots = getPageDots();

  return (
    <div className={cn("flex items-center justify-center gap-3", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-slate-700/50 disabled:text-gray-600 disabled:hover:bg-transparent"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1.5">
        {pageDots.map((page) => (
          <button
            key={page}
            onClick={() => handlePageClick(page)}
            className={cn(
              "h-2 w-2 rounded-full transition-all duration-200",
              page === currentPage 
                ? "bg-cyan-400 scale-125 shadow-lg shadow-cyan-400/50" 
                : "bg-gray-600/50 hover:bg-gray-500/70"
            )}
            aria-label={`Ir para página ${page}`}
          />
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-slate-700/50 disabled:text-gray-600 disabled:hover:bg-transparent"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PostsPagination;