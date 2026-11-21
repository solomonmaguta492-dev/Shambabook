import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

function renderNavbar() {
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );
}

describe('Navbar', () => {
  it('shows the Log in and Sign up links', () => {
    renderNavbar();

    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/register');
  });

  it('opens the mobile menu when the menu button is clicked', async () => {
    const user = userEvent.setup();
    renderNavbar();

    const menuButton = screen.getByRole('button', { name: 'Open menu' });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    await user.click(menuButton);

    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    expect(menuButton).toHaveAccessibleName('Close menu');
    /* The desktop links plus the mobile menu copies */
    expect(screen.getAllByRole('link', { name: 'Log in' })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'Sign up' })).toHaveLength(2);
  });
});
