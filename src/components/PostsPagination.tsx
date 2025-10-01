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

/**
 * Simple pagination component for posts
 * Features:
 * - Previous/Next navigation
 * - Page numbers with current page highlight
 * - Responsive design
 * - Clean and minimal interface
 */
export const PostsPagination: React.FC<PostsPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  // Debug logs
  console.log('PostsPagination props:', { currentPage, totalPages });
  
  // Don't render if there are no pages
  if (totalPages < 1) return null;

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5; // Show max 5 page numbers
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);
      
      // Adjust if we're near the beginning or end
      if (currentPage <= 3) {
        end = Math.min(totalPages, 5);
      }
      if (currentPage > totalPages - 3) {
        start = Math.max(1, totalPages - 4);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Anterior</span>
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "ghost"}
            size="sm"
            onClick={() => handlePageClick(page)}
            className={cn(
              "min-w-[2.5rem] h-9",
              page === currentPage && "bg-gradient-primary hover:bg-primary-hover shadow-glow"
            )}
          >
            {page}
          </Button>
        ))}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1"
      >
        <span className="hidden sm:inline">Próximo</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PostsPagination;
