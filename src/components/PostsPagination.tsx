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
 * Minimalist pagination component for posts
 * Features:
 * - Only arrow icons for navigation
 * - Dot indicators for pages (max 5 dots)
 * - No text, no borders
 * - Clean and minimal interface
 */
export const PostsPagination: React.FC<PostsPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  
  // Don't render if there are no pages
  if (totalPages < 1) return null;

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) onPageChange(page);
  };

  // Generate page dots to show (max 5 dots)
  const getPageDots = () => {
    const dots: number[] = [];
    const maxVisible = 5; // Show max 5 dots
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        dots.push(i);
      }
    } else {
      // Show dots around current page
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);
      
      // Adjust if we're near the beginning or end
      if (currentPage <= 3) end = Math.min(totalPages, 5);
      if (currentPage > totalPages - 3) start = Math.max(1, totalPages - 4);
      
      for (let i = start; i <= end; i++) {
        dots.push(i);
      }
    }
    
    return dots;
  };

  const pageDots = getPageDots();

  return (
    <div className={cn("flex items-center justify-center gap-3", className)}>
      {/* Previous button - only icon */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page dots */}
      <div className="flex items-center gap-1.5">
        {pageDots.map((page) => (
          <button
            key={page}
            onClick={() => handlePageClick(page)}
            className={cn(
              "h-2 w-2 rounded-full transition-all duration-200",
              page === currentPage 
                ? "bg-foreground scale-125" 
                : "bg-muted-foreground/30"
            )}
            aria-label={`Ir para página ${page}`}
          />
        ))}
      </div>

      {/* Next button - only icon */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PostsPagination;