// Export all shared UI components and utilities
export * from './platform';
export * from './tokens';
export * from './components/Button';
export * from './components/Common';

// Re-export with convenient naming
import { Button } from './components/Button';
import { Card, Text } from './components/Common';

export {
  Button as PPLButton,
  Card as PPLCard,
  Text as PPLText,
};

// Utility hooks for cross-platform development
export { useResponsive } from './hooks/useResponsive';
export { useTheme } from './hooks/useTheme';
