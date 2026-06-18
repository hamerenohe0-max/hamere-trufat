/**
 * Color theme based on Hamere Tirufat logo
 * Primary: Dark green (from column, birds, and Ge'ez text)
 * Secondary: Warm brown (from the open book)
 */


export const colors = {
  // Brand colors (User defined)
  primary: {
    main: '#14381B',      // Deep Green
    light: '#1f572a',     // Lighter shade
    dark: '#0a1f0e',      // Darker shade
    lighter: '#2d7a3c',   // Even lighter for backgrounds
    darkest: '#051107',   // Darkest shade
  },

  // Secondary colors (Brown/Bronze)
  secondary: {
    main: '#9D6531',      // Warm Brown
    light: '#b57d4a',     // Lighter shade
    dark: '#7a4e25',      // Darker shade
    lighter: '#cca37a',   // Even lighter for backgrounds
  },

  light: {
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#64748b',
      disabled: '#94a3b8',
      inverse: '#ffffff',
    },
    border: {
      subtle: '#e2e8f0',
      light: '#e2e8f0',
      medium: '#cbd5e1',
      dark: '#94a3b8',
    },
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
    }
  },

  dark: {
    background: {
      primary: '#0f172a',   // Dark Slate (Main Background)
      secondary: '#1e293b', // Slightly Lighter Slate (Cards/Surfaces)
      tertiary: '#334155',  // Even Lighter Slate (Elevated Surfaces)
    },
    text: {
      primary: '#FFFFFF',   // White (High Contrast)
      secondary: '#E2E8F0', // Off-white/Light Gray (Subtitles)
      tertiary: '#94A3B8',  // Muted Gray
      disabled: '#64748B',  // Disabled Text
      inverse: '#0f172a',   // Dark Slate for inverse backgrounds
    },
    border: {
      subtle: '#1e293b',    // Subtle Border
      light: '#334155',     // Light Border
      medium: '#475569',    // Medium Border
      dark: '#64748B',      // Dark Border
    },
    neutral: {
      white: '#FFFFFF',
      black: '#000000',
      gray: {
        50: '#0f172a',
        100: '#1e293b',
        200: '#334155',
        300: '#475569',
        400: '#64748B',
        500: '#94a3B8',
        600: '#cbd5e1',
        700: '#e2e8f0',
        800: '#f1f5f9',
        900: '#ffffff',
      },
    }
  },

  // Semantic (Shared)
  success: '#1e6b47',
  error: '#dc2626',
  warning: '#d97706',
  info: '#2563eb',

  // Backward compatibility - defaults to light theme
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
  },
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    tertiary: '#64748b',
    disabled: '#94a3b8',
    inverse: '#ffffff',
  },
  border: {
    light: '#e2e8f0',
    medium: '#cbd5e1',
    dark: '#94a3b8',
  },
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
} as const;

// Legacy exports for backward compatibility - will be defaults (light)
export const primary = colors.primary.main;
export const secondary = colors.secondary.main;
export const background = colors.light.background;
export const text = colors.light.text;
export const border = colors.light.border;
export const neutral = colors.light.neutral;

