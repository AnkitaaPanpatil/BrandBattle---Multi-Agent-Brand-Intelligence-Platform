import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'dark' | 'light';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper function to resolve 'system' theme preference using matchMedia
export const resolveTheme = (theme: Theme): 'dark' | 'light' => {
  if (theme === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  }
  return theme;
};

// Directly apply theme to DOM elements synchronously
export const applyThemeToDom = (themeToApply: 'dark' | 'light') => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const body = document.body;
  const mainWrapper = document.getElementById('main-app-wrapper') || document.querySelector('.main-app-wrapper');

  if (themeToApply === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    if (body) {
      body.classList.add('dark');
      body.classList.remove('light');
    }
    if (mainWrapper) {
      mainWrapper.classList.add('dark');
      mainWrapper.classList.remove('light');
    }
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    if (body) {
      body.classList.remove('dark');
      body.classList.add('light');
    }
    if (mainWrapper) {
      mainWrapper.classList.remove('dark');
      mainWrapper.classList.add('light');
    }
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read initial theme preference from localStorage ('dark', 'light', 'system')
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = (localStorage.getItem('theme') || localStorage.getItem('brandbattle_theme')) as Theme;
      if (stored && ['dark', 'light', 'system'].includes(stored)) {
        return stored;
      }
    }
    return 'dark'; // Default
  });

  const [actualTheme, setActualTheme] = useState<'dark' | 'light'>(() => {
    return resolveTheme(theme);
  });

  // Synchronously update theme, localStorage, and DOM
  const setTheme = useCallback((newTheme: Theme) => {
    // 1. Resolve effective theme ('dark' or 'light')
    const resolved = resolveTheme(newTheme);

    // 2. Persist to localStorage synchronously
    try {
      localStorage.setItem('theme', newTheme);
      localStorage.setItem('brandbattle_theme', newTheme);
    } catch (e) {
      console.warn('Could not save theme to localStorage:', e);
    }

    // 3. Immediately apply classes to root HTML, body, and main wrapper element
    applyThemeToDom(resolved);

    // 4. Update React state
    setThemeState(newTheme);
    setActualTheme(resolved);
  }, []);

  const toggleTheme = useCallback(() => {
    if (actualTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  }, [actualTheme, setTheme]);

  // Synchronize on mount and handle OS system color-scheme changes
  useEffect(() => {
    const currentActual = resolveTheme(theme);
    applyThemeToDom(currentActual);
    setActualTheme(currentActual);

    // Listen to OS system color scheme changes if system mode is active
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
        if (theme === 'system') {
          const systemTheme = e.matches ? 'dark' : 'light';
          applyThemeToDom(systemTheme);
          setActualTheme(systemTheme);
        }
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleMediaChange);
        return () => mediaQuery.removeEventListener('change', handleMediaChange);
      } else if ('addListener' in mediaQuery) {
        // Fallback for older browsers
        (mediaQuery as any).addListener(handleMediaChange);
        return () => (mediaQuery as any).removeListener(handleMediaChange);
      }
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};


