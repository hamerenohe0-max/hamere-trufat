import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { usePreferencesStore } from '../store/usePreferencesStore';
import { colors } from '../config/colors';

interface ColorScheme {
    background: {
        primary: string;
        secondary: string;
        tertiary: string;
    };
    text: {
        primary: string;
        secondary: string;
        tertiary: string;
        disabled: string;
        inverse: string;
    };
    border: {
        light: string;
        medium: string;
        dark: string;
    };
}

interface ThemeContextType {
    theme: 'light' | 'dark';
    colors: any;
    fontScale: number;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const systemColorScheme = useColorScheme();
    const { theme: prefTheme, fontScale } = usePreferencesStore();

    const activeTheme = useMemo(() => {
        if (prefTheme === 'system') {
            return systemColorScheme === 'dark' ? 'dark' : 'light';
        }
        return prefTheme;
    }, [prefTheme, systemColorScheme]);

    const value = useMemo(() => {
        const themeColors = activeTheme === 'dark' ? colors.dark : colors.light;
        return {
            theme: activeTheme as 'light' | 'dark',
            colors: { ...colors, ...themeColors },
            fontScale,
            isDark: activeTheme === 'dark',
        };
    }, [activeTheme, fontScale]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
