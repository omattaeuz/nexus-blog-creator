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
    if (!isStarted) {
      const startTimer = setTimeout(() => {
        setIsStarted(true);
      }, delay);
      return () => clearTimeout(startTimer);
    }

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1));
          setCurrentIndex(currentIndex + 1);
        } else {
          if (loop) {
            const pauseTimer = setTimeout(() => {
              setIsDeleting(true);
            }, pauseTime);
            return () => clearTimeout(pauseTimer);
          }
        }
      } else {
        if (currentIndex > 0) {
          setDisplayText(text.slice(0, currentIndex - 1));
          setCurrentIndex(currentIndex - 1);
        } else {
          setIsDeleting(false);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [currentIndex, isDeleting, isStarted, text, speed, delay, loop, pauseTime]);

  return displayText;
};