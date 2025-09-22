// Cross-platform detection utility
export const isWeb = typeof window !== 'undefined' && !window.ReactNativeWebView;
export const isMobile = !isWeb;

// Platform-specific imports (conditional to avoid errors)
let Platform: any = null;
let Dimensions: any = null;

if (isMobile) {
  try {
    const RN = require('react-native');
    Platform = RN.Platform;
    Dimensions = RN.Dimensions;
  } catch (e) {
    // React Native not available
  }
}

// Cross-platform dimensions
export const getScreenDimensions = () => {
  if (isMobile && Dimensions) {
    return Dimensions.get('window');
  }

  if (isWeb) {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  return { width: 375, height: 812 }; // Default mobile dimensions
};

// Platform utilities
export const platformUtils = {
  isIOS: isMobile && Platform?.OS === 'ios',
  isAndroid: isMobile && Platform?.OS === 'android',
  isWeb,
  isMobile,

  // Get platform-specific values
  select: <T>(options: { web?: T; ios?: T; android?: T; mobile?: T; default: T }): T => {
    if (isWeb && options.web !== undefined) return options.web;
    if (isMobile && Platform?.OS === 'ios' && options.ios !== undefined) return options.ios;
    if (isMobile && Platform?.OS === 'android' && options.android !== undefined) return options.android;
    if (isMobile && options.mobile !== undefined) return options.mobile;
    return options.default;
  }
};
