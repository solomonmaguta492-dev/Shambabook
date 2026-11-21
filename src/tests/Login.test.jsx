import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login.jsx';

/* Fake useAuth and useToast so no real Firebase calls happen */
const mockLogin = vi.fn();
const mockLoginWithGoogle = vi.fn();
const mockShowToast = vi.fn();

vi.mock('../hooks/useAuth.js', () => ({
  useAuth: () => ({ login: mockLogin, loginWithGoogle: mockLoginWithGoogle }),
}));

vi.mock('../hooks/useToast.js', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

function renderLogin() {
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

describe('Login page', () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockLoginWithGoogle.mockReset();
    mockShowToast.mockReset();
  });

  it('shows an error for an invalid email', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.type(screen.getByLabelText('Password'), 'secret1');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveFocus();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows the friendly message when login fails', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValue({ code: 'auth/invalid-credential' });
    renderLogin();

    await user.type(screen.getByLabelText('Email'), 'amina@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrongpass');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Wrong email or password');
    expect(mockShowToast).not.toHaveBeenCalled();
  });

  it('calls login when the form is valid', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue();
    renderLogin();

    await user.type(screen.getByLabelText('Email'), 'amina@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret1');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(mockLogin).toHaveBeenCalledWith('amina@example.com', 'secret1');
    expect(mockShowToast).toHaveBeenCalledWith('Welcome back!', 'success');
  });

  it('calls loginWithGoogle when the Google button is clicked', async () => {
    const user = userEvent.setup();
    mockLoginWithGoogle.mockResolvedValue({ user: { displayName: 'Amina Njeri' } });
    renderLogin();

    await user.click(screen.getByRole('button', { name: 'Continue with Google' }));

    expect(mockLoginWithGoogle).toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith('Welcome, Amina!', 'success');
  });

  it('shows the friendly message when Google sign-in fails', async () => {
    const user = userEvent.setup();
    mockLoginWithGoogle.mockRejectedValue({ code: 'auth/popup-closed-by-user' });
    renderLogin();

    await user.click(screen.getByRole('button', { name: 'Continue with Google' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Google sign-in was cancelled');
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeEnabled();
  });
});
