import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "card" | "minimal";
}

const LoadingSpinner = ({ 
  message = "Loading...", 
  size = "md",
  variant = "card" 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      {message && (
        <p className="text-muted-foreground text-center">{message}</p>
      )}
    </div>
  );

  if (variant === "minimal") return spinner;

  return (
    <Card className="bg-gradient-surface shadow-md">
      <CardContent className="p-12">
        {spinner}
      </CardContent>
    </Card>
  );
};

export default LoadingSpinner;