/**
 * Validate an email address.
 */
export function isValidEmail(email: string): boolean {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return pattern.test(email);
}

/**
 * Validate a Korean phone number.
 * Accepts formats: 01012345678, 010-1234-5678, 010 1234 5678
 */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/[\s-]/g, "");
  const pattern = /^01[016789]\d{7,8}$/;
  return pattern.test(digits);
}

/**
 * Validate password strength.
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/\d/.test(password)) return false;
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) return false;
  return true;
}
