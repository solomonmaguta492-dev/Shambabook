import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Register from '../pages/Register.jsx';

/* Fake useAuth and useToast so no real Firebase calls happen */
const mockRegister = vi.fn();
const mockLoginWithGoogle = vi.fn();
const mockShowToast = vi.fn();

vi.mock('../hooks/useAuth.js', () => ({
  useAuth: () => ({ register: mockRegister, loginWithGoogle: mockLoginWithGoogle }),
}));

vi.mock('../hooks/useToast.js', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

function renderRegister() {
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );
}

describe('Register page', () => {
  beforeEach(() => {
    mockRegister.mockReset();
    mockLoginWithGoogle.mockReset();
    mockShowToast.mockReset();
  });

  it('shows errors for empty fields and focuses the first one', async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(screen.getByText('Full name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
    expect(screen.getByLabelText('Full name')).toHaveFocus();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows an error when the passwords do not match', async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByLabelText('Full name'), 'Amina Njeri');
    await user.type(screen.getByLabelText('Email'), 'amina@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret1');
    await user.type(screen.getByLabelText('Confirm password'), 'secret2');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm password')).toHaveFocus();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('calls register with the right values when the form is valid', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue();
    renderRegister();

    await user.type(screen.getByLabelText('Full name'), 'Amina Njeri');
    await user.type(screen.getByLabelText('Email'), 'amina@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret1');
    await user.type(screen.getByLabelText('Confirm password'), 'secret1');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(mockRegister).toHaveBeenCalledWith('Amina Njeri', 'amina@example.com', 'secret1');
    expect(mockShowToast).toHaveBeenCalledWith('Account created!', 'success');
  });

  it('calls loginWithGoogle when the Google button is clicked', async () => {
    const user = userEvent.setup();
    mockLoginWithGoogle.mockResolvedValue({ user: { displayName: 'Amina Njeri' } });
    renderRegister();

    await user.click(screen.getByRole('button', { name: 'Sign up with Google' }));

    expect(mockLoginWithGoogle).toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith('Welcome, Amina!', 'success');
  });

  it('shows the friendly message when Google sign-in fails', async () => {
    const user = userEvent.setup();
    mockLoginWithGoogle.mockRejectedValue({ code: 'auth/popup-blocked' });
    renderRegister();

    await user.click(screen.getByRole('button', { name: 'Sign up with Google' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Your browser blocked the Google pop-up. Please allow pop-ups and try again'
    );
  });
});
