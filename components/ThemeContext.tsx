import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('sentinel-theme');
      if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark'; // Default for SSR or non-browser env
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const darkHljs = document.getElementById('hljs-dark-theme') as HTMLLinkElement | null;
    const lightHljs = document.getElementById('hljs-light-theme') as HTMLLinkElement | null;

    if (theme === 'dark') {
      root.classList.add('dark');
      if (darkHljs) darkHljs.disabled = false;
      if (lightHljs) lightHljs.disabled = true;
    } else {
      root.classList.remove('dark');
      if (darkHljs) darkHljs.disabled = true;
      if (lightHljs) lightHljs.disabled = false;
    }
    localStorage.setItem('sentinel-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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