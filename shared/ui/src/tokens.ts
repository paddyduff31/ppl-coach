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
    xs: platformUtils.select<string | number>({ web: '12px', mobile: 12, default: '12px' }),
    sm: platformUtils.select<string | number>({ web: '14px', mobile: 14, default: '14px' }),
    base: platformUtils.select<string | number>({ web: '16px', mobile: 16, default: '16px' }),
    lg: platformUtils.select<string | number>({ web: '18px', mobile: 18, default: '18px' }),
    xl: platformUtils.select<string | number>({ web: '20px', mobile: 20, default: '20px' }),
    '2xl': platformUtils.select<string | number>({ web: '24px', mobile: 24, default: '24px' }),
    '3xl': platformUtils.select<string | number>({ web: '30px', mobile: 30, default: '30px' }),
    '4xl': platformUtils.select<string | number>({ web: '36px', mobile: 36, default: '36px' }),
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
  0: platformUtils.select<string | number>({ web: '0px', mobile: 0, default: '0px' }),
  1: platformUtils.select<string | number>({ web: '4px', mobile: 4, default: '4px' }),
  2: platformUtils.select<string | number>({ web: '8px', mobile: 8, default: '8px' }),
  3: platformUtils.select<string | number>({ web: '12px', mobile: 12, default: '12px' }),
  4: platformUtils.select<string | number>({ web: '16px', mobile: 16, default: '16px' }),
  5: platformUtils.select<string | number>({ web: '20px', mobile: 20, default: '20px' }),
  6: platformUtils.select<string | number>({ web: '24px', mobile: 24, default: '24px' }),
  8: platformUtils.select<string | number>({ web: '32px', mobile: 32, default: '32px' }),
  10: platformUtils.select<string | number>({ web: '40px', mobile: 40, default: '40px' }),
  12: platformUtils.select<string | number>({ web: '48px', mobile: 48, default: '48px' }),
  16: platformUtils.select<string | number>({ web: '64px', mobile: 64, default: '64px' }),
  20: platformUtils.select<string | number>({ web: '80px', mobile: 80, default: '80px' }),
};

// Border radius scale
export const borderRadius = {
  none: platformUtils.select<string | number>({ web: '0px', mobile: 0, default: '0px' }),
  sm: platformUtils.select<string | number>({ web: '2px', mobile: 2, default: '2px' }),
  base: platformUtils.select<string | number>({ web: '6px', mobile: 6, default: '6px' }),
  md: platformUtils.select<string | number>({ web: '8px', mobile: 8, default: '8px' }),
  lg: platformUtils.select<string | number>({ web: '12px', mobile: 12, default: '12px' }),
  xl: platformUtils.select<string | number>({ web: '16px', mobile: 16, default: '16px' }),
  full: platformUtils.select<string | number>({ web: '9999px', mobile: 9999, default: '9999px' }),
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
