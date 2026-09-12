import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (event?: React.MouseEvent | MouseEvent) => void;
  setTheme: (theme: Theme, event?: React.MouseEvent | MouseEvent) => void;
}

const THEME_STORAGE_KEY = 'adept_theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const triggerTransition = (newTheme: Theme) => {
    if (typeof window === 'undefined') {
      setThemeState(newTheme);
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // View Transitions API with gentle, soft cross-fade morph (Emil Kowalski / Linear standard)
    if (!prefersReducedMotion && typeof (document as any).startViewTransition === 'function') {
      (document as any).startViewTransition(() => {
        setThemeState(newTheme);
      });
      return;
    }

    // Universal Fallback (for older browsers or devices without View Transitions / GPU)
    const root = document.documentElement;
    root.classList.add('theme-transitioning');
    window.clearTimeout((window as any)._themeTransitionTimeout);
    (window as any)._themeTransitionTimeout = window.setTimeout(() => {
      root.classList.remove('theme-transitioning');
    }, 300);

    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    triggerTransition(theme === 'dark' ? 'light' : 'dark');
  };

  const setTheme = (newTheme: Theme) => {
    triggerTransition(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
