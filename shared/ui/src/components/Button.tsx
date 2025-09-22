import React from 'react';
import { platformUtils, isWeb } from '../platform';
import { colors, spacing, borderRadius, typography, shadows } from '../tokens';

// Cross-platform button component
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onPress?: () => void;
  style?: any; // Platform-specific styles
  className?: string; // Web-specific
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  onPress,
  style,
  className = '',
}) => {
  // Base styles that work across platforms
  const baseStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    borderWidth: platformUtils.select<string | number>({ web: '1px', mobile: 1, default: 1 }),
    fontFamily: typography.fonts.sans,
    fontWeight: typography.weights.medium,
    opacity: disabled || loading ? 0.6 : 1,
  };

  // Size-specific styles
  const sizeStyles = {
    sm: {
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
      fontSize: typography.sizes.sm,
    },
    md: {
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
      fontSize: typography.sizes.base,
    },
    lg: {
      paddingHorizontal: spacing[6],
      paddingVertical: spacing[4],
      fontSize: typography.sizes.lg,
    },
  };

  // Variant-specific styles
  const variantStyles = {
    primary: {
      backgroundColor: colors.primary[500],
      borderColor: colors.primary[500],
      color: 'white',
    },
    secondary: {
      backgroundColor: colors.gray[100],
      borderColor: colors.gray[200],
      color: colors.gray[900],
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: colors.primary[500],
      color: colors.primary[500],
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      color: colors.primary[500],
    },
  };

  const combinedStyle = {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  if (isWeb) {
    return (
      <button
        className={`ppl-button ${className}`}
        style={{
          ...combinedStyle,
          border: `${combinedStyle.borderWidth} solid ${combinedStyle.borderColor}`,
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease-in-out',
          ...(shadows.sm as any),
        }}
        onClick={onPress}
        disabled={disabled || loading}
      >
        {loading ? '...' : children}
      </button>
    );
  }

  // Mobile (React Native) implementation
  const { TouchableOpacity, Text } = require('react-native');

  return (
    <TouchableOpacity
      style={[combinedStyle, shadows.sm as any, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <Text style={{ color: combinedStyle.color, fontSize: combinedStyle.fontSize }}>
        {loading ? '...' : children}
      </Text>
    </TouchableOpacity>
  );
};
