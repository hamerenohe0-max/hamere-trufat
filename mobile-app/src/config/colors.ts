/**
 * Color theme based on Hamere Tirufat logo
 * Primary: Dark green (from column, birds, and Ge'ez text)
 * Secondary: Warm brown (from the open book)
 */

export const colors = {
  // Primary colors (Dark Green from logo)
  primary: {
    main: '#1e6b47',      // Main dark green
    light: '#2d8a5f',     // Lighter shade
    dark: '#155a37',      // Darker shade
    lighter: '#4a9d73',   // Even lighter for backgrounds
    darkest: '#0f4a2a',   // Darkest shade
  },

  // Secondary colors (Warm Brown from logo)
  secondary: {
    main: '#8b6f47',      // Main warm brown
    light: '#a67c52',     // Lighter shade
    dark: '#6b5635',      // Darker shade
    lighter: '#c49a6b',   // Even lighter for backgrounds
  },

  // Neutral colors
  neutral: {
    white: '#ffffff',
    black: '#000000',
    gray: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },

  // Semantic colors
  success: '#1e6b47',
  error: '#dc2626',
  warning: '#d97706',
  info: '#2563eb',

  // Background colors
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
  },

  // Text colors
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    tertiary: '#64748b',
    disabled: '#94a3b8',
    inverse: '#ffffff',
  },

  // Border colors
  border: {
    light: '#e2e8f0',
    medium: '#cbd5e1',
    dark: '#94a3b8',
  },
} as const;

// Export commonly used colors for convenience
export const primary = colors.primary.main;
export const secondary = colors.secondary.main;
export const background = colors.background.primary;
export const text = colors.text.primary;

