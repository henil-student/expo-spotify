import { AUTH_CONFIG, AUTH_MESSAGES } from '../constants/auth';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password regex based on AUTH_CONFIG requirements
const PASSWORD_REGEX = new RegExp(
  `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{${AUTH_CONFIG.MIN_PASSWORD_LENGTH},}$`
);

export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return AUTH_MESSAGES.REQUIRED_FIELD;
  }

  if (!EMAIL_REGEX.test(email)) {
    return AUTH_MESSAGES.INVALID_EMAIL;
  }

  return null;
};

export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return AUTH_MESSAGES.REQUIRED_FIELD;
  }

  if (!PASSWORD_REGEX.test(password)) {
    return AUTH_MESSAGES.INVALID_PASSWORD;
  }

  return null;
};

export const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    return AUTH_MESSAGES.REQUIRED_FIELD;
  }

  if (name.trim().length < AUTH_CONFIG.MIN_NAME_LENGTH || 
      name.trim().length > AUTH_CONFIG.MAX_NAME_LENGTH) {
    return AUTH_MESSAGES.INVALID_NAME;
  }

  return null;
};

export const validateSignupData = ({ name, email, password }) => {
  const nameError = validateName(name);
  if (nameError) return nameError;

  const emailError = validateEmail(email);
  if (emailError) return emailError;

  const passwordError = validatePassword(password);
  if (passwordError) return passwordError;

  return null;
};

export const validateLoginData = ({ email, password }) => {
  const emailError = validateEmail(email);
  if (emailError) return emailError;

  if (!password || typeof password !== 'string') {
    return AUTH_MESSAGES.REQUIRED_FIELD;
  }

  return null;
};
