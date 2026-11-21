/* Firebase error codes and the simple message we show for each one */
const messages = {
  'auth/invalid-credential': 'Wrong email or password',
  'auth/wrong-password': 'Wrong email or password',
  'auth/user-not-found': 'Wrong email or password',
  'auth/email-already-in-use': 'This email is already registered',
  'auth/weak-password': 'Password must be at least 6 characters',
  'auth/invalid-email': 'Please enter a valid email address',
  'auth/too-many-requests': 'Too many attempts. Please try again later',
  'auth/network-request-failed': 'No internet connection. Please try again',
  'auth/popup-closed-by-user': 'Google sign-in was cancelled',
  'auth/popup-blocked': 'Your browser blocked the Google pop-up. Please allow pop-ups and try again',
  'auth/unauthorized-domain': "Google sign-in isn't allowed on this website yet",
  'auth/account-exists-with-different-credential':
    'This email is already registered with a password. Please log in with your email and password',
};

export function getAuthErrorMessage(code) {
  return messages[code] || 'Something went wrong. Please try again';
}
