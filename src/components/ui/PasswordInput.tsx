import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showPassword: boolean;
  onToggleVisibility: () => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  minLength?: number;
  className?: string;
}

/**
 * Reusable password input component with visibility toggle
 * Provides consistent password input behavior across forms
 */
export const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = "Digite sua senha...",
  showPassword,
  onToggleVisibility,
  error,
  disabled = false,
  required = false,
  minLength,
  className,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-gray-300 font-medium">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "pr-10 bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 transition-all duration-300",
            error 
              ? "border-red-400 focus:ring-red-400/20" 
              : ""
          )}
          disabled={disabled}
          required={required}
          minLength={minLength}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-300"
          onClick={onToggleVisibility}
          disabled={disabled}
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
};
