// Form Validation Utilities

export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhone = (phone) => {
  return /^[0-9+\-\s()]{7,20}$/.test(phone);
};
