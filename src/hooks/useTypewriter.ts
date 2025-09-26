import { useState, useEffect } from 'react';

interface UseTypewriterOptions {
  text: string;
  speed?: number;
  delay?: number;
  loop?: boolean;
  pauseTime?: number;
}

export const useTypewriter = ({
  text,
  speed = 100,
  delay = 0,
  loop = false,
  pauseTime = 2000
}: UseTypewriterOptions) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    // Handle initial delay
    if (!isStarted) {
      const startTimer = setTimeout(() => {
        setIsStarted(true);
      }, delay);
      return () => clearTimeout(startTimer);
    }

    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing phase
        if (currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1));
          setCurrentIndex(currentIndex + 1);
        } else {
          // Finished typing, start deleting if loop is enabled
          if (loop) {
            const pauseTimer = setTimeout(() => {
              setIsDeleting(true);
            }, pauseTime);
            return () => clearTimeout(pauseTimer);
          }
        }
      } else {
        // Deleting phase
        if (currentIndex > 0) {
          setDisplayText(text.slice(0, currentIndex - 1));
          setCurrentIndex(currentIndex - 1);
        } else {
          // Finished deleting, start typing again
          setIsDeleting(false);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [currentIndex, isDeleting, isStarted, text, speed, delay, loop, pauseTime]);

  return displayText;
};
