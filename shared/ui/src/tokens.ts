import { platformUtils } from './platform';

// Shared design tokens that work across platforms
export const colors = {
  // Primary brand colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    900: '#1e3a8a',
  },

  // Semantic colors
  success: {
    light: '#10b981',
    main: '#059669',
    dark: '#047857',
  },

  error: {
    light: '#ef4444',
    main: '#dc2626',
    dark: '#b91c1c',
  },

  warning: {
    light: '#f59e0b',
    main: '#d97706',
    dark: '#b45309',
  },

  // Neutral grays
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Background colors
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
  }
};

// Typography scales that work across platforms
export const typography = {
  // Font families
  fonts: platformUtils.select({
    web: {
      sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, monospace',
    },
    ios: {
      sans: 'SF Pro Display',
      mono: 'SF Mono',
    },
    android: {
      sans: 'Roboto',
      mono: 'Roboto Mono',
    },
    default: {
      sans: 'System',
      mono: 'monospace',
    }
  }),

  // Font sizes (in platform-appropriate units)
  sizes: {
    xs: platformUtils.select({ web: '12px', mobile: 12, default: 12 }),
    sm: platformUtils.select({ web: '14px', mobile: 14, default: 14 }),
    base: platformUtils.select({ web: '16px', mobile: 16, default: 16 }),
    lg: platformUtils.select({ web: '18px', mobile: 18, default: 18 }),
    xl: platformUtils.select({ web: '20px', mobile: 20, default: 20 }),
    '2xl': platformUtils.select({ web: '24px', mobile: 24, default: 24 }),
    '3xl': platformUtils.select({ web: '30px', mobile: 30, default: 30 }),
    '4xl': platformUtils.select({ web: '36px', mobile: 36, default: 36 }),
  },

  // Font weights
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Line heights
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  }
};

// Spacing scale (works for both margin/padding and layout)
export const spacing = {
  0: platformUtils.select({ web: '0px', mobile: 0, default: 0 }),
  1: platformUtils.select({ web: '4px', mobile: 4, default: 4 }),
  2: platformUtils.select({ web: '8px', mobile: 8, default: 8 }),
  3: platformUtils.select({ web: '12px', mobile: 12, default: 12 }),
  4: platformUtils.select({ web: '16px', mobile: 16, default: 16 }),
  5: platformUtils.select({ web: '20px', mobile: 20, default: 20 }),
  6: platformUtils.select({ web: '24px', mobile: 24, default: 24 }),
  8: platformUtils.select({ web: '32px', mobile: 32, default: 32 }),
  10: platformUtils.select({ web: '40px', mobile: 40, default: 40 }),
  12: platformUtils.select({ web: '48px', mobile: 48, default: 48 }),
  16: platformUtils.select({ web: '64px', mobile: 64, default: 64 }),
  20: platformUtils.select({ web: '80px', mobile: 80, default: 80 }),
};

// Border radius scale
export const borderRadius = {
  none: platformUtils.select({ web: '0px', mobile: 0, default: 0 }),
  sm: platformUtils.select({ web: '2px', mobile: 2, default: 2 }),
  base: platformUtils.select({ web: '6px', mobile: 6, default: 6 }),
  md: platformUtils.select({ web: '8px', mobile: 8, default: 8 }),
  lg: platformUtils.select({ web: '12px', mobile: 12, default: 12 }),
  xl: platformUtils.select({ web: '16px', mobile: 16, default: 16 }),
  full: platformUtils.select({ web: '9999px', mobile: 9999, default: 9999 }),
};

// Shadow/elevation styles
export const shadows = platformUtils.select({
  web: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  mobile: {
    sm: { elevation: 2, shadowOpacity: 0.1, shadowRadius: 2 },
    base: { elevation: 4, shadowOpacity: 0.12, shadowRadius: 4 },
    md: { elevation: 6, shadowOpacity: 0.16, shadowRadius: 6 },
    lg: { elevation: 8, shadowOpacity: 0.19, shadowRadius: 8 },
    xl: { elevation: 12, shadowOpacity: 0.25, shadowRadius: 12 },
  },
  default: {}
});
