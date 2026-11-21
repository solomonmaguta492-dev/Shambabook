import { getAuthErrorMessage } from '../utils/authErrors.js';

describe('getAuthErrorMessage', () => {
  it('turns Firebase error codes into simple messages', () => {
    expect(getAuthErrorMessage('auth/invalid-credential')).toBe('Wrong email or password');
    expect(getAuthErrorMessage('auth/email-already-in-use')).toBe('This email is already registered');
    expect(getAuthErrorMessage('auth/weak-password')).toBe('Password must be at least 6 characters');
    expect(getAuthErrorMessage('auth/too-many-requests')).toBe('Too many attempts. Please try again later');
  });

  it('uses a general message for unknown codes', () => {
    expect(getAuthErrorMessage('auth/something-new')).toBe('Something went wrong. Please try again');
    expect(getAuthErrorMessage(undefined)).toBe('Something went wrong. Please try again');
  });
});
