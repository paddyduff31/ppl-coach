import { useState, useEffect } from 'react';
import { getScreenDimensions, platformUtils } from '../platform';

// Breakpoint definitions
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export type Breakpoint = keyof typeof breakpoints;

export interface ResponsiveState {
  width: number;
  height: number;
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
  isXLargeScreen: boolean;
  currentBreakpoint: Breakpoint;
}

export const useResponsive = (): ResponsiveState => {
  const [dimensions, setDimensions] = useState(() => getScreenDimensions());

  useEffect(() => {
    if (platformUtils.isWeb) {
      const handleResize = () => {
        setDimensions(getScreenDimensions());
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }

    if (platformUtils.isMobile) {
      // React Native dimension change listener
      try {
        const { Dimensions } = require('react-native');
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
          setDimensions(window);
        });

        return () => subscription?.remove();
      } catch (e) {
        // React Native not available
      }
    }
  }, []);

  const getCurrentBreakpoint = (width: number): Breakpoint => {
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    return 'sm';
  };

  return {
    width: dimensions.width,
    height: dimensions.height,
    isSmallScreen: dimensions.width < breakpoints.md,
    isMediumScreen: dimensions.width >= breakpoints.md && dimensions.width < breakpoints.lg,
    isLargeScreen: dimensions.width >= breakpoints.lg,
    isXLargeScreen: dimensions.width >= breakpoints.xl,
    currentBreakpoint: getCurrentBreakpoint(dimensions.width),
  };
};
