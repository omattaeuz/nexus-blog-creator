import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Sun, 
  Moon, 
  Monitor,
  Palette
} from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get theme from localStorage or default to system
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Monitor className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1 border rounded-lg p-1">
      <Button
        variant={theme === 'light' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleThemeChange('light')}
        className="h-8 w-8 p-0"
        title="Tema claro"
      >
        <Sun className="h-4 w-4" />
      </Button>
      
      <Button
        variant={theme === 'dark' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleThemeChange('dark')}
        className="h-8 w-8 p-0"
        title="Tema escuro"
      >
        <Moon className="h-4 w-4" />
      </Button>
      
      <Button
        variant={theme === 'system' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleThemeChange('system')}
        className="h-8 w-8 p-0"
        title="Seguir sistema"
      >
        <Monitor className="h-4 w-4" />
      </Button>
    </div>
  );
}