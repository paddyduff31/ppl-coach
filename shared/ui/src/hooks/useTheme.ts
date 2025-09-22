import { useMemo } from 'react';
import { colors, typography, spacing, borderRadius, shadows } from '../tokens';

export interface Theme {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  isDark: boolean;
}

export const useTheme = (isDark: boolean = false): Theme => {
  return useMemo(() => {
    const theme = {
      colors: isDark ? {
        ...colors,
        // Dark theme overrides
        background: {
          primary: colors.gray[900],
          secondary: colors.gray[800],
          tertiary: colors.gray[700],
        },
        gray: {
          ...colors.gray,
          900: colors.gray[50], // Invert text colors
          800: colors.gray[100],
          700: colors.gray[200],
          // ... etc
        }
      } : colors,
      typography,
      spacing,
      borderRadius,
      shadows,
      isDark,
    };

    return theme;
  }, [isDark]);
};
