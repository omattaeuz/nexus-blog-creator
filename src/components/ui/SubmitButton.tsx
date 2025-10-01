import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubmitButtonProps {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}

/**
 * Reusable submit button component with loading state
 * Provides consistent submit button behavior across forms
 */
export const SubmitButton: React.FC<SubmitButtonProps> = ({
  isLoading,
  loadingText = "Processando...",
  children,
  icon,
  disabled = false,
  className,
  variant = "default",
  size = "default",
  type = "submit",
  onClick,
}) => {
  return (
    <Button
      type={type}
      disabled={isLoading || disabled}
      className={cn(
        "w-full transition-all duration-300",
        variant === "default" && "bg-gradient-primary hover:bg-primary-hover shadow-glow",
        className
      )}
      variant={variant}
      size={size}
      onClick={onClick}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </Button>
  );
};