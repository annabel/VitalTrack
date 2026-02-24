import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

const VALID_THEMES: Theme[] = ['light', 'dark', 'system'];

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem('vt-theme');
    if (stored && VALID_THEMES.includes(stored as Theme)) return stored as Theme;
  } catch { /* storage unavailable */ }
  return 'system';
}

export function useDarkMode() {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);

  const [systemDark, setSystemDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  const isDark = theme === 'dark' || (theme === 'system' && systemDark);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    try {
      if (t === 'system') localStorage.removeItem('vt-theme');
      else localStorage.setItem('vt-theme', t);
    } catch { /* storage unavailable */ }
  };

  // Cycle through system → dark → light → system
  const cycleTheme = () => {
    const next: Record<Theme, Theme> = { system: 'dark', dark: 'light', light: 'system' };
    setTheme(next[theme]);
  };

  // Apply / remove the `dark` class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Track system preference changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return { isDark, theme, setTheme, cycleTheme };
}
