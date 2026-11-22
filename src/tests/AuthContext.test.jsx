import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { AuthProvider } from '../context/AuthContext.jsx';
import { useAuth } from '../hooks/useAuth.js';

/* Fake Firebase so the tests never talk to the real service */
vi.mock('../services/firebase.js', () => ({
  auth: { currentUser: { email: 'farmer@example.com', displayName: 'Old Name' } },
  db: {},
  googleProvider: {},
}));

vi.mock('firebase/auth', () => ({
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
});
