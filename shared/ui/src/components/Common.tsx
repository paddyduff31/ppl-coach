import React from 'react';
import { platformUtils, isWeb } from './platform';
import { colors, spacing, borderRadius, typography, shadows } from './tokens';

// Cross-platform card component
export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: keyof typeof spacing;
  style?: any;
  className?: string;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 4,
  style,
  className = '',
  onPress,
}) => {
  const baseStyle = {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.primary,
    padding: spacing[padding],
  };

  const variantStyles = {
    default: {
      backgroundColor: colors.background.primary,
    },
    outlined: {
      backgroundColor: colors.background.primary,
      borderWidth: platformUtils.select({ web: '1px', mobile: 1, default: 1 }),
      borderColor: colors.gray[200],
    },
    elevated: {
      backgroundColor: colors.background.primary,
      ...shadows.md,
    },
  };

  const combinedStyle = {
    ...baseStyle,
    ...variantStyles[variant],
    ...style,
  };

  if (isWeb) {
    const Component = onPress ? 'button' : 'div';
    return (
      <Component
        className={`ppl-card ${className}`}
        style={{
          ...combinedStyle,
          border: combinedStyle.borderWidth ? `${combinedStyle.borderWidth} solid ${combinedStyle.borderColor}` : 'none',
          cursor: onPress ? 'pointer' : 'default',
        }}
        onClick={onPress}
      >
        {children}
      </Component>
    );
  }

  // Mobile (React Native) implementation
  const { View, TouchableOpacity } = require('react-native');

  if (onPress) {
    return (
      <TouchableOpacity style={[combinedStyle, style]} onPress={onPress} activeOpacity={0.95}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[combinedStyle, style]}>
      {children}
    </View>
  );
};

// Cross-platform text component
export interface TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'overline';
  color?: string;
  weight?: keyof typeof typography.weights;
  align?: 'left' | 'center' | 'right';
  style?: any;
  className?: string;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  color = colors.gray[900],
  weight = 'normal',
  align = 'left',
  style,
  className = '',
}) => {
  const variantStyles = {
    h1: {
      fontSize: typography.sizes['4xl'],
      fontWeight: typography.weights.bold,
      lineHeight: typography.lineHeights.tight,
    },
    h2: {
      fontSize: typography.sizes['3xl'],
      fontWeight: typography.weights.bold,
      lineHeight: typography.lineHeights.tight,
    },
    h3: {
      fontSize: typography.sizes['2xl'],
      fontWeight: typography.weights.semibold,
      lineHeight: typography.lineHeights.normal,
    },
    h4: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.semibold,
      lineHeight: typography.lineHeights.normal,
    },
    body: {
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.normal,
      lineHeight: typography.lineHeights.normal,
    },
    caption: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.normal,
      lineHeight: typography.lineHeights.normal,
    },
    overline: {
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.medium,
      textTransform: 'uppercase',
      letterSpacing: platformUtils.select({ web: '0.05em', mobile: 0.5, default: 0.5 }),
    },
  };

  const combinedStyle = {
    fontFamily: typography.fonts.sans,
    color,
    fontWeight: typography.weights[weight],
    textAlign: align,
    ...variantStyles[variant],
    ...style,
  };

  if (isWeb) {
    const tags = {
      h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4',
      body: 'p', caption: 'span', overline: 'span'
    };
    const Tag = tags[variant] as keyof JSX.IntrinsicElements;

    return (
      <Tag className={`ppl-text ${className}`} style={combinedStyle}>
        {children}
      </Tag>
    );
  }

  // Mobile (React Native) implementation
  const { Text: RNText } = require('react-native');

  return (
    <RNText style={[combinedStyle, style]}>
      {children}
    </RNText>
  );
};
