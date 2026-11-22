import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase.js';
import { AuthProvider } from '../context/AuthContext.jsx';
import { useAuth } from '../hooks/useAuth.js';

/* Fake Firebase so the tests never talk to the real service */
vi.mock('../services/firebase.js', () => ({
  auth: { currentUser: { email: 'farmer@example.com', displayName: 'Old Name' } },
  db: {},
  googleProvider: {},
}));

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
}));

/* Small component that shows what useAuth gives back */
function ShowUser() {
  const { user } = useAuth();
  return <p>{user ? `Hello ${user.email}` : 'No user'}</p>;
}

function renderWithProvider() {
  render(
    <AuthProvider>
      <ShowUser />
    </AuthProvider>
  );
}

/*
  Renders the provider with a logged-out user and returns what useAuth gives,
  so a test can call register, login and the others directly
*/
function renderAndGetAuth() {
  vi.mocked(onAuthStateChanged).mockImplementation((firebaseAuth, callback) => {
    callback(null);
    return () => {};
  });

  const result = {};
  function GrabAuth() {
    Object.assign(result, useAuth());
    return <ShowUser />;
  }

  render(
    <AuthProvider>
      <GrabAuth />
    </AuthProvider>
  );
  return result;
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the loading message first', () => {
    /* Firebase has not answered yet, so the callback is never called */
    vi.mocked(onAuthStateChanged).mockReturnValue(() => {});

    renderWithProvider();

    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(screen.queryByText('No user')).not.toBeInTheDocument();
  });

  it('provides the user after onAuthStateChanged reports a user', () => {
    vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
      callback({ email: 'farmer@example.com' });
      return () => {};
    });

    renderWithProvider();

    expect(screen.getByText('Hello farmer@example.com')).toBeInTheDocument();
    expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
  });

  it('provides null when logged out', () => {
    vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
      callback(null);
      return () => {};
    });

    renderWithProvider();

    expect(screen.getByText('No user')).toBeInTheDocument();
  });

  it('updateName saves the new name and shows it straight away', async () => {
    const user = userEvent.setup();
    vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
      callback(auth.currentUser);
      return () => {};
    });
    /* Firebase changes the name on the current user, so the fake does the same */
    vi.mocked(updateProfile).mockImplementation(async (currentUser, changes) => {
      currentUser.displayName = changes.displayName;
    });

    function ChangeName() {
      const { user: currentUser, updateName } = useAuth();
      return (
        <button type="button" onClick={() => updateName('New Name')}>
          {currentUser.displayName}
        </button>
      );
    }

    render(
      <AuthProvider>
        <ChangeName />
      </AuthProvider>
    );
    await user.click(screen.getByRole('button', { name: 'Old Name' }));

    expect(updateProfile).toHaveBeenCalledWith(expect.anything(), { displayName: 'New Name' });
    expect(await screen.findByRole('button', { name: 'New Name' })).toBeInTheDocument();
  });

  it('useAuth throws an error when used outside AuthProvider', () => {
    /* Hide the error React prints to the console for this test */
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<ShowUser />)).toThrow('useAuth must be used inside an AuthProvider');

    consoleError.mockRestore();
  });

  it('stops listening to Firebase when the provider is removed', () => {
    const unsubscribe = vi.fn();
    vi.mocked(onAuthStateChanged).mockReturnValue(unsubscribe);

    const { unmount } = render(<AuthProvider><ShowUser /></AuthProvider>);
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it('register creates the account, saves the name and shows the new user', async () => {
    const newUser = { email: 'new@example.com' };
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({ user: newUser });
    vi.mocked(updateProfile).mockResolvedValue();
    const authValue = renderAndGetAuth();

    await act(() => authValue.register('Amina', 'new@example.com', 'secret123'));

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, 'new@example.com', 'secret123');
    expect(updateProfile).toHaveBeenCalledWith(newUser, { displayName: 'Amina' });
    expect(screen.getByText('Hello new@example.com')).toBeInTheDocument();
  });

  it('register passes on a Firebase error and does not save a name', async () => {
    vi.mocked(createUserWithEmailAndPassword).mockRejectedValue({ code: 'auth/email-already-in-use' });
    const authValue = renderAndGetAuth();

    await expect(authValue.register('Amina', 'taken@example.com', 'secret123')).rejects.toEqual({
      code: 'auth/email-already-in-use',
    });
    expect(updateProfile).not.toHaveBeenCalled();
    expect(screen.getByText('No user')).toBeInTheDocument();
  });

  it('login signs in with the email and password', async () => {
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({ user: {} });
    const authValue = renderAndGetAuth();

    await authValue.login('farmer@example.com', 'secret123');

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'farmer@example.com', 'secret123');
  });

  it('login passes on a wrong-password error', async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue({ code: 'auth/invalid-credential' });
    const authValue = renderAndGetAuth();

    await expect(authValue.login('farmer@example.com', 'wrong')).rejects.toEqual({ code: 'auth/invalid-credential' });
  });

  it('loginWithGoogle opens the Google pop-up', async () => {
    vi.mocked(signInWithPopup).mockResolvedValue({ user: {} });
    const authValue = renderAndGetAuth();

    await authValue.loginWithGoogle();

    expect(signInWithPopup).toHaveBeenCalledWith(auth, googleProvider);
  });

  it('loginWithGoogle passes on an error when the pop-up is closed', async () => {
    vi.mocked(signInWithPopup).mockRejectedValue({ code: 'auth/popup-closed-by-user' });
    const authValue = renderAndGetAuth();

    await expect(authValue.loginWithGoogle()).rejects.toEqual({ code: 'auth/popup-closed-by-user' });
  });

  it('updateName passes on an error and keeps the old name', async () => {
    vi.mocked(updateProfile).mockRejectedValue(new Error('offline'));
    vi.mocked(onAuthStateChanged).mockImplementation((firebaseAuth, callback) => {
      callback({ email: 'farmer@example.com', displayName: 'Old Name' });
      return () => {};
    });

    const result = {};
    function ShowName() {
      Object.assign(result, useAuth());
      return <p>{result.user.displayName}</p>;
    }
    render(
      <AuthProvider>
        <ShowName />
      </AuthProvider>
    );

    await expect(result.updateName('New Name')).rejects.toThrow('offline');
    expect(screen.getByText('Old Name')).toBeInTheDocument();
  });

  it('logout signs out of Firebase', async () => {
    vi.mocked(signOut).mockResolvedValue();
    const authValue = renderAndGetAuth();

    await authValue.logout();

    expect(signOut).toHaveBeenCalledWith(auth);
  });

  it('logout passes on an error', async () => {
    vi.mocked(signOut).mockRejectedValue(new Error('offline'));
    const authValue = renderAndGetAuth();

    await expect(authValue.logout()).rejects.toThrow('offline');
  });
});
