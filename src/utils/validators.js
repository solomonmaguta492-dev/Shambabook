/* Each function returns an error message, or an empty string when the value is fine */

export function validateRequired(value, label) {
  return value.trim() === '' ? `${label} is required` : '';
}

export function validateEmail(email) {
  if (email.trim() === '') {
    return 'Email is required';
  }

  /* Something, then @, then something, a dot and something, with no spaces */
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email.trim()) ? '' : 'Please enter a valid email address';
}

export function validatePassword(password) {
  if (password === '') {
    return 'Password is required';
  }
  return password.length < 6 ? 'Password must be at least 6 characters' : '';
}

export function validatePasswordsMatch(password, confirmPassword) {
  if (confirmPassword === '') {
    return 'Please confirm your password';
  }
  return password === confirmPassword ? '' : 'Passwords do not match';
}
