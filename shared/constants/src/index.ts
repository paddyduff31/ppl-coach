// App-wide constants and configuration
export const APP_CONFIG = {
  name: 'PPL Coach',
  version: '1.0.0',
  description: 'Your personal Push/Pull/Legs workout companion',

  // API Configuration
  api: {
    baseUrl: {
      development: 'http://localhost:5000',
      production: 'https://api.ppl-coach.com',
    },
    timeout: 10000,
    retryAttempts: 3,
  },

  // Feature flags
  features: {
    enableAnalytics: true,
    enablePushNotifications: true,
    enableOfflineMode: true,
    enableBetaFeatures: false,
  },

  // Storage keys
  storage: {
    authToken: 'ppl_auth_token',
    userProfile: 'ppl_user_profile',
    workoutData: 'ppl_workout_data',
    preferences: 'ppl_user_preferences',
    logs: 'ppl_coach_logs',
  },
};

// Workout-related constants
export const WORKOUT_CONSTANTS = {
  // Day types for PPL split
  dayTypes: {
    PUSH: 1,
    PULL: 2,
    LEGS: 3,
    REST: 4,
  } as const,

  // Equipment types
  equipmentTypes: {
    BARBELL: 1,
    DUMBBELL: 2,
    MACHINE: 3,
    BODYWEIGHT: 4,
    CABLE: 5,
    KETTLEBELL: 6,
    RESISTANCE_BAND: 7,
  } as const,

  // Muscle groups
  muscleGroups: {
    CHEST: 1,
    SHOULDERS: 2,
    TRICEPS: 3,
    BACK: 4,
    BICEPS: 5,
    LEGS: 6,
    GLUTES: 7,
    CORE: 8,
    CARDIO: 9,
  } as const,

  // Default workout parameters
  defaults: {
    restTime: 90, // seconds
    sets: 3,
    reps: 8,
    warmupSets: 2,
  },

  // Validation limits
  limits: {
    minSets: 1,
    maxSets: 10,
    minReps: 1,
    maxReps: 100,
    minWeight: 0,
    maxWeight: 1000,
    maxWorkoutDuration: 300, // minutes
  },
};

// UI/UX constants
export const UI_CONSTANTS = {
  // Animation durations (milliseconds)
  animations: {
    fast: 150,
    normal: 300,
    slow: 500,
  },

  // Spacing multiplier (used with design tokens)
  spacing: {
    baseUnit: 4, // 4px base unit
  },

  // Z-index layers
  zIndex: {
    background: 0,
    content: 1,
    overlay: 10,
    modal: 100,
    toast: 1000,
    tooltip: 1001,
  },

  // Breakpoints (matches UI tokens)
  breakpoints: {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
    wide: 1280,
  },

  // Common durations for user interactions
  debounceTime: 300, // ms
  longPressDelay: 500, // ms
};

// Validation constants
export const VALIDATION = {
  // User input validation
  user: {
    nameMinLength: 2,
    nameMaxLength: 50,
    emailMaxLength: 100,
    passwordMinLength: 8,
  },

  // Workout validation
  workout: {
    nameMinLength: 1,
    nameMaxLength: 100,
    descriptionMaxLength: 500,
    notesMaxLength: 1000,
  },

  // Exercise validation
  exercise: {
    nameMinLength: 1,
    nameMaxLength: 100,
    instructionsMaxLength: 2000,
  },

  // Regular expressions
  regex: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    phoneNumber: /^\+?[\d\s\-\(\)]+$/,
  },
};

// Error messages
export const ERROR_MESSAGES = {
  // Network errors
  network: {
    offline: 'You appear to be offline. Please check your connection.',
    timeout: 'Request timed out. Please try again.',
    serverError: 'Server error occurred. Please try again later.',
    unauthorized: 'Please log in to continue.',
    forbidden: 'You do not have permission to perform this action.',
    notFound: 'The requested resource was not found.',
  },

  // Validation errors
  validation: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    password: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
    passwordMatch: 'Passwords do not match',
    phoneNumber: 'Please enter a valid phone number',
    minLength: (min: number) => `Must be at least ${min} characters`,
    maxLength: (max: number) => `Must not exceed ${max} characters`,
    minValue: (min: number) => `Must be at least ${min}`,
    maxValue: (max: number) => `Must not exceed ${max}`,
  },

  // Workout errors
  workout: {
    noExercises: 'Please add at least one exercise',
    invalidWeight: 'Please enter a valid weight',
    invalidReps: 'Please enter valid number of reps',
    invalidSets: 'Please enter valid number of sets',
    workoutTooLong: 'Workout duration exceeds maximum allowed time',
  },
};

// Success messages
export const SUCCESS_MESSAGES = {
  workout: {
    created: '🏋️ Workout created successfully!',
    updated: '✅ Workout updated!',
    deleted: '🗑️ Workout deleted',
    completed: '🎉 Great workout! Keep it up!',
  },

  user: {
    profileUpdated: '✅ Profile updated successfully!',
    passwordChanged: '🔐 Password changed successfully!',
    settingsSaved: '⚙️ Settings saved!',
  },

  general: {
    saved: '✅ Saved successfully!',
    deleted: '🗑️ Deleted successfully!',
    copied: '📋 Copied to clipboard!',
  },
};

// Date and time constants
export const DATE_TIME = {
  // Date formats
  formats: {
    shortDate: 'MMM dd',
    longDate: 'MMMM dd, yyyy',
    dateTime: 'MMM dd, yyyy HH:mm',
    time: 'HH:mm',
    timeWithSeconds: 'HH:mm:ss',
  },

  // Time periods
  periods: {
    week: 7 * 24 * 60 * 60 * 1000, // milliseconds
    month: 30 * 24 * 60 * 60 * 1000,
    year: 365 * 24 * 60 * 60 * 1000,
  },

  // Days of week
  daysOfWeek: [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday'
  ] as const,

  // Short day names
  shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const,
};

// Type exports for better TypeScript support
export type DayType = typeof WORKOUT_CONSTANTS.dayTypes[keyof typeof WORKOUT_CONSTANTS.dayTypes];
export type EquipmentType = typeof WORKOUT_CONSTANTS.equipmentTypes[keyof typeof WORKOUT_CONSTANTS.equipmentTypes];
export type MuscleGroup = typeof WORKOUT_CONSTANTS.muscleGroups[keyof typeof WORKOUT_CONSTANTS.muscleGroups];

