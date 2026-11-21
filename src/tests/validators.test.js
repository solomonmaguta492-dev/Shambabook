import {
  validateEmail,
  validatePassword,
  validatePasswordsMatch,
  validateRequired,
} from '../utils/validators.js';

describe('validators', () => {
  it('validateRequired needs some text', () => {
    expect(validateRequired('', 'Full name')).toBe('Full name is required');
    expect(validateRequired('   ', 'Full name')).toBe('Full name is required');
    expect(validateRequired('Amina', 'Full name')).toBe('');
  });

  it('validateEmail checks the email format', () => {
    expect(validateEmail('')).toBe('Email is required');
    expect(validateEmail('farmer')).toBe('Please enter a valid email address');
    expect(validateEmail('farmer@mail')).toBe('Please enter a valid email address');
    expect(validateEmail('farmer@example.com')).toBe('');
  });

  it('validatePassword needs at least 6 characters', () => {
    expect(validatePassword('')).toBe('Password is required');
    expect(validatePassword('12345')).toBe('Password must be at least 6 characters');
    expect(validatePassword('123456')).toBe('');
  });

  it('validatePasswordsMatch checks both passwords are the same', () => {
    expect(validatePasswordsMatch('secret1', '')).toBe('Please confirm your password');
    expect(validatePasswordsMatch('secret1', 'secret2')).toBe('Passwords do not match');
    expect(validatePasswordsMatch('secret1', 'secret1')).toBe('');
  });
});
