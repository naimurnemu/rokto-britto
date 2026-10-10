'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Laptop } from 'lucide-react';
import { Button } from './ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl border border-border bg-card/50 flex items-center justify-center opacity-60">
        <Sun className="w-4 h-4 text-muted-foreground animate-spin" />
      </div>
    );
  }

  const nextMode = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl border border-border bg-card/60 backdrop-blur-sm shadow-sm">
      <button
        type="button"
        onClick={() => setTheme('light')}
        title="Light Mode"
        className={`p-1.5 rounded-lg text-xs transition-all flex items-center justify-center ${
          theme === 'light'
            ? 'bg-primary text-primary-foreground shadow-sm shadow-rose-900/20'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        title="Dark Mode"
        className={`p-1.5 rounded-lg text-xs transition-all flex items-center justify-center ${
          theme === 'dark'
            ? 'bg-primary text-primary-foreground shadow-sm shadow-rose-900/20'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => setTheme('system')}
        title="System Preference"
        className={`p-1.5 rounded-lg text-xs transition-all flex items-center justify-center ${
          theme === 'system'
            ? 'bg-primary text-primary-foreground shadow-sm shadow-rose-900/20'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        }`}
      >
        <Laptop className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
