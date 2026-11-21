import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GoogleButton from '../components/GoogleButton.jsx';

describe('GoogleButton', () => {
  it('shows the default label, or the label passed in', () => {
    const { rerender } = render(<GoogleButton />);
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeInTheDocument();

    rerender(<GoogleButton label="Sign up with Google" />);
    expect(screen.getByRole('button', { name: 'Sign up with Google' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<GoogleButton onClick={handleClick} />);

    await user.click(screen.getByRole('button', { name: 'Continue with Google' }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled is true', () => {
    render(<GoogleButton disabled />);

    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeDisabled();
  });
});
