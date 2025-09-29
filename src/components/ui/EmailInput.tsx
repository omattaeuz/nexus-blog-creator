import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface EmailInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

/**
 * Reusable email input component with validation styling
 * Provides consistent email input behavior across forms
 */
export const EmailInput: React.FC<EmailInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = "Digite seu email...",
  error,
  disabled = false,
  required = false,
  className,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-foreground font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={id}
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "transition-all duration-300",
          error 
            ? "border-destructive focus:ring-destructive" 
            : "focus:ring-primary"
        )}
        disabled={disabled}
        required={required}
        autoComplete="email"
      />
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
    </div>
  );
};
