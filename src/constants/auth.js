// Authentication configuration
export const AUTH_CONFIG = {
  MIN_PASSWORD_LENGTH: 8,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  PASSWORD_REQUIREMENTS: {
    minLength: 8,
    requireNumbers: true,
    requireSpecialChars: true,
    requireUppercase: true,
    requireLowercase: true
  }
};

// Authentication messages
export const AUTH_MESSAGES = {
  // Validation messages
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD: 'Password must be at least 8 characters and contain a number, special character, and uppercase letter',
  INVALID_NAME: 'Name must be between 2 and 50 characters',
  REQUIRED_FIELD: 'This field is required',
  
  // Success messages
  LOGIN_SUCCESS: 'Successfully logged in',
  SIGNUP_SUCCESS: 'Account created successfully',
  LOGOUT_SUCCESS: 'Successfully logged out',
  
  // Error messages
  LOGIN_ERROR: 'Unable to log in. Please check your credentials and try again',
  SIGNUP_ERROR: 'Unable to create account. Please try again',
  NETWORK_ERROR: 'Network error. Please check your connection',
  SERVER_ERROR: 'Server error. Please try again later',
  USER_EXISTS: 'An account with this email already exists',
  
  // Status messages
  LOGGING_IN: 'Logging in...',
  CREATING_ACCOUNT: 'Creating account...',
  LOGGING_OUT: 'Logging out...'
};

// Authentication endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token'
};

// Token storage keys
export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data'
};

// Authentication timeouts
export const AUTH_TIMEOUTS = {
  SESSION_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  REQUEST_TIMEOUT: 10000 // 10 seconds
};
