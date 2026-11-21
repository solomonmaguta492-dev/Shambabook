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
};

export function getAuthErrorMessage(code) {
  return messages[code] || 'Something went wrong. Please try again';
}
