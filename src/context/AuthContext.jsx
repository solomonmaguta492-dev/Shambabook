import { createContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase.js';

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

  /* Create the account, then save the person's name on it */
  async function register(name, email, password) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });

    /* Firebase does not report the new name by itself, so copy the user to show it straight away */
    setUser({ ...result.user });
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  /* Opens a Google pop-up; it works for new and existing accounts */
  function loginWithGoogle() {
    return signInWithPopup(auth, googleProvider);
  }

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
    <AuthContext.Provider value={{ user, loading, register, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
