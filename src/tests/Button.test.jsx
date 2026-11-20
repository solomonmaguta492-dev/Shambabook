import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../components/Button.jsx';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Save</Button>);

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Save</Button>);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('uses the primary style by default', () => {
    render(<Button>Save</Button>);

    expect(screen.getByRole('button')).toHaveClass('bg-green-700', 'text-white');
  });

  it('uses the secondary style when asked', () => {
    render(<Button variant="secondary">Cancel</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('border', 'bg-white', 'text-green-700');
    expect(button).not.toHaveClass('bg-green-700');
  });
});
