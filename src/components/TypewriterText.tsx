import React from 'react';
import { useTypewriter } from '@/hooks/useTypewriter';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  loop?: boolean;
  pauseTime?: number;
  className?: string;
  showCursor?: boolean;
  cursorChar?: string;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 100,
  delay = 0,
  loop = false,
  pauseTime = 2000,
  className = '',
  showCursor = true,
  cursorChar = '|'
}) => {
  const displayText = useTypewriter({
    text,
    speed,
    delay,
    loop,
    pauseTime
  });

  return (
    <span className={className}>
      {displayText}
      {showCursor && (
        <span className="text-primary animate-pulse">
          {cursorChar}
        </span>
      )}
    </span>
  );
};

export default TypewriterText;