import { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../services/firebase.js';

/* Holds the logged-in user so any component can read it */
/* eslint-disable-next-line react-refresh/only-export-components */
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /* Firebase calls this now and again every time the user logs in or out */
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    /* Stop listening when the provider is removed */
    return unsubscribe;
  }, []);

  function logout() {
    return signOut(auth);
  }

  /* Wait for Firebase before showing pages, so they don't flash the wrong content */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-stone-600">Loading…</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
