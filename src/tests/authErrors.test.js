import { getAuthErrorMessage } from '../utils/authErrors.js';

describe('getAuthErrorMessage', () => {
  it('turns Firebase error codes into simple messages', () => {
    expect(getAuthErrorMessage('auth/invalid-credential')).toBe('Wrong email or password');
    expect(getAuthErrorMessage('auth/email-already-in-use')).toBe('This email is already registered');
    expect(getAuthErrorMessage('auth/weak-password')).toBe('Password must be at least 6 characters');
    expect(getAuthErrorMessage('auth/too-many-requests')).toBe('Too many attempts. Please try again later');
  });

  it('has simple messages for Google sign-in errors', () => {
    expect(getAuthErrorMessage('auth/popup-closed-by-user')).toBe('Google sign-in was cancelled');
    expect(getAuthErrorMessage('auth/popup-blocked')).toBe(
      'Your browser blocked the Google pop-up. Please allow pop-ups and try again'
    );
    expect(getAuthErrorMessage('auth/unauthorized-domain')).toBe(
      "Google sign-in isn't allowed on this website yet"
    );
    expect(getAuthErrorMessage('auth/account-exists-with-different-credential')).toBe(
      'This email is already registered with a password. Please log in with your email and password'
    );
  });

  it('uses a general message for unknown codes', () => {
    expect(getAuthErrorMessage('auth/something-new')).toBe('Something went wrong. Please try again');
    expect(getAuthErrorMessage(undefined)).toBe('Something went wrong. Please try again');
  });
});
