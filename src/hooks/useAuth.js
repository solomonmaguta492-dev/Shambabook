import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

/* Shortcut for reading the logged-in user, logout and loading */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }

  return context;
}
