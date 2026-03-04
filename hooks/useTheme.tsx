'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // Initialize theme state by reading from localStorage or system preference
    // This ensures the initial render uses the correct theme without a flicker
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme') as Theme;
            if (savedTheme) {
                return savedTheme;
            }
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return 'light'; // Default theme if no preference is found or on SSR
    });

    // Effect to synchronize the 'dark' class on the document element
    // This runs once after initial mount and whenever the theme changes
    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        // Also, ensure localStorage is updated if the theme was just initialized
        // based on system preference and not yet saved.
        localStorage.setItem('theme', theme);
    }, [theme]); // Re-run effect when theme changes

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        // localStorage.setItem('theme', newTheme); // This is now handled by the useEffect
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
