import { render, screen } from '@testing-library/react';
import { onAuthStateChanged } from 'firebase/auth';
import { AuthProvider } from '../context/AuthContext.jsx';
import { useAuth } from '../hooks/useAuth.js';

/* Fake Firebase so the tests never talk to the real service */
vi.mock('../services/firebase.js', () => ({
  auth: {},
  db: {},
  googleProvider: {},
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  signOut: vi.fn(),
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

describe('AuthContext', () => {
  beforeEach(() => {
    vi.mocked(onAuthStateChanged).mockReset();
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

  it('useAuth throws an error when used outside AuthProvider', () => {
    /* Hide the error React prints to the console for this test */
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<ShowUser />)).toThrow('useAuth must be used inside an AuthProvider');

    consoleError.mockRestore();
  });
});
