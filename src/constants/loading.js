export const LOADING_MESSAGES = {
  // Auth loading messages
  CHECKING_AUTH: 'Checking authentication...',
  LOGGING_IN: 'Logging in...',
  SIGNING_UP: 'Creating account...',
  LOGGING_OUT: 'Logging out...',
  
  // Data loading messages
  LOADING_PROFILE: 'Loading profile...',
  LOADING_PLAYLISTS: 'Loading playlists...',
  LOADING_SONGS: 'Loading songs...',
  LOADING_ALBUMS: 'Loading albums...',
  LOADING_ARTISTS: 'Loading artists...',
  
  // Generic messages
  DEFAULT: 'Loading...',
  PLEASE_WAIT: 'Please wait...',
  PROCESSING: 'Processing...',
  
  // Sync messages
  SYNCING: 'Syncing your data...',
  UPDATING: 'Updating...',
  SAVING: 'Saving changes...',
};

// Loading states for different actions
export const LOADING_STATES = {
  INITIAL: 'INITIAL',
  AUTH_CHECK: 'AUTH_CHECK',
  LOGIN: 'LOGIN',
  SIGNUP: 'SIGNUP',
  LOGOUT: 'LOGOUT',
  DATA_FETCH: 'DATA_FETCH',
  DATA_SYNC: 'DATA_SYNC',
  NONE: 'NONE'
};

// Get loading message based on state
export const getLoadingMessage = (state = LOADING_STATES.INITIAL) => {
  switch (state) {
    case LOADING_STATES.AUTH_CHECK:
      return LOADING_MESSAGES.CHECKING_AUTH;
    case LOADING_STATES.LOGIN:
      return LOADING_MESSAGES.LOGGING_IN;
    case LOADING_STATES.SIGNUP:
      return LOADING_MESSAGES.SIGNING_UP;
    case LOADING_STATES.LOGOUT:
      return LOADING_MESSAGES.LOGGING_OUT;
    case LOADING_STATES.DATA_FETCH:
      return LOADING_MESSAGES.LOADING_PROFILE;
    case LOADING_STATES.DATA_SYNC:
      return LOADING_MESSAGES.SYNCING;
    default:
      return LOADING_MESSAGES.DEFAULT;
  }
};
